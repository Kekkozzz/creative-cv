# Chapter 01 + InteractionLayer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chapter 01 "La Prima Riga" (new desk objects: coffee mug, notepad, sheets) and InteractionLayer (click on CRT to trigger typing animation). Also fix visual issues: camera position, object placement, text overlay spacing.

**Architecture:** Follows patterns from Foundation plan. New objects use `MorphableObject`. InteractionLayer uses Three.js `Raycaster` via R3F's event system. Chapter data added to `chapters.js`.

**Tech Stack:** Same as Foundation (R3F 9, Drei 10, GSAP 3.14, Zustand)

**Spec:** `docs/superpowers/specs/2026-04-01-3d-cv-redesign-design.md` — Cap. 01 section

---

## File Structure

```
src/
├── data/
│   └── chapters.js                 # [MODIFY] Add Ch.01 config
│   └── cameraPath.js               # [MODIFY] Tune Ch.00 camera, add Ch.01 keyframe
├── components/
│   ├── 3d/
│   │   ├── DeskCanvas.jsx          # [MODIFY] Add new objects + InteractionLayer
│   │   ├── InteractionLayer.jsx    # [CREATE] Raycaster click/hover system
│   │   └── objects/
│   │       ├── CoffeeMug.jsx       # [CREATE] Procedural mug (cylinder + torus handle)
│   │       ├── Notepad.jsx         # [CREATE] Procedural notepad (box + lines)
│   │       └── PaperSheets.jsx     # [CREATE] Procedural scattered sheets
│   ├── InteractionModal.jsx        # [CREATE] Modal popup for click interactions
│   ├── NarrativeOverlay.jsx        # [MODIFY] Ch.01 already data-driven, just needs more scroll space
│   └── ChapterIntro.jsx            # No changes needed
```

---

## Task 1: Tune Camera + Object Positions

**Files:**
- Modify: `src/data/cameraPath.js`
- Modify: `src/components/3d/DeskCanvas.jsx`

- [ ] **Step 1: Bring camera closer and angle it better**

In `src/data/cameraPath.js`, update Ch.00 keyframe:

```js
{
  chapter: 0,
  scrollRange: [0.0, 0.15],
  position: [0, 1.8, 4.5],    // was [0, 2, 8] — much closer
  target: [0, 0.7, 0],         // was [0, 0.5, 0] — look slightly higher
  fov: 50,                     // was 60 — tighter framing
},
```

- [ ] **Step 2: Fix object positions in DeskCanvas**

In `src/components/3d/DeskCanvas.jsx`, adjust CRT and chair positions:
- CRT: `position={[0, 0.84, -0.3]}` (push back slightly)
- Chair: `position={[0, 0, 1.2]}` (push back further from desk)

- [ ] **Step 3: Verify visually**

`npm run dev` — desk should fill more of the viewport, objects shouldn't overlap.

- [ ] **Step 4: Commit**

```bash
git commit -m "polish: tune camera distance and object positions for Ch.00"
```

---

## Task 2: Create Ch.01 Objects (Mug, Notepad, Sheets)

**Files:**
- Create: `src/components/3d/objects/CoffeeMug.jsx`
- Create: `src/components/3d/objects/Notepad.jsx`
- Create: `src/components/3d/objects/PaperSheets.jsx`

- [ ] **Step 1: Create CoffeeMug**

`src/components/3d/objects/CoffeeMug.jsx` — cylinder body + torus handle:

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function CoffeeMug({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.055, 0.12, 12), [])
  const handleGeo = useMemo(() => new THREE.TorusGeometry(0.035, 0.008, 8, 12, Math.PI), [])

  return (
    <group {...rest}>
      <MorphableObject
        geometry={bodyGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.06, 0]}
        pbrProps={{ color: '#e4e4e7', roughness: 0.4, metalness: 0.1 }}
      />
      <MorphableObject
        geometry={handleGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0.065, 0.06, 0]}
        rotation={[0, 0, Math.PI / 2]}
        pbrProps={{ color: '#e4e4e7', roughness: 0.4 }}
      />
    </group>
  )
}
```

- [ ] **Step 2: Create Notepad**

`src/components/3d/objects/Notepad.jsx` — flat box with line details:

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

export default function Notepad({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const padGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.015, 0.3), [])
  const spineGeo = useMemo(() => new THREE.BoxGeometry(0.22, 0.02, 0.008), [])

  return (
    <group {...rest}>
      <MorphableObject
        geometry={padGeo}
        materiality={materiality}
        accentColor={accentColor}
        pbrProps={{ color: '#e4e4e7', roughness: 0.9, metalness: 0 }}
      />
      <MorphableObject
        geometry={spineGeo}
        materiality={materiality}
        accentColor={accentColor}
        position={[0, 0.005, -0.146]}
        pbrProps={{ color: '#8b5cf6', roughness: 0.7 }}
      />
    </group>
  )
}
```

