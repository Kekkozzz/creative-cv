'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function DeskChair({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.06, 0.5), [])
  const backGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.06), [])
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), [])

  return (
    <group {...rest}>
      {/* Seat */}
      <MorphableObject
        geometry={seatGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.45, 0]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.7 }}
      />

      {/* Backrest */}
      <MorphableObject
        geometry={backGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.7, -0.22]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.7 }}
      />

      {/* Center pole */}
      <MorphableObject
        geometry={legGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.225, 0]}
        pbrProps={{ color: '#16161d', metalness: 0.3 }}
      />
    </group>
  )
}
