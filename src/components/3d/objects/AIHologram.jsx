'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

/**
 * AI Hologram — wireframe icosahedron that pulses and rotates,
 * with floating particle dots around it. Represents AI tools.
 */
export default function AIHologram({ ...rest }) {
  const groupRef = useRef()
  const icoRef = useRef()
  const innerRef = useRef()
  const particleRefs = useRef([])
  const fadeRefOrValue = useFade()

  const icoEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.12, 1)
    return new THREE.EdgesGeometry(geo)
  }, [])

  const innerEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.07, 0)
    return new THREE.EdgesGeometry(geo)
  }, [])

  // Particle positions — orbit around the hologram
  const particles = useMemo(() => {
    const pts = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      pts.push({ angle, radius: 0.18 + Math.random() * 0.06, speed: 0.5 + Math.random() * 0.5, y: (Math.random() - 0.5) * 0.1 })
    }
    return pts
  }, [])

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      // Gentle float
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.02
    }

    // Outer icosahedron — rotate and pulse opacity
    if (icoRef.current) {
      icoRef.current.rotation.y = t * 0.3
      icoRef.current.rotation.x = Math.sin(t * 0.2) * 0.15
      const pulse = 0.5 + Math.sin(t * 1.5) * 0.2
      icoRef.current.material.opacity = pulse * fade
      icoRef.current.material.visible = fade > 0.01
    }

    // Inner icosahedron — counter-rotate
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.5
      innerRef.current.rotation.z = t * 0.2
      const pulse = 0.3 + Math.sin(t * 2) * 0.15
      innerRef.current.material.opacity = pulse * fade
      innerRef.current.material.visible = fade > 0.01
    }

    // Particles orbit
    particleRefs.current.forEach((ref, i) => {
      if (!ref) return
      const p = particles[i]
      const a = p.angle + t * p.speed
      ref.position.x = Math.cos(a) * p.radius
      ref.position.z = Math.sin(a) * p.radius
      ref.position.y = p.y + Math.sin(t * 2 + i) * 0.02
      ref.material.opacity = (0.5 + Math.sin(t * 3 + i * 1.5) * 0.3) * fade
      ref.visible = fade > 0.01
    })
  })

  return (
    <group {...rest}>
      <group ref={groupRef}>
        {/* Outer wireframe icosahedron */}
        <lineSegments ref={icoRef} geometry={icoEdges}>
          <lineBasicMaterial color="#8b5cf6" transparent opacity={0} depthWrite={false} />
        </lineSegments>

        {/* Inner wireframe icosahedron */}
        <lineSegments ref={innerRef} geometry={innerEdges}>
          <lineBasicMaterial color="#06b6d4" transparent opacity={0} depthWrite={false} />
        </lineSegments>

        {/* Orbiting particles */}
        {particles.map((_, i) => (
          <mesh key={i} ref={(el) => { particleRefs.current[i] = el }} visible={false}>
            <sphereGeometry args={[0.006, 4, 4]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
