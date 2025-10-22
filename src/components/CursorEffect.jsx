'use client';

import { useEffect, useRef, useState } from 'react';
import { isMobile, isTouchDevice } from '@/utils/detectDevice';

/**
 * Custom Cursor Component
 * Replaces default cursor with trembling effect (desktop only)
 * Adds glow effect and follows mouse with smooth lag
 */
export default function CursorEffect({ trembleIntensity = 2, enabled = true }) {
  const cursorRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const trembleInterval = useRef(null);

  useEffect(() => {
    // Don't show custom cursor on mobile/touch devices
    if (!enabled || isMobile() || isTouchDevice()) {
      return;
    }

    // Add custom-cursor class to body
    document.body.classList.add('custom-cursor');

    const cursor = cursorRef.current;
    const cursorGlow = cursorGlowRef.current;

    // Mouse move handler
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    // Mouse enter/leave handlers
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Smooth follow animation with trembling effect
    const animateCursor = () => {
      if (!cursor || !cursorGlow) return;

      // Smooth lag (easing)
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

      // Apply trembling offset
      const trembleX = (Math.random() - 0.5) * trembleIntensity;
      const trembleY = (Math.random() - 0.5) * trembleIntensity;

      cursor.style.transform = `translate3d(${cursorPos.current.x + trembleX}px, ${cursorPos.current.y + trembleY}px, 0)`;
      cursorGlow.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;

      requestAnimationFrame(animateCursor);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    // Start animation loop
    animateCursor();

    // Cleanup
    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      if (trembleInterval.current) {
        clearInterval(trembleInterval.current);
      }
    };
  }, [enabled, trembleIntensity, isVisible]);

  // Don't render on mobile
  if (!enabled || isMobile() || isTouchDevice()) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: 'var(--accent-primary)',
          boxShadow: '0 0 12px var(--glow-primary)',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform',
        }}
      />

      {/* Cursor glow effect (follows with more lag) */}
      <div
        ref={cursorGlowRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] transition-opacity duration-500 ${
          isVisible ? 'opacity-40' : 'opacity-0'
        }`}
        style={{
          backgroundColor: 'var(--accent-primary)',
          filter: 'blur(12px)',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform',
        }}
      />
    </>
  );
}

/**
 * Hook to increase cursor tremble intensity temporarily
 * Useful for specific sections (like "La Prima Riga" typing animation)
 */
export function useCursorTremble(intensity = 5, duration = 2000) {
  const [trembleLevel, setTrembleLevel] = useState(2);

  const triggerTremble = () => {
    setTrembleLevel(intensity);
    setTimeout(() => {
      setTrembleLevel(2);
    }, duration);
  };

  return [trembleLevel, triggerTremble];
}
