'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from './FadeInGroup'

export default function DeskBase({ materiality = 0, accentColor = '#6366f1' }) {
  const surfaceGeo = useMemo(() => new THREE.BoxGeometry(2.4, 0.04, 1.2), [])
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.75, 0.06), [])
  const surfaceEdges = useMemo(() => new THREE.EdgesGeometry(surfaceGeo, 15), [surfaceGeo])
  const legEdges = useMemo(() => new THREE.EdgesGeometry(legGeo, 15), [legGeo])

  const legPositions = [
    [-1.1, -0.375, -0.5],
    [1.1, -0.375, -0.5],
    [-1.1, -0.375, 0.5],
    [1.1, -0.375, 0.5],
  ]

  // Remap: desk reaches full materiality by end of chapter 1 (global ~0.1)
  const deskMat = Math.min(1, materiality * 10)

  // GLTF model
  const { scene } = useGLTF('/3d/scrivania1.glb')
  const modelRef = useRef()
  const fadeRefOrValue = useFade()
  const materialsSetup = useRef(false)

  // Wireframe material refs
  const wireRefs = useRef([])
  const currentMat = useRef(materiality)

  useFrame((_, delta) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    currentMat.current = THREE.MathUtils.lerp(currentMat.current, deskMat, Math.min(1, delta * 3))
    const m = currentMat.current

    // Wireframe: fade out as materiality increases
    const wireOp = Math.max(0, 1 - m) * fade
    wireRefs.current.forEach((mat) => {
      if (mat) {
        mat.opacity = wireOp
        mat.visible = wireOp > 0.01
      }
    })

    // GLTF: fade in with materiality
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (!materialsSetup.current) {
            child.material = child.material.clone()
            child.material.transparent = true
            child.userData._origOpacity = child.material.opacity
          }

          const origOp = child.userData._origOpacity ?? 1
          child.material.opacity = origOp * fade * m
          child.visible = fade > 0.01 && m > 0.01
        }
      })
      materialsSetup.current = true
    }
  })

  // Helper to collect wireframe material refs
  const setWireRef = (index) => (ref) => {
    wireRefs.current[index] = ref
  }

  return (
    <group position={[0, 0.75, 0]}>
      {/* Wireframe-only desk (fades out with materiality) */}
      <lineSegments geometry={surfaceEdges}>
        <lineBasicMaterial
          ref={setWireRef(0)}
          color={accentColor}
          transparent
          depthWrite={false}
        />
      </lineSegments>
      {legPositions.map((pos, i) => (
        <lineSegments key={i} geometry={legEdges} position={pos}>
          <lineBasicMaterial
            ref={setWireRef(i + 1)}
            color={accentColor}
            transparent
            depthWrite={false}
          />
        </lineSegments>
      ))}

      {/* GLTF model (fades in with materiality) */}
      <primitive
        ref={modelRef}
        object={scene}
        position={[0, -0.75, 0]}
        scale={[1.714, 1.107, 1.714]}
      />
    </group>
  )
}

useGLTF.preload('/3d/scrivania1.glb')
