'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const puffOffsets = [-0.025, 0, 0.025]

export default function MugSteam({ ...rest }) {
  const puffRefs = useRef([])
  const fadeRefOrValue = useFade()

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()

    puffRefs.current.forEach((ref, i) => {
      if (!ref) return

      const cycle = (t * 0.5 + i * 0.28) % 1
      const life = 1 - Math.abs(cycle * 2 - 1)

      ref.position.x = puffOffsets[i] + Math.sin(t * 1.9 + i) * 0.01
      ref.position.y = cycle * 0.28
      ref.position.z = Math.cos(t * 1.4 + i) * 0.008

      const scale = THREE.MathUtils.lerp(0.55, 1.35, cycle)
      ref.scale.setScalar(scale)

      ref.material.opacity = life * 0.42 * fade
      ref.visible = fade > 0.01
    })
  })

  return (
    <group {...rest}>
      {puffOffsets.map((_, i) => (
        <mesh key={i} ref={(el) => { puffRefs.current[i] = el }} visible={false}>
          <sphereGeometry args={[0.023, 10, 10]} />
          <meshBasicMaterial
            color="#f8fafc"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}