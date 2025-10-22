# Creative CV - Francesco Urban
## Contesto Progetto e Progressi

**Data ultimo aggiornamento**: 22 Ottobre 2025

---

## 🎯 Obiettivo del Progetto

Creare un **CV creativo interattivo** che racconta la storia di Francesco Urban come developer, dal primo "Hello World" ai 900+ commit su GitHub. Il sito deve essere:
- **Narrativo**: Racconta una storia attraverso 10 sezioni
- **Visivamente impattante**: Animazioni pesanti ma wow
- **Tecnicamente avanzato**: Uso di 3D, GSAP, smooth scroll
- **Creativo-sperimentale**: Non un CV tradizionale, ma un'esperienza

---

## 📊 Stack Tecnologico

### Core
- **Framework**: Next.js 15.5.6 (con Turbopack)
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4

### Animazioni
- **GSAP 3.13.0**: Timeline e ScrollTrigger per animazioni complesse
- **Framer Motion 12.23.24**: Animazioni componenti (installato ma non ancora usato)
- **Lenis 1.3.11**: Smooth scroll premium

### 3D (installato ma non utilizzato nella v1)
- **Three.js 0.180.0**
- **React Three Fiber 9.4.0**
- **Drei 10.7.6**

### Altre Librerie
- **react-syntax-highlighter**: Code highlighting per editor mockup
- **clsx + tailwind-merge**: Gestione classi CSS

---

## 🎨 Design System: "Developer's Night"

### Palette Colori
```css
/* Background */
--bg-primary: #0a0a0f       /* Quasi nero elegante */
--bg-secondary: #16161d     /* Grigio scuro per sezioni alternate */
--bg-tertiary: #1e1e2e      /* Background code editor */
--bg-surface: #24243a       /* Surface elements */

/* Text */
--text-primary: #e4e4e7     /* Grigio chiaro per testo */
--text-secondary: #a1a1aa   /* Grigio medio per sottotitoli */
--text-muted: #71717a       /* Grigio per testo secondario */

/* Accent Colors - Gradient Tech */
--accent-primary: #6366f1   /* Indigo */
--accent-secondary: #8b5cf6 /* Viola */
--accent-tertiary: #06b6d4  /* Cyan */

/* Status */
--success: #10b981          /* Verde */
--warning: #f59e0b          /* Ambra */
--error: #ef4444            /* Rosso */

/* Glow Effects */
--glow-primary: rgba(99, 102, 241, 0.4)
--glow-secondary: rgba(139, 92, 246, 0.3)
--glow-tertiary: rgba(6, 182, 212, 0.3)
```

### Font
- **Heading**: Space Grotesk (400, 500, 600, 700)
- **Body**: DM Sans (400, 500, 600, 700)

---

## 📂 Struttura File Implementati

### `/src/app`
- `page.jsx` - Home page con Hero + Section01
- `layout.js` - Layout root con SmoothScroll wrapper
- `globals.css` - Design system completo con palette e utility

### `/src/components`
#### ✅ Implementati e Funzionanti
- **Hero.jsx** - Sezione introduttiva con nome animato e testo statico
- **Section01.jsx** - "La Prima Riga" con testo narrativo + 3 code editors (HTML, CSS, JS)
- **CodeEditor.jsx** - Mockup code editor con typing animation integrata
- **Sidebar.jsx** - Navigation stile Notion con scroll spy (desktop only)
- **MobileProgressBar** - Barra progresso top (mobile only)
- **SmoothScroll.jsx** - Wrapper Lenis per smooth scrolling
- **HeroShape.jsx** - Geometrie 3D (creato ma non utilizzato)

#### ❌ Non Più Utilizzati
- **CursorEffect.jsx** - Cursore personalizzato (rimosso su richiesta)
- **AnimatedText.jsx** - Typing animation (sostituito con logica diretta in CodeEditor)
- **Scene3D.jsx** - Scena 3D (rimosso da Hero su richiesta)
- **FloatingShape.jsx** - Computer 3D (test iniziale)

### `/src/utils`
- **detectDevice.js** - Utility per mobile detection e animation config

### `/src/data`
- **sections.js** - Configurazione sezioni per sidebar navigation

---

## 🚀 Componenti Implementati in Dettaglio

### 1. Hero Section
**File**: `src/components/Hero.jsx`

**Caratteristiche**:
- Nome "Francesco Romito" con gradient text e glow effect
- Testo statico: "Da zero righe di codice a 900 commit. Questa è la mia storia."
- Background gradient animato con radial gradients (indigo + viola)
- Scroll indicator pulsante
- Animazione GSAP: fade in + slide up del nome
- Noise texture overlay per depth

**Note**:
- ~~Typing animation rimossa (non funzionava correttamente)~~
- ~~Oggetto 3D rimosso su richiesta dell'utente~~
- ~~Effetto parallax mouse rimosso (causava errori)~~

### 2. Section01 - "La Prima Riga"
**File**: `src/components/Section01.jsx`

