/**
 * LocalStorage Management per Trascrizioni Chiamate
 * Gestisce salvataggio, caricamento e pulizia dati con quota management
 */

const STORAGE_KEY = 'call-transcriptions';
const MAX_TRANSCRIPTIONS = 1000; // Limite per evitare overflow storage
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB (buffer di sicurezza su 5MB limit)

/**
 * Salva una singola trascrizione nel LocalStorage
 * @param {Object} transcription - Oggetto trascrizione
 * @returns {boolean} - True se salvato con successo
 */
export function saveTranscription(transcription) {
  try {
    const existing = getTranscriptions();
    const updated = [...existing, transcription];

    // Mantieni solo le ultime MAX_TRANSCRIPTIONS
    const trimmed = updated.slice(-MAX_TRANSCRIPTIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return true;
  } catch (error) {
    console.error('[Storage] Error saving transcription:', error);

    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.warn('[Storage] Quota exceeded, cleaning old data');
      clearOldTranscriptions();

      // Retry dopo pulizia
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([transcription]));
        return true;
      } catch (retryError) {
        console.error('[Storage] Failed even after cleanup:', retryError);
        return false;
      }
    }

    return false;
  }
}

/**
 * Carica tutte le trascrizioni dal LocalStorage
 * @returns {Array} - Array di trascrizioni
 */
export function getTranscriptions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const transcriptions = JSON.parse(data);

    // Valida che sia un array
    if (!Array.isArray(transcriptions)) {
      console.warn('[Storage] Invalid data format, resetting');
      return [];
    }

    return transcriptions;
  } catch (error) {
    console.error('[Storage] Error loading transcriptions:', error);
    return [];
  }
}

/**
 * Ottieni trascrizioni per una specifica chiamata
 * @param {string} callSid - ID chiamata Twilio
 * @returns {Array} - Trascrizioni filtrate
 */
export function getTranscriptionsByCall(callSid) {
  const all = getTranscriptions();
  return all.filter(t => t.callSid === callSid);
}

/**
 * Ottieni trascrizioni dell'ultimo periodo
 * @param {number} hours - Ore da includere (default: 24)
 * @returns {Array} - Trascrizioni recenti
 */
export function getRecentTranscriptions(hours = 24) {
  const all = getTranscriptions();
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

  return all.filter(t => {
    const timestamp = typeof t.timestamp === 'string'
      ? new Date(t.timestamp).getTime()
      : t.timestamp;
    return timestamp >= cutoffTime;
  });
}

/**
 * Cancella tutte le trascrizioni
 * @returns {boolean} - True se cancellato con successo
 */
export function clearTranscriptions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] All transcriptions cleared');
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing transcriptions:', error);
    return false;
  }
}

/**
 * Mantieni solo le ultime N trascrizioni
 * @param {number} keepLast - Numero di trascrizioni da mantenere (default: 100)
 * @returns {boolean} - True se pulizia riuscita
 */
export function clearOldTranscriptions(keepLast = 100) {
  try {
    const all = getTranscriptions();
    if (all.length <= keepLast) {
      console.log('[Storage] No cleanup needed');
      return true;
    }

    const recent = all.slice(-keepLast);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));

    console.log(`[Storage] Cleaned up: kept ${recent.length} of ${all.length} transcriptions`);
    return true;
  } catch (error) {
    console.error('[Storage] Error clearing old transcriptions:', error);
    return false;
  }
}

/**
 * Cancella trascrizioni più vecchie di N giorni
 * @param {number} days - Giorni threshold (default: 7)
 * @returns {number} - Numero trascrizioni cancellate
 */
export function clearTranscriptionsOlderThan(days = 7) {
  try {
    const all = getTranscriptions();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const filtered = all.filter(t => {
      const timestamp = typeof t.timestamp === 'string'
        ? new Date(t.timestamp).getTime()
        : t.timestamp;
      return timestamp >= cutoffTime;
    });

    const deleted = all.length - filtered.length;

    if (deleted > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log(`[Storage] Deleted ${deleted} transcriptions older than ${days} days`);
    }

    return deleted;
  } catch (error) {
    console.error('[Storage] Error deleting old transcriptions:', error);
    return 0;
  }
}

/**
 * Esporta trascrizioni in JSON file
 * @param {string} filename - Nome file (opzionale)
 */
