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

  useFrame(() => {
    const { currentChapter, materiality } = useScrollStore.getState()
    const chapter = chapters[currentChapter] || chapters[0]

    // Bloom: stronger in wireframe chapters (controlled via ref only)
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
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.001, 0.001)}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
