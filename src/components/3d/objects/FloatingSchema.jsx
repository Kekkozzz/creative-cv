'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

/**
 * Floating DB schema — wireframe boxes (tables) connected by lines,
 * hovering above the desk with gentle bobbing animation.
 */
export default function FloatingSchema({ accentColor = '#06b6d4', ...rest }) {
  const groupRef = useRef()
  const fadeRefOrValue = useFade()

  // Table positions
  const tables = useMemo(() => [
    { pos: [-0.15, 0, 0], size: [0.12, 0.06, 0.08] },
    { pos: [0.15, 0, 0], size: [0.14, 0.06, 0.08] },
    { pos: [0, 0, 0.15], size: [0.1, 0.06, 0.08] },
    { pos: [0, 0.12, 0.07], size: [0.11, 0.06, 0.08] },
  ], [])

  // Connection lines between tables
  const lineGeo = useMemo(() => {
    const points = [
      // Table 0 → Table 1
      new THREE.Vector3(-0.09, 0, 0), new THREE.Vector3(0.08, 0, 0),
      // Table 0 → Table 2
      new THREE.Vector3(-0.15, 0, 0.04), new THREE.Vector3(0, 0, 0.11),
      // Table 1 → Table 3
      new THREE.Vector3(0.15, 0, 0.04), new THREE.Vector3(0, 0.12, 0.07),
      // Table 2 → Table 3
      new THREE.Vector3(0, 0, 0.19), new THREE.Vector3(0, 0.12, 0.11),
    ]
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(
      points.flatMap(p => [p.x, p.y, p.z]), 3
    ))
    return geo
  }, [])

  const edgeGeos = useMemo(
    () => tables.map(t => new THREE.EdgesGeometry(new THREE.BoxGeometry(...t.size), 15)),
    [tables]
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    // Gentle floating bob
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.03
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05

    // Update line and edge opacities based on fade
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    groupRef.current.traverse((child) => {
      if (child.material && child.material.transparent) {
        if (child.userData._schemaBase === undefined) {
          child.userData._schemaBase = child.material.opacity
        }
        child.material.opacity = child.userData._schemaBase * fade
        child.material.visible = fade > 0.01
      }
    })
  })

  return (
    <group {...rest}>
      <group ref={groupRef}>
        {/* Table wireframes */}
        {tables.map((table, i) => (
          <lineSegments key={i} geometry={edgeGeos[i]} position={table.pos}>
            <lineBasicMaterial
              color={accentColor}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </lineSegments>
        ))}

        {/* Connection lines */}
        <lineSegments geometry={lineGeo}>
          <lineBasicMaterial
            color={accentColor}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  )
}
