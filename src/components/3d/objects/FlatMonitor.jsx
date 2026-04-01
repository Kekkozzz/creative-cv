'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function FlatMonitor({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const panelGeo = useMemo(() => new THREE.BoxGeometry(0.75, 0.45, 0.03), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.2, 0.06), [])
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.25, 0.015, 0.15), [])

  return (
    <group {...rest}>
      {/* Screen panel */}
      <MorphableObject
        geometry={panelGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.325, 0]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.3, metalness: 0.4 }}
      />

      {/* Stand neck */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.1, -0.02]}
        pbrProps={{ color: '#16161d', roughness: 0.5, metalness: 0.3 }}
      />

      {/* Stand base */}
      <MorphableObject
        geometry={baseGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0, -0.02]}
        pbrProps={{ color: '#16161d', roughness: 0.5, metalness: 0.3 }}
      />
    </group>
  )
}
