'use client'

import type { ComponentProps, ElementType } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/components/use-in-view'

/**
 * Scroll-reveal wrapper: starts hidden (.reveal), gains .in-view when scrolled
 * into the viewport. `delay` staggers groups of siblings (in ms).
 */
export function Reveal({
  as,
  className,
  delay,
  style,
  children,
  ...props
}: { as?: ElementType; delay?: number } & ComponentProps<'div'>) {
  const Tag = (as ?? 'div') as ElementType
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <Tag
      ref={ref}
      className={cn('reveal', inView && 'in-view', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...props}
    >
      {children}
    </Tag>
  )
}
