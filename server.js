/**
 * Custom Node.js Server per Next.js + WebSocket
 * Integra Twilio Media Streams con Google Gemini AI per trascrizione real-time
 * 
 * NOTA: Questo server è necessario solo per development locale o self-hosting.
 * Su Vercel, i WebSocket non sono supportati nativamente - considera:
 * 1. Usare Vercel Edge Functions con Durable Objects (Cloudflare)
 * 2. Usare un servizio esterno per WebSocket (Pusher, Ably, etc.)
 * 3. Usare un server separato per il Media Stream handler
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Audio processing utilities (CommonJS version)
function mulawToPcm(mulaw) {
  mulaw = ~mulaw;
  const sign = mulaw & 0x80;
  const exponent = (mulaw >> 4) & 0x07;
  const mantissa = mulaw & 0x0f;
  let sample = mantissa << (exponent + 3);
  sample += (1 << (exponent + 2)) - 128;
  return sign !== 0 ? -sample : sample;
}

function createWavHeader(dataLength, sampleRate, channels, bitsPerSample) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

function mulawToWav(mulawBuffer) {
  const pcmBuffer = Buffer.alloc(mulawBuffer.length * 2);
  for (let i = 0; i < mulawBuffer.length; i++) {
    const pcmValue = mulawToPcm(mulawBuffer[i]);
    pcmBuffer.writeInt16LE(pcmValue, i * 2);
  }
  const wavHeader = createWavHeader(pcmBuffer.length, 8000, 1, 16);
  return Buffer.concat([wavHeader, pcmBuffer]);
}

function hasAudioContent(pcmBuffer, threshold = 100) {
  let sumSquares = 0;
  const sampleCount = pcmBuffer.length / 2;
  for (let i = 0; i < pcmBuffer.length; i += 2) {
    const sample = pcmBuffer.readInt16LE(i);
    sumSquares += sample * sample;
  }
  const rms = Math.sqrt(sumSquares / sampleCount);
  return rms > threshold;
}

function getAudioDuration(pcmBuffer, sampleRate, channels, bitsPerSample) {
  const bytesPerSample = (channels * bitsPerSample) / 8;
  const totalSamples = pcmBuffer.length / bytesPerSample;
  return totalSamples / sampleRate;
}

// Configurazione
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Inizializza Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Inizializza Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Storage sessioni chiamate
const sessions = new Map();

// Statistiche globali
const stats = {
  totalCalls: 0,
  activeCalls: 0,
  totalTranscriptions: 0,
  totalErrors: 0
};

// Prepara Next.js app
app.prepare().then(() => {
  // Crea HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[HTTP] Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // ========================================
  // WebSocket Server: Twilio Media Streams
  // ========================================
  const twilioWss = new WebSocketServer({
    server,
    path: '/media-stream'
  });

  twilioWss.on('connection', (ws) => {
    console.log('[Twilio WS] Media Stream connected');

    let streamSid = null;
    let callSid = null;
    let sessionData = null;

    ws.on('message', async (message) => {
      try {
        const msg = JSON.parse(message);

        switch (msg.event) {
          case 'start':
            streamSid = msg.start.streamSid;
            callSid = msg.start.callSid;

            console.log(`[Stream Start] CallSid: ${callSid}, StreamSid: ${streamSid}`);
            console.log(`[Stream Config] Track: ${msg.start.mediaFormat.track}, Codec: ${msg.start.mediaFormat.encoding}`);

            sessionData = {
              streamSid,
              callSid,
              twilioWs: ws,
              conversationHistory: [],
              audioBuffer: Buffer.alloc(0),
              lastProcessedTime: Date.now(),
              startTime: Date.now(),
              transcriptionCount: 0
            };

            sessions.set(callSid, sessionData);
            stats.totalCalls++;
            stats.activeCalls++;

            notifyClient(callSid, {
              type: 'stream-started',
              data: { callSid, streamSid }
            });
            break;

          case 'media':
            if (!callSid || !sessions.has(callSid)) {
              console.warn('[Media] Received media without active session');
              break;
            }

            sessionData = sessions.get(callSid);
            const payload = Buffer.from(msg.media.payload, 'base64');
            sessionData.audioBuffer = Buffer.concat([sessionData.audioBuffer, payload]);

            const now = Date.now();
            const timeSinceLastProcess = now - sessionData.lastProcessedTime;
            const bufferSize = sessionData.audioBuffer.length;

            if (bufferSize >= 16000 && timeSinceLastProcess >= 1500) {
              processAudioChunk(sessionData, callSid).catch(err => {
                console.error('[Audio Processing] Error:', err.message);
                stats.totalErrors++;
              });

              sessionData.audioBuffer = Buffer.alloc(0);
              sessionData.lastProcessedTime = now;
            }
            break;

          case 'stop':
            console.log(`[Stream Stop] CallSid: ${callSid}, StreamSid: ${streamSid}`);

            if (sessionData) {
              const duration = (Date.now() - sessionData.startTime) / 1000;
              console.log(`[Session Stats] Duration: ${duration.toFixed(1)}s, Transcriptions: ${sessionData.transcriptionCount}`);

              notifyClient(callSid, {
                type: 'stream-stopped',
                data: { callSid, duration, transcriptions: sessionData.transcriptionCount }
              });

              sessions.delete(callSid);
              stats.activeCalls--;
            }
            break;

          case 'mark':
            console.log(`[Mark] ${msg.mark.name}`);
            break;

          default:
            console.log(`[Twilio WS] Unknown event: ${msg.event}`);
        }
      } catch (error) {
        console.error('[Twilio WS] Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('[Twilio WS] Media Stream disconnected');
      if (callSid && sessions.has(callSid)) {
        sessions.delete(callSid);
        stats.activeCalls--;
      }
    });

    ws.on('error', (error) => {
      console.error('[Twilio WS] Error:', error);
    });
  });

  // SSE connections storage
  if (!global.sseConnections) {
    global.sseConnections = new Map();
  }

  // ========================================
  // Helper Functions
  // ========================================

  async function processAudioChunk(session, callSid) {
    const startTime = Date.now();

    try {
      const audioBuffer = session.audioBuffer;
      if (!hasAudioContent(audioBuffer, 50)) {
        console.log('[Audio] Skipping silent chunk');
        return;
      }

      const wavAudio = mulawToWav(audioBuffer);
      const duration = getAudioDuration(audioBuffer, 8000, 1, 8);
      console.log(`[Audio] Processing ${duration.toFixed(1)}s of audio (${audioBuffer.length} bytes)`);

      const context = session.conversationHistory
        .slice(-5)
        .map(item => `${item.speaker === 'caller' ? 'Chiamante' : 'Operatore'}: ${item.text}`)
        .join('\n');

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      });

      const prompt = `Sei un assistente AI che analizza conversazioni telefoniche in tempo reale in italiano.

CONTESTO CONVERSAZIONE PRECEDENTE:
${context || 'Inizio conversazione'}

COMPITO:
1. Trascrivi accuratamente l'audio in italiano
2. Determina chi sta parlando: "caller" (chi chiama) o "operator" (operatore)
3. Genera 2-3 suggerimenti pratici per l'operatore basati sulla conversazione
4. Analizza il sentiment (positive, neutral, negative)
5. Identifica l'intento principale

Rispondi SOLO in formato JSON valido (senza markdown):
{
  "transcription": "testo trascritto esatto",
  "speaker": "caller" o "operator",
  "suggestions": ["suggerimento 1", "suggerimento 2", "suggerimento 3"],
  "sentiment": "positive", "neutral", o "negative",
  "intent": "breve descrizione intento (es: richiesta informazioni, reclamo, ringraziamento)"
}`;

      const audioData = {
        inlineData: {
          data: wavAudio.toString('base64'),
          mimeType: 'audio/wav'
        }
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 15000)
      );

      const resultPromise = model.generateContent([prompt, audioData]);
      const result = await Promise.race([resultPromise, timeoutPromise]);

      const response = await result.response;
      const text = response.text();

      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);

      if (!parsedResponse.transcription || !parsedResponse.speaker) {
        throw new Error('Invalid Gemini response format');
      }

      const historyItem = {
        speaker: parsedResponse.speaker,
        text: parsedResponse.transcription,
        timestamp: Date.now(),
        suggestions: parsedResponse.suggestions || [],
        sentiment: parsedResponse.sentiment || 'neutral',
        intent: parsedResponse.intent || ''
      };

      session.conversationHistory.push(historyItem);
      session.transcriptionCount++;
      stats.totalTranscriptions++;

      notifyClient(callSid, {
        type: 'final',
        data: parsedResponse
      });

      const processingTime = Date.now() - startTime;
      console.log(`[AI] Transcribed in ${processingTime}ms: "${parsedResponse.transcription.substring(0, 60)}..."`);

    } catch (error) {
      console.error('[AI Processing] Error:', error.message);
      stats.totalErrors++;

      notifyClient(callSid, {
        type: 'error',
        message: `Errore trascrizione: ${error.message}`
      });
    }
  }

  function notifyClient(callSid, message) {
    const connection = global.sseConnections.get(callSid);

    if (!connection) {
      console.warn(`[SSE] No active connection for call ${callSid}`);
      return false;
    }

    try {
      const data = `data: ${JSON.stringify(message)}\n\n`;
      connection.controller.enqueue(connection.encoder.encode(data));
      return true;
    } catch (error) {
      console.error(`[SSE] Error sending to ${callSid}:`, error);
      global.sseConnections.delete(callSid);
      return false;
    }
  }

  // ========================================
  // Server Startup
  // ========================================

  server.listen(port, (err) => {
    if (err) throw err;
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🚀 Creative CV + Phone Assistant Server                ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n✓ Next.js:              http://${hostname}:${port}`);
    console.log(`✓ Phone Assistant:      http://${hostname}:${port}/phone`);
    console.log(`✓ Twilio Media Stream:  ws://${hostname}:${port}/media-stream`);
    console.log(`✓ Client Stream (SSE):  http://${hostname}:${port}/api/transcriptions/stream`);
    console.log(`✓ Gemini AI:            ${process.env.GEMINI_API_KEY ? 'Configured ✓' : 'NOT CONFIGURED ✗'}`);
    console.log(`✓ Environment:          ${dev ? 'Development' : 'Production'}\n`);
    console.log('Press Ctrl+C to stop\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n[Server] SIGTERM signal received: closing server');
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n[Server] SIGINT signal received: closing server');
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });

  // Log stats periodicamente in dev
  if (dev) {
    setInterval(() => {
      if (stats.activeCalls > 0) {
        console.log('\n[Stats] Total calls:', stats.totalCalls, '| Active:', stats.activeCalls, '| Transcriptions:', stats.totalTranscriptions, '| Errors:', stats.totalErrors);
      }
    }, 300000);
  }
});
