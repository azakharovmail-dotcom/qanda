import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Host secrets for anonymous (no-registration) events.
 *
 * When a visitor launches an event without signing up, we mint a high-entropy
 * host secret. Only its sha256 hash is stored (events.host_secret_hash); the raw
 * secret is returned once and lives in the private host link the creator keeps.
 * Moderation / presenter routes re-hash the presented secret and compare in
 * constant time — the same trust model as the signed anon token for
 * question/vote writes. See supabase/migrations/0004_anon_host.sql.
 */

/** Mint a new URL-safe host secret (32 bytes → 43-char base64url). */
export function generateHostSecret(): string {
  return randomBytes(32).toString('base64url')
}

/** The hash stored in events.host_secret_hash. */
export function hashHostSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/** Constant-time check of a presented secret against a stored hash. */
export function verifyHostSecret(secret: string, storedHash: string | null): boolean {
  if (!storedHash) return false
  const a = Buffer.from(hashHostSecret(secret), 'hex')
  const b = Buffer.from(storedHash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

/** The private host link the creator keeps (moderation + presenter control). */
export function hostPath(eventId: string, secret: string): string {
  return `/host/${eventId}?k=${encodeURIComponent(secret)}`
}