export function exportTranscriptions(filename = null) {
  try {
    const data = getTranscriptions();

    if (data.length === 0) {
      console.warn('[Storage] No transcriptions to export');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const defaultFilename = `transcriptions-${new Date().toISOString().split('T')[0]}.json`;
    const finalFilename = filename || defaultFilename;

    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log(`[Storage] Exported ${data.length} transcriptions to ${finalFilename}`);
  } catch (error) {
    console.error('[Storage] Error exporting transcriptions:', error);
  }
}

/**
 * Importa trascrizioni da JSON file
 * @param {File} file - File JSON da importare
 * @returns {Promise<number>} - Numero trascrizioni importate
 */
export function importTranscriptions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!Array.isArray(imported)) {
          throw new Error('Invalid format: expected array');
        }

        const existing = getTranscriptions();
        const merged = [...existing, ...imported];

        // Deduplica per ID
        const unique = Array.from(
          new Map(merged.map(item => [item.id, item])).values()
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
        console.log(`[Storage] Imported ${imported.length} transcriptions`);
        resolve(imported.length);
      } catch (error) {
        console.error('[Storage] Error importing transcriptions:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Ottieni statistiche storage
 * @returns {Object} - Oggetto con statistiche
 */
export function getStorageStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const transcriptions = getTranscriptions();

    const sizeInBytes = new Blob([data || '']).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    // Stima quota usata (5MB tipicamente il limite)
    const percentUsed = ((sizeInBytes / MAX_STORAGE_SIZE) * 100).toFixed(2);

    // Statistiche per speaker
    const speakerStats = transcriptions.reduce((acc, t) => {
      acc[t.speaker] = (acc[t.speaker] || 0) + 1;
      return acc;
    }, {});

    // Statistiche sentiment
    const sentimentStats = transcriptions.reduce((acc, t) => {
      if (t.sentiment) {
        acc[t.sentiment] = (acc[t.sentiment] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      count: transcriptions.length,
      sizeInBytes,
      sizeInKB,
      sizeInMB,
      percentUsed,
      speakerStats,
      sentimentStats,
      oldestTimestamp: transcriptions.length > 0
        ? transcriptions[0].timestamp
        : null,
      newestTimestamp: transcriptions.length > 0
        ? transcriptions[transcriptions.length - 1].timestamp
        : null
    };
  } catch (error) {
    console.error('[Storage] Error getting stats:', error);
    return {
      count: 0,
      sizeInBytes: 0,
      sizeInKB: '0',
      sizeInMB: '0',
      percentUsed: '0',
      speakerStats: {},
      sentimentStats: {},
      oldestTimestamp: null,
      newestTimestamp: null
    };
  }
}

/**
 * Verifica spazio disponibile prima di salvare
 * @returns {boolean} - True se c'è spazio
 */
export function ensureStorageSpace() {
  try {
    const test = 'storage-test-key';
    const testData = 'x'.repeat(1024); // 1KB test

    localStorage.setItem(test, testData);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('[Storage] Storage full, attempting cleanup');
      clearOldTranscriptions(50); // Mantieni solo ultimi 50
      return false;
    }
    return true;
  }
}

/**
 * Ricerca trascrizioni per testo
 * @param {string} query - Testo da cercare
 * @param {boolean} caseSensitive - Case sensitive (default: false)
 * @returns {Array} - Trascrizioni che contengono il testo
 */
export function searchTranscriptions(query, caseSensitive = false) {
  const all = getTranscriptions();

  if (!query) return all;

  const searchQuery = caseSensitive ? query : query.toLowerCase();

  return all.filter(t => {
    const text = caseSensitive ? t.text : t.text.toLowerCase();
    return text.includes(searchQuery);
  });
}

/**
 * Ottieni statistiche per periodo di tempo
 * @param {Date} startDate - Data inizio
 * @param {Date} endDate - Data fine
 * @returns {Object} - Statistiche periodo
 */
export function getStatsForPeriod(startDate, endDate) {
  const all = getTranscriptions();
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const filtered = all.filter(t => {
    const timestamp = typeof t.timestamp === 'string'
      ? new Date(t.timestamp).getTime()
      : t.timestamp;
    return timestamp >= startTime && timestamp <= endTime;
  });

  const totalWords = filtered.reduce((sum, t) => {
    return sum + t.text.split(/\s+/).length;
  }, 0);

  return {
    totalTranscriptions: filtered.length,
    totalWords,
    averageWordsPerTranscription: filtered.length > 0
      ? (totalWords / filtered.length).toFixed(1)
      : 0,
    bySpeaker: filtered.reduce((acc, t) => {
      acc[t.speaker] = (acc[t.speaker] || 0) + 1;
      return acc;
    }, {}),
    bySentiment: filtered.reduce((acc, t) => {
      if (t.sentiment) {
        acc[t.sentiment] = (acc[t.sentiment] || 0) + 1;
      }
      return acc;
    }, {})
  };
}
