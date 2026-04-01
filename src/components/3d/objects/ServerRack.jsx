'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'
import { useFade } from '../FadeInGroup'

export default function ServerRack({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  // PC tower case
  const caseGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.45, 0.4), [])
  // Front panel
  const frontGeo = useMemo(() => new THREE.BoxGeometry(0.19, 0.44, 0.005), [])
  // Drive bay slots
  const slotGeo = useMemo(() => new THREE.BoxGeometry(0.14, 0.02, 0.005), [])
  // Power button + ring
  const buttonGeo = useMemo(() => new THREE.CylinderGeometry(0.01, 0.01, 0.005, 8), [])
  const buttonRingGeo = useMemo(() => new THREE.TorusGeometry(0.013, 0.002, 8, 16), [])
  // Ventilation grill lines
  const ventGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.002, 0.005), [])

  const powerLedRef = useRef()
  const hddLedRef = useRef()
  const buttonRingRef = useRef()
  const fadeRefOrValue = useFade()

  useFrame(({ clock }) => {
    const fade = typeof fadeRefOrValue === 'number' ? fadeRefOrValue : fadeRefOrValue.current
    if (powerLedRef.current) {
      const pulse = 0.6 + Math.sin(clock.getElapsedTime() * 1.5) * 0.3
      powerLedRef.current.opacity = pulse * fade
      powerLedRef.current.visible = fade > 0.01
    }
    // Power button ring glow
    if (buttonRingRef.current) {
      const glow = 0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.2
      buttonRingRef.current.opacity = glow * fade
      buttonRingRef.current.visible = fade > 0.01
    }
    // HDD LED — fast irregular blinking
    if (hddLedRef.current) {
      const t = clock.getElapsedTime()
      const blink = Math.sin(t * 4) * Math.sin(t * 2.5) > 0.2 ? 0.9 : 0.1
      hddLedRef.current.opacity = blink * fade
      hddLedRef.current.visible = fade > 0.01
    }
  })

  const slots = [0.12, 0.09, 0.06]
  const vents = [-0.08, -0.1, -0.12, -0.14, -0.16]

  return (
    <group {...rest}>
      {/* Main case */}
      <MorphableObject
        geometry={caseGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.225, 0]}
        receiveShadow={false}
        pbrProps={{ color: '#1a1a2e', roughness: 0.85, metalness: 0.1 }}
      />

      {/* Front panel — slightly lighter */}
      <MorphableObject
        geometry={frontGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.225, 0.203]}
        receiveShadow={false}
        pbrProps={{ color: '#24243a', roughness: 0.8, metalness: 0.15 }}
      />

      {/* Drive bay slots */}
      {slots.map((y, i) => (
        <MorphableObject
          key={`slot-${i}`}
          geometry={slotGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={[0, y + 0.225, 0.206]}
          pbrProps={{ color: '#16161d', roughness: 0.7, metalness: 0.2 }}
        />
      ))}

      {/* Power button */}
      <MorphableObject
        geometry={buttonGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.38, 0.206]}
        rotation={[Math.PI / 2, 0, 0]}
        pbrProps={{ color: '#3a3a52', roughness: 0.5, metalness: 0.3, emissive: '#e4e4e7', emissiveIntensity: 0.3 }}
      />

      {/* Power LED — green */}
      <mesh position={[0.06, 0.39, 0.206]}>
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshBasicMaterial
          ref={powerLedRef}
          color="#10b981"
          transparent
          opacity={0}
        />
      </mesh>

      {/* HDD LED — red, fast blink */}
      <mesh position={[0.06, 0.37, 0.206]}>
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshBasicMaterial
          ref={hddLedRef}
          color="#ef4444"
          transparent
          opacity={0}
        />
      </mesh>

      {/* Ventilation grill */}
      {vents.map((y, i) => (
        <MorphableObject
          key={`vent-${i}`}
          geometry={ventGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={[0, y + 0.225, 0.206]}
          pbrProps={{ color: '#16161d', roughness: 0.9, metalness: 0.05 }}
        />
      ))}
    </group>
  )
}
