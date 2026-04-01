'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from './MorphableObject'

export default function DeskBase({ materiality = 0, accentColor = '#6366f1' }) {
  const surfaceGeo = useMemo(() => new THREE.BoxGeometry(2.4, 0.08, 1.2), [])
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.75, 0.06), [])

  const legPositions = [
    [-1.1, -0.375, -0.5],
    [1.1, -0.375, -0.5],
    [-1.1, -0.375, 0.5],
    [1.1, -0.375, 0.5],
  ]

  return (
    <group position={[0, 0.75, 0]}>
      {/* Table surface */}
      <MorphableObject
        geometry={surfaceGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#1e1e2e', roughness: 0.8, metalness: 0.05 }}
      />

      {/* Legs */}
      {legPositions.map((pos, i) => (
        <MorphableObject
          key={i}
          geometry={legGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={pos}
          pbrProps={{ color: '#16161d', roughness: 0.7, metalness: 0.2 }}
        />
      ))}
    </group>
  )
}
