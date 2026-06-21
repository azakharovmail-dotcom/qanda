import { describe, expect, it } from 'vitest'
import { generateCode, normalizeCode, slugify, uniqueSlug } from '@/lib/codes'

// The alphabet deliberately omits visually ambiguous glyphs so codes are easy
// to read aloud / type on a phone. Keep this in sync with lib/codes.ts.
const ALLOWED = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]+$/
const FORBIDDEN = ['0', '1', 'O', 'I', 'L']

describe('generateCode', () => {
  it('defaults to 6 characters', () => {
    expect(generateCode()).toHaveLength(6)
  })

  it('honours a custom length', () => {
    expect(generateCode(4)).toHaveLength(4)
    expect(generateCode(10)).toHaveLength(10)
  })

  it('only uses the unambiguous alphabet', () => {
    // Sample many codes so a stray forbidden char would almost surely show up.
    for (let i = 0; i < 500; i++) {
      const code = generateCode(8)
      expect(code).toMatch(ALLOWED)
      for (const bad of FORBIDDEN) expect(code).not.toContain(bad)
    }
  })

  it('is non-deterministic across calls', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(generateCode(6))
    // With ~10^9 combos, 200 draws colliding into <190 uniques is implausible.
    expect(seen.size).toBeGreaterThan(190)
  })
})

describe('normalizeCode', () => {
  it('uppercases', () => {
    expect(normalizeCode('abc123')).toBe('ABC123')
  })

  it('strips spaces and dashes', () => {
    expect(normalizeCode('ab c-1 23')).toBe('ABC123')
    expect(normalizeCode('  a-b-c  ')).toBe('ABC')
  })

  it('drops any other punctuation', () => {
    expect(normalizeCode('a.b_c!')).toBe('ABC')
  })
})

describe('slugify', () => {
  it('transliterates and hyphenates cyrillic', () => {
    const slug = slugify('Привет Мир')
    expect(slug).toBe('privet-mir')
    // Result is latin-ish, lowercased, hyphen-separated.
    expect(slug).toMatch(/^[a-z0-9-]+$/)
  })

  it('lowercases latin and collapses separators', () => {
    expect(slugify('Hello   World!!!')).toBe('hello-world')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  !!! Тест !!!  ')).toBe('test')
  })

  it('falls back to "event" when nothing survives', () => {
    expect(slugify('!!!')).toBe('event')
    expect(slugify('')).toBe('event')
  })
})

describe('uniqueSlug', () => {
  it('appends a lowercase random suffix', () => {
    const slug = uniqueSlug('Привет Мир')
    expect(slug).toMatch(/^privet-mir-[a-z0-9]{4}$/)
  })

  it('produces distinct slugs for the same title', () => {
    expect(uniqueSlug('Test')).not.toBe(uniqueSlug('Test'))
  })
})
