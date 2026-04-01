'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'
import { useFade } from '../FadeInGroup'

export default function DeskClock({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const frameGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.15, 0.02), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.04, 0.04), [])

  const faceRef = useRef()
  const fadeRefOrValue = useFade()

  useFrame(({ clock }) => {
    if (!faceRef.current) return
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2
    faceRef.current.opacity = pulse * 0.4 * fade
    faceRef.current.visible = fade > 0.01
  })

  return (
    <group {...rest}>
      {/* Frame — lighter color to contrast with desk */}
      <MorphableObject
        geometry={frameGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.075, 0]}
        pbrProps={{ color: '#3a3a52', roughness: 0.85, metalness: 0.05 }}
      />

      {/* Display face — pulsing cyan glow */}
      <mesh position={[0, 0.075, 0.011]}>
        <planeGeometry args={[0.09, 0.11]} />
        <meshBasicMaterial
          ref={faceRef}
          color="#06b6d4"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Stand */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, -0.02, 0.01]}
        pbrProps={{ color: '#3a3a52', roughness: 0.85, metalness: 0.05 }}
      />
    </group>
  )
}
