'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function Keyboard({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.45, 0.02, 0.16), [])
  const keyGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.008, 0.03), [])

  // Generate a grid of keys (12 cols x 4 rows)
  const keys = useMemo(() => {
    const result = []
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        result.push([
          -0.18 + col * 0.033,
          0.014,
          -0.05 + row * 0.035,
        ])
      }
    }
    return result
  }, [])

  return (
    <group {...rest}>
      {/* Keyboard base */}
      <MorphableObject
        geometry={baseGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#16161d', roughness: 0.8, metalness: 0.15 }}
      />

      {/* Individual keys */}
      {keys.map((pos, i) => (
        <MorphableObject
          key={i}
          geometry={keyGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={pos}
          pbrProps={{ color: '#24243a', roughness: 0.6, metalness: 0.1 }}
        />
      ))}
    </group>
  )
}
