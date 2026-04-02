'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

/**
 * Ch.09 — A mini Three.js scene "inception": floating geometric shapes
 * that deform and levitate, representing mastery of 3D.
 */
export default function ThreeJSScene({ ...rest }) {
  const groupRef = useRef()
  const shapesRef = useRef([])
  const fadeRefOrValue = useFade()

  const shapes = useMemo(() => [
    { geo: new THREE.IcosahedronGeometry(0.06, 1), color: '#8b5cf6', orbit: 0.22, speed: 0.7, yOff: 0 },
    { geo: new THREE.TorusGeometry(0.04, 0.015, 8, 16), color: '#06b6d4', orbit: 0.18, speed: -1.1, yOff: 0.05 },
    { geo: new THREE.OctahedronGeometry(0.05, 0), color: '#10b981', orbit: 0.25, speed: 0.5, yOff: -0.03 },
    { geo: new THREE.TetrahedronGeometry(0.045, 0), color: '#f59e0b', orbit: 0.15, speed: -0.9, yOff: 0.07 },
    { geo: new THREE.DodecahedronGeometry(0.04, 0), color: '#ef4444', orbit: 0.2, speed: 0.8, yOff: -0.06 },
  ], [])

  const edges = useMemo(() => shapes.map(s => new THREE.EdgesGeometry(s.geo, 15)), [shapes])

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1
    }

    shapesRef.current.forEach((ref, i) => {
      if (!ref) return
      const s = shapes[i]
      const angle = t * s.speed
      ref.position.x = Math.cos(angle) * s.orbit
      ref.position.z = Math.sin(angle) * s.orbit
      ref.position.y = s.yOff + Math.sin(t * 1.5 + i) * 0.02
      ref.rotation.x = t * 0.5
      ref.rotation.z = t * 0.3

      // Update material opacity
      ref.traverse((child) => {
        if (child.material) {
          child.material.opacity = fade * 0.7
          child.visible = fade > 0.01
        }
      })
    })
  })

  return (
    <group {...rest}>
      <group ref={groupRef}>
        {shapes.map((s, i) => (
          <group key={i} ref={(el) => { shapesRef.current[i] = el }}>
            <lineSegments geometry={edges[i]}>
              <lineBasicMaterial color={s.color} transparent opacity={0} depthWrite={false} />
            </lineSegments>
            <mesh geometry={s.geo}>
              <meshBasicMaterial color={s.color} transparent opacity={0} depthWrite={false} wireframe />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
