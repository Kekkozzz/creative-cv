'use client'

import { useMemo, useRef, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Import the fade context directly to read .current in useFrame
import { useFade } from './FadeInGroup'

export default function MorphableObject({
  geometry,
  materiality = 0,
  accentColor = '#6366f1',
  pbrProps = {},
  children,
  ...rest
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry])

  const wireMatRef = useRef()
  const wireGlowRef = useRef()
  const solidMatRef = useRef()
  const currentMat = useRef(materiality)
  // useFade returns either a ref (inside FadeInGroup) or the number 1
  const fadeRefOrValue = useFade()

  useFrame((_, delta) => {
    // Smooth lerp toward target materiality
    currentMat.current = THREE.MathUtils.lerp(currentMat.current, materiality, Math.min(1, delta * 3))
    const m = currentMat.current

    // Get fade multiplier: ref.current if inside FadeInGroup, otherwise 1
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current

    const wireOp = Math.max(0, 1 - m) * fade
    const solidOp = m * fade

    if (wireMatRef.current) {
      wireMatRef.current.opacity = wireOp
      wireMatRef.current.visible = wireOp > 0.01
    }
    if (wireGlowRef.current) {
      wireGlowRef.current.opacity = wireOp * 0.06
      wireGlowRef.current.visible = wireOp > 0.01
    }
    if (solidMatRef.current) {
      solidMatRef.current.opacity = solidOp
      solidMatRef.current.transparent = solidOp < 0.99
      solidMatRef.current.visible = solidOp > 0.01
    }
  })

  return (
    <group {...rest}>
      {/* Wireframe edges */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          ref={wireMatRef}
          color={accentColor}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </lineSegments>

      {/* Faint emissive fill for glow-like effect */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          ref={wireGlowRef}
          color={accentColor}
          transparent
          opacity={0.06}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Solid PBR layer */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          ref={solidMatRef}
          color="#e4e4e7"
          roughness={0.6}
          metalness={0.1}
          {...pbrProps}
          transparent
          opacity={0}
          visible={false}
        />
      </mesh>

      {children}
    </group>
  )
}
