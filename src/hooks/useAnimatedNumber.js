import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 (or previous value) to target
 * Returns the current animated value
 */
export function useAnimatedNumber(target, duration = 800) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = prevRef.current
    const end = target
    const startTime = performance.now()

    // Easing: ease-out cubic
    const ease = (t) => 1 - Math.pow(1 - t, 3)

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const value = Math.round(start + (end - start) * ease(progress))
      setDisplay(value)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = end
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}
