import { create } from 'zustand'
import { cameraKeyframes } from '@/data/cameraPath'
import { chapters } from '@/data/chapters'

function getChapterFromProgress(p) {
  let chapter = 0
  for (let i = 0; i < cameraKeyframes.length; i++) {
    if (p >= cameraKeyframes[i].scrollRange[0]) {
      chapter = i
    }
  }
  return chapter
}

function getMaterialityFromProgress(p) {
  if (cameraKeyframes.length === 0 || chapters.length === 0) return 0

  let currentIdx = 0
  for (let i = 0; i < cameraKeyframes.length; i++) {
    if (p >= cameraKeyframes[i].scrollRange[0]) {
      currentIdx = i
    }
  }

  const nextIdx = Math.min(currentIdx + 1, chapters.length - 1)
  const currentMateriality = chapters[currentIdx]?.materiality ?? 0
  const nextMateriality = chapters[nextIdx]?.materiality ?? currentMateriality

  const range = cameraKeyframes[currentIdx]?.scrollRange ?? [0, 1]
  const rangeStart = range[0]
  const rangeEnd = range[1]
  const rawT = rangeEnd > rangeStart ? (p - rangeStart) / (rangeEnd - rangeStart) : 0
  const t = Math.max(0, Math.min(1, rawT))
  const easedT = t * t * (3 - 2 * t)

  return currentMateriality + (nextMateriality - currentMateriality) * easedT
}

const useScrollStore = create((set) => ({
  scrollProgress: 0,
  currentChapter: 0,
  materiality: 0,

  setScrollProgress: (p) => set({
    scrollProgress: p,
    currentChapter: getChapterFromProgress(p),
    materiality: getMaterialityFromProgress(p),
  }),

  // Interaction modal state
  modalContent: null,
  openModal: (content) => set({ modalContent: content }),
  closeModal: () => set({ modalContent: null }),
}))

export default useScrollStore
