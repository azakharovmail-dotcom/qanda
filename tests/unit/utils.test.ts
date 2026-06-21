import { describe, expect, it } from 'vitest'
import { cn, timeAgo } from '@/lib/utils'

describe('cn', () => {
  it('joins truthy class names with a space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('returns an empty string when everything is falsy', () => {
    expect(cn(false, null, undefined, '')).toBe('')
  })
})

describe('timeAgo', () => {
  // Pin "now" so the relative buckets are deterministic.
  const now = Date.UTC(2026, 0, 1, 12, 0, 0)
  const ago = (ms: number) => new Date(now - ms).toISOString()

  const SEC = 1000
  const MIN = 60 * SEC
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR

  it('"только что" for under a minute', () => {
    expect(timeAgo(ago(0), now)).toBe('только что')
    expect(timeAgo(ago(59 * SEC), now)).toBe('только что')
  })

  it('minutes', () => {
    expect(timeAgo(ago(MIN), now)).toBe('1 мин назад')
    expect(timeAgo(ago(59 * MIN), now)).toBe('59 мин назад')
  })

  it('hours', () => {
    expect(timeAgo(ago(HOUR), now)).toBe('1 ч назад')
    expect(timeAgo(ago(23 * HOUR), now)).toBe('23 ч назад')
  })

  it('days', () => {
    expect(timeAgo(ago(DAY), now)).toBe('1 дн назад')
    expect(timeAgo(ago(5 * DAY), now)).toBe('5 дн назад')
  })

  it('clamps future timestamps to "только что"', () => {
    expect(timeAgo(ago(-10 * MIN), now)).toBe('только что')
  })
})
