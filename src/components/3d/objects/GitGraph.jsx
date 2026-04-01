'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const statsLines = [
  { text: '$ git add .', color: '#10b981', y: 0.12 },
  { text: '$ git commit -m "fix fix fix..."', color: '#10b981', y: 0.08 },
  { text: '$ git push origin main', color: '#10b981', y: 0.04 },
  { text: '  ! [rejected] main -> main', color: '#ef4444', y: 0.0 },
  { text: '$ git pull --rebase', color: '#f59e0b', y: -0.04 },
  { text: '  Successfully rebased', color: '#a1a1aa', y: -0.08 },
  { text: '$ git push', color: '#10b981', y: -0.12 },
]

const START_SCALE = 0.75
const END_SCALE = 1.8
const START_Z = 0
const END_Z = 0.8

export default function GitGraph({ ...rest }) {
  const groupRef = useRef()
  const panelRef = useRef()
  const borderRef = useRef()
  const textRefs = useRef([])
  const fadeRefOrValue = useFade()

  useFrame((_, delta) => {
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
          <planeGeometry args={[0.55, 0.32]} />
          <meshBasicMaterial
            ref={panelRef}
            color="#0a0a12"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {/* Border */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.55, 0.32)]} />
          <lineBasicMaterial
            ref={borderRef}
            color="#10b981"
            transparent
            opacity={0}
          />
        </lineSegments>

        {/* Stats text */}
        {statsLines.map((line, i) => (
          <Text
            key={i}
            ref={(el) => { textRefs.current[i] = el }}
            position={[-0.25, line.y, 0]}
            fontSize={0.022}
            color={line.color}
            anchorX="left"
            anchorY="middle"
            maxWidth={0.5}
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
