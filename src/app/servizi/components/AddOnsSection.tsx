"use client";

import type { AddOn } from "@/app/data/packages";

interface AddOnsSectionProps {
  addOns: AddOn[];
}

export default function AddOnsSection({ addOns }: AddOnsSectionProps) {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            Potenzia il tuo pacchetto
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Add-on disponibili
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {addOns.map((addOn, index) => (
            <div
              key={index}
              className="bg-surface/30 border border-border rounded-xl p-6 md:p-8 flex flex-col items-center text-center hover:border-accent/30 hover:bg-surface/50 transition-all duration-300"
            >
              {/* Name */}
              <h3 className="font-bold text-foreground text-base mb-3">
                {addOn.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="font-display text-2xl text-accent">
                  {addOn.price.replace(/^\+/, "")}
                </span>
                {addOn.recurring && (
                  <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mt-1">
                    /mese
                  </span>
                )}
                {!addOn.recurring && (
                  <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mt-1">
                    una tantum
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted text-sm leading-relaxed">
                {addOn.description}
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
