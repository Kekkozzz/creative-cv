# Design: CV 3D Immersivo — "La Scrivania che Evolve"

## Context

Il portfolio/CV attuale ("Da Zero a Developer") ha 2 sezioni live su 10, con un design Morozov a scroll verticale e animazioni GSAP. L'utente vuole un redesign completo della sezione CV incentrato sul 3D, ispirato a Bruno Simon ma senza navigazione 3D libera. L'obiettivo è creare un'esperienza wow immersiva dove una scena 3D full-screen racconta la storia della crescita professionale attraverso l'evoluzione di una scrivania — da wireframe scheletrico a setup solido e dettagliato.

La sezione servizi (Edizioni Duepuntozero) resta invariata. Focus esclusivo sulla sezione CV, solo desktop per ora.

### Mobile Fallback

Su mobile (`isMobile()` da `src/utils/detectDevice.js`), la canvas 3D non viene renderizzata. Si mostra una versione statica con: i ChapterIntro (numero + titolo + testo), immagini pre-renderizzate della scrivania per i momenti chiave, e animazioni GSAP leggere (fade/slide). Il `MobileProgressBar` esistente in Sidebar viene mantenuto per la navigazione mobile.

---

## Design Overview

### Concept Narrativo
Una scrivania 3D che evolve nel tempo, seguendo gli 11 capitoli (00–10) della storia professionale di Francesco. La materialità degli oggetti progredisce da 100% wireframe (cap. 00) a completamente solido con PBR ed effetti emissivi (cap. 10). Questa progressione visiva è la metafora della crescita: dall'incertezza del primo Hello World alla padronanza tecnica odierna.

### Approccio Tecnico: "Scena Continua"
Un'unica canvas React Three Fiber persistente, `position: fixed`, che occupa tutto il viewport. Il testo narrativo scorre in overlay (`position: relative`, `z-index: 1`) con pannelli semitrasparenti a backdrop-blur. Lo scroll pilota tutto: posizione camera, materialità oggetti, lighting, oggetti visibili.

### Interattività
- **Scroll-driven**: la scena reagisce allo scroll (camera path, transizioni materiali, oggetti che appaiono/scompaiono)
- **Mouse hover**: parallasse 3D leggera sulla camera, glow outline sugli oggetti interattivi
- **Click**: oggetti cliccabili rivelano dettagli extra (popup/modal): click sul monitor → typing animation, click sulla tazza → easter egg, etc.

---

## Architettura Tecnica

### Component Tree

```
CVPage
├── DeskCanvas (R3F Canvas, position:fixed, z-index:0, 100vw×100vh)
│   ├── CameraRig (camera su path, controllata da scrollProgress)
│   │   └── PerspectiveCamera + MouseParallax (easing 0.05)
│   ├── LightingRig (luci che cambiano intensità/colore per capitolo)
│   │   └── AmbientLight + DirectionalLight + PointLights[]
│   ├── DeskBase (scrivania sempre presente, morph wireframe→solido)
│   │   ├── DeskSurface (piano del tavolo)
│   │   ├── DeskLegs (gambe, evolvono da basic a standing desk)
│   │   └── Monitor[] (CRT → flat → ultrawide via morph)
│   ├── ChapterObjects (oggetti specifici per capitolo)
│   │   ├── useChapterState(scrollProgress)
│   │   ├── ObjectPool[] (tazza, libri, cuffie, pianta, badge...)
│   │   └── FloatingElements[] (git graph, lighthouse, costellazioni...)
│   ├── InteractionLayer (raycaster per click/hover)
│   │   ├── ClickableObject[] (hotspot con cursor custom)
│   │   └── HoverGlow (OutlinePass su hover)
│   ├── MaterialSystem (gestisce transizione wireframe→solido)
│   │   └── Dual-mesh crossfade: LineSegments (wireframe) + Mesh (PBR)
│   └── PostProcessing (@react-three/postprocessing)
│       └── EffectComposer > Bloom + Vignette + ChromaticAberration
├── NarrativeOverlay (position:relative, z-index:1)
│   ├── ChapterIntro[] (numero + titolo + intro text, GSAP entrance)
│   ├── NarrativePanel[] (card semitrasparenti con backdrop-blur)
│   ├── InteractionModal (popup quando click su oggetti 3D)
│   └── ChapterTransition (fade/wipe tra sezioni narrative)
├── Sidebar (nav laterale, già esistente, adattata)
└── Navbar (top nav, già esistente)
```

