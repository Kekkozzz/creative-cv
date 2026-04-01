import { create } from 'zustand'

const useScrollStore = create((set) => ({
  scrollProgress: 0,
  currentChapter: 0,
  materiality: 0,

  setScrollProgress: (p) => set({
    scrollProgress: p,
    currentChapter: Math.min(10, Math.floor(p * 11)),
    // NOTE: With only Ch.00 content, scroll range is short so materiality
    // will stay near 0 (wireframe). As more chapters are added and scroll
    // content grows, materiality will naturally spread across the full range.
    materiality: Math.min(1, p * 1.1),
  }),
}))

export default useScrollStore
