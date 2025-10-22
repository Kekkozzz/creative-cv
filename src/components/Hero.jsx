'use client';

import { useEffect, useRef } from 'react';

/**
 * Hero Section
 * Introduction with animated name and subheadline
 */
export default function Hero() {
  const heroRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        const ctx = gsap.context(() => {
          // Name animation
          gsap.from(nameRef.current, {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.3,
          });
        }, heroRef);

        return () => ctx.revert();
      });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, var(--accent-primary) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, var(--accent-secondary) 0%, transparent 50%)
          `,
          filter: 'blur(100px)',
          animation: 'gradient-shift 15s ease infinite',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Name */}
        <h1
          ref={nameRef}
          className="font-heading font-bold mb-6 gradient-text glow-text-primary"
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Francesco Romito
        </h1>

        {/* Subheadline */}
        <p
          className="font-body text-xl md:text-2xl lg:text-3xl mb-12"
          style={{
            color: '#a1a1aa',
          }}
        >
          Da zero righe di codice a 900 commit. Questa è la mia storia.
        </p>

        {/* Scroll Indicator */}
        <div className="mt-16 flex flex-col items-center gap-3 pulse-glow">
          <span
            className="text-sm font-body tracking-wider uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Scorri per iniziare
          </span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--accent-primary)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />
    </section>
  );
}
