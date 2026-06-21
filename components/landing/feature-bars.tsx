'use client'

import { useInView } from '@/components/use-in-view'

/**
 * The three width-filling bars in the «Живые результаты» feature card. Each
 * track is sochi-35; the fill is sochi-text, animating 0 → target% on first
 * view (staggered), matching the prototype's `transition: width 1.1s`.
 */
const BARS = [72, 54, 38]

export function FeatureBars() {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="mt-auto flex flex-col gap-2.5">
      {BARS.map((w, i) => (
        <div key={i} className="h-3 overflow-hidden rounded-pill bg-sochi-35" aria-hidden>
          <div
            className="h-full rounded-pill"
            style={{
              width: inView ? `${w}%` : '0%',
              background: 'var(--sochi-text)',
              transition: `width 1.1s var(--ease-standard) ${i * 0.12}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
