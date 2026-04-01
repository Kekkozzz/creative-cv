# 3D CV Foundation + Chapter 00 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational 3D infrastructure (canvas, scroll→store pipeline, camera rig, material system, lighting, postprocessing) and implement Chapter 00 "Hello" as the first working vertical slice — a wireframe desk emerging from darkness.

**Architecture:** Single R3F Canvas (`position: fixed`) with NarrativeOverlay scrolling on top. Lenis + GSAP ScrollTrigger writes `scrollProgress` to a zustand store. All 3D subsystems (camera, materials, lighting, objects) read from the store. Dual-mesh crossfade (LineSegments wireframe + MeshStandardMaterial solid) controlled by `materiality` value.

**Tech Stack:** Next.js 16, React 19, React Three Fiber 9, Drei 10, @react-three/postprocessing 3, GSAP 3.14 + ScrollTrigger, Lenis 1.3, Zustand, Three.js 0.183

**Spec:** `docs/superpowers/specs/2026-04-01-3d-cv-redesign-design.md`

**Scope:** Foundation infrastructure + Chapter 00 only. Chapters 01–10 will be separate plans following the same patterns established here.

**Deferred to next plan:** InteractionLayer (raycaster click/hover on 3D objects) and mobile fallback guard. These are spec requirements but are deferred to keep this plan focused on the visual foundation. The CRT click interaction for Ch.00 will be added with the InteractionLayer.

---

## File Structure

```
src/
├── stores/
│   └── scrollStore.js              # Zustand store: scrollProgress, currentChapter, materiality
├── data/
│   ├── chapters.js                 # Chapter config (objects, clickables, bloom, narrative position)
│   └── cameraPath.js               # Camera keyframe definitions per chapter
├── components/
│   ├── 3d/
│   │   ├── DeskCanvas.jsx          # R3F Canvas wrapper, loading screen, mobile guard
│   │   ├── CameraRig.jsx           # PerspectiveCamera on scroll-driven path + mouse parallax
│   │   ├── LightingRig.jsx         # Dynamic lights that change per chapter
│   │   ├── MorphableObject.jsx     # Dual-mesh wireframe↔solid crossfade component
│   │   ├── DeskBase.jsx            # Procedural desk geometry (surface + legs)
│   │   ├── PostProcessingStack.jsx # EffectComposer with Bloom + Vignette + ChromaticAberration
│   │   └── objects/
│   │       ├── CRTMonitor.jsx      # Procedural CRT wireframe for Ch.00
│   │       └── DeskChair.jsx       # Procedural chair wireframe for Ch.00
│   ├── NarrativeOverlay.jsx        # Scroll container with chapter sections, pointer-events:none
│   ├── ChapterIntro.jsx            # Big number + title + subtitle overlay per chapter
│   └── ScrollProgressManager.jsx   # GSAP ScrollTrigger → zustand bridge (client component)
└── app/(cv)/
    ├── layout.jsx                  # [MODIFY] Keep fonts + SmoothScroll
    └── page.jsx                    # [MODIFY] Replace current content with DeskCanvas + NarrativeOverlay
```

---

## Task 1: Install Zustand + Create Scroll Store

**Files:**

- Create: `src/stores/scrollStore.js`

- [ ] **Step 1: Install zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Create the scroll store**

Create `src/stores/` directory (new — does not exist yet) and `src/stores/scrollStore.js`:

```js
import { create } from 'zustand'

const useScrollStore = create((set) => ({
  scrollProgress: 0,
  currentChapter: 0,
  materiality: 0,

  setScrollProgress: (p) => set({
    scrollProgress: p,
    currentChapter: Math.min(10, Math.floor(p * 11)),
    // NOTE: With only Ch.00 content, scroll range is short so materiality
    // will stay near 0 (wireframe). As more chapters are added and scroll
    // content grows, materiality will naturally spread across the full range.
    materiality: Math.min(1, p * 1.1),
  }),
}))

export default useScrollStore
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/stores/scrollStore.js package.json package-lock.json
git commit -m "feat: add zustand scroll store for 3D scene state"
```

---

## Task 2: Create Chapter & Camera Data

**Files:**

- Create: `src/data/chapters.js`
- Create: `src/data/cameraPath.js`

- [ ] **Step 1: Create chapter config**

Create `src/data/chapters.js` — only Chapter 00 for now, with the data structure for all chapters:

