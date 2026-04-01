'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import useScrollStore from '@/stores/scrollStore'
import { interpolateCamera } from '@/data/cameraPath'

const _vec3Position = new THREE.Vector3()
const _vec3Target = new THREE.Vector3()

export default function CameraRig() {
  const cameraRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  // Track mouse for parallax
  useEffect(() => {
    const canvas = gl.domElement
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [gl])

  useFrame(({ clock }) => {
    if (!cameraRef.current) return

    const { scrollProgress, currentChapter } = useScrollStore.getState()
    const { position, target, fov } = interpolateCamera(scrollProgress)

    // Mouse parallax offset (subtle)
    const parallaxX = mouse.current.x * 0.15
    const parallaxY = mouse.current.y * 0.1

    // Camera shake for Ch.03 (backend struggle) — subtle
    let shakeX = 0, shakeY = 0
    if (currentChapter === 3) {
      const t = clock.getElapsedTime()
      shakeX = Math.sin(t * 13) * 0.004 + Math.sin(t * 19) * 0.003
      shakeY = Math.cos(t * 17) * 0.003 + Math.cos(t * 23) * 0.002
    }

    // Smooth interpolation toward target position
    _vec3Position.set(
      position[0] + parallaxX + shakeX,
      position[1] + parallaxY + shakeY,
      position[2]
    )
    cameraRef.current.position.lerp(_vec3Position, 0.05)

    // Smooth lookAt
    _vec3Target.set(target[0], target[1], target[2])
    cameraRef.current.lookAt(_vec3Target)

    // Smooth FOV
    if (Math.abs(cameraRef.current.fov - fov) > 0.1) {
      cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, fov, 0.05)
      cameraRef.current.updateProjectionMatrix()
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 2, 8]}
      fov={60}
      near={0.1}
      far={100}
    />
  )
}
