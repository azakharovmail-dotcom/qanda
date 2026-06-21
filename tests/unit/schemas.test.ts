import { describe, expect, it } from 'vitest'
import {
  brandingSchema,
  createEventSchema,
  signInSchema,
  submitQuestionSchema,
} from '@/lib/schemas'

describe('submitQuestionSchema', () => {
  it('rejects an empty body', () => {
    expect(submitQuestionSchema.safeParse({ body: '' }).success).toBe(false)
    // Whitespace-only is trimmed away → also empty.
    expect(submitQuestionSchema.safeParse({ body: '   ' }).success).toBe(false)
  })

  it('rejects a body longer than 280 chars', () => {
    expect(submitQuestionSchema.safeParse({ body: 'x'.repeat(281) }).success).toBe(false)
  })

  it('accepts a valid question (280 chars is the boundary)', () => {
    expect(submitQuestionSchema.safeParse({ body: 'Как дела?' }).success).toBe(true)
    expect(submitQuestionSchema.safeParse({ body: 'x'.repeat(280) }).success).toBe(true)
  })

  it('accepts an optional author name and normalizes empty → undefined', () => {
    const parsed = submitQuestionSchema.parse({ body: 'Вопрос', authorName: '' })
    expect(parsed.authorName).toBeUndefined()
    expect(submitQuestionSchema.parse({ body: 'Вопрос', authorName: 'Иван' }).authorName).toBe(
      'Иван',
    )
  })

  it('rejects a non-empty honeypot (website)', () => {
    expect(submitQuestionSchema.safeParse({ body: 'Вопрос', website: 'spam' }).success).toBe(false)
  })
})

describe('brandingSchema', () => {
  it('rejects a malformed hex color', () => {
    expect(brandingSchema.safeParse({ primaryColor: 'blue' }).success).toBe(false)
    expect(brandingSchema.safeParse({ primaryColor: '#GGG' }).success).toBe(false)
    expect(brandingSchema.safeParse({ primaryColor: '#FFF' }).success).toBe(false) // 3-digit not allowed
  })

  it('accepts a 6-digit hex color', () => {
    const parsed = brandingSchema.parse({ primaryColor: '#2563EB' })
    expect(parsed.primaryColor).toBe('#2563EB')
  })

  it('treats an empty color as undefined (no override)', () => {
    expect(brandingSchema.parse({ primaryColor: '' }).primaryColor).toBeUndefined()
  })
})

describe('signInSchema', () => {
  it('rejects a malformed email', () => {
    expect(signInSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
    expect(signInSchema.safeParse({ email: '' }).success).toBe(false)
  })

  it('accepts a valid email', () => {
    expect(signInSchema.safeParse({ email: 'host@example.com' }).success).toBe(true)
  })
})

describe('createEventSchema', () => {
  it('rejects a 1-char title', () => {
    expect(createEventSchema.safeParse({ title: 'A' }).success).toBe(false)
  })

  it('rejects a title longer than 80 chars', () => {
    expect(createEventSchema.safeParse({ title: 'x'.repeat(81) }).success).toBe(false)
  })

  it('accepts a valid title and defaults moderation to "pre"', () => {
    const parsed = createEventSchema.parse({ title: 'Моё мероприятие' })
    expect(parsed.moderation).toBe('pre')
  })
})
