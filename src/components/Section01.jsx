'use client';

import { useEffect, useRef, useState } from 'react';
import CodeEditor, { CodeExamples } from './CodeEditor';
import { isMobile } from '@/utils/detectDevice';

/**
 * Section 01: "La Prima Riga"
 * The first line of code - beginning of the journey
 * Features:
 * - Split layout (text | code editor)
 * - ScrollTrigger animations
 * - Parallax effects
 * - Typing animation in code editor
 * - Blurred desk background
 */
export default function Section01() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const editorRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const mobile = typeof window !== 'undefined' && isMobile();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // Title slide in from left
          gsap.from(titleRef.current, {
            opacity: 0,
            x: -100,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          });

          // Text paragraphs stagger fade in
          const paragraphs = textRef.current.querySelectorAll('p');
          gsap.from(paragraphs, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 75%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          });

          // Code editor slide in from right
          gsap.from(editorRef.current, {
            opacity: 0,
            x: 100,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: editorRef.current,
              start: 'top 75%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
              onEnter: () => setIsVisible(true),
            },
          });

          // Parallax effects (desktop only)
          if (!mobile) {
            // Background image slower parallax
            gsap.to(backgroundRef.current, {
              yPercent: 30,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });

            // Text normal speed
            gsap.to(textRef.current, {
              yPercent: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });

            // Editor slower parallax
            gsap.to(editorRef.current, {
              yPercent: -20,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          }
        }, sectionRef);

        return () => ctx.revert();
      });
    });
  }, [mobile]);

  return (
    <section
      ref={sectionRef}
      id="section01"
      className="relative min-h-screen flex items-center py-20 overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Background - Blurred desk image */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.3)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg,
            rgba(10, 10, 15, 0.95) 0%,
            rgba(22, 22, 29, 0.9) 50%,
            rgba(10, 10, 15, 0.95) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Section Number + Title */}
        <div ref={titleRef} className="mb-12">
          <div
            className="inline-block font-mono text-sm mb-2 px-3 py-1 rounded"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid var(--accent-primary)',
            }}
          >
            01
          </div>
          <h2
            className="font-heading font-bold gradient-text"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            La Prima Riga
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Narrative text */}
          <div ref={textRef} className="space-y-6">
            <p
              className="font-body text-lg leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              Ricordo ancora quel primo <code className="px-2 py-1 rounded" style={{
                backgroundColor: 'var(--code-bg)',
                color: 'var(--code-string)',
                fontFamily: 'monospace'
              }}>Hello World</code>.
            </p>

            <p
              className="font-body text-lg leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              Le mani sulla tastiera, incerte. Era le 2 di notte, solo io e lo schermo acceso.
            </p>

            <p
              className="font-body text-lg leading-relaxed"
              style={{ color: 'var(--text-primary)' }}
            >
              Non sapevo che quelle poche righe avrebbero cambiato tutto.
              <br />
              Non sapevo che era l'inizio di <span style={{ color: 'var(--accent-tertiary)', fontWeight: 600 }}>600 ore di formazione</span>,
              di notti passate a debuggare, di quella sensazione incredibile quando il codice finalmente funziona.
            </p>

            <p
              className="font-body text-xl leading-relaxed font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Era l'inizio di tutto.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="space-y-2">
                <div
                  className="font-mono text-4xl font-bold gradient-text"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  600
                </div>
                <div
                  className="font-body text-sm uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Ore di formazione
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="font-mono text-4xl font-bold gradient-text"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  900
                </div>
                <div
                  className="font-body text-sm uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Commit nell'ultimo anno
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code Editors with typing animation */}
          <div ref={editorRef} className="gpu-accelerated space-y-6">
            {/* HTML Editor */}
            <CodeEditor
              code={CodeExamples.helloWorldHTML}
              language="html"
              showTyping={isVisible && !mobile}
              typingSpeed={50}
              typingDelay={300}
              showOutput={false}
              fileName="index.html"
              showLineNumbers={true}
              className="hover:shadow-2xl transition-shadow duration-300"
            />

            {/* CSS & JS Editors side by side */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* CSS Editor */}
              <CodeEditor
                code={CodeExamples.helloWorldCSS}
                language="css"
                showTyping={isVisible && !mobile}
                typingSpeed={50}
                typingDelay={2000}
                showOutput={false}
                fileName="style.css"
                showLineNumbers={true}
                className="hover:shadow-2xl transition-shadow duration-300"
              />

              {/* JS Editor */}
              <CodeEditor
                code={CodeExamples.helloWorldJS}
                language="javascript"
                showTyping={isVisible && !mobile}
                typingSpeed={50}
                typingDelay={3500}
                showOutput={false}
                fileName="script.js"
                showLineNumbers={true}
                className="hover:shadow-2xl transition-shadow duration-300"
              />
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
  );
}
