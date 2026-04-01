'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function SecondMonitor({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const panelGeo = useMemo(() => new THREE.BoxGeometry(0.55, 0.35, 0.025), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.18, 0.05), [])
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.012, 0.12), [])

  return (
    <group {...rest}>
      {/* Screen panel */}
      <MorphableObject
        geometry={panelGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.28, 0]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.3, metalness: 0.35 }}
      />

      {/* Stand neck */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.09, -0.015]}
        pbrProps={{ color: '#16161d', roughness: 0.5, metalness: 0.3 }}
      />

      {/* Stand base */}
      <MorphableObject
        geometry={baseGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0, -0.015]}
        pbrProps={{ color: '#16161d', roughness: 0.5, metalness: 0.3 }}
      />
    </group>
  )
}
