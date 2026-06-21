import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

/**
 * Next.js 16 Proxy (formerly `middleware`). Runs before every matched request.
 *
 *  1. Refreshes the Supabase auth session cookie (keeps organizers logged in).
 *  2. Gates /dashboard/** — unauthenticated users are bounced to /signin.
 *
 * NOTE: per Next 16 guidance, proxy must NOT be the only auth gate — the
 * dashboard layout re-checks `auth.getUser()` server-side (defense in depth).
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

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except static assets & image files.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
