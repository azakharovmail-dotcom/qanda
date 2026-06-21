import { describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import { mintAnonToken, verifyAnonToken } from '@/lib/anon'

// lib/env.ts falls back to a fixed dev secret when ANON_SECRET is unset and
// NODE_ENV !== 'production', so these tests are deterministic in CI without
// any env wiring. We recompute that secret here to forge a *valid* signature
// over a different id (proving the format itself isn't trusted).
const DEV_SECRET = 'dev-only-insecure-anon-secret-change-me'
const sign = (value: string) => createHmac('sha256', DEV_SECRET).update(value).digest('base64url')

describe('mintAnonToken → verifyAnonToken', () => {
  it('roundtrips the anonId', () => {
    const { anonId, token } = mintAnonToken()
    expect(verifyAnonToken(token)).toBe(anonId)
  })

  it('mints a unique id each time', () => {
    expect(mintAnonToken().anonId).not.toBe(mintAnonToken().anonId)
  })
})

describe('verifyAnonToken rejects bad input', () => {
  it('returns null for a tampered signature', () => {
    const { token } = mintAnonToken()
    // Flip the last char of the signature.
    const last = token.slice(-1)
    const tampered = token.slice(0, -1) + (last === 'A' ? 'B' : 'A')
    expect(verifyAnonToken(tampered)).toBeNull()
  })

  it('returns null when the anonId is swapped under a stale signature', () => {
    const { anonId, token } = mintAnonToken()
    const sig = token.slice(token.lastIndexOf('.') + 1)
    // Different id, but reusing the old (now-wrong) signature.
    const forged = `${anonId}x.${sig}`
    expect(verifyAnonToken(forged)).toBeNull()
  })

  it('returns null for a forged token signed with the wrong key', () => {
    const id = 'attacker-controlled-id'
    const badSig = createHmac('sha256', 'totally-wrong-secret').update(id).digest('base64url')
    expect(verifyAnonToken(`${id}.${badSig}`)).toBeNull()
  })

  it('accepts a correctly forged signature over a chosen id (signature is the trust root)', () => {
    // Sanity-check the threat model: knowing the secret lets you sign any id.
    // This is exactly why ANON_SECRET must stay server-only.
    const id = 'chosen-id'
    expect(verifyAnonToken(`${id}.${sign(id)}`)).toBe(id)
  })

  it('returns null for empty / missing / malformed tokens', () => {
    expect(verifyAnonToken('')).toBeNull()
    expect(verifyAnonToken(undefined)).toBeNull()
    expect(verifyAnonToken(null)).toBeNull()
    expect(verifyAnonToken('no-dot-here')).toBeNull()
    expect(verifyAnonToken('.sig-only')).toBeNull()
  })
})
