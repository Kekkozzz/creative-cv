"use client";

import { useState } from "react";
import type { FAQItem } from "@/app/data/service-details";

interface ServiceFAQProps {
  items: FAQItem[];
}

export default function ServiceFAQ({ items }: ServiceFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
              Domande frequenti
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">
              Hai domande?
            </h2>
          </div>

          {/* Accordion */}
          <div className="divide-y divide-border border-t border-border">
            {items.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={index}>
                  {/* Question header */}
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left hover:text-accent transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-medium text-base leading-snug transition-colors duration-200 ${isOpen ? "text-accent" : "text-foreground"}`}>
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 text-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>

                  {/* Answer body */}
                  <div
                    className="overflow-hidden transition-[grid-template-rows] duration-300"
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                    }}
                  >
                    <div className="min-h-0">
                      <p className="text-muted leading-relaxed text-sm md:text-base pb-5">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Border bottom */}
            <div className="border-b border-border" />
          </div>
        </div>
      </div>

      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
