"use client";

import { useState, useEffect, useRef } from "react";
import { Device } from "@twilio/voice-sdk";
import Image from "next/image";
import {
  saveTranscription,
  getTranscriptions,
  clearTranscriptions,
  exportTranscriptions,
  getStorageStats
} from "@/utils/storage";

export default function PhonePage() {
  // Stati esistenti
  const [phoneNumber, setPhoneNumber] = useState("");
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("Disconnesso");
  const [isReady, setIsReady] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState(null);
  const deviceRef = useRef(null);

  // Nuovi stati per AI
  const [transcriptions, setTranscriptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [storageStats, setStorageStats] = useState({ count: 0, sizeInKB: '0', percentUsed: '0' });
  const wsRef = useRef(null);
  const transcriptionsEndRef = useRef(null);

  // Auto-scroll trascrizioni
  useEffect(() => {
    transcriptionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptions]);

  // Load trascrizioni da LocalStorage all'avvio
  useEffect(() => {
    const saved = getTranscriptions();
    if (saved && saved.length > 0) {
      console.log(`[Storage] Loaded ${saved.length} previous transcriptions`);
    }
    updateStorageStats();
  }, []);

  // Update storage stats quando cambiano le trascrizioni
  useEffect(() => {
    if (transcriptions.length > 0) {
      updateStorageStats();
    }
  }, [transcriptions]);

  // Inizializza Twilio Device
  useEffect(() => {
    initializeTwilioDevice();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const updateStorageStats = () => {
    const stats = getStorageStats();
    setStorageStats(stats);
  };

  const initializeTwilioDevice = async () => {
    try {
      setStatus("Connessione a Twilio...");

      const response = await fetch("/api/twilio/token");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nel recupero del token");
      }

      const newDevice = new Device(data.token, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"],
      });

      newDevice.on("registered", () => {
        setStatus("Pronto per chiamare");
        setIsReady(true);
      });

      newDevice.on("error", (error) => {
        console.error("Device error:", error);
        setError(error.message);
        setStatus("Errore");
      });

      newDevice.on("incoming", (incomingCall) => {
        console.log("Chiamata in arrivo:", incomingCall.parameters.From);
      });

      await newDevice.register();

      deviceRef.current = newDevice;
      setDevice(newDevice);
    } catch (err) {
      console.error("Errore nell'inizializzazione:", err);
      setError(err.message);
      setStatus("Errore di connessione");
    }
  };

  // Connetti SSE (Server-Sent Events) per AI
  const connectAiWebSocket = (callSid) => {
    // Usa EventSource invece di WebSocket (funziona meglio con ngrok)
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const host = window.location.host;
    const sseUrl = `${protocol}://${host}/api/transcriptions/stream?callSid=${callSid}`;

    console.log('[AI SSE] Connecting to:', sseUrl);
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[AI SSE] Connected');
      setIsAiConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'connected':
            console.log('[AI SSE] Connection established');
            break;

          case 'final':
            // Trascrizione completa ricevuta
            const { transcription, speaker, suggestions: newSuggestions, sentiment, intent } = message.data;

            console.log(`[AI] Transcription: [${speaker}] ${transcription.substring(0, 50)}...`);

            const newTranscription = {
              id: Date.now() + Math.random(), // ID univoco
              callSid: call?.parameters?.CallSid,
              speaker,
              text: transcription,
              timestamp: new Date().toISOString(),
              sentiment,
              intent
            };

            // Aggiungi a stato e salva in LocalStorage
            setTranscriptions(prev => [...prev, newTranscription]);
            saveTranscription(newTranscription);

            // Update suggerimenti
            if (newSuggestions && newSuggestions.length > 0) {
              setSuggestions(newSuggestions);
            }
            break;

          case 'history':
            // Storico conversazione caricato
            const history = message.data.map(item => ({
              id: Date.now() + Math.random(),
              callSid: call?.parameters?.CallSid,
              speaker: item.speaker,
              text: item.text,
              timestamp: new Date(item.timestamp).toISOString(),
              sentiment: item.sentiment,
              intent: item.intent
            }));
            setTranscriptions(history);
            console.log(`[AI] Loaded ${history.length} messages from history`);
            break;

          case 'stream-started':
            console.log('[AI] Media stream started');
            break;

          case 'stream-stopped':
            console.log('[AI] Media stream stopped');
            break;

          case 'error':
            console.error('[AI] Error:', message.message);
            setError(`AI: ${message.message}`);
            break;

          default:
            console.log('[AI SSE] Unknown message type:', message.type);
        }
      } catch (err) {
        console.error('[AI SSE] Error parsing message:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[AI SSE] Error:', error);
      setIsAiConnected(false);
      setError('Errore connessione AI SSE');
      eventSource.close();
    };

    wsRef.current = eventSource;
  };

  const makeCall = async () => {
    if (!device || !phoneNumber) {
      setError("Inserisci un numero di telefono valido");
      return;
    }

    try {
      setError(null);
      setIsCalling(true);
      setStatus("Chiamata in corso...");

      // Reset trascrizioni e suggerimenti per nuova chiamata
      setTranscriptions([]);
      setSuggestions([]);

      const outgoingCall = await device.connect({
        params: { To: phoneNumber },
      });

      setCall(outgoingCall);

      outgoingCall.on("accept", () => {
        setStatus("In chiamata");
        console.log("Chiamata accettata");

        // Connetti WebSocket AI quando chiamata inizia
        const callSid = outgoingCall.parameters.CallSid;
        if (callSid) {
          console.log('[Call] CallSid:', callSid);
          connectAiWebSocket(callSid);
        } else {
          console.warn('[Call] No CallSid available');
        }
      });

      outgoingCall.on("disconnect", () => {
        setStatus("Chiamata terminata");
        setIsCalling(false);
        setCall(null);

        // Disconnetti WebSocket
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }

        setTimeout(() => {
          if (isReady) setStatus("Pronto per chiamare");
        }, 2000);
      });

      outgoingCall.on("cancel", () => {
        setStatus("Chiamata annullata");
        setIsCalling(false);
        setCall(null);

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      });

      outgoingCall.on("error", (error) => {
        console.error("Call error:", error);
        setError(error.message);
        setIsCalling(false);
        setCall(null);
        setStatus("Errore nella chiamata");

        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      });
    } catch (err) {
      console.error("Errore nell'effettuare la chiamata:", err);
      setError(err.message);
      setIsCalling(false);
      setStatus("Errore");
    }
  };

  const hangUp = () => {
    if (call) {
      call.disconnect();
      setCall(null);
      setIsCalling(false);
      setStatus("Pronto per chiamare");

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  };

  const toggleMute = () => {
    if (call) {
      const isMuted = call.isMuted();
      call.mute(!isMuted);
    }
  };

  const handleClearTranscriptions = () => {
    setTranscriptions([]);
    clearTranscriptions();
    updateStorageStats();
  };

  const handleExport = () => {
    exportTranscriptions();
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                ← Back to Portfolio
              </a>
              <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
                Twilio Voice + AI Assistant
              </h1>
            </div>
          </div>

          {/* Layout a 3 colonne */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLONNA 1: Controlli Chiamata */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Chiamata</h2>

                {/* Status Indicators */}
                <div className="space-y-3 mb-6">
                  {/* Twilio Status */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isReady
                          ? "bg-green-500 animate-pulse"
                          : isCalling
                          ? "bg-blue-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      Twilio: {status}
                    </span>
                  </div>

                  {/* AI Status */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isAiConnected ? "bg-purple-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      AI: {isAiConnected ? "Connesso" : "Disconnesso"}
                    </span>
                  </div>
                </div>

                {/* Phone Input */}
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Numero di telefono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+393331234567"
                    disabled={isCalling}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-50"
                  />
                </div>

                {/* Call Controls */}
                <div className="flex gap-3 mb-4">
                  {!isCalling ? (
                    <button
                      onClick={makeCall}
                      disabled={!isReady || !phoneNumber}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      Chiama
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleMute}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Mute
                      </button>
                      <button
                        onClick={hangUp}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Riaggancia
                      </button>
                    </>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    <p className="font-medium">Errore:</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}

                {/* Stats */}
                {isCalling && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
                    <h3 className="text-sm font-semibold mb-2">Statistiche</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Trascrizioni:</span>
                        <span className="font-mono">{transcriptions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                        <span className="font-mono">{storageStats.sizeInKB} KB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-2 text-sm">Come funziona:</p>
                  <ul className="text-xs space-y-1">
                    <li>• L&apos;AI ascolta la conversazione real-time</li>
                    <li>• Trascrizioni di entrambi i lati</li>
                    <li>• Suggerimenti contestuali per l&apos;operatore</li>
                    <li>• Dati salvati in LocalStorage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* COLONNA 2: Trascrizioni */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow h-[700px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Trascrizioni</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      disabled={transcriptions.length === 0}
                      className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded disabled:opacity-50 transition-colors"
                      title="Esporta in JSON"
                    >
                      Export
                    </button>
                    <button
                      onClick={handleClearTranscriptions}
                      disabled={transcriptions.length === 0}
                      className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded disabled:opacity-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {transcriptions.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500 text-center">
                        Le trascrizioni appariranno qui durante la chiamata
                      </p>
                    </div>
                  ) : (
                    <>
                      {transcriptions.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg ${
                            item.speaker === 'operator'
                              ? 'bg-blue-50 dark:bg-blue-950 ml-6 rounded-br-sm'
                              : 'bg-gray-100 dark:bg-zinc-800 mr-6 rounded-bl-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wide">
                                {item.speaker === 'operator' ? '🎧 Tu' : '📞 Chiamante'}
                              </span>
                              {item.sentiment && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    item.sentiment === 'positive'
                                      ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : item.sentiment === 'negative'
                                      ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {item.sentiment}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.timestamp).toLocaleTimeString('it-IT')}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{item.text}</p>
                          {item.intent && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                              Intent: {item.intent}
                            </p>
                          )}
                        </div>
                      ))}
                      <div ref={transcriptionsEndRef} />
                    </>
                  )}
                </div>

                {transcriptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t dark:border-zinc-800 text-xs text-gray-500">
                    Totale: {transcriptions.length} messaggi • {storageStats.sizeInKB} KB
                  </div>
                )}
              </div>
            </div>

            {/* COLONNA 3: Suggerimenti AI */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Suggerimenti AI
                </h2>

                {suggestions.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      I suggerimenti appariranno qui<br/>durante la conversazione
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <p className="text-sm flex-1 leading-relaxed">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info AI */}
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      Google Gemini AI
                    </p>
                  </div>
                  <ul className="text-xs space-y-1 text-indigo-700 dark:text-indigo-300">
                    <li>• Analisi real-time con Gemini 1.5 Flash</li>
                    <li>• Suggerimenti contestuali intelligenti</li>
                    <li>• Analisi sentiment e intent</li>
                    <li>• Latenza target: &lt;500ms</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