### Data Flow: Scroll → Scene State

```
Lenis Smooth Scroll
    ↓
GSAP ScrollTrigger (scrub: true, trigger: NarrativeOverlay container)
    ↓
scrollProgress: 0.0 → 1.0 (zustand store)
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│   CameraRig     │  MaterialSystem  │ ChapterObjects  │
│ Interpola pos   │ mix(wire,solid)  │ Mostra/nascondi │
│ lungo path      │ basato su prog.  │ con fade in/out │
├─────────────────┼──────────────────┼─────────────────┤
│  LightingRig    │ NarrativeOverlay │ PostProcessing  │
│ Cambia mood     │ Attiva pannelli  │ Bloom intensity │
│ per capitolo    │ e transizioni    │ segue progr.    │
└─────────────────┴──────────────────┴─────────────────┘
```

### Material Transition System

Il cuore dell'effetto. Approccio **dual-mesh con crossfade di opacità** — non un custom PBR shader (troppo complesso replicare l'intero lighting pipeline di Three.js).

Ogni oggetto è un `<group>` con due figli sovrapposti:
1. **Wireframe mesh**: `EdgesGeometry` + `LineBasicMaterial` (accent color, emissive glow)
2. **Solid mesh**: `MeshStandardMaterial` (PBR pieno, roughness/metalness, ombre)

Un valore `materiality` (0→1), derivato da `scrollProgress`, controlla le opacità:
- Wireframe: `opacity = 1.0 - materiality` (scompare gradualmente)
- Solid: `opacity = materiality` (appare gradualmente)
- Entrambi `transparent: true`

| materiality | Wireframe opacity | Solid opacity | Aspetto |
|---|---|---|---|
| 0.0 | 1.0 | 0.0 | Solo wireframe glowing |
| 0.25 | 0.75 | 0.25 | Wire dominante + ghost fill |
| 0.50 | 0.50 | 0.50 | Transizione bilanciata |
| 0.75 | 0.25 | 0.75 | Solido dominante + faint edges |
| 1.0 | 0.0 | 1.0 | Full PBR, no wireframe |

Implementazione — componente wrapper R3F:
```jsx
function MorphableObject({ geometry, materiality, accentColor, ...pbrProps }) {
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry])
  return (
    <group>
      {/* Wireframe layer */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          color={accentColor}
          transparent opacity={1 - materiality}
        />
      </lineSegments>
      {/* Solid PBR layer */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          {...pbrProps}
          transparent opacity={materiality}
        />
      </mesh>
    </group>
  )
}
```

Questo approccio sfrutta il PBR lighting nativo di Three.js senza riscrivere shader custom.

### PostProcessing Stack

Usa `@react-three/postprocessing` (già installato, wrappa `pmndrs/postprocessing`):

```jsx
<EffectComposer>
  <Bloom luminanceThreshold={0.8} intensity={1.5} radius={0.4} />
  <Vignette offset={0.3} darkness={0.7} />
  <ChromaticAberration offset={[0.001, 0.001]} />
</EffectComposer>
```

- **Bloom**: glow per wireframe edges e oggetti emissivi. Intensity varia per capitolo (più forte nei primi, wireframe glowing)
- **Vignette**: effetto cinematografico costante
- **ChromaticAberration**: leggera, aumentata nel cap. 03 (struggle/glitch)
- Niente FXAA manuale — R3F postprocessing gestisce l'AA internamente

