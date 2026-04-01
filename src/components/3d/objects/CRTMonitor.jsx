'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function CRTMonitor({ materiality = 0, accentColor = '#6366f1', onClick, ...rest }) {
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.55, 0.5), [])
  const screenGeo = useMemo(() => new THREE.PlaneGeometry(0.55, 0.4), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.06, 0.3), [])

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

      {/* Screen — clickable */}
      <mesh
        position={[0, 0.3, 0.251]}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[0.55, 0.4]} />
        <meshBasicMaterial color="#0a0a0f" />
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
