'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

export default function DeskChair({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.06, 0.5), [])
  const backGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.06), [])
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), [])
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.45, 0.03, 0.45), [])

  const seatEdges = useMemo(() => new THREE.EdgesGeometry(seatGeo, 15), [seatGeo])
  const backEdges = useMemo(() => new THREE.EdgesGeometry(backGeo, 15), [backGeo])
  const legEdges = useMemo(() => new THREE.EdgesGeometry(legGeo, 15), [legGeo])
  const baseEdges = useMemo(() => new THREE.EdgesGeometry(baseGeo, 15), [baseGeo])

  // Remap: chair reaches full materiality by end of chapter 1 (global ~0.1)
  const chairMat = Math.min(1, materiality * 10)

  // GLTF model
  const { scene } = useGLTF('/3d/sedia.glb')
  const modelRef = useRef()
  const fadeRefOrValue = useFade()
  const materialsSetup = useRef(false)

  // Wireframe material refs
  const wireRefs = useRef([])
  const currentMat = useRef(materiality)

  useFrame((_, delta) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    currentMat.current = THREE.MathUtils.lerp(currentMat.current, chairMat, Math.min(1, delta * 3))
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

  const setWireRef = (index) => (ref) => {
    wireRefs.current[index] = ref
  }

  return (
    <group {...rest}>
      {/* Wireframe chair (fades out with materiality) */}
      <lineSegments geometry={seatEdges} position={[0, 0.45, 0]}>
        <lineBasicMaterial ref={setWireRef(0)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={backEdges} position={[0, 0.7, -0.22]}>
        <lineBasicMaterial ref={setWireRef(1)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={legEdges} position={[0, 0.225, 0]}>
        <lineBasicMaterial ref={setWireRef(2)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={baseEdges} position={[0, 0.015, 0]}>
        <lineBasicMaterial ref={setWireRef(3)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>

      {/* GLTF model (fades in with materiality) */}
      <primitive ref={modelRef} object={scene} position={[0, 0, 0.79]} scale={1.2} />
    </group>
  )
}

useGLTF.preload('/3d/sedia.glb')
