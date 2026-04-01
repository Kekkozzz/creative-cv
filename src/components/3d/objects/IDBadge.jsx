'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function IDBadge({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const cardGeo = useMemo(() => new THREE.BoxGeometry(0.12, 0.005, 0.16), [])
  const photoGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.006, 0.07), [])
  const clipGeo = useMemo(() => new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), [])

  return (
    <group {...rest}>
      {/* Card body — white, slightly emissive to be visible in dark scene */}
      <MorphableObject
        geometry={cardGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#d4d4d8', roughness: 0.9, metalness: 0, emissive: '#d4d4d8', emissiveIntensity: 0.08 }}
      />

      {/* Photo placeholder */}
      <MorphableObject
        geometry={photoGeo}
        materiality={materiality}
        accentColor="#6366f1"
        position={[0, 0.004, -0.025]}
        pbrProps={{ color: '#6366f1', roughness: 0.8, metalness: 0, emissive: '#6366f1', emissiveIntensity: 0.1 }}
      />

      {/* Clip */}
      <MorphableObject
        geometry={clipGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.012, 0.075]}
        pbrProps={{ color: '#a1a1aa', roughness: 0.4, metalness: 0.5 }}
      />
    </group>
  )
}
