'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'
import { useFade } from '../FadeInGroup'

export default function CRTMonitor({ materiality = 0, accentColor = '#6366f1', onClick, ...rest }) {
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.55, 0.5), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.06, 0.3), [])

  const screenRef = useRef()
  const fadeRefOrValue = useFade()

  useFrame(() => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    if (screenRef.current) {
      screenRef.current.opacity = fade
      screenRef.current.visible = fade > 0.01
    }
  })

  return (
    <group {...rest}>
      {/* CRT body */}
      <MorphableObject
        geometry={bodyGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.275, 0]}
        pbrProps={{ color: '#24243a', roughness: 0.9, metalness: 0.05 }}
      />

      {/* Screen — clickable, respects fade */}
      <mesh
        position={[0, 0.3, 0.251]}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <planeGeometry args={[0.55, 0.4]} />
        <meshBasicMaterial
          ref={screenRef}
          color="#212131"
          transparent
          opacity={1}
        />
      </mesh>

      {/* Stand */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, -0.02, 0]}
        pbrProps={{ color: '#16161d', roughness: 0.8, metalness: 0.1 }}
      />
    </group>
  )
}
