"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

const messages = [
  "Analizzo le tue preferenze di design...",
  "Scelgo il layout migliore per il tuo settore...",
  "Definisco la struttura delle sezioni...",
  "Applico i tuoi colori e il tuo stile...",
  "L'intelligenza artificiale sta disegnando il mockup...",
  "Sto componendo header, hero e navigazione...",
  "Genero ogni dettaglio grafico del layout...",
  "Perfeziono tipografia e spaziature...",
  "Aggiungo gli ultimi elementi al design...",
  "Ottimizzo il rendering finale...",
  "Ci siamo quasi, ancora qualche secondo...",
  "Finalizzo il tuo mockup personalizzato...",
];

export default function PreviewLoading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i < messages.length - 1 ? i + 1 : i));
    }, 8000);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const target = 95;
    const duration = 120000;
    const step = target / (duration / 50);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + step, target));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Animated orb */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-accent/20 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-accent/30 flex items-center justify-center">
          <ImageIcon size={20} className="text-accent" />
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-muted transition-all duration-500 text-center min-h-[1.5em]">
        {messages[msgIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-0.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-muted/50 text-center mt-2 font-mono">
          Generazione Mockup
        </p>
      </div>
    </div>
  );
}
