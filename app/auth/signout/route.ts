import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/seo'

/** Sign the organizer out and return to the landing page. */
export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return Response.redirect(absoluteUrl('/'), 303)
}