### Performance Budget
- **Target**: 60 FPS su desktop mid-range
- **Modelli totali**: < 5MB (con Draco compression)
- **Triangoli visibili per frame**: < 50K
- **Draw calls**: < 30 per frame
- **DPR**: `Math.min(window.devicePixelRatio, 2)`
- **Frustum culling**: attivo (default Three.js)
- **Lazy loading**: modelli GLTF caricati progressivamente con `useGLTF.preload()`
- **JS bundle target**: < 300KB gzipped (JS iniziale, esclusi modelli 3D)
- **Loading state**: Schermata di caricamento iniziale con progress bar mentre i primi asset si caricano (wireframe della scrivania + cap. 00). Usa `useProgress()` da Drei. I modelli GLTF dei capitoli successivi vengono precaricati in background dopo il render iniziale

---

## Mappa degli 11 Capitoli (00–10)

### Cap. 00 — INTRO "Hello" (100% wireframe)
- **Scena**: Buio totale. Punto luminoso si espande in griglia wireframe. Scrivania scheletrica emerge. CRT si accende con cursore lampeggiante.
- **Camera**: Zoom-in lento dal buio verso la scrivania.
- **Oggetti**: Scrivania wireframe, CRT wireframe, sedia wireframe.
- **Click**: CRT → "Hello World" typing animation.
- **Bloom**: Alto (wireframe glowing).

### Cap. 01 — LA PRIMA RIGA (90% wireframe)
- **Scena**: Blocco note e tazza wireframe sulla scrivania. CRT mostra HTML. Linee con leggero glow. Fogli sparsi.
- **Camera**: Angolo laterale, focus monitor.
- **Oggetti nuovi**: Tazza, bloc notes, fogli.
- **Click**: Monitor → typing del primo HTML/CSS/JS.

### Cap. 02 — AULAB (75% wireframe)
- **Scena**: CRT morpha in monitor piatto. Tastiera semi-wireframe. Libri impilati. Calendario "847 ore". Superfici con fill leggero.
- **Camera**: Si alza, visione più ampia.
- **Oggetti nuovi**: Monitor flat, tastiera, libri, calendario.
- **Click**: Libri → tech stack. Orologio → counter animato.

### Cap. 03 — BACKEND STRUGGLE (60% wireframe)
- **Scena**: Monitor con terminale errori (rosso). Scrivania si "incrina" (glitch). Server rack wireframe dietro desk. DB schema fluttuante. Superfici oscillano (instabilità).
- **Camera**: Shake leggero, poi stabilizza.
- **Effetti speciali**: GlitchPass temporaneo, chromatic aberration aumentata.
- **Click**: Server → schema DB. Monitor → evoluzione codice.

### Cap. 04 — REACT "Quando ho capito" (50% → svolta visiva)
- **Scena**: MOMENTO CHIAVE. Monitor si illumina con logo React. Onda di "solidificazione" dal monitor attraversa tutta la scrivania. Secondo monitor, cuffie, pianta appaiono. Punto di svolta wireframe→solido.
- **Camera**: Zoom drammatico sul monitor, pullback per rivelare setup.
- **Oggetti nuovi**: Secondo monitor, cuffie, pianta (piccola).
- **Click**: Monitor → component tree interattivo.

### Cap. 05 — PRIMO LAVORO (40% wireframe)
- **Scena**: Muri semi-trasparenti (ufficio). Post-it colorati. Slack su secondo monitor. Badge appoggiato. Git graph fluttuante. Scrivania per lo più solida.
- **Camera**: Zoom-out per mostrare ambiente.
- **Oggetti nuovi**: Muri, post-it, badge, git graph.
- **Click**: Badge → prima esperienza. Git graph → contribuzioni.

### Cap. 06 — AI "Non magia, solo strumenti" (25% wireframe)
- **Scena**: Ologramma AI fluttua sopra desk (icosahedron wireframe pulsante). Split-screen monitor: manuale vs AI. Particelle connettono ologramma→codice.
- **Camera**: Focus ologramma, poi monitor.
- **Oggetti nuovi**: Ologramma AI, particelle.
- **Click**: Ologramma → prompt reali. Monitor → confronto.

