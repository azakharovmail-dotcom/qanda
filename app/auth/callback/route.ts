import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/seo'

/**
 * Magic-link landing. Exchanges the one-time `code` for a session (cookies are
 * written by the server client) and forwards to ?next= or the dashboard.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const nextParam = request.nextUrl.searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard'

  if (!code) {
    return Response.redirect(absoluteUrl('/signin?error=auth'))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return Response.redirect(absoluteUrl('/signin?error=auth'))
  }

  return Response.redirect(absoluteUrl(next))
}
