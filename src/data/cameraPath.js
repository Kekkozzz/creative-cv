// 11 chapters (0-10) — each gets ~9% of scroll range
export const cameraKeyframes = [
  {
    chapter: 0,
    scrollRange: [0.0, 0.09],
    position: [0, 1.8, 4.5],
    target: [0, 0.7, 0],
    fov: 50,
  },
  {
    chapter: 1,
    scrollRange: [0.09, 0.18],
    position: [-1.5, 1.5, 3.5],
    target: [0, 0.8, -0.2],
    fov: 48,
  },
  {
    chapter: 2,
    scrollRange: [0.18, 0.27],
    position: [0.5, 2.2, 4],
    target: [0, 0.7, 0],
    fov: 52,
  },
  {
    chapter: 3,
    scrollRange: [0.27, 0.36],
    position: [1, 1.6, 3.8],
    target: [-0.2, 0.7, -0.3],
    fov: 50,
  },
  {
    chapter: 4,
    scrollRange: [0.36, 0.45],
    position: [-0.8, 1.7, 3.2],
    target: [0.2, 0.8, -0.2],
    fov: 46,
  },
  {
    chapter: 5,
    scrollRange: [0.45, 0.54],
    position: [0.3, 2, 4.2],
    target: [0, 0.7, 0],
    fov: 52,
  },
  {
    chapter: 6,
    scrollRange: [0.54, 0.63],
    position: [0, 1.9, 3.5],
    target: [0, 1.0, -0.2],
    fov: 48,
  },
  {
    chapter: 7,
    scrollRange: [0.63, 0.72],
    position: [0.6, 2.0, 3.25],
    target: [0.05, 0.95, -0.1],
    fov: 46,
  },
  {
    chapter: 8,
    scrollRange: [0.72, 0.81],
    position: [-0.5, 1.8, 3.4],
    target: [0.1, 0.85, -0.2],
    fov: 47,
  },
  {
    chapter: 9,
    scrollRange: [0.81, 0.90],
    position: [0.3, 1.9, 3.0],
    target: [0, 1.0, 0],
    fov: 45,
  },
  {
    chapter: 10,
    scrollRange: [0.90, 1.0],
    position: [0, 2.5, 5.5],
    target: [0, 0.8, 0],
    fov: 55,
  },
]

/**
 * Given a scrollProgress (0–1), find the current keyframe and the next one,
 * then interpolate between them during the TRANSITION ZONE at the end of
 * the current keyframe's scroll range.
 *
 * Within a chapter's range, the camera holds the chapter's position.
 * The transition to the next chapter happens in the last 20% of the range.
 */
export function interpolateCamera(scrollProgress) {
  const keyframes = cameraKeyframes

  // Find which keyframe we're in
  let currentIdx = 0
  for (let i = 0; i < keyframes.length; i++) {
    if (scrollProgress >= keyframes[i].scrollRange[0]) {
      currentIdx = i
    }
  }

  const current = keyframes[currentIdx]
  const next = keyframes[Math.min(currentIdx + 1, keyframes.length - 1)]

  // Calculate transition: only interpolate toward next in last 20% of range
  const rangeEnd = current.scrollRange[1]
  const transitionStart = rangeEnd - (rangeEnd - current.scrollRange[0]) * 0.2

  let t = 0
  if (scrollProgress > transitionStart && currentIdx < keyframes.length - 1) {
    const rawT = (scrollProgress - transitionStart) / (rangeEnd - transitionStart)
    t = Math.max(0, Math.min(1, rawT))
    // Smooth ease in-out
    t = t * t * (3 - 2 * t)
  }

  return {
    position: current.position.map((v, i) => v + (next.position[i] - v) * t),
    target: current.target.map((v, i) => v + (next.target[i] - v) * t),
    fov: current.fov + (next.fov - current.fov) * t,
  }
}
