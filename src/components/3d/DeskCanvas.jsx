'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import LightingRig from './LightingRig'
import DeskBase from './DeskBase'
import CRTMonitor from './objects/CRTMonitor'
import DeskChair from './objects/DeskChair'
import useScrollStore from '@/stores/scrollStore'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{
        color: '#6366f1',
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: '14px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

function Scene() {
  const materiality = useScrollStore((s) => s.materiality)

  return (
    <>
      <CameraRig />
      <LightingRig />

      {/* Desk + Chapter 00 objects */}
      <DeskBase materiality={materiality} />
      <CRTMonitor
        materiality={materiality}
        position={[0, 0.83, -0.1]}
      />
      <DeskChair
        materiality={materiality}
        position={[0, 0, 0.9]}
        rotation={[0, Math.PI, 0]}
      />
    </>
  )
}

function handleCreated({ gl }) {
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = 1.2
  gl.outputColorSpace = THREE.SRGBColorSpace
}

export default function DeskCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        shadows
        onCreated={handleCreated}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 15, 30]} />
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