### Cap. 07 — ANIMAZIONI "Dare vita al web" (15% wireframe)
- **Scena**: La scrivania "prende vita" — micro-animazioni ovunque (pianta cresce, tazza fuma, luci pulsano). Monitor con loop GSAP. Particelle colorate nell'aria. Sezione più viva e colorata.
- **Camera**: Orbita lenta attorno alla scrivania.
- **Effetti**: Bloom aumentato, particelle colorful.
- **Click**: Monitor → demo animazione. Particelle → FPS counter.

### Cap. 08 — NEXT.JS "Maturità tecnica" (5% wireframe)
- **Scena**: Setup professionale: ultrawide, MacBook, standing desk. Lighthouse circles fluttuanti. Deploy pipeline come tubo luminoso verso il cloud.
- **Camera**: Vista professionale, angolo pulito.
- **Oggetti nuovi**: Ultrawide, MacBook, standing desk, lighthouse circles.
- **Click**: Lighthouse → scores animati. Pipeline → step deploy.

### Cap. 09 — THREE.JS "La nuova frontiera" (0% wireframe — 100% solido)
- **Scena**: CLIMAX. Scrivania completamente solida, PBR pieno. Monitor mostra scena Three.js (inception!). Scrivania si deforma creativamente — oggetti levitano, tavolo si piega. Padronanza = libertà.
- **Camera**: Orbita libera, prospettive impossibili.
- **Effetti**: Deformazione vertex shader, levitazione oggetti.
- **Click**: Monitor → galleria esperimenti. Oggetti → deformazione interattiva.

### Cap. 10 — OGGI & DOMANI "Oltre il solido — emissivo"
- **Scena**: Scrivania al massimo splendore. Poi zoom-out: diventa isola luminosa in spazio scuro. Altre isole in lontananza (futuro). Tech stack come costellazione orbitante. CTA finale luminoso.
- **Camera**: Grand zoom-out, dalla scrivania all'universo.
- **Oggetti nuovi**: Costellazioni tech, isole lontane.
- **Click**: Costellazioni → tech stack. Isole → link portfolio/contatti.

---

## Workflow Produzione Asset 3D

### 3 Livelli di Produzione

**Livello 1 — Procedurale (~60% degli oggetti)**
Cap. 00–02. Geometrie create in codice Three.js (BoxGeometry, CylinderGeometry, EdgesGeometry, LineSegments). Zero file esterni. Oggetti: scrivania base, tazza, libri, fogli, server rack, badge, git graph, lighthouse, costellazioni, ologramma AI.

**Livello 2 — Marketplace (~25%)**
Cap. 03–06. Modelli low-poly gratuiti/economici da Sketchfab, poly.pizza, Kenney.nl. Oggetti: CRT (retro_computer.glb già esiste!), monitor flat, cuffie, piccoli gadget. Ottimizzati con gltf-transform + Draco.

**Livello 3 — Custom/AI (~15%)**
Cap. 07–10. Blender custom o AI (Meshy.ai, Tripo3D). Oggetti: ultrawide, MacBook, standing desk. Export GLTF con PBR textures, Draco compression.

### Pipeline Ottimizzazione
1. Download .glb
2. Blender: decimate modifier + cleanup
3. `npx @gltf-transform/cli optimize input.glb output.glb`
4. `npx @gltf-transform/cli draco input.glb output.glb`
5. `npx gltfjsx output.glb` → componente R3F
6. → `/public/models/`

### Budget: €0-50 (usando asset gratuiti per la maggior parte)

---

## Overlay Narrativo

### Layout Pannelli Testo
I pannelli narrativi sono HTML/CSS puri sopra la canvas 3D:

```
┌─────────────────────────────────────┐
│  Canvas 3D (position: fixed)        │
│  ┌───────────────────┐              │
│  │  NarrativePanel   │              │
│  │  backdrop-blur     │  ← z-index:1│
│  │  bg: rgba(10,10,  │              │
│  │      15, 0.7)     │              │
│  │  max-w: 520px     │              │
│  │  padding: 32px    │              │
│  └───────────────────┘              │
│                                     │
└─────────────────────────────────────┘
```

