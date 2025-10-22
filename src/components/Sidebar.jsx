'use client';

import { useEffect, useState, useRef } from 'react';
import { getEnabledSections } from '@/data/sections';
import { isMobile } from '@/utils/detectDevice';

/**
 * Sidebar Navigation Component
 * Notion-style table of contents with scroll spy
 * - Fixed position on right side (desktop only)
 * - Active section highlighting
 * - Smooth scroll to sections
 * - Auto-hide when not needed
 */
export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('hero');
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
      className={`fixed right-8 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <nav
        className="rounded-lg p-4"
        style={{
          backgroundColor: 'rgba(22, 22, 29, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Progress indicator */}
        <div
          className="absolute left-2 top-4 bottom-4 w-0.5 rounded-full"
          style={{ backgroundColor: 'var(--border-medium)' }}
        >
          <div
            className="w-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'var(--accent-primary)',
              height: `${(sections.findIndex((s) => s.id === activeSection) / (sections.length - 1)) * 100}%`,
              boxShadow: '0 0 8px var(--glow-primary)',
            }}
          />
        </div>

        {/* Section links */}
        <ul className="space-y-3 ml-6">
          {sections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`group flex items-center gap-3 text-left transition-all duration-200 ${
                    isActive ? 'translate-x-1' : 'hover:translate-x-1'
                  }`}
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {/* Section number */}
                  <span
                    className={`font-mono text-xs font-semibold w-6 text-right transition-all duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-dimmed)',
                    }}
                  >
                    {section.number}
                  </span>

                  {/* Section title */}
                  <span
                    className={`font-body text-sm whitespace-nowrap transition-all duration-200 ${
                      isActive ? 'font-semibold' : 'font-normal group-hover:font-medium'
                    }`}
                  >
                    {section.shortTitle}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        boxShadow: '0 0 6px var(--glow-primary)',
                      }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Optional: Total progress percentage */}
        <div
          className="mt-4 pt-4 border-t text-center"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--text-dimmed)' }}
          >
            {Math.round((sections.findIndex((s) => s.id === activeSection) / (sections.length - 1)) * 100)}%
          </span>
        </div>
      </nav>
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
