'use client'

import { useEffect, useRef } from 'react'

/**
 * Custom cursor: a dot that tracks the mouse instantly and a ring that lags
 * behind (lerp ~0.18/frame). On hovering anything interactive (a, button,
 * [data-hover]) the ring grows and tints yellow. Only active on fine pointers;
 * on touch the elements stay hidden and the native cursor is preserved. The
 * native cursor is hidden (via `.cursor-active` on the root) only after ours
 * is live, so a JS failure never leaves the page cursor-less.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    const fine = window.matchMedia?.('(pointer: fine)').matches
    if (!fine) return

    const root = document.querySelector('.landing') as HTMLElement | null
    root?.classList.add('cursor-active')

    let rx = -100
    let ry = -100
    let x = -100
    let y = -100
    let raf = 0

    const move = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && t.closest('[data-hover], a, button')
    const over = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.add('is-hovering')
    }
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.remove('is-hovering')
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseout', out)
    loop()

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mouseout', out)
      cancelAnimationFrame(raf)
      root?.classList.remove('cursor-active')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
