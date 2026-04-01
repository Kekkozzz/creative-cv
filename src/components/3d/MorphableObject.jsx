'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * MorphableObject — renders a geometry as dual overlapping meshes:
 * 1. Wireframe (EdgesGeometry + LineBasicMaterial) — visible at low materiality
 * 2. Solid (MeshStandardMaterial) — visible at high materiality
 *
 * @param {THREE.BufferGeometry} geometry - The geometry to render
 * @param {number} materiality - 0 (wireframe) to 1 (solid)
 * @param {string} accentColor - Color for wireframe edges (default: indigo #6366f1)
 * @param {object} pbrProps - Props passed to MeshStandardMaterial (color, roughness, metalness, etc.)
 * @param {object} rest - Props passed to the outer <group> (position, rotation, scale, etc.)
 */
export default function MorphableObject({
  geometry,
  materiality = 0,
  accentColor = '#6366f1',
  pbrProps = {},
  children,
  ...rest
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry])

  const wireOpacity = Math.max(0, 1 - materiality)
  const solidOpacity = materiality

  return (
    <group {...rest}>
      {/* Wireframe layer */}
      {wireOpacity > 0.01 && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial
            color={accentColor}
            transparent
            opacity={wireOpacity}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* Solid PBR layer */}
      {solidOpacity > 0.01 && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#e4e4e7"
            roughness={0.6}
            metalness={0.1}
            {...pbrProps}
            transparent={solidOpacity < 0.99}
            opacity={solidOpacity}
          />
        </mesh>
      )}

      {children}
    </group>
  )
}
