import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import type { Database } from '@/lib/database.types'

/**
 * Service-role client — BYPASSES RLS. Server-only (the `server-only` import
 * makes the build fail if this is ever imported into a client bundle).
 *
 * Used exclusively by trusted route handlers for anonymous participant writes,
 * AFTER the server has validated the signed anon token, event status, payload
 * and rate limit. Never expose the service-role key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
