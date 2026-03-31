"use client";

import { useState } from "react";
import Link from "next/link";
import type { TierDetail } from "@/app/data/service-details";
import type { Tier } from "@/app/data/packages";

interface TierSelectorProps {
  serviceId: string;
  tierDetails: TierDetail[];
  tiers: { base: Tier; pro: Tier; premium: Tier };
}

type TierKey = "base" | "pro" | "premium";

export default function TierSelector({ serviceId, tierDetails, tiers }: TierSelectorProps) {
  const defaultTier =
    (tierDetails.find((t) => t.highlighted)?.key as TierKey | undefined) ?? "base";
  const [activeTier, setActiveTier] = useState<TierKey>(defaultTier);

  const activeTierDetail = tierDetails.find((t) => t.key === activeTier)!;
  const activeTierInfo = tiers[activeTier];
  const includedItems = activeTierDetail.includes.split(" · ").filter(Boolean);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-10 md:mb-14">
          <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-accent font-mono">
            Scegli il tuo pacchetto
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
            Trova il tier giusto per te
          </h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted leading-relaxed">
            Confronta i piani in modo chiaro e attiva il livello che accompagna meglio la crescita del tuo progetto.
          </p>
        </div>

        <div className="relative mb-12 rounded-2xl border border-border bg-surface/30 p-3 md:p-4">
          <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-3 md:gap-4 md:pt-4">
            {tierDetails.map((detail) => {
              const tierInfo = tiers[detail.key];
              const isActive = activeTier === detail.key;

              return (
                <button
                  key={detail.key}
                  onClick={() => setActiveTier(detail.key)}
                  className={`group relative overflow-visible rounded-xl border px-5 py-5 text-left transition-all duration-300 ${
                    isActive
                      ? "bg-accent/10 border-accent/45 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                      : "bg-background/40 border-border hover:border-accent/30 hover:bg-surface/60"
                  }`}
                >
                  {detail.highlighted && (
                    <span className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[9px] font-mono font-medium uppercase tracking-[0.2em] text-background whitespace-nowrap">
                      Più scelto
                    </span>
                  )}

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className={`text-xs uppercase tracking-[0.2em] font-mono ${
                      isActive ? "text-accent" : "text-muted"
                    }`}>
                      {tierInfo.name}
                    </span>
                    <span className={`h-2 w-2 rounded-full transition-colors ${
                      isActive ? "bg-accent" : "bg-border"
                    }`} />
                  </div>

                  <p className={`font-display text-2xl tracking-tight md:text-3xl ${
                    isActive ? "text-foreground" : "text-foreground/80"
                  }`}>
                    {tierInfo.price}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-muted">{tierInfo.frequency}</p>
                  <p className={`mt-4 text-sm leading-relaxed ${
                    isActive ? "text-foreground/85" : "text-muted"
                  }`}>
                    {detail.tagline}
                  </p>

                  <div
                    className={`mt-5 h-px bg-linear-to-r transition-all duration-300 ${
                      isActive ? "from-accent/80 to-transparent" : "from-border to-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div key={activeTier} className="overflow-hidden rounded-2xl border border-border bg-surface/20 animate-fade-up">
          <div className="grid md:grid-cols-[1.2fr_0.8fr]">
            <div className="px-7 py-8 md:px-10 md:py-10">
              <div className="mb-6 flex items-start justify-between gap-6 border-b border-border pb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-mono">
                    Piano attivo
                  </p>
                  <h3 className="mt-3 font-display text-2xl tracking-tight text-foreground md:text-3xl">
                    {activeTierDetail.tagline}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm md:text-base text-muted leading-relaxed">
                    {activeTierDetail.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {includedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/35 px-3.5 py-3"
                  >
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-[11px] text-accent">
                      ✓
                    </span>
                    <span className="text-sm text-foreground/85">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative border-t border-border bg-background/45 px-7 py-8 md:border-l md:border-t-0 md:px-8 md:py-10">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/35 to-transparent md:inset-x-auto md:inset-y-0 md:left-0 md:h-auto md:w-px md:bg-linear-to-b md:from-transparent md:via-accent/35 md:to-transparent" />

              <div className="rounded-xl border border-accent/25 bg-accent/8 p-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-mono">
                  Investimento
                </p>
                <p className="mt-3 font-display text-4xl tracking-tight text-foreground">
                  {activeTierInfo.price}
                </p>
                <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
                  {activeTierInfo.frequency}
                </p>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted">
                Ogni pacchetto resta personalizzabile: dopo la selezione potrai aggiungere servizi, integrazioni e supporto dedicato.
              </p>

              <div className="mt-6">
                {activeTierDetail.ctaType === "wizard" ? (
                  <Link
                    href={`/?service=${serviceId}&tier=${activeTier}#pricing`}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium tracking-wide text-background transition-all duration-300 hover:bg-foreground hover:text-background"
                  >
                    Inizia con {activeTierInfo.name}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                ) : (
                  <Link
                    href={`/?service=${serviceId}&tier=${activeTier}#pricing`}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent px-6 py-3 text-sm font-medium tracking-wide text-accent transition-all duration-300 hover:bg-accent/10"
                  >
                    Contattaci per un preventivo
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
