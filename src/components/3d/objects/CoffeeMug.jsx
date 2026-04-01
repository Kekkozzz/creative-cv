'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function CoffeeMug({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.055, 0.12, 12), [])
  const handleGeo = useMemo(() => new THREE.TorusGeometry(0.035, 0.008, 8, 12, Math.PI), [])

  return (
    <group {...rest}>
      <MorphableObject
        geometry={bodyGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.06, 0]}
        pbrProps={{ color: '#e4e4e7', roughness: 0.4, metalness: 0.1 }}
      />
      <MorphableObject
        geometry={handleGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0.065, 0.06, 0]}
        rotation={[0, 0, Math.PI / 2]}
        pbrProps={{ color: '#e4e4e7', roughness: 0.4 }}
      />
    </group>
  )
}
