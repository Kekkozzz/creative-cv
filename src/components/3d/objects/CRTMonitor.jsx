'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

export default function CRTMonitor({ materiality = 0, accentColor = '#6366f1', onClick, ...rest }) {
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.55, 0.5), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.06, 0.3), [])
  const bodyEdges = useMemo(() => new THREE.EdgesGeometry(bodyGeo, 15), [bodyGeo])
  const standEdges = useMemo(() => new THREE.EdgesGeometry(standGeo, 15), [standGeo])

  // Remap: reaches full materiality by end of chapter 1
  const crtMat = Math.min(1, materiality * 10)

  // GLTF model
  const { scene: originalScene } = useGLTF('/3d/monitorCrt.glb')
  const scene = useMemo(() => originalScene.clone(true), [originalScene])
  const modelRef = useRef()
  const fadeRefOrValue = useFade()
  const materialsSetup = useRef(false)

  // Wireframe refs
  const wireRefs = useRef([])
  const currentMat = useRef(materiality)

  useFrame((_, delta) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    currentMat.current = THREE.MathUtils.lerp(currentMat.current, crtMat, Math.min(1, delta * 3))
    const m = currentMat.current

    // Wireframe: fade out
    const wireOp = Math.max(0, 1 - m) * fade
    wireRefs.current.forEach((mat) => {
      if (mat) {
        mat.opacity = wireOp
        mat.visible = wireOp > 0.01
      }
    })

    // GLTF: fade in
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
      {/* Wireframe CRT (fades out) */}
      <lineSegments geometry={bodyEdges} position={[0, 0.275, 0]}>
        <lineBasicMaterial ref={setWireRef(0)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={standEdges} position={[0, -0.02, 0]}>
        <lineBasicMaterial ref={setWireRef(1)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>

      {/* GLTF model (fades in) */}
      <primitive ref={modelRef} object={scene} position={[0, -1.15, 0.2]} scale={1.552} rotation={[0, Math.PI, 0]} />
    </group>
  )
}

useGLTF.preload('/3d/monitorCrt.glb')
