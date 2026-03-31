"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { siteConfig } from "../data/config";

const testimonials = [
  {
    quote:
      "Hanno trasformato la nostra idea in un sito che ha triplicato i contatti in tre mesi. Professionalità e attenzione al dettaglio impressionanti.",
    name: "Marco R.",
    role: "CEO, TechFlow",
  },
  {
    quote:
      "Il configuratore prezzi ci ha convinto subito — trasparenza totale. Il risultato finale ha superato ogni aspettativa.",
    name: "Giulia B.",
    role: "Founder, Boutique Milano",
  },
  {
    quote:
      "L'app mobile che hanno sviluppato per noi è intuitiva e velocissima. I nostri utenti la adorano — le recensioni sullo store parlano chiaro.",
    name: "Alessandro T.",
    role: "Product Manager, FitTracker",
  },
  {
    quote:
      "Web app consegnata nei tempi, con una qualità del codice che il nostro team ha apprezzato enormemente. Collaborazione perfetta.",
    name: "Sara M.",
    role: "CTO, FinApp",
  },
];

const INTERVAL = 5000;

export default function ContactHub() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, INTERVAL);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetTimer]);

  const handleDotClick = useCallback(
    (index: number) => {
      setActiveIndex(index);
      resetTimer();
    },
    [resetTimer]
  );

  const whatsappMessage = encodeURIComponent(
    "Ciao, vorrei informazioni sui vostri servizi web"
  );

  return (
    <section id="contatti" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-8 text-center">
        {/* Headline */}
        <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
          Pronto a far crescere
          <br />
          il tuo business <em className="text-accent">online</em>?
        </h2>
        <p className="text-muted text-base md:text-lg mb-16">
          Unisciti a chi ha già scelto di lavorare con noi
        </p>

        {/* Testimonial carousel */}
        <div className="relative mb-12 min-h-40 flex items-center justify-center" aria-live="polite" aria-atomic="true">

          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center justify-center px-4 ${
                reducedMotion ? "" : "transition-opacity duration-700"
              } ${i === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <blockquote className="text-foreground/90 text-base md:text-lg leading-relaxed italic max-w-2xl mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t.name}
                </p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              aria-label={`Testimonial ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                i === activeIndex
                  ? "bg-accent"
                  : "bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="group inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-accent hover:text-background transition-all duration-300"
          >
            Configura il tuo pacchetto
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href={`https://wa.me/${siteConfig.contact.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm tracking-wide border border-border text-muted hover:border-foreground hover:text-foreground transition-all duration-300"
          >
            Scrivici su WhatsApp
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
