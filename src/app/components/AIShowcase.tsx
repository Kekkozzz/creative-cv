"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  { src: "/ai-preview.jpg", label: "Sito Web" },
  { src: "/ai-preview-shop.jpg", label: "Shop & SaaS" },
  { src: "/ai-preview-webapp.jpg", label: "Web App" },
  { src: "/ai-preview-mobile.webp", label: "Mobile App" },
];

export default function AIShowcase() {
  const [current, setCurrent] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<boolean[]>([]);

  // Check which images exist by attempting to load them
  useEffect(() => {
    Promise.all(
      slides.map(
        (s) =>
          new Promise<boolean>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = s.src;
          })
      )
    ).then(setLoadedSlides);
  }, []);

  const available = slides.filter((_, i) => loadedSlides[i]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % available.length);
  }, [available.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + available.length) % available.length);
  }, [available.length]);

  // Auto-advance every 5s
  useEffect(() => {
    if (available.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, available.length]);

  if (available.length === 0) return null;

  const slide = available[current];

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Copy */}
          <div>
            <p className="animate-fade-up stagger-1 text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
              ✦ Solo da noi
            </p>
            <h2 className="animate-fade-up stagger-2 font-display text-3xl md:text-4xl tracking-tight mb-6">
              Vedi il tuo sito{" "}
              <em className="text-accent">prima di iniziarlo.</em>
            </h2>
            <p className="animate-fade-up stagger-3 text-muted text-base leading-relaxed max-w-md mb-8">
              Configura il pacchetto, descrivi la tua attività e genera un
              mockup personalizzato in tempo reale. Nessun impegno, nessun
              costo aggiuntivo. Solo noi lo offriamo.
            </p>
            <div className="animate-fade-up stagger-4">
              <a
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 bg-foreground text-background px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-accent hover:text-background transition-all duration-300"
              >
                Prova ora
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Carousel */}
          <div className="animate-fade-up stagger-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono">
                {slide.label} — Generato in 30 secondi
              </p>
              {available.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={prev}
                    className="text-muted hover:text-accent transition-colors text-sm"
                    aria-label="Precedente"
                  >
                    ←
                  </button>
                  <span className="text-[10px] text-muted font-mono">
                    {current + 1}/{available.length}
                  </span>
                  <button
                    onClick={next}
                    className="text-muted hover:text-accent transition-colors text-sm"
                    aria-label="Successivo"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* Browser frame */}
            <div className="relative overflow-hidden border border-border rounded">

              {/* Slides */}
              <div className="relative aspect-video bg-background">
                {available.map((s, i) => (
                  <div
                    key={s.src}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: i === current ? 1 : 0 }}
                  >
                    <Image
                      src={s.src}
                      alt={`Preview AI — ${s.label}`}
                      width={1440}
                      height={900}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            {available.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {available.map((s, i) => (
                  <button
                    key={s.src}
                    onClick={() => setCurrent(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 bg-accent"
                        : "w-2 bg-border hover:bg-muted"
                    }`}
                    aria-label={`Vai a ${s.label}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
