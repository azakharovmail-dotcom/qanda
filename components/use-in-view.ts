'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tiny IntersectionObserver hook. Returns a ref to attach to an element and a
 * boolean that flips to true the first time the element scrolls into view (and
 * stays true). Used for scroll-reveal toggling and count-up triggers.
 *
 * Robust fallback: if IO never fires (some embed environments), the element is
 * still revealed on mount via an immediate bounding-box check, so above-the-fold
 * content never stays hidden.
 */
export function useInView<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number
  rootMargin?: string
  once?: boolean
}): { ref: React.RefObject<T | null>; inView: boolean } {
  const { threshold = 0.18, rootMargin = '0px 0px -8% 0px', once = true } = options ?? {}
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Tell the inline fail-safe (app/layout.tsx) that client reveal logic is
    // alive, so its timeout doesn't force-reveal everything and steal the
    // scroll animation. If hydration never runs (a proxy strips/breaks the JS,
    // etc.), this stays unset and the fail-safe shows all content anyway.
    ;(window as Window & { __qReveal?: boolean }).__qReveal = true

    // Honor reduced motion / no-IO: reveal on the next microtask (not
    // synchronously in the effect body — keeps renders from cascading).
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setInView(true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)

    // Fallback: reveal above-the-fold blocks that may already be on screen
    // before IO delivers its first batch (next frame, off the effect body).
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        setInView(true)
        if (once) observer.disconnect()
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
