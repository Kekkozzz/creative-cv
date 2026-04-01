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

  useFrame(() => {
    const { materiality } = useScrollStore.getState()

    // Ambient: brighter as materiality increases
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.4, 1.0, materiality)
    }

    // Directional (key light): stronger with more solid objects
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(0.6, 1.5, materiality)
    }

    // Accent point light: stronger in wireframe mode (glow effect)
    if (accentRef.current) {
      accentRef.current.intensity = THREE.MathUtils.lerp(1.5, 0.5, materiality)
    }

    // Fill light from opposite side: grows with materiality
    if (fillRef.current) {
      fillRef.current.intensity = THREE.MathUtils.lerp(0.1, 0.6, materiality)
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
        args={['#1e1e3a', '#0a0a0f', 0.3]}
      />
    </>
  )
}
