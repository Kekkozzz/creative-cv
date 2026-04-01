import { create } from 'zustand'
import { cameraKeyframes } from '@/data/cameraPath'

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
  // Materiality ramps from 0 to 1 across the full scroll
  // Reaches 1.0 at ~90% scroll (leaving room for Ch.10 to go "beyond solid")
  return Math.min(1, p * 1.2)
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
