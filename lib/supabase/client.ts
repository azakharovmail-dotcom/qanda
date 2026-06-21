import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'
import type { Database } from '@/lib/database.types'

/**
 * Supabase client for Client Components (participant & presenter realtime).
 * Uses the public anon key → RLS runs as `anon`, so only moderated-visible
 * questions of non-draft events are ever returned or streamed.
 */
export function createClient() {
  return createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}
