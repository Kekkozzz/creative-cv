"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { name: "Assipedia", tag: "Progetto Realizzato", image: "/projects/Assipedia.png" },
  { name: "Giurispedia", tag: "Progetto Realizzato", image: "/projects/Giurispedia.png" },
  { name: "Leonidia", tag: "Progetto Realizzato", image: "/projects/Leonidia.png" },
  { name: "Sparta", tag: "Progetto Realizzato", image: "/projects/Sparta.png" },
];

const row1 = projects;
const row2 = [...projects].reverse();

function ProjectCard({ name, tag, image }: { name: string; tag: string; image: string }) {
  return (
    <div className="shrink-0 w-md aspect-video relative border border-border bg-surface/40 overflow-hidden group">
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 90vw, 42rem"
        className="object-contain object-center grayscale saturate-0 transition-[transform,filter] duration-700 group-hover:grayscale-0 group-hover:saturate-100"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-7">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono mb-2">
          {tag}
        </p>
        <p className="text-base font-medium text-foreground">{name}</p>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(201,185,154,0.1)_0%,transparent_70%)]" />
    </div>
  );
}

function MobileProjectCard({ name, tag, image }: { name: string; tag: string; image: string }) {
  return (
    <div className="aspect-video relative border border-border bg-surface/40 overflow-hidden">
      <Image
        src={image}
        alt={name}
        fill
        sizes="45vw"
        className="object-contain object-center"
      />
      <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-accent font-mono mb-1">
          {tag}
        </p>
        <p className="text-sm font-medium text-foreground">{name}</p>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const r1 = row1Ref.current;
    const r2 = row2Ref.current;
    if (!section || !r1 || !r2) return;

    const ctx = gsap.context(() => {
      gsap.to(r1, {
        x: -200,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(r2, {
        x: 200,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 mb-16 md:mb-20">
        <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
          Casi Studio
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">
          Progetti realizzati
        </h2>
      </div>

      {/* Mobile — 2-column grid */}
      <div className="md:hidden px-4">
        <div className="grid grid-cols-2 gap-3">
          {projects.map((p) => (
            <MobileProjectCard key={p.name} name={p.name} tag={p.tag} image={p.image} />
          ))}
        </div>
      </div>

      {/* Desktop — parallax rows */}
      <div className="hidden md:block">
        <div
          ref={row1Ref}
          className="flex gap-6 mb-6"
          style={{ transform: "translateX(100px)" }}
        >
          {[...row1, ...row1].map((p, i) => (
            <ProjectCard key={`r1-${i}`} name={p.name} tag={p.tag} image={p.image} />
          ))}
        </div>

        <div
          ref={row2Ref}
          className="flex gap-6"
          style={{ transform: "translateX(-100px)" }}
        >
          {[...row2, ...row2].map((p, i) => (
            <ProjectCard key={`r2-${i}`} name={p.name} tag={p.tag} image={p.image} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
