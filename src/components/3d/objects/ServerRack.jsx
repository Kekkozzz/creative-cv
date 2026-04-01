'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'
import { useFade } from '../FadeInGroup'

export default function ServerRack({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const frameGeo = useMemo(() => new THREE.BoxGeometry(0.4, 0.8, 0.3), [])
  const slotGeo = useMemo(() => new THREE.BoxGeometry(0.34, 0.04, 0.25), [])

  const ledRefs = useRef([])
  const fadeRefOrValue = useFade()

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()
    ledRefs.current.forEach((led, i) => {
      if (led) {
        const blink = Math.sin(t * (3 + i * 1.7) + i * 2) > 0 ? 0.8 : 0.1
        led.opacity = blink * fade
        led.visible = fade > 0.01
      }
    })
  })

  const slots = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25]

  return (
    <group {...rest}>
      {/* Rack frame */}
      <MorphableObject
        geometry={frameGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.4, 0]}
        pbrProps={{ color: '#2a2a3d', roughness: 0.9, metalness: 0.15 }}
      />

      {/* Server slots */}
      {slots.map((y, i) => (
        <MorphableObject
          key={`slot-${i}`}
          geometry={slotGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={[0, 0.4 + y, 0.03]}
          pbrProps={{ color: '#1a1a2e', roughness: 0.7, metalness: 0.2 }}
        />
      ))}

      {/* LED indicators */}
      {slots.map((y, i) => (
        <mesh key={`led-${i}`} position={[0.15, 0.4 + y, 0.16]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial
            ref={(el) => { ledRefs.current[i] = el }}
            color={i % 3 === 0 ? '#ef4444' : '#10b981'}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  )
}
