'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

const books = [
  { width: 0.18, height: 0.025, depth: 0.13, color: '#6366f1', y: 0 },
  { width: 0.17, height: 0.03, depth: 0.12, color: '#8b5cf6', y: 0.028 },
  { width: 0.19, height: 0.02, depth: 0.13, color: '#06b6d4', y: 0.053 },
  { width: 0.16, height: 0.035, depth: 0.12, color: '#10b981', y: 0.08 },
]

export default function BookStack({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const geometries = useMemo(
    () => books.map((b) => new THREE.BoxGeometry(b.width, b.height, b.depth)),
    []
  )

  return (
    <group {...rest}>
      {books.map((book, i) => (
        <MorphableObject
          key={i}
          geometry={geometries[i]}
          materiality={materiality}
          accentColor={accentColor}
          position={[0, book.y + book.height / 2, 0]}
          rotation={[0, (i % 2) * 0.08, 0]}
          pbrProps={{ color: book.color, roughness: 0.85, metalness: 0.02 }}
        />
      ))}
    </group>
  )
}
