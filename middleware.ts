import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // MUST be called before any redirect — refreshes the session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gradfolio.com'

  console.log('[middleware] pathname:', pathname)
  console.log('[middleware] user.email:', user?.email ?? 'unauthenticated')

  // Unauthenticated → login
  const protectedPaths = ['/tasks', '/dashboard', '/admin', '/onboarding', '/settings']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!user && isProtected) {
    console.log('[middleware] unauthenticated — redirecting to /login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin-only enforcement — server-side, not just UI
  if (pathname.startsWith('/admin')) {
    console.log(
      '[middleware] admin check — user.email:', user?.email,
      '| ADMIN_EMAIL:', adminEmail
    )

    if (!user || user.email !== adminEmail) {
      console.log('[middleware] non-admin blocked — redirecting to /dashboard')
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    console.log('[middleware] admin access granted')
  }

  // Logged-in users away from login page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/tasks'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
