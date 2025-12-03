/**
 * Custom Node.js Server per Next.js + WebSocket
 * Integra Twilio Media Streams con Google Gemini AI per trascrizione real-time
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { mulawToWav, hasAudioContent, getAudioDuration } = require('./utils/audio');

// Configurazione
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Inizializza Next.js app
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Inizializza Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Storage sessioni chiamate
// Map<callSid, SessionData>
const sessions = new Map();

// Statistiche globali (opzionale per monitoring)
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
  // WebSocket Server 1: Twilio Media Streams
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
            // Chiamata iniziata
            streamSid = msg.start.streamSid;
            callSid = msg.start.callSid;

            console.log(`[Stream Start] CallSid: ${callSid}, StreamSid: ${streamSid}`);
            console.log(`[Stream Config] Track: ${msg.start.mediaFormat.track}, Codec: ${msg.start.mediaFormat.encoding}`);

            // Crea nuova sessione
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

            // Notifica client browser se connesso
            notifyClient(callSid, {
              type: 'stream-started',
              data: { callSid, streamSid }
            });
            break;

          case 'media':
            // Audio chunk ricevuto
            if (!callSid || !sessions.has(callSid)) {
              console.warn('[Media] Received media without active session');
              break;
            }

            sessionData = sessions.get(callSid);

            // Decode base64 payload
            const payload = Buffer.from(msg.media.payload, 'base64');

            // Accumula nel buffer
            sessionData.audioBuffer = Buffer.concat([
              sessionData.audioBuffer,
              payload
            ]);

            // Processa quando buffer raggiunge soglia (~1.5-2 secondi)
            // 8kHz mulaw = ~8000 bytes/sec, quindi 16000 bytes = ~2 secondi
            const now = Date.now();
            const timeSinceLastProcess = now - sessionData.lastProcessedTime;
            const bufferSize = sessionData.audioBuffer.length;

            if (bufferSize >= 16000 && timeSinceLastProcess >= 1500) {
              // Non bloccare la ricezione di nuovi chunks
              processAudioChunk(sessionData, callSid).catch(err => {
                console.error('[Audio Processing] Error:', err.message);
                stats.totalErrors++;
              });

              // Reset buffer e timer
              sessionData.audioBuffer = Buffer.alloc(0);
              sessionData.lastProcessedTime = now;
            }
            break;

          case 'stop':
            // Chiamata terminata
            console.log(`[Stream Stop] CallSid: ${callSid}, StreamSid: ${streamSid}`);

            if (sessionData) {
              const duration = (Date.now() - sessionData.startTime) / 1000;
              console.log(`[Session Stats] Duration: ${duration.toFixed(1)}s, Transcriptions: ${sessionData.transcriptionCount}`);

              // Notifica client
              notifyClient(callSid, {
                type: 'stream-stopped',
                data: { callSid, duration, transcriptions: sessionData.transcriptionCount }
              });

              // Cleanup
              sessions.delete(callSid);
              stats.activeCalls--;
            }
            break;

          case 'mark':
            // Marker events (opzionale, per sincronizzazione)
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

  // ========================================
  // SSE (Server-Sent Events) per Client Browser
  // ========================================
  // Le connessioni SSE sono gestite tramite API route Next.js
  // Vedi: /api/transcriptions/stream/route.js
  // Usiamo global.sseConnections per comunicare tra server.js e API routes

  if (!global.sseConnections) {
    global.sseConnections = new Map();
  }

  // ========================================
  // Funzioni Helper
  // ========================================

  /**
   * Processa chunk audio con Gemini AI
   */
  async function processAudioChunk(session, callSid) {
    const startTime = Date.now();

    try {
      // Verifica che buffer contenga audio significativo
      const audioBuffer = session.audioBuffer;
      if (!hasAudioContent(audioBuffer, 50)) {
        console.log('[Audio] Skipping silent chunk');
        return;
      }

      // Converti mulaw → WAV
      const wavAudio = mulawToWav(audioBuffer);
      const duration = getAudioDuration(audioBuffer, 8000, 1, 8);
      console.log(`[Audio] Processing ${duration.toFixed(1)}s of audio (${audioBuffer.length} bytes)`);

      // Prepara context conversazione (ultimi 5 messaggi)
      const context = session.conversationHistory
        .slice(-5)
        .map(item => `${item.speaker === 'caller' ? 'Chiamante' : 'Operatore'}: ${item.text}`)
        .join('\n');

      // Chiama Gemini API
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

      // Genera con timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 15000)
      );

      const resultPromise = model.generateContent([prompt, audioData]);
      const result = await Promise.race([resultPromise, timeoutPromise]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response (rimuovi markdown se presente)
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanText);

      // Valida risposta
      if (!parsedResponse.transcription || !parsedResponse.speaker) {
        throw new Error('Invalid Gemini response format');
      }

      // Salva in history
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

      // Invia al client browser
      notifyClient(callSid, {
        type: 'final',
        data: parsedResponse
      });

      const processingTime = Date.now() - startTime;
      console.log(`[AI] Transcribed in ${processingTime}ms: "${parsedResponse.transcription.substring(0, 60)}..."`);

    } catch (error) {
      console.error('[AI Processing] Error:', error.message);
      stats.totalErrors++;

      // Invia errore al client
      notifyClient(callSid, {
        type: 'error',
        message: `Errore trascrizione: ${error.message}`
      });
    }
  }

  /**
   * Invia messaggio a client browser specifico tramite SSE
   */
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
    console.log('║   🚀 Twilio Voice + AI Assistant Server                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n✓ Next.js:              http://${hostname}:${port}`);
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

  // Log stats periodicamente (ogni 5 minuti)
  if (dev) {
    setInterval(() => {
      console.log('\n[Stats] Total calls:', stats.totalCalls, '| Active:', stats.activeCalls, '| Transcriptions:', stats.totalTranscriptions, '| Errors:', stats.totalErrors);
    }, 300000);
  }
});
