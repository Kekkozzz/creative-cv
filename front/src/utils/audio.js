/**
 * Audio Processing Utilities
 * Conversione audio mulaw (8-bit, 8kHz) a PCM WAV (16-bit)
 * Twilio Media Streams invia audio in formato mulaw
 */

/**
 * Converti mulaw audio buffer a WAV format
 * @param {Buffer} mulawBuffer - Buffer contenente audio mulaw
 * @returns {Buffer} - Buffer contenente WAV file completo (header + data)
 */
function mulawToWav(mulawBuffer) {
  // Converti ogni byte mulaw in PCM 16-bit (2 bytes)
  const pcmBuffer = Buffer.alloc(mulawBuffer.length * 2);

  for (let i = 0; i < mulawBuffer.length; i++) {
    const pcmValue = mulawToPcm(mulawBuffer[i]);
    pcmBuffer.writeInt16LE(pcmValue, i * 2);
  }

  // Crea WAV header con parametri standard
  const sampleRate = 8000;  // Twilio usa 8kHz
  const channels = 1;        // Mono
  const bitsPerSample = 16;  // PCM 16-bit

  const wavHeader = createWavHeader(
    pcmBuffer.length,
    sampleRate,
    channels,
    bitsPerSample
  );

  // Combina header + audio data
  return Buffer.concat([wavHeader, pcmBuffer]);
}

/**
 * Converti singolo byte mulaw in valore PCM 16-bit
 * Implementa algoritmo standard mulaw decode (ITU-T G.711)
 * @param {number} mulaw - Byte mulaw (0-255)
 * @returns {number} - Valore PCM signed 16-bit (-32768 to 32767)
 */
function mulawToPcm(mulaw) {
  // Inverti tutti i bit (mulaw usa complemento a uno)
  mulaw = ~mulaw;

  // Estrai componenti del formato mulaw
  const sign = mulaw & 0x80;      // Bit 7: segno
  const exponent = (mulaw >> 4) & 0x07;  // Bit 4-6: esponente
  const mantissa = mulaw & 0x0f;   // Bit 0-3: mantissa

  // Calcola valore PCM usando formula mulaw
  // sample = mantissa * 2^(exponent + 3) + 2^(exponent + 2) - 128
  let sample = mantissa << (exponent + 3);
  sample += (1 << (exponent + 2)) - 128;

  // Applica segno
  return sign !== 0 ? -sample : sample;
}

/**
 * Crea header WAV (RIFF) per audio PCM
 * @param {number} dataLength - Lunghezza dati audio in bytes
 * @param {number} sampleRate - Sample rate in Hz (es. 8000, 16000, 44100)
 * @param {number} channels - Numero canali (1 = mono, 2 = stereo)
 * @param {number} bitsPerSample - Bits per sample (8, 16, 24, 32)
 * @returns {Buffer} - Buffer 44 bytes contenente WAV header
 */
function createWavHeader(dataLength, sampleRate, channels, bitsPerSample) {
  const header = Buffer.alloc(44);

  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  // RIFF chunk descriptor (12 bytes)
  header.write('RIFF', 0);                    // ChunkID
  header.writeUInt32LE(36 + dataLength, 4);   // ChunkSize (file size - 8)
  header.write('WAVE', 8);                    // Format

  // fmt sub-chunk (24 bytes)
  header.write('fmt ', 12);                   // Subchunk1ID
  header.writeUInt32LE(16, 16);               // Subchunk1Size (16 per PCM)
  header.writeUInt16LE(1, 20);                // AudioFormat (1 = PCM)
  header.writeUInt16LE(channels, 22);         // NumChannels
  header.writeUInt32LE(sampleRate, 24);       // SampleRate
  header.writeUInt32LE(byteRate, 28);         // ByteRate
  header.writeUInt16LE(blockAlign, 32);       // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34);    // BitsPerSample

  // data sub-chunk (8 bytes header)
  header.write('data', 36);                   // Subchunk2ID
  header.writeUInt32LE(dataLength, 40);       // Subchunk2Size

  return header;
}

/**
 * Downsample audio PCM a sample rate inferiore
 * Utile per ridurre dimensione file o adattare a requisiti API
 * @param {Buffer} pcmBuffer - Buffer audio PCM 16-bit
 * @param {number} originalRate - Sample rate originale
 * @param {number} targetRate - Sample rate desiderato
 * @returns {Buffer} - Buffer audio downsampled
 */
function downsampleAudio(pcmBuffer, originalRate, targetRate) {
  if (originalRate === targetRate) {
    return pcmBuffer;
  }

  const ratio = originalRate / targetRate;
  const outputLength = Math.floor(pcmBuffer.length / (ratio * 2));
  const output = Buffer.alloc(outputLength * 2);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = Math.floor(i * ratio) * 2;
    const sample = pcmBuffer.readInt16LE(sourceIndex);
    output.writeInt16LE(sample, i * 2);
  }

  return output;
}

/**
 * Calcola durata audio in secondi
 * @param {Buffer} pcmBuffer - Buffer audio PCM
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} channels - Numero canali
 * @param {number} bitsPerSample - Bits per sample
 * @returns {number} - Durata in secondi
 */
function getAudioDuration(pcmBuffer, sampleRate, channels, bitsPerSample) {
  const bytesPerSample = (channels * bitsPerSample) / 8;
  const totalSamples = pcmBuffer.length / bytesPerSample;
  return totalSamples / sampleRate;
}

/**
 * Verifica se buffer contiene audio valido (non silenzio)
 * @param {Buffer} pcmBuffer - Buffer audio PCM 16-bit
 * @param {number} threshold - Soglia RMS (default: 100)
 * @returns {boolean} - True se contiene audio significativo
 */
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

module.exports = {
  mulawToWav,
  mulawToPcm,
  createWavHeader,
  downsampleAudio,
  getAudioDuration,
  hasAudioContent
};
