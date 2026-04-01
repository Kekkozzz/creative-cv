'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const palette = ['#22d3ee', '#8b5cf6', '#10b981', '#f59e0b']

export default function ColorParticles({ ...rest }) {
  const particleRefs = useRef([])
  const fadeRefOrValue = useFade()

  const particles = useMemo(() => {
    const values = []
    for (let i = 0; i < 14; i++) {
      values.push({
        color: palette[i % palette.length],
        radius: 0.18 + Math.random() * 0.18,
        speed: 0.3 + Math.random() * 0.5,
        yBase: -0.05 + Math.random() * 0.2,
        yAmp: 0.015 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return values
  }, [])

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()

    particleRefs.current.forEach((ref, i) => {
      if (!ref) return

      const p = particles[i]
      const angle = t * p.speed + p.phase
      const pulse = (Math.sin(t * 2 + i) + 1) / 2

      ref.position.x = Math.cos(angle) * p.radius
      ref.position.z = Math.sin(angle) * p.radius * 0.65
      ref.position.y = p.yBase + Math.sin(t * 1.7 + i) * p.yAmp
      ref.scale.setScalar(0.75 + pulse * 0.35)

      ref.material.opacity = (0.18 + pulse * 0.32) * fade
      ref.visible = fade > 0.01
    })
  })

  return (
    <group {...rest}>
      {particles.map((particle, i) => (
        <mesh key={i} ref={(el) => { particleRefs.current[i] = el }} visible={false}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
