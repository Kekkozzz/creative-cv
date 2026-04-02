'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useFade } from '../FadeInGroup'

const techNodes = [
  { name: 'React', pos: [-0.3, 0.15, 0], color: '#06b6d4' },
  { name: 'Next.js', pos: [0.1, 0.2, 0], color: '#e4e4e7' },
  { name: 'Three.js', pos: [0.35, 0.05, 0], color: '#10b981' },
  { name: 'GSAP', pos: [-0.15, -0.1, 0], color: '#10b981' },
  { name: 'TypeScript', pos: [0.2, -0.15, 0], color: '#06b6d4' },
  { name: 'Node.js', pos: [-0.35, -0.02, 0], color: '#10b981' },
  { name: 'Supabase', pos: [0.0, 0.0, 0], color: '#10b981' },
]

// Connections between nodes (indices)
const connections = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [5, 0], [6, 1], [6, 3], [2, 4],
]

export default function TechConstellation({ ...rest }) {
  const groupRef = useRef()
  const dotRefs = useRef([])
  const textRefsArr = useRef([])
  const lineRef = useRef()
  const fadeRefOrValue = useFade()

  const lineGeo = useMemo(() => {
    const points = []
    connections.forEach(([a, b]) => {
      points.push(new THREE.Vector3(...techNodes[a].pos))
      points.push(new THREE.Vector3(...techNodes[b].pos))
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(p => [p.x, p.y, p.z]), 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.1
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.015
    }

    dotRefs.current.forEach((ref, i) => {
      if (!ref) return
      const pulse = 0.5 + Math.sin(t * 2 + i * 1.2) * 0.3
      ref.material.opacity = pulse * fade
      ref.visible = fade > 0.01
    })

    textRefsArr.current.forEach((ref) => {
      if (!ref) return
      ref.fillOpacity = fade * 0.8
      ref.visible = fade > 0.01
    })

    if (lineRef.current) {
      lineRef.current.material.opacity = 0.2 * fade
      lineRef.current.visible = fade > 0.01
    }
  })

  return (
    <group {...rest}>
      <group ref={groupRef}>
        {/* Connection lines */}
        <lineSegments ref={lineRef} geometry={lineGeo}>
          <lineBasicMaterial color="#6366f1" transparent opacity={0} depthWrite={false} />
        </lineSegments>

        {/* Tech nodes — dots + labels */}
        {techNodes.map((node, i) => (
          <group key={i}>
            <mesh ref={(el) => { dotRefs.current[i] = el }} position={node.pos} visible={false}>
              <sphereGeometry args={[0.012, 6, 6]} />
              <meshBasicMaterial color={node.color} transparent opacity={0} />
            </mesh>
            <Text
              ref={(el) => { textRefsArr.current[i] = el }}
              position={[node.pos[0], node.pos[1] - 0.025, node.pos[2]]}
              fontSize={0.016}
              color={node.color}
              anchorX="center"
              anchorY="top"
              fillOpacity={0}
              visible={false}
            >
              {node.name}
            </Text>
          </group>
        ))}
      </group>
    </group>
  )
}
