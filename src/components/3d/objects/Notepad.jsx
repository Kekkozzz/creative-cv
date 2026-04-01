'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function Notepad({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const padGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.015, 0.3), [])
  const spineGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.02, 0.008), [])

  return (
    <group {...rest}>
      <MorphableObject
        geometry={padGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#e4e4e7', roughness: 0.9, metalness: 0 }}
      />
      <MorphableObject
        geometry={spineGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.005, -0.146]}
        pbrProps={{ color: '#8b5cf6', roughness: 0.7 }}
      />
    </group>
  )
}
