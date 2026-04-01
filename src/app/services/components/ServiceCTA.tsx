"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ServiceCTAProps {
  serviceId: string;
}

export default function ServiceCTA({ serviceId }: ServiceCTAProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    const ctx = gsap.context(() => {
      gsap.from(inner, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,185,154,0.06)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div ref={innerRef} className="max-w-xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            Inizia ora
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-4">
            Pronto a partire?
          </h2>
          <p className="text-base text-muted leading-relaxed mb-10">
            Configura il tuo pacchetto in 2 minuti con il nostro wizard interattivo.
          </p>
          <a
            href={`/?service=${serviceId}#pricing`}
            className="group inline-flex items-center justify-center gap-2 bg-accent text-background px-8 py-4 text-sm font-medium tracking-wide hover:bg-foreground transition-all duration-300"
          >
            Configura il pacchetto
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
