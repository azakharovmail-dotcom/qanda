import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

/**
 * Next.js 16 Proxy (formerly `middleware`). Runs before every matched request.
 *
 * Refreshes the Supabase auth session cookie (keeps an optionally-signed-in
 * organizer logged in). It no longer gates /dashboard: in the no-registration
 * model the admin panel is reachable without an account, and the few pages that
 * still need a user re-check `auth.getUser()` server-side themselves.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  // If Supabase isn't configured, don't block the request — just pass through.
  // Prevents a hard 500 on every route if env vars are missing/misapplied.
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return response

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: do not run code between createServerClient and getUser().
  // Never let a Supabase/network hiccup 500 the page — treat as logged-out.
  let user = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    user = null
  }

  // Session is refreshed above; no route is gated here anymore.
  void user

  return response
}

export const config = {
  matcher: [
    // Run on everything except static assets & image files.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
