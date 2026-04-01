'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScrollStore from '@/stores/scrollStore'

export default function LightingRig() {
  const ambientRef = useRef()
  const dirRef = useRef()
  const accentRef = useRef()
  const fillRef = useRef()
  const hemiRef = useRef()

  useFrame(({ clock }) => {
    const { materiality, currentChapter } = useScrollStore.getState()
    const t = clock.getElapsedTime()
    const isAnimationChapter = currentChapter === 7

    // Ambient: brighter as materiality increases
    if (ambientRef.current) {
      const base = THREE.MathUtils.lerp(0.4, 1.0, materiality)
      ambientRef.current.intensity = base + (isAnimationChapter ? 0.12 : 0)
    }

    // Directional (key light): stronger with more solid objects
    if (dirRef.current) {
      const base = THREE.MathUtils.lerp(0.6, 1.5, materiality)
      dirRef.current.intensity = base + (isAnimationChapter ? 0.18 : 0)
    }

    // Accent point light: stronger in wireframe mode (glow effect)
    if (accentRef.current) {
      const base = THREE.MathUtils.lerp(1.5, 0.5, materiality)
      const pulse = isAnimationChapter ? 0.35 + (Math.sin(t * 3.2) + 1) * 0.18 : 0
      accentRef.current.intensity = base + pulse

      if (isAnimationChapter) {
        accentRef.current.color.setHSL(0.68 + Math.sin(t * 0.8) * 0.06, 0.85, 0.58)
      } else {
        accentRef.current.color.set('#6366f1')
      }
    }

    // Fill light from opposite side: grows with materiality
    if (fillRef.current) {
      const base = THREE.MathUtils.lerp(0.1, 0.6, materiality)
      fillRef.current.intensity = base + (isAnimationChapter ? 0.12 : 0)
    }

    // Hemisphere accent for chapter mood
    if (hemiRef.current) {
      const base = 0.3
      const pulse = isAnimationChapter ? (Math.sin(t * 1.8) + 1) * 0.06 : 0
      hemiRef.current.intensity = base + pulse
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />

      {/* Key light — main directional */}
      <directionalLight
        ref={dirRef}
        position={[5, 8, 5]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light — softer, from opposite side */}
      <directionalLight
        ref={fillRef}
        position={[-4, 4, 3]}
        intensity={0.1}
      />

      {/* Accent point light — indigo glow, stronger in wireframe chapters */}
      <pointLight
        ref={accentRef}
        position={[0, 2, 2]}
        color="#6366f1"
        intensity={1.5}
        distance={10}
      />

      {/* Hemisphere light — subtle sky/ground gradient for depth */}
      <hemisphereLight
        ref={hemiRef}
        args={['#1e1e3a', '#0a0a0f', 0.3]}
      />
    </>
  )
}
