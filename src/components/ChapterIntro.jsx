'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ChapterIntro({ number, title, subtitle }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
        },
      })

      tl.fromTo(ref.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(8rem, 15vw, 15rem)',
          fontWeight: 700,
          color: 'rgba(99, 102, 241, 0.1)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {number}
      </span>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginTop: '-2rem',
          textAlign: 'center',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
            textAlign: 'center',
            maxWidth: '520px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
