'use client'

import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import LightingRig from './LightingRig'
import DeskBase from './DeskBase'
import CRTMonitor from './objects/CRTMonitor'
import DeskChair from './objects/DeskChair'
import CoffeeMug from './objects/CoffeeMug'
import Notepad from './objects/Notepad'
import PaperSheets from './objects/PaperSheets'
import Keyboard from './objects/Keyboard'
import BookStack from './objects/BookStack'
import FlatMonitor from './objects/FlatMonitor'
import DeskClock from './objects/DeskClock'
import FadeInGroup from './FadeInGroup'
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
  const currentChapter = useScrollStore((s) => s.currentChapter)
  const openModal = useScrollStore((s) => s.openModal)

  const handleCRTClick = useCallback(() => {
    openModal({
      type: 'typing',
      content: '> Hello World\n\nconsole.log("Hello World!");\n// Il mio primo programma...',
    })
  }, [openModal])

  return (
    <>
      <CameraRig />
      <LightingRig />

      {/* Desk — always present */}
      <DeskBase materiality={materiality} />
      <DeskChair
        materiality={materiality}
        position={[0, 0, 1.2]}
        rotation={[0, Math.PI, 0]}
      />

      {/* CRT — visible Ch.00-01, fades out at Ch.02 (replaced by flat monitor) */}
      <FadeInGroup visible={currentChapter < 2}>
        <CRTMonitor
          materiality={materiality}
          position={[0, 0.84, -0.3]}
          onClick={handleCRTClick}
        />
      </FadeInGroup>

      {/* Ch.01+ objects — fade in smoothly */}
      <FadeInGroup visible={currentChapter >= 1}>
        <CoffeeMug materiality={materiality} position={[0.85, 0.8, 0.15]} />
        <Notepad materiality={materiality} position={[-0.7, 0.795, 0.2]} rotation={[0, 0.2, 0]} />
        <PaperSheets materiality={materiality} position={[0.5, 0.795, 0.3]} />
      </FadeInGroup>

      {/* Ch.02+ objects — flat monitor replaces CRT, keyboard, books, clock */}
      <FadeInGroup visible={currentChapter >= 2}>
        <FlatMonitor materiality={materiality} position={[0, 0.79, -0.35]} />
        <Keyboard materiality={materiality} position={[0, 0.795, 0.15]} />
        <BookStack materiality={materiality} position={[-0.95, 0.79, -0.2]} />
        <DeskClock materiality={materiality} position={[0.95, 0.79, -0.25]} rotation={[0, -0.3, 0]} />
      </FadeInGroup>
    </>
  )
}

function handleCreated({ gl }) {
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = 1.2
  gl.outputColorSpace = THREE.SRGBColorSpace
  // Use PCFShadowMap — PCFSoftShadowMap is deprecated in Three.js 0.183
  gl.shadowMap.type = THREE.PCFShadowMap
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
