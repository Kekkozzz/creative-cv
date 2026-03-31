"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Globe, ShoppingBag, Zap, Smartphone } from "lucide-react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { categories, type ServiceCategory } from "../data/packages";

const fallbackIcons: Record<string, React.ReactNode> = {
  globe: <Globe size={48} strokeWidth={1} />,
  "shopping-bag": <ShoppingBag size={48} strokeWidth={1} />,
  zap: <Zap size={48} strokeWidth={1} />,
  smartphone: <Smartphone size={48} strokeWidth={1} />,
};

function ServiceCard({
  cat,
}: {
  cat: ServiceCategory;
}) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [animationData, setAnimationData] = useState<any>(null);
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(hover: hover)").matches;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Keep media query preferences in sync.
  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onHoverChange = (event: MediaQueryListEvent) => {
      setIsTouch(!event.matches);
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    hoverQuery.addEventListener("change", onHoverChange);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      hoverQuery.removeEventListener("change", onHoverChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  // Load lottie data only on desktop (hover-capable devices).
  useEffect(() => {
    if (!cat.lottie || isTouch) return;

    fetch(cat.lottie)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => {
        /* silent fallback to icon */
      });
  }, [cat.lottie, isTouch]);

  const handleMouseEnter = useCallback(() => {
    if (isTouch || prefersReducedMotion) return;
    lottieRef.current?.play();
  }, [isTouch, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (isTouch || prefersReducedMotion) return;
    lottieRef.current?.stop();
  }, [isTouch, prefersReducedMotion]);

  // Determine filter classes
  const showGrayscale = !isTouch && !prefersReducedMotion;

  return (
    <a
      ref={cardRef}
      href={'/servizi/' + cat.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative border border-border bg-surface/30 p-8 md:p-10 hover:border-accent/30 hover:bg-surface/60 transition-all duration-500"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-6 items-center">
        {/* Text content */}
        <div className="order-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Icon — visible only on mobile */}
            <span className="sm:hidden text-accent" aria-hidden="true">
              {fallbackIcons[cat.icon]}
            </span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono">
              {cat.name}
            </p>
          </div>
          <h3 className="text-lg font-medium tracking-tight mb-3 group-hover:text-accent transition-colors duration-300">
            {cat.description}
          </h3>
          <p className="text-sm text-muted font-mono mb-2">
            da {cat.startingPrice}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono mb-4">
            Preview AI inclusa
          </p>
          <div className="text-xs text-muted group-hover:text-foreground transition-colors duration-300 flex items-center gap-1">
            Vedi pacchetti
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>

        {/* Lottie — hidden on mobile, visible on desktop */}
        <div
          aria-hidden="true"
          role="presentation"
          className={`hidden sm:flex order-2 items-center justify-center max-h-48 transition-[filter] duration-500 ${
            showGrayscale
              ? "grayscale brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-100"
              : ""
          }`}
        >
          {animationData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop
              autoplay={false}
              className="w-full h-full max-h-48"
            />
          ) : (
            <span className="text-muted group-hover:text-accent transition-colors duration-500">
              {fallbackIcons[cat.icon]}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function ServicesOverview() {
  return (
    <section id="servizi" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-4 font-mono">
            I nostri servizi
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight">
            Cosa possiamo fare per te
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <ServiceCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
