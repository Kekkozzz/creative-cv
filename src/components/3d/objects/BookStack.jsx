'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

export default function BookStack({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const { scene } = useGLTF('/3d/book_stack.glb')
  const groupRef = useRef()
  const fadeRefOrValue = useFade()
  const materialsSetup = useRef(false)

  useFrame(() => {
    if (!groupRef.current) return
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // First time: store original opacity and make transparent
        if (!materialsSetup.current) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.userData._origOpacity = child.material.opacity
        }

        const origOp = child.userData._origOpacity ?? 1
        child.material.opacity = origOp * fade * materiality
        child.visible = fade > 0.01 && materiality > 0.01
      }
    })
    materialsSetup.current = true
  })

  return (
    <group {...rest}>
      <primitive ref={groupRef} object={scene} />
    </group>
  )
}

useGLTF.preload('/3d/book_stack.glb')
