'use client'

import dynamic from 'next/dynamic'

const DeskCanvas = dynamic(() => import('./DeskCanvas'), {
  ssr: false,
})

export default function DeskCanvasLoader() {
  return <DeskCanvas />
}