**Caratteristiche**:
- **Layout**: 50/50 testo narrativo | code editors
- **Testo**: Storia del primo "Hello World" con stats (600h formazione, 900 commit)
- **Code Editors**:
  - HTML editor (index.html) - 10 righe
  - CSS editor (style.css) - 5 righe
  - JS editor (script.js) - 5 righe
- **Animazioni ScrollTrigger**:
  - Titolo slide in da sinistra
  - Paragrafi fade in con stagger
  - Editors slide in da destra
  - Parallax multi-layer (background, testo, editors)
- **Typing Animation**: Gli editors si digitano in sequenza (HTML → CSS → JS)
- **Background**: Immagine Unsplash di scrivania sfocata (blur + brightness)

**Timing**:
- HTML: inizia dopo 300ms
- CSS: inizia dopo 2000ms
- JS: inizia dopo 3500ms

### 3. CodeEditor Component
**File**: `src/components/CodeEditor.jsx`

**Caratteristiche**:
- Mockup editor stile macOS con traffic lights
- Syntax highlighting con `react-syntax-highlighter` (light build)
- **Typing animation custom** (senza dipendenze esterne):
  - Velocità variabile per effetto umano
  - Cursore blinking durante digitazione
  - Support per HTML, CSS, JavaScript
- Terminal header con filename
- Optional output section (per console.log)

**Linguaggi Supportati**:
```javascript
- javascript
- html (xml)
- css
```

**Esempi Preset**:
```javascript
CodeExamples.helloWorldHTML  // DOCTYPE completo
CodeExamples.helloWorldCSS   // Styling h1 (5 righe)
CodeExamples.helloWorldJS    // Funzione greet (5 righe)
```

### 4. Sidebar Navigation
**File**: `src/components/Sidebar.jsx`

**Caratteristiche**:
- Fixed a destra (desktop only)
- Scroll spy con Intersection Observer
- Active section highlight con dot animato
- Progress indicator verticale
- Progress percentage in fondo
- Auto fade-in dopo 1 secondo

**Sezioni Configurate**:
```javascript
00 - Intro (Hero)
01 - La Prima Riga (Section01)
02-10 - Disabled (future)
```

### 5. SmoothScroll
**File**: `src/components/SmoothScroll.jsx`

**Configurazione Lenis**:
```javascript
duration: 1.2
easing: easeOutExpo
smooth: true
```

---

## 🔧 Problemi Risolti

### 1. AnimatedText Non Funzionante
**Problema**: Il componente AnimatedText non renderizzava il testo nell'Hero
**Causa**: Problemi con SSR e condizioni di rendering
**Soluzione**:
- Nell'Hero: Sostituito con testo statico
- Nel CodeEditor: Riscritta typing animation direttamente nel componente con logica custom

### 2. Maximum Update Depth nell'Hero
**Problema**: Errore "Maximum update depth exceeded" con mousePosition
**Causa**: State update loop con useEffect senza dipendenze corrette
**Soluzione**: Rimosso effetto parallax mouse e oggetto 3D dall'Hero

### 3. React-Syntax-Highlighter Import Error
**Problema**: `Module not found: Can't resolve 'refractor/lib/all'`
**Causa**: Import di Prism che richiede refractor completo
**Soluzione**: Usato `Light` build con import manuali dei linguaggi

### 4. Code Editor Vuoto
**Problema**: Il CodeEditor mostrava box vuoto senza codice
**Causa**: Typing animation che non partiva correttamente
**Soluzione**: Logica di typing riscritta con useEffect e setTimeout ricorsivo

### 5. Flash del Codice Completo
**Problema**: Al caricamento si vedeva il codice completo, poi spariva e ripartiva la typing
**Causa**: displayCode inizializzato con `code` invece di stringa vuota
**Soluzione**: Aggiunto flag `hasStartedTypingRef` per resettare display quando `showTyping` diventa true

---

## 📝 Copy Sections (da `copy.txt`)

### Sezioni Pianificate (10 totali)
1. ✅ **La Prima Riga** - Implementata
2. ⏳ **Aulab: Dove Tutto È Iniziato** - Da fare
3. ⏳ **La Fatica del Backend** - Da fare
4. ⏳ **React: Quando Ho Capito** - Da fare
5. ⏳ **Il Primo Lavoro** - Da fare
6. ⏳ **L'AI: Non È Magia, È Tool** - Da fare
7. ⏳ **Le Animazioni: Dare Vita al Web** - Da fare
8. ⏳ **Next.js: Maturità Tecnica** - Da fare
9. ⏳ **Three.js: La Nuova Frontiera** - Da fare
10. ⏳ **Oggi, E Domani** - Da fare

### Dati Reali Utente
- **Nome**: Francesco Urban
- **Ore formazione Aulab**: 600h (400h HTML/CSS/JS/PHP/Laravel + 200h JS/React)
- **Commit ultimo anno**: 900+

---

## 🎬 Animazioni Implementate

