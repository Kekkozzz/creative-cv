'use client'

import { useRef, createContext, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FadeContext = createContext(null)
const FALLBACK_FADE_REF = { current: 1 }

/**
 * Read the current fade multiplier (0–1) from the nearest FadeInGroup.
 * Returns a stable ref with current=1 if no FadeInGroup parent exists.
 */
export function useFade() {
  return useContext(FadeContext) ?? FALLBACK_FADE_REF
}

/**
 * Provides a smooth fade multiplier (0→1) via context ref.
 * Children call useFade() inside useFrame to get the current value.
 * No traverse, no material mutation — just a shared ref.
 */
export default function FadeInGroup({ visible, speed = 3, children, ...rest }) {
  const fadeRef = useRef(visible ? 1 : 0)

  useFrame((_, delta) => {
    const target = visible ? 1 : 0
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, target, Math.min(1, delta * speed))
  })

  return (
    <FadeContext.Provider value={fadeRef}>
      <group {...rest}>
        {children}
      </group>
    </FadeContext.Provider>
  )
}
