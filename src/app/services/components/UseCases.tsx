"use client";

import type { UseCase } from "@/app/data/service-details";

interface UseCasesProps {
  cases: UseCase[];
}

export default function UseCases({ cases }: UseCasesProps) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 md:mb-16 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            Per chi è questo servizio
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Il servizio giusto per te
          </h2>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cases.map((useCase, index) => (
            <div
              key={index}
              className="bg-surface/30 border border-border rounded-xl p-6 md:p-8 hover:border-accent/30 hover:bg-surface/50 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              {/* Title */}
              <h3 className="font-semibold text-accent text-lg mb-3">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-muted text-sm leading-relaxed mb-5">
                {useCase.description}
              </p>

              {/* Recommended tier */}
              <p className="text-xs text-muted">
                <span>→ Consigliato: </span>
                <span className="text-accent font-mono">{useCase.recommendedTier}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
