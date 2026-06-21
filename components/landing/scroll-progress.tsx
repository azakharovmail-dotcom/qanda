'use client'

import { useEffect, useRef } from 'react'

/**
 * Fixed 4px yellow bar at the very top whose width tracks scroll progress
 * (scrollY / (scrollHeight − innerHeight)). Updated imperatively via ref so
 * scrolling never triggers a React re-render.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = ref.current
    if (!bar) return
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0
      bar.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden />
}
