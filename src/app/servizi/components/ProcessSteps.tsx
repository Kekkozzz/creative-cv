"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { number: "01", title: "Briefing", description: "Call conoscitiva 30 minuti" },
  { number: "02", title: "Design", description: "Mockup e revisioni" },
  { number: "03", title: "Sviluppo", description: "Codice e test" },
  { number: "04", title: "Lancio", description: "Deploy e supporto" },
];

export default function ProcessSteps() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stepsEl = stepsRef.current;
    if (!section || !stepsEl) return;

    const items = stepsEl.querySelectorAll<HTMLElement>(".process-step");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          y: 32,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.12,
          immediateRender: false,
          onComplete: () => {
            gsap.set(items, { clearProps: "opacity,transform" });
          },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
            invalidateOnRefresh: true,
          once: true,
        },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            Come lavoriamo
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Il nostro processo
          </h2>
          <p className="text-sm text-muted mt-4 max-w-xl">
            Quattro fasi lineari, con milestone chiare dal kickoff al rilascio.
          </p>
        </div>

        {/* Steps grid */}
        <div ref={stepsRef} className="relative">
          {/* Desktop timeline backbone */}
          <div
            className="hidden lg:block absolute left-0 right-0 top-6 h-px bg-accent/35"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {steps.map((step, i) => (
            <div key={step.number} className="process-step relative lg:px-2">
              {/* Connector line (mobile only) */}
              {i < steps.length - 1 && (
                <div
                  className="lg:hidden absolute left-6 top-14 -bottom-8 w-px bg-border/80"
                  aria-hidden="true"
                />
              )}

              {/* Numbered circle */}
              <div className="w-12 h-12 rounded-full bg-background border border-accent/45 shadow-[0_0_0_4px_rgba(201,185,154,0.08)] flex items-center justify-center mb-5 relative z-10">
                <span className="text-[11px] font-mono text-accent tracking-widest font-semibold">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <div className="rounded-xl border border-border/90 bg-surface/35 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent/90 font-mono mb-2">
                  Fase {step.number}
                </p>
                <h3 className="font-display text-2xl tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
