"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProblemSolutionData, PainPoint } from "@/app/data/service-details";

gsap.registerPlugin(ScrollTrigger);

function PainPointList({
  points,
  label,
  accentColor,
}: {
  points: PainPoint[];
  label: string;
  accentColor: "muted" | "accent";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-6 font-mono">
        {label}
      </p>
      <ul className="space-y-5">
        {points.map((point, i) => {
          // Split the text around the bold portion to wrap it in <strong>
          const boldStart = point.text.indexOf(point.bold);
          if (boldStart === -1) {
            return (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${
                    accentColor === "accent" ? "bg-accent" : "bg-muted"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-base leading-relaxed text-muted">{point.text}</span>
              </li>
            );
          }

          const before = point.text.slice(0, boldStart);
          const after = point.text.slice(boldStart + point.bold.length);

          return (
            <li key={i} className="flex gap-3 items-start">
              <span
                className={`mt-2 shrink-0 w-1.5 h-1.5 rounded-full ${
                  accentColor === "accent" ? "bg-accent" : "bg-muted"
                }`}
                aria-hidden="true"
              />
              <span className="text-base leading-relaxed text-muted">
                {before}
                <strong className="text-foreground font-medium">{point.bold}</strong>
                {after}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ProblemSolutionProps {
  data: ProblemSolutionData;
}

export default function ProblemSolution({ data }: ProblemSolutionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cols = colsRef.current;
    if (!section || !cols) return;

    const children = cols.querySelectorAll<HTMLElement>(":scope > div");

    const ctx = gsap.context(() => {
      gsap.from(children, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.18,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div
          ref={colsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
        >
          {/* Left — Problems */}
          <PainPointList
            points={data.problems}
            label="Il problema"
            accentColor="muted"
          />

          {/* Right — Solutions */}
          <PainPointList
            points={data.solutions}
            label="La nostra soluzione"
            accentColor="accent"
          />
        </div>
      </div>

      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