```js
export const chapters = [
  {
    id: 0,
    title: 'INTRO',
    subtitle: 'Hello',
    materiality: 0.0,
    objects: ['desk', 'crt', 'chair'],
    clickables: [
      { id: 'crt', action: 'typing', content: 'Hello World' },
    ],
    bloomIntensity: 1.5,
    narrativePosition: 'center',
    narrativeContent: {
      number: '00',
      heading: 'Hello',
      text: 'Ricordo ancora quel primo "Hello World". Il cursore lampeggiava su uno schermo nero, e io non avevo idea di cosa stessi facendo. Ma qualcosa è scattato.',
    },
  },
]
```

- [ ] **Step 2: Create camera path**

Create `src/data/cameraPath.js`:

```js
export const cameraKeyframes = [
  {
    chapter: 0,
    scrollRange: [0.0, 0.09],
    position: [0, 2, 8],
    target: [0, 0.5, 0],
    fov: 60,
  },
  // Placeholder keyframes for future chapters — camera stays at ch0 position
  // These will be filled in as chapters are implemented
  {
    chapter: 1,
    scrollRange: [0.09, 0.18],
    position: [-2, 1.5, 5],
    target: [0, 0.5, 0],
    fov: 55,
  },
]

/**
 * Given a scrollProgress (0–1), find the current keyframe and the next one,
 * then interpolate between them during the TRANSITION ZONE at the end of
 * the current keyframe's scroll range.
 *
 * Within a chapter's range, the camera holds the chapter's position.
 * The transition to the next chapter happens in the last 20% of the range.
 */
export function interpolateCamera(scrollProgress) {
  const keyframes = cameraKeyframes

  // Find which keyframe we're in
  let currentIdx = 0
  for (let i = 0; i < keyframes.length; i++) {
    if (scrollProgress >= keyframes[i].scrollRange[0]) {
      currentIdx = i
    }
  }

  const current = keyframes[currentIdx]
  const next = keyframes[Math.min(currentIdx + 1, keyframes.length - 1)]

  // Calculate transition: only interpolate toward next in last 20% of range
  const rangeEnd = current.scrollRange[1]
  const transitionStart = rangeEnd - (rangeEnd - current.scrollRange[0]) * 0.2

  let t = 0
  if (scrollProgress > transitionStart && currentIdx < keyframes.length - 1) {
    const rawT = (scrollProgress - transitionStart) / (rangeEnd - transitionStart)
    t = Math.max(0, Math.min(1, rawT))
    // Smooth ease in-out
    t = t * t * (3 - 2 * t)
  }

  return {
    position: current.position.map((v, i) => v + (next.position[i] - v) * t),
    target: current.target.map((v, i) => v + (next.target[i] - v) * t),
    fov: current.fov + (next.fov - current.fov) * t,
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/data/chapters.js src/data/cameraPath.js
git commit -m "feat: add chapter config and camera path data"
```

---

## Task 3: Create MorphableObject Component

**Files:**

- Create: `src/components/3d/MorphableObject.jsx`

This is the core dual-mesh wireframe↔solid crossfade component used by all 3D objects.

- [ ] **Step 1: Create the component**

