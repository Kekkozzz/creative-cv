'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function DeskClock({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const frameGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.15, 0.02), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.04, 0.04), [])
  const faceGeo = useMemo(() => new THREE.PlaneGeometry(0.09, 0.11), [])

  // Subtle pulsing glow on the face
  const faceRef = useRef()
  useFrame(({ clock }) => {
    if (faceRef.current) {
      const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2
      faceRef.current.opacity = pulse * (1 - materiality) * 0.3
    }
  })

  return (
    <group {...rest}>
      {/* Frame */}
      <MorphableObject
        geometry={frameGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.075, 0]}
        pbrProps={{ color: '#24243a', roughness: 0.7, metalness: 0.2 }}
      />

      {/* Display face — glowing */}
      <mesh position={[0, 0.075, 0.011]}>
        <planeGeometry args={[0.09, 0.11]} />
        <meshBasicMaterial
          ref={faceRef}
          color="#06b6d4"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Stand */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, -0.02, 0.01]}
        pbrProps={{ color: '#16161d', roughness: 0.8 }}
      />
    </group>
  )
}
