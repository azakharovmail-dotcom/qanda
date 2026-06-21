'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/components/use-in-view'

/**
 * Animates a number 0 → `to` over `duration` ms (easeOutCubic) the first time
 * the card scrolls into view. RU decimal separator = comma. `prefix`/`suffix`
 * frame the value (e.g. «2,4» + « млн», «32» + « сек», «10» + «+»).
 */
export function CountUp({
  to,
  decimals = 0,
  duration = 1400,
  prefix = '',
  suffix = '',
  label,
}: {
  to: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  label: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(to * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [inView, to, duration])

  const formatted = value.toFixed(decimals).replace('.', ',')

  return (
    <div ref={ref} className="rounded-card bg-white p-7 shadow-soft-sm sm:p-9">
      <div className="text-[clamp(40px,5vw,68px)] font-medium leading-none tracking-[-0.03em] text-ink-800">
        <span className="tabular-nums">
          {prefix}
          {formatted}
        </span>
        {suffix}
      </div>
      <div className="mt-2 text-[15px] text-ink-500">{label}</div>
    </div>
  )
}
