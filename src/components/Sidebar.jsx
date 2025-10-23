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
  const [showSectionNotification, setShowSectionNotification] = useState(false);
  const [isNotificationExiting, setIsNotificationExiting] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const sidebarRef = useRef(null);
  const notificationTimerRef = useRef(null);
  const sections = getEnabledSections();
  const mobile = typeof window !== 'undefined' && isMobile();

  // Hide sidebar on mobile
  if (mobile) return null;

  // Show notification when section changes
  useEffect(() => {
    // Don't show notification on initial mount
    if (activeSection === 'hero' && !isVisible) return;

    // Clear existing timer
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    // Reset exit state and show notification
    setIsNotificationExiting(false);
    setShowSectionNotification(true);

    // Start fade out after 2 seconds
    notificationTimerRef.current = setTimeout(() => {
      setIsNotificationExiting(true);

      // Completely hide after fade out animation (300ms)
      setTimeout(() => {
        setShowSectionNotification(false);
        setIsNotificationExiting(false);
      }, 300);
    }, 2000);

    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, [activeSection, isVisible]);

  useEffect(() => {
    // Show sidebar after short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);

    // Scroll listener to detect when at the top (Hero section)
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('hero');
      }
    };

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

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
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
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
    >
      <nav
        className="flex flex-col gap-6"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;
          const showTooltip = isHovered || (isActive && showSectionNotification);

          return (
            <div key={section.id} className="relative flex items-center justify-end">
              {/* Tooltip - Shows on hover OR on section change (if active) */}
              {showTooltip && (
                <div
                  className="absolute right-full mr-3 whitespace-nowrap"
                  style={{
                    animation:
                      isActive && isNotificationExiting
                        ? 'fadeOut 0.3s ease-out forwards'
                        : isActive && showSectionNotification
                          ? 'slideIn 0.3s ease-in forwards'
                          : 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div
                    className="px-2 py-0.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(8px)',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {/* Section title only - ultra minimal */}
                    <span
                      className="font-body text-[10px] font-light tracking-wide"
                      style={{ color: 'rgba(255, 255, 255, 0.4)' }}
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
                className="group relative transition-all duration-200 cursor-pointer rounded-xl"
                style={{
                  width: isActive ? '40px' : isHovered ? '32px' : '24px',
                  height: isSidebarHovered ? '8px' : '2px',
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

      {/* Animations keyframes */}
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

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-8px);
          }
        }
      `}</style>
    </aside>
  );
}

/**
 * Alternative: Mobile Progress Bar
 * Shows at top of screen on mobile instead of sidebar
 * DISABLED - Not currently in use
 */
export function MobileProgressBar() {
  return null;
}
