'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * AnimatedText Component
 * Creates realistic typing animation with:
 * - Variable speed (human-like)
 * - Optional typos that get corrected
 * - Blinking cursor
 * - Callbacks for animation events
 */
export default function AnimatedText({
  text,
  speed = 80,
  startDelay = 0,
  showCursor = true,
  typos = [],
  onComplete,
  onCharacter,
  className = '',
  cursorClassName = 'cursor-blink',
  style = {},
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursorState, setShowCursorState] = useState(showCursor);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);
  const typoStateRef = useRef({ active: false, typoIndex: -1, correcting: false });

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setIsComplete(false);
    setShowCursorState(showCursor);
    indexRef.current = 0;
    typoStateRef.current = { active: false, typoIndex: -1, correcting: false };

    const typeCharacter = () => {
      const currentIndex = indexRef.current;

      // Check if we should inject a typo
      const typo = typos.find(t => t.at === currentIndex && !typoStateRef.current.active);

      if (typo && !typoStateRef.current.correcting) {
        // Start typing the typo
        typoStateRef.current = { active: true, typoIndex: 0, correcting: false, typo };
        typeTypo();
        return;
      }

      if (currentIndex < text.length) {
        const nextChar = text[currentIndex];

        setDisplayedText(prev => prev + nextChar);
        indexRef.current++;

        // Call character callback
        if (onCharacter) {
          onCharacter(nextChar, currentIndex);
        }

        // Variable speed for human-like typing
        const variance = (Math.random() - 0.5) * (speed * 0.4);
        const nextSpeed = Math.max(30, speed + variance);

        timeoutRef.current = setTimeout(typeCharacter, nextSpeed);
      } else {
        // Animation complete
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    const typeTypo = () => {
      const { typo, typoIndex, correcting } = typoStateRef.current;

      if (!correcting) {
        // Typing the typo
        if (typoIndex < typo.wrong.length) {
          const nextChar = typo.wrong[typoIndex];
          setDisplayedText(prev => prev + nextChar);
          typoStateRef.current.typoIndex++;

          timeoutRef.current = setTimeout(typeTypo, speed * 0.7);
        } else {
          // Typo complete, pause, then start correcting
          timeoutRef.current = setTimeout(() => {
            typoStateRef.current.correcting = true;
            typoStateRef.current.typoIndex = 0;
            typeTypo();
          }, typo.pauseDuration || 300);
        }
      } else {
        // Correcting the typo (backspacing)
        if (typoStateRef.current.typoIndex < typo.wrong.length) {
          setDisplayedText(prev => prev.slice(0, -1));
          typoStateRef.current.typoIndex++;

          timeoutRef.current = setTimeout(typeTypo, speed * 0.5);
        } else {
          // Correction complete, resume normal typing
          typoStateRef.current = { active: false, typoIndex: -1, correcting: false };
          timeoutRef.current = setTimeout(typeCharacter, speed);
        }
      }
    };

    // Start typing after delay
    timeoutRef.current = setTimeout(typeCharacter, startDelay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, startDelay, showCursor, typos, onComplete, onCharacter]);

  return (
    <span className={className} style={style}>
      {displayedText}
      {showCursorState && !isComplete && (
        <span
          className={cursorClassName}
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: 'var(--accent-primary)',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
    </span>
  );
}

/**
 * TypewriterText - Alternative simpler version using GSAP
 * For use with GSAP ScrollTrigger animations
 */
export function TypewriterText({ children, duration = 2, stagger = 0.03, delay = 0 }) {
  const textRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic import of GSAP
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const element = textRef.current;
        if (!element) return;

        // Split text into characters
        const text = element.textContent;
        element.innerHTML = '';

        text.split('').forEach(char => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.opacity = '0';
          element.appendChild(span);
        });

        // Animate characters
        gsap.to(element.children, {
          opacity: 1,
          duration: 0.05,
          stagger: stagger,
          delay: delay,
          ease: 'none',
        });
      });
    });
  }, [children, duration, stagger, delay]);

  return <span ref={textRef}>{children}</span>;
}

/**
 * Typing animation presets for common use cases
 */
export const TypingPresets = {
  // Fast typing (developer speed)
  fast: { speed: 50, typos: [] },

  // Normal typing (human speed)
  normal: { speed: 80, typos: [] },

  // Slow typing (uncertain beginner)
  slow: { speed: 150, typos: [] },

  // Beginner with typos (like in "La Prima Riga")
  beginner: {
    speed: 120,
    typos: [
      { at: 16, wrong: 'Wrold', pauseDuration: 400 },
    ],
  },

  // Code typing with occasional mistakes
  coding: {
    speed: 60,
    typos: [
      { at: 10, wrong: 'fucntion', pauseDuration: 300 },
    ],
  },
};
