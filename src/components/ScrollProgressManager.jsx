'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useScrollStore from '@/stores/scrollStore'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProgressManager() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          useScrollStore.getState().setScrollProgress(self.progress)
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
