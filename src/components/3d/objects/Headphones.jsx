'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function Headphones({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  // Headband arc
  const bandGeo = useMemo(() => new THREE.TorusGeometry(0.08, 0.008, 8, 16, Math.PI), [])
  // Ear cups
  const cupGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 0.025, 12), [])
  // Ear cushions
  const cushionGeo = useMemo(() => new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12), [])

  return (
    <group {...rest}>
      {/* Headband */}
      <MorphableObject
        geometry={bandGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.08, 0]}
        rotation={[0, 0, 0]}
        pbrProps={{ color: '#2a2a3d', roughness: 0.6, metalness: 0.3 }}
      />

      {/* Left ear cup */}
      <MorphableObject
        geometry={cupGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[-0.08, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        pbrProps={{ color: '#2a2a3d', roughness: 0.5, metalness: 0.25 }}
      />

      {/* Right ear cup */}
      <MorphableObject
        geometry={cupGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0.08, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        pbrProps={{ color: '#2a2a3d', roughness: 0.5, metalness: 0.25 }}
      />

      {/* Left cushion */}
      <MorphableObject
        geometry={cushionGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[-0.08, 0, 0.015]}
        rotation={[Math.PI / 2, 0, 0]}
        pbrProps={{ color: '#3a3a52', roughness: 0.9, metalness: 0 }}
      />

      {/* Right cushion */}
      <MorphableObject
        geometry={cushionGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0.08, 0, 0.015]}
        rotation={[Math.PI / 2, 0, 0]}
        pbrProps={{ color: '#3a3a52', roughness: 0.9, metalness: 0 }}
      />
    </group>
  )
}
