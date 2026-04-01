"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const rows = [
  {
    aspect: "Prezzo",
    noi: "Trasparente, fisso",
    freelancer: "Variabile",
    agenzia: "€3.000–€50.000+",
  },
  {
    aspect: "Preview AI",
    noi: "✓",
    freelancer: "✗",
    agenzia: "✗",
  },
  {
    aspect: "Tempi",
    noi: "3–25 giorni",
    freelancer: "7–60 giorni",
    agenzia: "30–180 giorni",
  },
  {
    aspect: "Prezzo pubblico",
    noi: "✓",
    freelancer: "A volte",
    agenzia: "✗",
  },
  {
    aspect: "Supporto post-lancio",
    noi: "Incluso/add-on",
    freelancer: "Limitato",
    agenzia: "A pagamento",
  },
];

function CellValue({ value, highlight }: { value: string; highlight?: boolean }) {
  const isCheck = value === "✓";
  const isCross = value === "✗";

  return (
    <span
      className={[
        "text-sm",
        isCheck && highlight
          ? "text-accent font-medium"
          : isCheck
          ? "text-foreground/60"
          : isCross
          ? "text-muted/50"
          : highlight
          ? "text-foreground font-medium"
          : "text-muted",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value}
    </span>
  );
}

export default function ComparisonTable() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const table = tableRef.current;
    if (!section || !table) return;

    const ctx = gsap.context(() => {
      gsap.from(table, {
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
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
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            Perché scegliere noi
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Il confronto
          </h2>
        </div>

        {/* Table wrapper — horizontal scroll on mobile */}
        <div ref={tableRef} className="overflow-x-auto -mx-8 px-8">
          <div className="min-w-140">
            {/* Column headers */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-0 mb-2">
              <div className="py-3 px-4" />
              <div className="py-3 px-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-accent">
                  Noi
                </span>
              </div>
              <div className="py-3 px-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted">
                  Freelancer
                </span>
              </div>
              <div className="py-3 px-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-muted">
                  Grande Agenzia
                </span>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.aspect}
                className={[
                  "grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-0 border-t border-border",
                  i === rows.length - 1 ? "border-b" : "",
                ].join(" ")}
              >
                {/* Aspect */}
                <div className="py-4 px-4">
                  <span className="text-xs text-muted/70 font-mono uppercase tracking-widest">
                    {row.aspect}
                  </span>
                </div>

                {/* Noi — highlighted column */}
                <div className="py-4 px-4 bg-accent/4 border-l border-r border-accent/10">
                  <CellValue value={row.noi} highlight />
                </div>

                {/* Freelancer */}
                <div className="py-4 px-4">
                  <CellValue value={row.freelancer} />
                </div>

                {/* Grande Agenzia */}
                <div className="py-4 px-4">
                  <CellValue value={row.agenzia} />
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
