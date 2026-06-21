'use client'

import { useEffect, useRef } from 'react'

/**
 * Decorative hero layer (z-0, non-interactive): faint pencil scribbles + a set
 * of floating geometric shapes with a subtle mouse parallax. The solid-yellow
 * «?» glyph and the speech-bubble live here. Idle float animations come from
 * .float-a / .float-b in globals.css (disabled under reduced motion); parallax
 * is layered on the wrapping element so the two transforms never collide.
 */
const SHAPES = [
  { depth: 0.06, className: 'top-[12%] left-[8%] h-[120px] w-[120px]', float: 'float-a' },
  { depth: 0.09, className: 'top-[22%] right-[9%] h-[132px] w-[132px]', float: 'float-b' },
  { depth: 0.14, className: 'bottom-[20%] left-[14%] h-[70px] w-[70px]', float: 'float-b' },
  { depth: 0.07, className: 'bottom-[16%] right-[18%] h-[56px] w-[56px]', float: 'float-a' },
  { depth: 0.11, className: 'top-[60%] right-[6%] h-[44px] w-[44px]', float: 'float-a' },
  { depth: 0.06, className: 'top-[12%] left-[44%] h-[34px] w-[34px]', float: 'float-b' },
]

export function HeroDecor() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia?.('(pointer: fine)').matches
    if (reduce || !fine) return

    const items = Array.from(layer.querySelectorAll<HTMLElement>('[data-depth]'))
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      tx = e.clientX - window.innerWidth / 2
      ty = e.clientY - window.innerHeight / 2
    }
    const loop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      for (const el of items) {
        const d = Number(el.dataset.depth) || 0
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`
      }
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="scribble" ref={layerRef}>
      {/* faint pencil scribbles, edge to edge */}
      <svg
        className="absolute inset-0 h-full w-full text-ink-700"
        style={{ opacity: 0.06 }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 150 C 80 60 160 60 200 150 C 232 220 150 252 150 180 C 150 120 260 120 320 170 C 400 236 470 70 560 150 C 650 230 720 60 820 150 C 900 226 870 252 900 180 C 932 120 1000 130 1060 165 C 1142 216 1182 90 1320 150"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 320 C 120 240 200 410 320 320 C 440 235 520 405 640 320 C 760 240 840 410 960 320 C 1080 240 1160 405 1320 320"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 500 C 100 430 180 565 300 500 C 430 440 520 560 650 495 C 722 460 690 545 742 522 C 802 497 790 468 760 470 C 980 425 1100 565 1320 500"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M120 600 C 260 540 320 660 460 610 C 600 560 660 670 820 620 C 980 570 1060 668 1240 612"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M40 60 C 180 20 260 130 420 80 C 560 38 640 140 800 90 C 940 48 1040 140 1240 80"
        />
      </svg>

      {/* floating shapes */}
      {SHAPES.map((s, i) => (
        <div key={i} data-depth={s.depth} className={`absolute ${s.className}`}>
          <div className={`flex h-full w-full items-center justify-center ${s.float}`}>
            {i === 0 ? (
              <span
                className="leading-none text-brand"
                style={{ fontSize: 116, fontWeight: 600, transform: 'rotate(-8deg)' }}
              >
                ?
              </span>
            ) : i === 1 ? (
              <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ overflow: 'visible' }}>
                <path
                  d="M 24 10 H 96 Q 114 10 114 28 V 62 Q 114 80 96 80 H 58 L 40 106 L 38 80 H 24 Q 6 80 6 62 V 28 Q 6 10 24 10 Z"
                  fill="var(--sochi-35)"
                />
                <circle cx="42" cy="45" r="5" fill="var(--sochi-text)" />
                <circle cx="60" cy="45" r="5" fill="var(--sochi-text)" />
                <circle cx="78" cy="45" r="5" fill="var(--sochi-text)" />
              </svg>
            ) : i === 2 ? (
              <div className="h-full w-full rounded-full bg-paris-30" />
            ) : i === 3 ? (
              <div className="h-full w-full rounded-full border-[3px] border-ink-800" />
            ) : i === 4 ? (
              <div className="h-full w-full rounded-full bg-manila-35" />
            ) : (
              <div className="h-full w-full rounded-lg bg-porto-30" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
