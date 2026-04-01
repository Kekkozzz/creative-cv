'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const promptLines = [
  { text: '> Refactora questo componente React', color: '#8b5cf6', y: 0.12 },
  { text: '  usando custom hooks e memo', color: '#8b5cf6', y: 0.08 },
  { text: '', color: '#71717a', y: 0.05 },
  { text: '  ✓ Estratto useAuth hook', color: '#10b981', y: 0.02 },
  { text: '  ✓ Aggiunto React.memo', color: '#10b981', y: -0.02 },
  { text: '  ✓ -40% re-renders', color: '#10b981', y: -0.06 },
  { text: '', color: '#71717a', y: -0.09 },
  { text: '  127 ore risparmiate questo mese', color: '#f59e0b', y: -0.12 },
]

const START_SCALE = 0.6
const END_SCALE = 1.2
const START_Z = 0
const END_Z = 1.0

export default function AIPromptPanel({ ...rest }) {
  const groupRef = useRef()
  const panelRef = useRef()
  const borderRef = useRef()
  const textRefs = useRef([])
  const fadeRefOrValue = useFade()

  useFrame(() => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const p = fade

    if (groupRef.current) {
      const s = THREE.MathUtils.lerp(START_SCALE, END_SCALE, p)
      groupRef.current.scale.setScalar(s)
      groupRef.current.position.z = THREE.MathUtils.lerp(START_Z, END_Z, p)
    }

    if (panelRef.current) {
      panelRef.current.opacity = 0.85 * fade
      panelRef.current.visible = fade > 0.01
    }
    if (borderRef.current) {
      borderRef.current.opacity = 0.5 * fade
      borderRef.current.visible = fade > 0.01
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
        {/* Background panel */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.6, 0.32]} />
          <meshBasicMaterial
            ref={panelRef}
            color="#0a0a12"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {/* Border — violet for AI theme */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.6, 0.32)]} />
          <lineBasicMaterial
            ref={borderRef}
            color="#8b5cf6"
            transparent
            opacity={0}
          />
        </lineSegments>

        {/* Prompt text */}
        {promptLines.map((line, i) => (
          <Text
            key={i}
            ref={(el) => { textRefs.current[i] = el }}
            position={[-0.27, line.y, 0]}
            fontSize={0.022}
            color={line.color}
            anchorX="left"
            anchorY="middle"
            maxWidth={0.55}
            fillOpacity={0}
            visible={false}
          >
            {line.text}
          </Text>
        ))}
      </group>
    </group>
  )
}
