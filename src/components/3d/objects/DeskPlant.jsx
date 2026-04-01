'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function DeskPlant({ materiality = 0, accentColor = '#6366f1', lively = false, ...rest }) {
  const potGeo = useMemo(() => new THREE.CylinderGeometry(0.05, 0.04, 0.08, 10), [])
  const soilGeo = useMemo(() => new THREE.CylinderGeometry(0.045, 0.045, 0.01, 10), [])
  const leafGeo = useMemo(() => new THREE.SphereGeometry(0.025, 6, 6), [])

  const groupRef = useRef()
  const leavesRef = useRef()

  // Subtle sway
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      const growth = lively ? 1.12 : 1
      const pulse = lively ? 1 + Math.sin(t * 2.6) * 0.03 : 1
      const targetScale = growth * pulse
      const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08)
      groupRef.current.scale.setScalar(s)
    }

    if (leavesRef.current) {
      const swayZ = lively ? 0.08 : 0.03
      const swayX = lively ? 0.05 : 0.02
      leavesRef.current.rotation.z = Math.sin(t * (lively ? 1.8 : 0.8)) * swayZ
      leavesRef.current.rotation.x = Math.sin(t * (lively ? 1.3 : 0.6)) * swayX
    }
  })

  const leaves = [
    { pos: [0, 0.1, 0], scale: 1.2 },
    { pos: [-0.03, 0.08, 0.02], scale: 0.9 },
    { pos: [0.03, 0.09, -0.02], scale: 1 },
    { pos: [0, 0.13, 0.01], scale: 0.8 },
    { pos: [-0.02, 0.12, -0.01], scale: 0.7 },
  ]

  return (
    <group ref={groupRef} {...rest}>
      {/* Pot */}
      <MorphableObject
        geometry={potGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.04, 0]}
        pbrProps={{ color: '#8b5cf6', roughness: 0.85, metalness: 0.05 }}
      />

      {/* Soil */}
      <MorphableObject
        geometry={soilGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.085, 0]}
        pbrProps={{ color: '#3a2a1a', roughness: 1, metalness: 0 }}
      />

      {/* Leaves cluster with sway */}
      <group ref={leavesRef}>
        {leaves.map((leaf, i) => (
          <MorphableObject
            key={i}
            geometry={leafGeo}
            materiality={materiality}
            accentColor="#10b981"
            position={leaf.pos}
            scale={leaf.scale}
            pbrProps={{ color: '#10b981', roughness: 0.8, metalness: 0 }}
          />
        ))}
      </group>
    </group>
  )
}