- [ ] **Step 3: Create PaperSheets**

`src/components/3d/objects/PaperSheets.jsx` — a few scattered flat planes:

```jsx
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import MorphableObject from '../MorphableObject'

const sheets = [
  { pos: [0, 0, 0], rot: [0, 0.15, 0] },
  { pos: [0.05, 0.002, 0.03], rot: [0, -0.1, 0] },
  { pos: [-0.03, 0.004, -0.02], rot: [0, 0.3, 0] },
]

export default function PaperSheets({ materiality = 0, accentColor = '#6366f1', ...rest }) {
  const sheetGeo = useMemo(() => new THREE.BoxGeometry(0.15, 0.002, 0.2), [])

  return (
    <group {...rest}>
      {sheets.map((s, i) => (
        <MorphableObject
          key={i}
          geometry={sheetGeo}
          materiality={materiality}
          accentColor={accentColor}
          position={s.pos}
          rotation={s.rot}
          pbrProps={{ color: '#e4e4e7', roughness: 0.95, metalness: 0 }}
        />
      ))}
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
git commit -m "feat: add CoffeeMug, Notepad, PaperSheets for Ch.01"
```

---

## Task 3: Add Ch.01 Data + Wire Objects into Scene

**Files:**
- Modify: `src/data/chapters.js`
- Modify: `src/data/cameraPath.js`
- Modify: `src/components/3d/DeskCanvas.jsx`

- [ ] **Step 1: Add Ch.01 to chapters.js**

Append to the chapters array:

```js
{
  id: 1,
  title: 'LA PRIMA RIGA',
  subtitle: 'Il primo Hello World',
  materiality: 0.1,
  objects: ['desk', 'crt', 'chair', 'mug', 'notepad', 'sheets'],
  clickables: [
    { id: 'crt', action: 'typing', content: 'Hello World' },
  ],
  bloomIntensity: 1.3,
  narrativePosition: 'left',
  narrativeContent: {
    number: '01',
    heading: 'La Prima Riga',
    text: "Ricordo ancora quel primo 'Hello World'. Le mani sulla tastiera, incerte. Non sapevo che quelle poche righe di codice avrebbero cambiato la mia vita. Era l'inizio di tutto.",
  },
},
```

- [ ] **Step 2: Add Ch.01 camera keyframe**

Update `cameraPath.js` Ch.01 entry:

```js
{
  chapter: 1,
  scrollRange: [0.15, 0.25],
  position: [-1.5, 1.5, 3.5],    // side angle, focus on monitor
  target: [0, 0.8, -0.2],
  fov: 48,
},
```

- [ ] **Step 3: Add Ch.01 objects to DeskCanvas Scene**

Import the new components and render them conditionally based on `currentChapter`:

```jsx
import CoffeeMug from './objects/CoffeeMug'
import Notepad from './objects/Notepad'
import PaperSheets from './objects/PaperSheets'

// Inside Scene(), after existing objects:
const currentChapter = useScrollStore((s) => s.currentChapter)

// Ch.01+ objects
{currentChapter >= 1 && (
  <>
    <CoffeeMug materiality={materiality} position={[0.85, 0.8, 0.15]} />
    <Notepad materiality={materiality} position={[-0.7, 0.795, 0.2]} rotation={[0, 0.2, 0]} />
    <PaperSheets materiality={materiality} position={[0.5, 0.795, 0.3]} />
  </>
)}
```

- [ ] **Step 4: Verify dev + scroll through both chapters**

```bash
npm run dev
```

