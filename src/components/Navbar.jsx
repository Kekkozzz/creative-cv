'use client';

import { useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Navbar() {
  const navRef = useRef(null);

  useEffect(() => {
    // GSAP animation - fade in from top
    if (typeof window !== 'undefined') {
      import('gsap').then(({ gsap }) => {
        const ctx = gsap.context(() => {
          gsap.from(navRef.current, {
            opacity: 0,
            y: -20,
            duration: 1,
            delay: 0.2,
            ease: 'power3.out',
          });
        }, navRef);

        return () => ctx.revert();
      });
    }
  }, []);

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Kekkozzz',
      icon: FaGithub,
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/francesco-romito-89b83632b/',
      icon: FaLinkedin,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/kekkoz_01/',
      icon: FaInstagram,
    },
  ];

  return (
    <nav
      ref={navRef}
      className="absolute top-0 left-0 right-0 z-50 w-full"
    >
      <div className=" mx-auto px-8 lg:px-16 py-8">
        <div className="flex items-center justify-between">

          {/* Logo / Name */}
          <div>
            <a
              href="#hero"
              className="font-heading font-bold text-white tracking-tight transition-colors duration-300 hover:text-[var(--accent-primary)]"
              style={{
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                letterSpacing: '0.05em',
              }}
            >
              FRANCESCO ROMITO
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300"
                  style={{
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  aria-label={social.name}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}
