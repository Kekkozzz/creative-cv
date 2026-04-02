'use client'

import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
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
import ServerRack from './objects/ServerRack'
import FloatingTerminal from './objects/FloatingTerminal'
import SecondMonitor from './objects/SecondMonitor'
import Headphones from './objects/Headphones'
import DeskPlant from './objects/DeskPlant'
import PostItWall from './objects/PostItWall'
import GitGraph from './objects/GitGraph'
import AIHologram from './objects/AIHologram'
import AIPromptPanel from './objects/AIPromptPanel'
import AnimationLoopPanel from './objects/AnimationLoopPanel'
import ColorParticles from './objects/ColorParticles'
import MugSteam from './objects/MugSteam'
import LighthousePanel from './objects/LighthousePanel'
import ThreeJSScene from './objects/ThreeJSScene'
import TechConstellation from './objects/TechConstellation'
import FadeInGroup from './FadeInGroup'
import useScrollStore from '@/stores/scrollStore'

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

  const handleAnimationPanelClick = useCallback(() => {
    openModal({
      type: 'typing',
      content: '> gsap.timeline({ defaults: { ease: "power2.out" } })\n  .from(".card", { y: 40, opacity: 0, stagger: 0.08 })\n  .to(".cta", { scale: 1.06, repeat: -1, yoyo: true })\n\n✓ 60 FPS stabili su desktop\n✓ Animazioni adattive su mobile',
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
      {/* Monitor gets more solid at Ch.03+ so terminal text reads better against it */}
      <FadeInGroup visible={currentChapter >= 2}>
        <FlatMonitor materiality={Math.max(materiality, currentChapter >= 3 ? 0.7 : 0)} position={[0, 0.79, -0.35]} />
        <Keyboard materiality={materiality} position={[0, 0.795, 0.15]} />
        <BookStack materiality={materiality} position={[-0.85, 0.90, -0.15]} scale={0.15} />
        <DeskClock materiality={materiality} position={[0.95, 0.79, -0.25]} rotation={[0, -0.3, 0]} />
      </FadeInGroup>

      {/* Ch.03+ objects — server rack persists, terminal only on Ch.03 */}
      <FadeInGroup visible={currentChapter >= 3}>
        <ServerRack materiality={materiality} position={[0.9, 0, 0.1]} scale={1.3} />
      </FadeInGroup>
      <FadeInGroup visible={currentChapter === 3}>
        <FloatingTerminal position={[0, 1.1, -0.32]} />
      </FadeInGroup>

      {/* Ch.04+ objects — second monitor, headphones, plant (React moment) */}
      <FadeInGroup visible={currentChapter >= 4}>
        <SecondMonitor materiality={materiality} position={[0.75, 0.79, -0.2]} rotation={[0, -0.25, 0]} />
        <Headphones materiality={materiality} position={[-0.5, 0.88, 0.35]} rotation={[0.1, 0.4, 0]} />
        <DeskPlant materiality={materiality} lively={currentChapter === 7} position={[1.05, 0.79, 0.3]} />
      </FadeInGroup>

      {/* Ch.05+ object — badge stays from first job onward */}
      {/* <FadeInGroup visible={currentChapter >= 5}>
        <IDBadge
          materiality={materiality}
          position={[-0.18, 0.803, 0.42]}
          rotation={[0, 0.2, 0.06]}
        />
      </FadeInGroup> */}

      {/* Ch.05 only objects — disappear at Ch.06 */}
      <FadeInGroup visible={currentChapter === 5}>
        {/* Post-its floating out of the main monitor screen area */}
        <PostItWall materiality={materiality} position={[0, 1.1, -0.32]} />
        {/* Git stats panel from second monitor — same angle as SecondMonitor */}
        <GitGraph position={[0.74, 1.08, -0.18]} rotation={[0, -0.25, 0]} />
      </FadeInGroup>

      {/* Ch.06 only — AI hologram floating above desk + prompt panel from main monitor */}
      <FadeInGroup visible={currentChapter === 6}>
        <AIHologram position={[0, 1.5, 0]} />
        <AIPromptPanel position={[0, 1.1, -0.35]} />
      </FadeInGroup>

      {/* Ch.07 only — lively animation chapter */}
      <FadeInGroup visible={currentChapter === 7}>
        <AnimationLoopPanel
          position={[0, 1.3, -0.35]}
          onClick={handleAnimationPanelClick}
        />
        <ColorParticles
          position={[0.18, 1.2, -0.12]}
        />
        <MugSteam position={[0.85, 0.92, 0.15]} />
      </FadeInGroup>

      {/* Ch.08 only — Next.js: Lighthouse scores panel from main monitor */}
      <FadeInGroup visible={currentChapter === 8}>
        <LighthousePanel position={[0, 1.1, -0.35]} />
      </FadeInGroup>

      {/* Ch.09 only — Three.js: floating geometric shapes orbiting above desk */}
      <FadeInGroup visible={currentChapter === 9}>
        <ThreeJSScene position={[0, 1.4, 0]} />
      </FadeInGroup>

      {/* Ch.10 only — Today & Tomorrow: tech constellation zoomed out */}
      <FadeInGroup visible={currentChapter === 10}>
        <TechConstellation position={[0, 1.5, 0.5]} scale={2.55} />
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
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
