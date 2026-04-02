'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const scores = [
  { label: 'Performance', score: '98', color: '#10b981', y: 0.1 },
  { label: 'Accessibility', score: '100', color: '#10b981', y: 0.05 },
  { label: 'Best Practices', score: '95', color: '#10b981', y: 0.0 },
  { label: 'SEO', score: '100', color: '#10b981', y: -0.05 },
]

const START_SCALE = 0.65
const END_SCALE = 1.2
const START_Z = 0
const END_Z = 0.9

export default function LighthousePanel({ ...rest }) {
  const groupRef = useRef()
  const panelRef = useRef()
  const borderRef = useRef()
  const textRefs = useRef([])
  const fadeRefOrValue = useFade()

  useFrame(() => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const p = fade

    if (groupRef.current) {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(START_SCALE, END_SCALE, p))
      groupRef.current.position.z = THREE.MathUtils.lerp(START_Z, END_Z, p)
    }
    if (panelRef.current) {
      panelRef.current.opacity = 0.88 * fade
      panelRef.current.visible = fade > 0.01
    }
    if (borderRef.current) {
      borderRef.current.opacity = 0.5 * fade
      borderRef.current.visible = fade > 0.01
    }
    textRefs.current.forEach((ref) => {
      if (ref) { ref.fillOpacity = fade; ref.visible = fade > 0.01 }
    })
  })

  return (
    <group {...rest}>
      <group ref={groupRef} scale={START_SCALE}>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.55, 0.34]} />
          <meshBasicMaterial ref={panelRef} color="#0a0a12" transparent opacity={0} depthWrite={false} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.55, 0.34)]} />
          <lineBasicMaterial ref={borderRef} color="#10b981" transparent opacity={0} />
        </lineSegments>

        {/* Title */}
        <Text ref={(el) => { textRefs.current[0] = el }} position={[-0.24, 0.14, 0]} fontSize={0.024} color="#10b981" anchorX="left" fillOpacity={0} visible={false}>
          Lighthouse Scores
        </Text>

        {/* Score rows */}
        {scores.map((s, i) => (
          <group key={i}>
            <Text ref={(el) => { textRefs.current[i + 1] = el }} position={[-0.24, s.y, 0]} fontSize={0.018} color="#a1a1aa" anchorX="left" fillOpacity={0} visible={false}>
              {s.label}
            </Text>
            <Text ref={(el) => { textRefs.current[i + 5] = el }} position={[0.22, s.y, 0]} fontSize={0.02} color={s.color} anchorX="right" fillOpacity={0} visible={false}>
              {s.score}
            </Text>
          </group>
        ))}

        {/* Deploy line */}
        <Text ref={(el) => { textRefs.current[9] = el }} position={[0, -0.12, 0]} fontSize={0.015} color="#f59e0b" anchorX="center" fillOpacity={0} visible={false}>
          $ vercel --prod ✓ deployed
        </Text>
      </group>
    </group>
  )
}