Create `src/components/3d/MorphableObject.jsx`:

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * MorphableObject — renders a geometry as dual overlapping meshes:
 * 1. Wireframe (EdgesGeometry + LineBasicMaterial) — visible at low materiality
 * 2. Solid (MeshStandardMaterial) — visible at high materiality
 *
 * @param {THREE.BufferGeometry} geometry - The geometry to render
 * @param {number} materiality - 0 (wireframe) to 1 (solid)
 * @param {string} accentColor - Color for wireframe edges (default: indigo #6366f1)
 * @param {object} pbrProps - Props passed to MeshStandardMaterial (color, roughness, metalness, etc.)
 * @param {object} rest - Props passed to the outer <group> (position, rotation, scale, etc.)
 */
export default function MorphableObject({
  geometry,
  materiality = 0,
  accentColor = '#6366f1',
  pbrProps = {},
  children,
  ...rest
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 15), [geometry])

  const wireOpacity = Math.max(0, 1 - materiality)
  const solidOpacity = materiality

  return (
    <group {...rest}>
      {/* Wireframe layer */}
      {wireOpacity > 0.01 && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial
            color={accentColor}
            transparent
            opacity={wireOpacity}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* Solid PBR layer */}
      {solidOpacity > 0.01 && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#e4e4e7"
            roughness={0.6}
            metalness={0.1}
            {...pbrProps}
            transparent={solidOpacity < 0.99}
            opacity={solidOpacity}
          />
        </mesh>
      )}

      {children}
    </group>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/MorphableObject.jsx
git commit -m "feat: add MorphableObject dual-mesh wireframe/solid component"
```

---

## Task 4: Create Procedural Desk Objects (Ch.00)

**Files:**

- Create: `src/components/3d/DeskBase.jsx`
- Create: `src/components/3d/objects/CRTMonitor.jsx`
- Create: `src/components/3d/objects/DeskChair.jsx`

- [ ] **Step 1: Create DeskBase**

Create `src/components/3d/DeskBase.jsx` — procedural desk (table surface + 4 legs):

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from './MorphableObject'

export default function DeskBase({ materiality = 0, accentColor = '#6366f1' }) {
  const surfaceGeo = useMemo(() => new THREE.BoxGeometry(2.4, 0.08, 1.2), [])
  const legGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.75, 0.06), [])

  const legPositions = [
    [-1.1, -0.375, -0.5],
    [1.1, -0.375, -0.5],
    [-1.1, -0.375, 0.5],
    [1.1, -0.375, 0.5],
  ]

  return (
    <group position={[0, 0.75, 0]}>
      {/* Table surface */}
      <MorphableObject
        geometry={surfaceGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#1e1e2e', roughness: 0.8, metalness: 0.05 }}
      />

      {/* Legs */}
      {legPositions.map((pos, i) => (
        <MorphableObject
          key={i}
          geometry={legGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={pos}
          pbrProps={{ color: '#16161d', roughness: 0.7, metalness: 0.2 }}
        />
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create CRTMonitor**

Create `src/components/3d/objects/CRTMonitor.jsx` — procedural CRT (box body + plane screen):

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function CRTMonitor({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.55, 0.5), [])
  const screenGeo = useMemo(() => new THREE.PlaneGeometry(0.55, 0.4), [])
  const standGeo = useMemo(() => new THREE.BoxGeometry(0.3, 0.06, 0.3), [])

  return (
    <group {...rest}>
      {/* CRT body */}
      <MorphableObject
        geometry={bodyGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.275, 0]}
        pbrProps={{ color: '#24243a', roughness: 0.9, metalness: 0.05 }}
      />

      {/* Screen (slightly in front of body) */}
      <mesh position={[0, 0.3, 0.251]}>
        <planeGeometry args={[0.55, 0.4]} />
        <meshBasicMaterial color="#0a0a0f" />
      </mesh>

      {/* Stand */}
      <MorphableObject
        geometry={standGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, -0.02, 0]}
        pbrProps={{ color: '#16161d', roughness: 0.8, metalness: 0.1 }}
      />
    </group>
  )
}
```

- [ ] **Step 3: Create DeskChair**

Create `src/components/3d/objects/DeskChair.jsx` — minimal procedural chair:

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function DeskChair({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.06, 0.5), [])
  const backGeo = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.06), [])
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), [])

  return (
    <group {...rest}>
      {/* Seat */}
      <MorphableObject
        geometry={seatGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.45, 0]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.7 }}
      />

      {/* Backrest */}
      <MorphableObject
        geometry={backGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.7, -0.22]}
        pbrProps={{ color: '#1e1e2e', roughness: 0.7 }}
      />

      {/* Center pole */}
      <MorphableObject
        geometry={legGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.225, 0]}
        pbrProps={{ color: '#16161d', metalness: 0.3 }}
      />
    </group>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/3d/DeskBase.jsx src/components/3d/objects/CRTMonitor.jsx src/components/3d/objects/DeskChair.jsx