Scroll past Ch.00 → Ch.01 objects should appear (mug, notepad, sheets). Camera should move to side angle.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Chapter 01 data, camera keyframe, and desk objects"
```

---

## Task 4: Create InteractionLayer (Click/Hover)

**Files:**
- Create: `src/components/3d/InteractionLayer.jsx`
- Create: `src/components/InteractionModal.jsx`
- Modify: `src/components/3d/DeskCanvas.jsx`

- [ ] **Step 1: Create InteractionModal**

`src/components/InteractionModal.jsx` — HTML overlay modal for click interactions:

```jsx
'use client'

import { useState, useEffect } from 'react'

export default function InteractionModal({ isOpen, onClose, content, type }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '480px',
          width: '90%',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'typing' && (
          <div>
            <pre style={{
              fontFamily: "'DM Mono', 'Fira Code', monospace",
              fontSize: '14px',
              color: '#06b6d4',
              background: 'rgba(30, 30, 46, 0.8)',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
            }}>
              {content}
            </pre>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            color: '#818cf8',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Make CRT clickable**

In `src/components/3d/objects/CRTMonitor.jsx`, add click handler props:

Add `onClick` prop and apply it to the CRT body mesh. Add `onPointerOver`/`onPointerOut` for cursor change:

```jsx
export default function CRTMonitor({ materiality = 0, accentColor = '#6366f1', onClick, ...rest }) {
  // ... existing geometry code ...

  return (
    <group {...rest}>
      {/* CRT body — clickable */}
      <MorphableObject ...existing props... />

      {/* Screen — clickable area */}
      <mesh
        position={[0, 0.3, 0.251]}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[0.55, 0.4]} />
        <meshBasicMaterial color="#0a0a0f" />
      </mesh>

      {/* Stand */}
      <MorphableObject ...existing props... />
    </group>
  )
}
```

- [ ] **Step 3: Wire interaction in DeskCanvas**

In `DeskCanvas.jsx`, add state for modal and pass onClick to CRT:

```jsx
import { useState } from 'react' // add to existing imports

// In Scene():
const [modal, setModal] = useState(null)

<CRTMonitor
  materiality={materiality}
  position={[0, 0.84, -0.3]}
  onClick={() => setModal({ type: 'typing', content: '> Hello World\n\nconsole.log("Hello World!");\n// Il mio primo programma...' })}
/>

// After Canvas, in the DeskCanvas component:
// Need to lift modal state up or use a store
```

Since the modal is HTML and the Canvas is WebGL, the modal state needs to be accessible outside the Canvas. Add to `scrollStore.js`:

```js
// Add to store:
modalContent: null,
openModal: (content) => set({ modalContent: content }),
closeModal: () => set({ modalContent: null }),
```

Then in `DeskCanvas.jsx` parent div, render `InteractionModal` reading from store.

- [ ] **Step 4: Verify interactions**

`npm run dev` → click on CRT screen → modal appears with "Hello World" content. Click outside or "Chiudi" → modal closes.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add InteractionLayer with CRT click and modal system"
```

---

## Task 5: Adjust NarrativeOverlay Scroll Space

**Files:**
- Modify: `src/components/NarrativeOverlay.jsx`

- [ ] **Step 1: Update scroll spacer**

Now that we have 2 chapters, increase the scroll space between chapters and reduce the end spacer:

```jsx
{chapters.map((ch, i) => (
  <div key={ch.id}>
    <ChapterIntro
      number={ch.narrativeContent.number}
      title={ch.narrativeContent.heading}
      subtitle={ch.narrativeContent.text}
    />
    {/* Scroll space for chapter content + transition */}
    <div style={{ height: '150vh' }} />
  </div>
))}

{/* End spacer */}
<div style={{ height: '100vh' }} />
```

- [ ] **Step 2: Verify smooth chapter transitions**

Scroll through both chapters. Camera should transition smoothly. Objects should appear at Ch.01.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: adjust NarrativeOverlay scroll spacing for multi-chapter"
```

---

## Verification Checklist

- [ ] Camera is closer to desk, good framing
- [ ] Ch.00: wireframe desk + CRT + chair visible
- [ ] Scroll to Ch.01: mug, notepad, sheets appear on desk
- [ ] Camera moves to side angle for Ch.01
- [ ] Click on CRT screen → modal with "Hello World"
- [ ] Modal closes on click outside or "Chiudi" button
- [ ] Smooth materiality transition throughout scroll
- [ ] `npm run build` succeeds
- [ ] No console errors
