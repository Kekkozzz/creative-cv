export const cameraKeyframes = [
  {
    chapter: 0,
    scrollRange: [0.0, 0.09],
    position: [0, 2, 8],
    target: [0, 0.5, 0],
    fov: 60,
  },
  // Placeholder keyframes for future chapters
  {
    chapter: 1,
    scrollRange: [0.09, 0.18],
    position: [-2, 1.5, 5],
    target: [0, 0.5, 0],
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