### GSAP ScrollTrigger
```javascript
// Section01
- Titolo: slide in da sinistra (x: -100, duration: 0.8s)
- Paragrafi: fade in stagger (y: 30, stagger: 0.2s)
- Editor: slide in da destra (x: 100, duration: 1s)
- Parallax: background 0.5x, testo 0.9x, editor 0.8x
```

### Typing Animation (CodeEditor)
```javascript
- Velocità base: 50-80ms per carattere
- Variance: ±30% per effetto umano
- Delay iniziali: 300ms, 2000ms, 3500ms
- Cursore: blink 1s con animation CSS
```

### CSS Animations
```css
@keyframes cursor-blink { /* 1s step-end */ }
@keyframes gradient-shift { /* 8s gradient background */ }
@keyframes pulse-glow { /* 2s scroll indicator */ }
```

---

## 🚧 Problemi Noti / TODO

### Problemi Minori
- [ ] Nome nell'Hero ancora dice "Francesco Romito" (dovrebbe essere "Francesco Urban")
- [ ] Cursore blinking nel CodeEditor non posizionato perfettamente durante typing
- [ ] Mobile: Parallax disabilitato ma potrebbe essere migliorato

### Feature Mancanti
- [ ] 9 sezioni rimanenti da implementare
- [ ] Contact form (Sezione 10)
- [ ] GitHub contributions graph live
- [ ] Project showcase interattivo

---

## 📱 Responsive Strategy

### Desktop (> 1024px)
- Layout completo con sidebar
- Tutte le animazioni attive
- Parallax effects
- Typing animation negli editors
- 60 FPS target

### Mobile (< 1024px)
- Layout verticale
- Progress bar top (no sidebar)
- Animazioni semplificate (no parallax)
- Code editors: codice statico (no typing)
- 30 FPS target

**Detection**: `src/utils/detectDevice.js`

---

## 🔄 Decisioni di Design Prese

1. **No cursore personalizzato** - Rimosso perché non piaceva all'utente
2. **No oggetti 3D nell'Hero** - Rimosso per semplicità
3. **Testo statico invece di typing nell'Hero** - Typing non funzionava bene
4. **Dark mode only** - Niente light mode per ora
5. **Single page scroll** - No route separate per sezioni
6. **Animazioni pesanti ma wow** - Priorità su impatto visivo vs performance
7. **Code editors compatti** - Max 5 righe per CSS/JS per evitare scroll

---

## 🎯 Next Steps (Prossima Sessione)

### Priorità Alta
1. [ ] Correggere nome nell'Hero (Francesco Romito → Francesco Urban)
2. [ ] Implementare Sezione 02 - "Aulab"
3. [ ] Testare e fixare mobile responsive

### Priorità Media
4. [ ] Aggiungere più microinterazioni
5. [ ] Migliorare transizioni tra sezioni
6. [ ] Ottimizzare performance (lazy load immagini)

### Priorità Bassa
7. [ ] Rivedere typing animation per Hero (se richiesto)
8. [ ] Aggiungere Easter eggs
9. [ ] Analytics e tracking

---

## 📚 Risorse e Riferimenti

### Design Inspiration
- Sidebar: Notion table of contents
- Code editors: VSCode dark theme
- Palette: Developer's Night (custom)

### Assets
- Background Section01: Unsplash (laptop/desk)
- Fonts: Google Fonts (Space Grotesk + DM Sans)
- Modelli 3D: Non più utilizzati (erano da Sketchfab)

### Documentazione
- Next.js: https://nextjs.org/docs
- GSAP ScrollTrigger: https://greensock.com/scrolltrigger/
- Lenis: https://github.com/studio-freight/lenis

---

## 💡 Note Importanti

1. **Typing Animation**: Non usare AnimatedText.jsx, è deprecato. Usare la logica integrata in CodeEditor.jsx
2. **3D Components**: HeroShape.jsx, Scene3D.jsx, FloatingShape.jsx esistono ma non sono usati
3. **Mobile Detection**: Usare sempre `isMobile()` da `src/utils/detectDevice.js`
4. **CSS Variables**: Tutte definite in `globals.css`, mai hardcodare colori
5. **GSAP ScrollTrigger**: Sempre usare `gsap.context()` per cleanup automatico

---

## 🐛 Debug Tips

### Se typing animation non funziona:
1. Verificare che `showTyping={true}`
2. Controllare `isVisible` state nella Section
3. Verificare che il linguaggio sia registrato in CodeEditor
4. Controllare console per errori di syntax highlighter

### Se scroll non è smooth:
1. Verificare che SmoothScroll wrapper sia in layout.js
2. Controllare che Lenis sia inizializzato
3. Verificare conflitti con CSS `scroll-behavior`

### Se animazioni non triggherano:
1. Controllare che gsap e ScrollTrigger siano importati
2. Verificare `start` e `end` di ScrollTrigger
3. Usare `markers: true` per debugging

---

**Fine del contesto progetto**
**Versione**: 1.0
**Ultima modifica**: 22 Ottobre 2025
