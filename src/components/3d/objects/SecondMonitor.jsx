'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

export default function SecondMonitor({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const panelGeo = useMemo(() => new THREE.BoxGeometry(0.55, 0.35, 0.025), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.18, 0.05), [])
  const baseGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.012, 0.12), [])
  const panelEdges = useMemo(() => new THREE.EdgesGeometry(panelGeo, 15), [panelGeo])
  const standEdges = useMemo(() => new THREE.EdgesGeometry(standGeo, 15), [standGeo])
  const baseEdges = useMemo(() => new THREE.EdgesGeometry(baseGeo, 15), [baseGeo])

  // Remap: reaches full materiality by end of chapter 1
  const monMat = Math.min(1, materiality * 10)

  // GLTF model
  const { scene: originalScene } = useGLTF('/3d/secondoMonitor.glb')
  const scene = useMemo(() => originalScene.clone(true), [originalScene])
  const modelRef = useRef()
  const fadeRefOrValue = useFade()
  const materialsSetup = useRef(false)
  const logged = useRef(false)

  // Wireframe refs
  const wireRefs = useRef([])
  const currentMat = useRef(materiality)
  useFrame((_, delta) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    currentMat.current = THREE.MathUtils.lerp(currentMat.current, monMat, Math.min(1, delta * 3))
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
      if (!logged.current) {
        // Compute local bounding box from geometries directly
        const localBox = new THREE.Box3()
        scene.traverse((child) => {
          if (child.isMesh && child.geometry) {
            child.geometry.computeBoundingBox()
            const geoBox = child.geometry.boundingBox.clone()
            geoBox.applyMatrix4(child.matrixWorld)
            // Undo the component's parent world transform to get local coords
            const parentInverse = new THREE.Matrix4().copy(modelRef.current.parent.matrixWorld).invert()
            geoBox.applyMatrix4(parentInverse)
            localBox.union(geoBox)
          }
        })
        const size = localBox.getSize(new THREE.Vector3())
        const center = localBox.getCenter(new THREE.Vector3())
        console.log(`[SecondMonitor GLTF LOCAL] size: ${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)} | center: ${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)} | min: ${localBox.min.x.toFixed(3)}, ${localBox.min.y.toFixed(3)}, ${localBox.min.z.toFixed(3)} | max: ${localBox.max.x.toFixed(3)}, ${localBox.max.y.toFixed(3)}, ${localBox.max.z.toFixed(3)}`)
        logged.current = true
      }
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
      {/* Wireframe monitor (fades out) */}
      <lineSegments geometry={panelEdges} position={[0, 0.28, 0]}>
        <lineBasicMaterial ref={setWireRef(0)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={standEdges} position={[0, 0.09, -0.015]}>
        <lineBasicMaterial ref={setWireRef(1)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={baseEdges} position={[0, 0, -0.015]}>
        <lineBasicMaterial ref={setWireRef(2)} color={accentColor} transparent depthWrite={false} />
      </lineSegments>

      {/* GLTF model (fades in) */}
      <primitive ref={modelRef} object={scene} position={[1.415, -1.265, 2.28]} scale={1.719} />
    </group>
  )
}

useGLTF.preload('/3d/secondoMonitor.glb')
