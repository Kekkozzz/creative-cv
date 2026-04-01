'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const terminalLines = [
  { text: '$ php artisan migrate', color: '#10b981' },
  { text: '  Creating users table...', color: '#a1a1aa' },
  { text: '  Creating posts table...', color: '#a1a1aa' },
  { text: '  SQLSTATE[42S01]: Table already exists', color: '#ef4444' },
  { text: '$ php artisan migrate:fresh', color: '#10b981' },
  { text: '  Dropped all tables successfully.', color: '#f59e0b' },
  { text: '  Running migrations...', color: '#a1a1aa' },
  { text: '  ✓ All migrations completed', color: '#10b981' },
]

// Start scale (on monitor screen) and end scale (zoomed in, readable)
const START_SCALE = 0.69
const END_SCALE = 1.265
const START_Z = 0
const END_Z = 1.0

export default function FloatingTerminal({ ...rest }) {
  const groupRef = useRef()
  const panelRef = useRef()
  const borderRef = useRef()
  const textRefs = useRef([])
  const headerRef = useRef()
  const fadeRefOrValue = useFade()
  const progress = useRef(0)

  useFrame((_, delta) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current

    // Animate: scale up and move toward camera
    const target = fade > 0.1 ? 1 : 0
    progress.current = THREE.MathUtils.lerp(progress.current, target, Math.min(1, delta * 1.5))
    const p = progress.current

    if (groupRef.current) {
      const s = THREE.MathUtils.lerp(START_SCALE, END_SCALE, p)
      groupRef.current.scale.setScalar(s)
      groupRef.current.position.z = THREE.MathUtils.lerp(START_Z, END_Z, p)
    }

    // Update all opacities with fade
    if (panelRef.current) {
      panelRef.current.opacity = 0.85 * fade
      panelRef.current.visible = fade > 0.01
    }
    if (borderRef.current) {
      borderRef.current.opacity = 0.5 * fade
      borderRef.current.visible = fade > 0.01
    }
    if (headerRef.current) {
      headerRef.current.fillOpacity = fade
      headerRef.current.visible = fade > 0.01
    }
    textRefs.current.forEach((ref) => {
      if (ref) {
        ref.fillOpacity = fade
        ref.visible = fade > 0.01
      }
    })
  })

  return (
    <group {...rest}>
      <group ref={groupRef} scale={START_SCALE}>
        {/* Background panel — opaque dark for readability */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.68, 0.4]} />
          <meshBasicMaterial
            ref={panelRef}
            color="#0a0a12"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {/* Border frame */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.68, 0.4)]} />
          <lineBasicMaterial
            ref={borderRef}
            color="#6366f1"
            transparent
            opacity={0}
          />
        </lineSegments>

        {/* Terminal text lines */}
        {terminalLines.map((line, i) => (
          <Text
            key={i}
            ref={(el) => { textRefs.current[i] = el }}
            position={[-0.32, 0.15 - i * 0.042, 0]}
            fontSize={0.022}
            color={line.color}
            anchorX="left"
            anchorY="middle"
            maxWidth={0.64}
            fillOpacity={0}
            visible={false}
          >
            {line.text}
          </Text>
        ))}

        {/* Header bar */}
        <Text
          ref={headerRef}
          position={[0, 0.22, 0]}
          fontSize={0.018}
          color="#71717a"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0}
          visible={false}
        >
          terminal — bash
        </Text>
      </group>
    </group>
  )
}
