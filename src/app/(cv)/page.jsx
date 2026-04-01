import Sidebar from '@/components/Sidebar'
import NarrativeOverlay from '@/components/NarrativeOverlay'
import ScrollProgressManager from '@/components/ScrollProgressManager'
import DeskCanvasLoader from '@/components/3d/DeskCanvasLoader'

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
      <DeskCanvasLoader />

      {/* ScrollTrigger → zustand bridge */}
      <ScrollProgressManager />

      {/* Narrative content scrolling over the 3D scene */}
      <main className="relative">
        <NarrativeOverlay />
      </main>
    </>
  )
}