- **Background**: `rgba(10, 10, 15, 0.7)` + `backdrop-filter: blur(12px)`
- **Border**: `1px solid rgba(99, 102, 241, 0.15)` (accent indigo)
- **Border-radius**: 16px
- **Max-width**: 520px
- **Position**: variano per sezione (left per alcune, right per altre, center per intro)
- **Animazioni entrance**: GSAP fade + slide (from left/right/bottom)
- **pointer-events**: La canvas ha sempre `pointer-events: auto` (necessaria per raycasting). L'overlay narrativo ha `pointer-events: none` di default, con `pointer-events: auto` solo sui pannelli di testo. In questo modo il click "passa attraverso" l'overlay vuoto e arriva alla canvas per le interazioni 3D

### Chapter Intro
Ogni capitolo inizia con un intro a pieno schermo:
- Numero grande (clamp 8rem-15vw) semi-trasparente
- Titolo capitolo
- 1-2 frasi intro
- Fade-in da scroll, fade-out quando il contenuto principale inizia

---

## File Critici da Modificare/Creare

Nota: i nuovi file vanno in `src/components/` (directory dei componenti CV, accanto a `Hero.jsx`, `Sidebar.jsx`, etc.) — non in `src/app/components/` (che è per i componenti della sezione servizi). I file dati vanno in `src/data/` (accanto a `sections.js` esistente).

### Da creare (nuovi):
- `src/components/3d/DeskCanvas.jsx` — Canvas R3F principale
- `src/components/3d/CameraRig.jsx` — Camera su path con scroll
- `src/components/3d/DeskBase.jsx` — Scrivania base morphable
- `src/components/3d/ChapterObjects.jsx` — Manager oggetti per capitolo
- `src/components/3d/MaterialSystem.jsx` — Sistema transizione wireframe→solido
- `src/components/3d/InteractionLayer.jsx` — Raycaster + hover/click
- `src/components/3d/LightingRig.jsx` — Luci dinamiche
- `src/components/3d/PostProcessingStack.jsx` — EffectComposer setup
- `src/components/3d/objects/` — Directory con componenti per singoli oggetti
- `src/components/NarrativeOverlay.jsx` — Container overlay narrativo
- `src/components/NarrativePanel.jsx` — Singolo pannello testo
- `src/components/ChapterIntro.jsx` — Intro capitolo (numero + titolo)
- `src/components/InteractionModal.jsx` — Modal per click su oggetti 3D
- `src/stores/scrollStore.js` — Zustand store (vedi contratto sotto)
- `src/data/chapters.js` — Config capitoli (vedi formato sotto)
- `src/data/cameraPath.js` — Definizione path camera (vedi formato sotto)

### Zustand Store Contract (`scrollStore.js`)

```js
const useScrollStore = create((set) => ({
  // Producers: ScrollTrigger scrive questi valori
  scrollProgress: 0,       // 0.0–1.0, progresso globale dello scroll
  currentChapter: 0,       // 0–10, indice del capitolo corrente
  materiality: 0,          // 0.0–1.0, livello di solidità (derivato da scrollProgress)

  // Actions
  setScrollProgress: (p) => set({
    scrollProgress: p,
    currentChapter: Math.floor(p * 11),           // 11 capitoli (00–10)
    materiality: Math.min(1, p * 1.1),            // raggiunge 1.0 al cap. 09
  }),

  // Consumers: letti da CameraRig, MaterialSystem, ChapterObjects,
  //            LightingRig, NarrativeOverlay, PostProcessing
}))
```

### Camera Path Keyframe Format (`cameraPath.js`)

