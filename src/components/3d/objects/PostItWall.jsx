'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

// Scattered across the monitor area — like pinned on a screen
const postIts = [
  { pos: [-0.22, 0.08, 0.01], rot: [0, 0, 0.06], color: '#f59e0b' },
  { pos: [0.08, 0.1, 0.01], rot: [0, 0, -0.04], color: '#6366f1' },
  { pos: [0.25, 0.05, 0.01], rot: [0, 0, 0.08], color: '#10b981' },
  { pos: [-0.1, -0.06, 0.01], rot: [0, 0, -0.05], color: '#ef4444' },
  { pos: [0.15, -0.08, 0.01], rot: [0, 0, 0.03], color: '#06b6d4' },
  { pos: [-0.25, -0.03, 0.01], rot: [0, 0, -0.07], color: '#8b5cf6' },
  { pos: [0.28, -0.02, 0.01], rot: [0, 0, 0.05], color: '#f59e0b' },
  { pos: [-0.05, 0.12, 0.01], rot: [0, 0, -0.03], color: '#10b981' },
]

export default function PostItWall({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const noteGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.08, 0.003), [])

  return (
    <group {...rest}>
      {postIts.map((note, i) => (
        <MorphableObject
          key={i}
          geometry={noteGeo}
          materiality={materiality}
          accentColor={note.color}
          position={note.pos}
          rotation={note.rot}
          pbrProps={{ color: note.color, roughness: 0.95, metalness: 0, emissive: note.color, emissiveIntensity: 0.15 }}
        />
      ))}
    </group>
  )
}
