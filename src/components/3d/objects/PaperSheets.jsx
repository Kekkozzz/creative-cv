'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

const sheets = [
  { pos: [0, 0, 0], rot: [0, 0.15, 0] },
  { pos: [0.05, 0.002, 0.03], rot: [0, -0.1, 0] },
  { pos: [-0.03, 0.004, -0.02], rot: [0, 0.3, 0] },
]

export default function PaperSheets({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const sheetGeo = useMemo(() => new THREE.BoxGeometry(0.15, 0.002, 0.2), [])

  return (
    <group {...rest}>
      {sheets.map((s, i) => (
        <MorphableObject
          key={i}
          geometry={sheetGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={s.pos}
          rotation={s.rot}
          pbrProps={{ color: '#e4e4e7', roughness: 0.95, metalness: 0 }}
        />
      ))}
    </group>
  )
}
