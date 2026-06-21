/**
 * Centralized environment access.
 *
 * Values are read lazily and tolerate absence at build time so `next build`
 * succeeds without secrets (data-dependent routes are `force-dynamic` and only
 * touch Supabase at request time). At runtime in production, missing critical
 * vars surface as Supabase client errors on the affected request.
 */

const isProd = process.env.NODE_ENV === 'production'

export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  SITE_URL: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ANON_SECRET:
    process.env.ANON_SECRET ?? (isProd ? '' : 'dev-only-insecure-anon-secret-change-me'),
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
} as const

export function assertServerSecrets() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  if (!env.ANON_SECRET) throw new Error('Missing ANON_SECRET')
}