```js
export const cameraKeyframes = [
  {
    chapter: 0,
    scrollRange: [0.0, 0.09],    // scrollProgress range per questo capitolo
    position: [0, 2, 8],          // camera position [x, y, z]
    target: [0, 0.5, 0],          // lookAt target [x, y, z]
    fov: 60,
  },
  {
    chapter: 1,
    scrollRange: [0.09, 0.18],
    position: [-2, 1.5, 5],
    target: [0, 0.5, 0],
    fov: 55,
  },
  // ... per ogni capitolo
]
```

### Chapter Config Format (`chapters.js`)

Importa il testo narrativo da `copy.txt` (file alla root del progetto che contiene il copy per tutte le sezioni).

```js
export const chapters = [
  {
    id: 0,
    title: "INTRO",
    subtitle: "Hello",
    materiality: 0.0,             // target materiality
    objects: ['desk', 'crt'],     // oggetti visibili
    clickables: [{ id: 'crt', action: 'typing', content: 'Hello World' }],
    bloomIntensity: 1.5,
    narrativePosition: 'center',  // 'left' | 'right' | 'center'
  },
  // ...
]
```

### Da modificare (esistenti):
- `src/app/(cv)/page.jsx` — Sostituire struttura attuale con DeskCanvas + NarrativeOverlay
- `src/app/(cv)/layout.jsx` — Mantenere fonts + SmoothScroll, aggiungere scroll height per trigger
- `src/components/Sidebar.jsx` — Adattare per nuovo scroll system
- `src/components/Navbar.jsx` — Assicurare z-index sopra canvas
- `src/data/sections.js` — Aggiornare metadata sezioni per nuovo sistema

### Da rimuovere/sostituire:
- `src/components/Hero.jsx` — Sostituito da Cap. 00 nel nuovo sistema
- `src/components/Section01.jsx` — Sostituito da Cap. 01
- `src/components/Section01Intro.jsx` — Integrato in ChapterIntro
- `src/components/FineHero.jsx` — Non più necessario (no sezioni separate)
- `src/components/Scene3D.jsx` — Sostituito da DeskCanvas
- `src/components/FloatingShape.jsx` — Integrato in ChapterObjects
- `src/components/HeroShape.jsx` — Integrato in ChapterObjects

---

## Dipendenze Nuove

```bash
npm install zustand          # State management per scrollProgress
npm install @gltf-transform/cli --save-dev  # Ottimizzazione modelli
```

Tutto il resto (Three.js, R3F, Drei, postprocessing, GSAP, Lenis) è già installato.

---

## Verifica e Testing

### Come testare le modifiche

1. **Visual test**: `npm run dev` → aprire il sito desktop → scrollare l'intera pagina verificando:
   - La canvas 3D è fissa e occupa tutto il viewport
   - La scrivania si trasforma fluidamente wireframe→solido con lo scroll
   - I pannelli narrativi appaiono/scompaiono correttamente
   - La camera si muove lungo il path predefinito
   - I capitoli si susseguono senza glitch

2. **Performance test**: DevTools → Performance tab → registrare uno scroll completo:
   - FPS stabile a 60
   - No memory leaks (heap non cresce)
   - No jank (long tasks < 50ms)

3. **Interaction test**: Verificare manualmente:
   - Hover su oggetti cliccabili → outline glow + cursor pointer
   - Click su oggetti → modal/popup corretto
   - Mouse parallasse → camera si muove leggermente

4. **Build test**: `npm run build` → verificare no errori, bundle size ragionevole

### Approccio Incrementale
Implementare un capitolo alla volta, partendo dal 00 (più semplice: wireframe puro). Ogni capitolo viene testato e validato prima di procedere al successivo.

### Ordine di implementazione suggerito
1. Setup base: DeskCanvas + CameraRig + scrollProgress store
2. MaterialSystem: shader wireframe→solido
3. Cap. 00: Hero wireframe (la scrivania che appare dal buio)
4. Cap. 01: La Prima Riga (testo overlay + primi oggetti)
5. NarrativeOverlay + ChapterIntro (sistema pannelli)
6. InteractionLayer (click/hover)
7. PostProcessing
8. Cap. 02-10 (uno alla volta)
