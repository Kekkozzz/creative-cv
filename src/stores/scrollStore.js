import { create } from 'zustand'

const useScrollStore = create((set) => ({
  scrollProgress: 0,
  currentChapter: 0,
  materiality: 0,

  setScrollProgress: (p) => set({
    scrollProgress: p,
    currentChapter: Math.min(10, Math.floor(p * 11)),
    materiality: Math.min(1, p * 1.1),
  }),

  // Interaction modal state
  modalContent: null,
  openModal: (content) => set({ modalContent: content }),
  closeModal: () => set({ modalContent: null }),
}))

export default useScrollStore
