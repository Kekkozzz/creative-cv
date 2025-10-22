'use client';

import { useEffect, useState, useRef } from 'react';
import { getEnabledSections } from '@/data/sections';
import { isMobile } from '@/utils/detectDevice';

/**
 * Sidebar Navigation Component - Minimal Morozov Style
 * - Only horizontal dashes on the right side
 * - Hover reveals section title in modal
 * - Active section highlighted
 */
export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sidebarRef = useRef(null);
  const sections = getEnabledSections();
  const mobile = typeof window !== 'undefined' && isMobile();

  // Hide sidebar on mobile
  if (mobile) return null;

  useEffect(() => {
    // Show sidebar after short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);

    // Intersection Observer for scroll spy
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <nav className="flex flex-col gap-6">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;

          return (
            <div key={section.id} className="relative flex items-center justify-end">
              {/* Hover Modal/Tooltip */}
              {isHovered && (
                <div
                  className="absolute right-full mr-4 whitespace-nowrap animate-fade-in"
                  style={{
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div
                    className="px-4 py-2 rounded-md"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Section number */}
                    <span
                      className="font-mono text-xs mr-3"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {section.number}
                    </span>
                    {/* Section title */}
                    <span
                      className="font-body text-sm"
                      style={{ color: '#e4e4e7' }}
                    >
                      {section.shortTitle}
                    </span>
                  </div>
                </div>
              )}

              {/* Dash/Line Button */}
              <button
                onClick={() => scrollToSection(section.id)}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className="group relative transition-all duration-300"
                style={{
                  width: isActive ? '40px' : '24px',
                  height: '2px',
                  background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: isActive ? '0 0 8px var(--glow-primary)' : 'none',
                }}
                aria-label={section.shortTitle}
              >
              </button>
            </div>
          );
        })}
      </nav>

      {/* Optional: Progress percentage (minimal) */}
      <div className="mt-8 text-right">
        <span
          className="font-mono text-xs"
          style={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          {String(Math.round((sections.findIndex((s) => s.id === activeSection) / (sections.length - 1)) * 100)).padStart(2, '0')}%
        </span>
      </div>

      {/* Fade-in animation keyframe */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
}

/**
 * Alternative: Mobile Progress Bar
 * Shows at top of screen on mobile instead of sidebar
 */
export function MobileProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const mobile = typeof window !== 'undefined' && isMobile();

  useEffect(() => {
    if (!mobile) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobile]);

  if (!mobile) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <div
        className="h-full transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: 'var(--accent-primary)',
          boxShadow: '0 0 8px var(--glow-primary)',
        }}
      />
    </div>
  );
}