git commit -m "feat: add procedural desk, CRT monitor, and chair for Ch.00"
```

---

## Task 5: Create CameraRig + LightingRig

**Files:**

- Create: `src/components/3d/CameraRig.jsx`
- Create: `src/components/3d/LightingRig.jsx`

- [ ] **Step 1: Create CameraRig**

Create `src/components/3d/CameraRig.jsx`:

```jsx
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

  useFrame(() => {
    if (!cameraRef.current) return

    const progress = useScrollStore.getState().scrollProgress
    const { position, target, fov } = interpolateCamera(progress)

    // Mouse parallax offset (subtle)
    const parallaxX = mouse.current.x * 0.15
    const parallaxY = mouse.current.y * 0.1

    // Smooth interpolation toward target position
    _vec3Position.set(
      position[0] + parallaxX,
      position[1] + parallaxY,
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
```

- [ ] **Step 2: Create LightingRig**

Create `src/components/3d/LightingRig.jsx`:

```jsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useScrollStore from '@/stores/scrollStore'

export default function LightingRig() {
  const ambientRef = useRef()
  const dirRef = useRef()
  const accentRef = useRef()

  useFrame(() => {
    const { materiality } = useScrollStore.getState()

    // Ambient: brighter as materiality increases
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.3, 0.8, materiality)
    }

    // Directional: stronger with more solid objects
    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(0.5, 1.2, materiality)
    }

    // Accent point light: stronger in wireframe mode (glow effect)
    if (accentRef.current) {
      accentRef.current.intensity = THREE.MathUtils.lerp(1.5, 0.5, materiality)
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.3} />
      <directionalLight
        ref={dirRef}
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        ref={accentRef}
        position={[0, 2, 2]}
        color="#6366f1"
        intensity={1.5}
        distance={10}
      />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/3d/CameraRig.jsx src/components/3d/LightingRig.jsx
git commit -m "feat: add CameraRig with scroll-driven path and LightingRig"
```

---

## Task 6: Create PostProcessingStack

**Files:**

- Create: `src/components/3d/PostProcessingStack.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/3d/PostProcessingStack.jsx`:

```jsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import useScrollStore from '@/stores/scrollStore'
import { chapters } from '@/data/chapters'

export default function PostProcessingStack() {
  const bloomRef = useRef()
  const chromaticRef = useRef()

  useFrame(() => {
    const { currentChapter, materiality } = useScrollStore.getState()
    const chapter = chapters[currentChapter] || chapters[0]

    // Bloom: stronger in wireframe chapters
    if (bloomRef.current) {
      const targetIntensity = chapter.bloomIntensity ?? (1.5 - materiality)
      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity,
        targetIntensity,
        0.05
      )
    }
  })

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        radius={0.4}
        {/* intensity controlled via ref in useFrame — do NOT set as prop */}
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        ref={chromaticRef}
        offset={new THREE.Vector2(0.001, 0.001)}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/PostProcessingStack.jsx
git commit -m "feat: add PostProcessingStack with Bloom, Vignette, ChromaticAberration"
```

---

## Task 7: Create DeskCanvas (Main R3F Canvas)

**Files:**

- Create: `src/components/3d/DeskCanvas.jsx`

This is the main entry point that composes all 3D subsystems.

- [ ] **Step 1: Create the component**

Create `src/components/3d/DeskCanvas.jsx`:

```jsx
'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import LightingRig from './LightingRig'
import DeskBase from './DeskBase'
import PostProcessingStack from './PostProcessingStack'
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

      <PostProcessingStack />
    </>
  )
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
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        shadows
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/3d/DeskCanvas.jsx
git commit -m "feat: add DeskCanvas main R3F canvas with scene composition"
```

---

## Task 8: Create ScrollProgressManager

**Files:**

- Create: `src/components/ScrollProgressManager.jsx`

This bridges GSAP ScrollTrigger to the zustand store.

- [ ] **Step 1: Create the component**

Create `src/components/ScrollProgressManager.jsx`:

```jsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useScrollStore from '@/stores/scrollStore'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProgressManager() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          useScrollStore.getState().setScrollProgress(self.progress)
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return null
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ScrollProgressManager.jsx
git commit -m "feat: add ScrollProgressManager bridging GSAP ScrollTrigger to zustand"
```

---

## Task 9: Create NarrativeOverlay + ChapterIntro

**Files:**

- Create: `src/components/NarrativeOverlay.jsx`
- Create: `src/components/ChapterIntro.jsx`

- [ ] **Step 1: Create ChapterIntro**

Create `src/components/ChapterIntro.jsx`:

```jsx
'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ChapterIntro({ number, title, subtitle }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
        },
      })

      tl.fromTo(ref.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(8rem, 15vw, 15rem)',
          fontWeight: 700,
          color: 'rgba(99, 102, 241, 0.1)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {number}
      </span>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginTop: '-2rem',
          textAlign: 'center',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            marginTop: '0.5rem',
            textAlign: 'center',
            maxWidth: '520px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create NarrativeOverlay**

Create `src/components/NarrativeOverlay.jsx` — reads content from `chapters.js` data:

```jsx
'use client'

import ChapterIntro from './ChapterIntro'
import { chapters } from '@/data/chapters'

export default function NarrativeOverlay() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {/* Render chapter intros from data */}
      {chapters.map((ch) => (
        <ChapterIntro
          key={ch.id}
          number={ch.narrativeContent.number}
          title={ch.narrativeContent.heading}
          subtitle={ch.narrativeContent.text}
        />
      ))}

      {/* Spacer for scroll length — provides scroll distance for materiality progression */}
      {/* As more chapters are added to chapters.js, this spacer shrinks */}
      <div style={{ height: '400vh' }} />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/NarrativeOverlay.jsx src/components/ChapterIntro.jsx
git commit -m "feat: add NarrativeOverlay and ChapterIntro components"
```

---

## Task 10: Wire Everything into CVPage

**Files:**

- Modify: `src/app/(cv)/page.jsx`

This is the integration step — replace the current Hero/Section01 content with the new 3D system.

- [ ] **Step 1: Read the current page.jsx**

Read `src/app/(cv)/page.jsx` to confirm current content before modifying.

- [ ] **Step 2: Update page.jsx**

Replace `src/app/(cv)/page.jsx` with:

```jsx
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import NarrativeOverlay from '@/components/NarrativeOverlay'
import ScrollProgressManager from '@/components/ScrollProgressManager'

// Dynamic import for DeskCanvas — no SSR (WebGL needs browser)
const DeskCanvas = dynamic(() => import('@/components/3d/DeskCanvas'), {
  ssr: false,
})

/**
 * Home Page - Creative CV
 * Da Zero a Developer: Francesco Urban's Story
 *
 * Layout: DeskCanvas (fixed, z:0) + NarrativeOverlay (relative, z:1)
 */
export default function Home() {
  return (
    <>
      {/* Sidebar Navigation (desktop only) */}
      <Sidebar />

      {/* 3D Scene — fixed behind everything */}
      <DeskCanvas />

      {/* ScrollTrigger → zustand bridge */}
      <ScrollProgressManager />

      {/* Narrative content scrolling over the 3D scene */}
      <main className="relative">
        <NarrativeOverlay />
      </main>
    </>
  )
}
```

**Important notes:**
- `DeskCanvas` is dynamically imported with `ssr: false` because Three.js/WebGL requires a browser environment.
- The old imports (Hero, Section01, Section01Intro, FineHero) are removed. The old component files remain in the codebase for reference but are no longer rendered.
- Mobile guard (skip DeskCanvas on mobile) is deferred to the next plan along with InteractionLayer.

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in browser. Expected:
- Full-screen dark background with the 3D canvas
- A wireframe desk, CRT monitor, and chair visible
- Indigo-colored wireframe edges with glow (bloom)
- Text overlay "00 / Hello" visible
- Scrolling changes the scene (materiality increases)
- Mouse movement causes subtle camera parallax

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(cv)/page.jsx
git commit -m "feat: wire DeskCanvas + NarrativeOverlay into CV page (replaces Hero/Section01)"
```

---

## Task 11: Visual Polish + Debug Pass

**Files:**

- May modify: any of the above files for position/color/size tweaks

This is a manual tuning pass. No code prescribed — just verification steps.

- [ ] **Step 1: Verify scroll-to-scene binding**

Open DevTools console, scroll the page. Watch for errors. The materiality should go from 0 to ~0.1 (only Ch.00 + spacer content). The desk should start as wireframe and begin to show faint solid fill.

- [ ] **Step 2: Verify camera movement**

Scroll through the page. The camera should smoothly interpolate between keyframe positions. Mouse movement should add subtle parallax (±0.15 horizontal, ±0.1 vertical).

- [ ] **Step 3: Verify postprocessing**

The wireframe edges should have a visible bloom glow. Vignette should darken corners. No visual artifacts.

- [ ] **Step 4: Check performance**

Open DevTools → Performance tab → record a scroll. Target: 60fps, no long tasks > 50ms.

- [ ] **Step 5: Verify build succeeds clean**

```bash
npm run build
```

No warnings, no errors.

- [ ] **Step 6: Final commit with any adjustments**

```bash
git add -A
git commit -m "polish: tune Ch.00 scene positions, lighting, and postprocessing"
```

---

## Verification Checklist

After all tasks are complete, verify end-to-end:

- [ ] `npm run dev` starts without errors
- [ ] Page loads showing a dark scene with a wireframe desk + CRT + chair
- [ ] Wireframe edges glow indigo with bloom
- [ ] Scrolling changes materiality (wireframe fades, solid appears)
- [ ] Camera smoothly follows scroll-driven path
- [ ] Mouse movement adds subtle parallax to camera
- [ ] Text overlay "00 / Hello" appears with fade-in animation
- [ ] No console errors or WebGL warnings
- [ ] `npm run build` succeeds
- [ ] FPS stays at 60 during scroll
