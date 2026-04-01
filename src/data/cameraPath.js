// 7 chapters — each gets ~14% of scroll range
export const cameraKeyframes = [
  {
    chapter: 0,
    scrollRange: [0.0, 0.14],
    position: [0, 1.8, 4.5],
    target: [0, 0.7, 0],
    fov: 50,
  },
  {
    chapter: 1,
    scrollRange: [0.14, 0.28],
    position: [-1.5, 1.5, 3.5],
    target: [0, 0.8, -0.2],
    fov: 48,
  },
  {
    chapter: 2,
    scrollRange: [0.28, 0.42],
    position: [0.5, 2.2, 4],
    target: [0, 0.7, 0],
    fov: 52,
  },
  {
    chapter: 3,
    scrollRange: [0.42, 0.56],
    position: [1, 1.6, 3.8],
    target: [-0.2, 0.7, -0.3],
    fov: 50,
  },
  {
    chapter: 4,
    scrollRange: [0.56, 0.70],
    position: [-0.8, 1.7, 3.2],
    target: [0.2, 0.8, -0.2],
    fov: 46,
  },
  {
    chapter: 5,
    scrollRange: [0.70, 0.84],
    position: [0.3, 2, 4.2],
    target: [0, 0.7, 0],
    fov: 52,
  },
  {
    chapter: 6,
    scrollRange: [0.84, 0.96],
    position: [0, 1.9, 3.5],
    target: [0, 1.0, -0.2],
    fov: 48,
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
