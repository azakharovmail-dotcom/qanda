import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { env } from '@/lib/env'

/**
 * Anonymous participant identity — no account required.
 *
 * Token format: `<uuid>.<hmac-sha256(uuid)>` (base64url signature).
 * The signature is forge-proof given ANON_SECRET, so a client cannot mint an
 * identity for someone else. The token rides in a signed httpOnly cookie and is
 * used to deduplicate votes (DB unique(question_id, anon_id)) and attribute
 * questions, without ever identifying the human.
 */

export const ANON_COOKIE = 'qa_anon'

function sign(value: string): string {
  return createHmac('sha256', env.ANON_SECRET).update(value).digest('base64url')
}

export function mintAnonToken(): { anonId: string; token: string } {
  const anonId = randomUUID()
  return { anonId, token: `${anonId}.${sign(anonId)}` }
}

/** Returns the verified anonId, or null if the token is missing/forged. */
export function verifyAnonToken(token: string | undefined | null): string | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const anonId = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(anonId)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  try {
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  return anonId
}
