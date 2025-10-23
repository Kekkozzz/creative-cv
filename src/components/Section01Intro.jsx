'use client';

import { useEffect, useRef } from 'react';

/**
 * Section 01 Intro - Chapter Opening
 * Minimal Morozov-style chapter introduction
 * - Large decorative number on the left
 * - Chapter title centered
 * - Brief introductory text
 */
export default function Section01Intro() {
  const sectionRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          gsap.registerPlugin(ScrollTrigger);

          const ctx = gsap.context(() => {
            const tl = gsap.timeline({
              defaults: { ease: 'power3.out' },
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
                toggleActions: 'play none none reverse',
              },
            });

            // Staggered entrance animations
            tl.from(numberRef.current, {
              opacity: 0,
              x: -50,
              duration: 1,
            })
              .from(
                titleRef.current,
                {
                  opacity: 0,
                  y: 30,
                  duration: 1,
                },
                '-=0.6'
              )
              .from(
                subtitleRef.current,
                {
                  opacity: 0,
                  y: 20,
                  duration: 1,
                },
                '-=0.6'
              );
          }, sectionRef);

          return () => ctx.revert();
        });
      });
    }
  }, []);

  return (
    <>
    <div className='-mt-1'>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="##000000" fillOpacity="1" d="M0,224L48,234.7C96,245,192,267,288,234.7C384,203,480,117,576,74.7C672,32,768,32,864,53.3C960,75,1056,117,1152,138.7C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
    </div>

    <section
      ref={sectionRef}
      id="section01"
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      
    >
      {/* Subtle gradient overlay */}
      

      {/* Main Content */}
      <div className="relative h-full w-full flex items-center">
        {/* Left Column: Decorative Number + Vertical Text */}
        <div className="absolute left-8 lg:left-16 xl:left-24 z-10 hidden lg:block" style={{ top: '50%', transform: 'translateY(calc(-50% + -1rem))' }}>
          <div className="relative flex flex-col items-center">
            {/* Large Number "01" */}
            <div
              ref={numberRef}
              className="font-heading font-bold select-none text-white/10 leading-none tracking-tighter"
              style={{
                fontSize: 'clamp(10rem, 16vw, 18rem)',
                letterSpacing: '0.01em',
              }}
            >
              01
            </div>

            {/* Vertical Line */}
            <div className="w-0.5 h-[100px] bg-white/20 mt-8" />

            {/* Vertical Text */}
            <div
              className="mt-8"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              <span className="font-body text-xs uppercase text-zinc-500 font-medium" style={{ letterSpacing: '0.5em' }}>
                La prima riga
              </span>
            </div>
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16">
          <div className="lg:ml-48 xl:ml-64 max-w-2xl">
            {/* Mobile number badge */}
            <div className="lg:hidden mb-6">
              <div
                className="inline-block font-mono text-sm px-3 py-1 rounded"
                style={{
                  color: 'var(--accent-primary)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--accent-primary)',
                }}
              >
                01
              </div>
            </div>

            {/* Title */}
            <div ref={titleRef} className="mb-6">
              <h2
                className="font-heading font-bold text-white leading-none tracking-tight mb-4"
                style={{
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                La Prima Riga
              </h2>
              <div className="w-20 h-[3px] bg-accent-primary" />
            </div>

            {/* Subtitle / Intro text */}
            <div ref={subtitleRef} className="space-y-4">
              <p className="font-body text-xl leading-relaxed text-gray-300">
                Dove tutto ha inizio. Il momento in cui la curiosità si trasforma in passione.
              </p>
              <p className="font-body text-base leading-relaxed text-gray-400">
                Una notte, uno schermo acceso, e la prima riga di codice che cambierà tutto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
        }}
      />
    </section>
        </>
  );
}
