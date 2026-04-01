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
      {/* Render chapter intros from data with scroll space between */}
      {chapters.map((ch) => (
        <div key={ch.id}>
          <ChapterIntro
            number={ch.narrativeContent.number}
            title={ch.narrativeContent.heading}
            subtitle={ch.narrativeContent.text}
          />
          {/* Scroll space for chapter content + transition */}
          <div style={{ height: '300vh' }} />
        </div>
      ))}

      {/* End spacer */}
      <div style={{ height: '200vh' }} />
    </div>
  )
}
