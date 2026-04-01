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
      <div style={{ height: '400vh' }} />
    </div>
  )
}
