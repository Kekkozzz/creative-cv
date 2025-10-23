'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from './Navbar';

/**
 * Hero Section - Morozov Style
 * Structured layout with decorative number and vertical text
 */
export default function Hero() {
  const heroRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          // Staggered entrance animations
          tl.from(numberRef.current, {
            opacity: 0,
            x: -50,
            duration: 1,
            delay: 0.3,
          })
          .from(titleRef.current, {
            opacity: 0,
            y: 30,
            duration: 1,
          }, '-=0.6')
          .from(textRef.current, {
            opacity: 0,
            y: 20,
            duration: 1,
          }, '-=0.6')
          .from(imageRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 1.2,
          }, '-=0.8');
        }, heroRef);

        return () => ctx.revert();
      });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content - starts at mid-page */}
      <div className="relative h-screen flex items-center">

        {/* Left Column: Decorative Number + Vertical Text */}
        <div className="absolute left-8 lg:left-16 xl:left-24 z-10 hidden lg:block" style={{ top: '50%', transform: 'translateY(calc(-50% + -1rem))' }}>
          <div className="relative flex flex-col items-center">
            {/* Large Number "00" */}
            <div
              ref={numberRef}
              className="font-heading font-bold select-none text-white/10 leading-none tracking-tighter"
              style={{
                fontSize: 'clamp(10rem, 16vw, 18rem)',
                letterSpacing: '-0.05em',
              }}
            >
              00
            </div>

            {/* Vertical Line */}
            <div className="w-0.5 h-[100px] bg-white/20 mt-8" />

            {/* Vertical Text "INTRO" */}
            <div
              className="mt-8"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
              }}
            >
              <span className="font-body text-xs uppercase text-zinc-500 font-medium" style={{ letterSpacing: '0.5em' }}>
                INTRO
              </span>
            </div>
          </div>
        </div>

        {/* Center-Left: Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16">
          <div className="lg:ml-48 xl:ml-64 max-w-xl">

            {/* Title "Hello" with underline */}
            <div ref={titleRef} className="mb-8">
              <h1
                className="font-heading font-bold mb-4 text-white leading-none tracking-tight"
                style={{
                  fontSize: 'clamp(3.5rem, 7vw, 6rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                Hello
              </h1>
              <div className="w-[60px] h-[3px] bg-accent-primary" />
            </div>

            {/* Bio Text */}
            <div ref={textRef} className="space-y-6">
              <p className="font-body text-lg leading-relaxed text-gray-300">
                Mi chiamo <strong className="font-semibold text-white">Francesco Romito</strong>,
                e sono un Creative Developer appassionato di storytelling digitale.
              </p>
              <p className="font-body text-base leading-relaxed text-gray-400">
                Con passione, creatività ed entusiasmo, costruisco esperienze digitali che raccontano storie.
                Da zero righe di codice a 900+ commit, ogni progetto è un capitolo della mia evoluzione.
              </p>

              {/* Scroll CTA */}
              <div className="pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-body tracking-wider uppercase text-gray-500">
                    Scorri per scoprire
                  </span>
                  <svg
                    className="w-5 h-5 text-accent-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

              {/* Role Badge */}
              <div className="pt-4">
                <span className="inline-block px-5 py-2.5 rounded-full font-body text-xs tracking-widest uppercase bg-transparent text-accent-primary border-[1.5px] border-accent-primary font-medium">
                  Creative Developer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Large Image - Overflowing */}
        <div
          ref={imageRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block z-5"
          style={{
            width: 'clamp(600px, 60vw, 1200px)',
            height: 'clamp(700px, 85vh, 900px)',
          }}
        >
          <Image
            src="/me.svg"
            alt="Francesco Romito"
            fill
            className="object-contain object-center grayscale contrast-[1.15] brightness-95"
            priority
          />
        </div>

        {/* Mobile: Image below text */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 h-[50vh] opacity-30">
          <Image
            src="/me.svg"
            alt="Francesco Romito"
            fill
            className="object-contain object-bottom grayscale contrast-[1.15] brightness-95"
            priority
          />
        </div>

      </div>
    </section>
  );
}
