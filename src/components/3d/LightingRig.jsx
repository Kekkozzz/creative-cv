'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScrollStore from '@/stores/scrollStore'

export default function LightingRig() {
  const ambientRef = useRef()
  const dirRef = useRef()
  const accentRef = useRef()

  useFrame(() => {
    const { materiality } = useScrollStore.getState()

    // Ambient: brighter as materiality increases
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.3, 0.8, materiality)
    }

    // Directional: stronger with more solid objects
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(0.5, 1.2, materiality)
    }

    // Accent point light: stronger in wireframe mode (glow effect)
    if (accentRef.current) {
      accentRef.current.intensity = THREE.MathUtils.lerp(1.5, 0.5, materiality)
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} />
      <directionalLight
        ref={dirRef}
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        ref={accentRef}
        position={[0, 2, 2]}
        color="#6366f1"
        intensity={1.5}
        distance={10}
      />
    </>
  )
}
