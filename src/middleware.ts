import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge middleware for:
 * 1. Protecting /account/* routes (redirect to login if no auth token)
 * 2. Adding security headers
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect account routes (except login, register, reset)
  const publicAccountRoutes = ['/account/login', '/account/register', '/account/reset']
  const isAccountRoute = pathname.startsWith('/account')
  const isPublicAccountRoute = publicAccountRoutes.some((route) => pathname.startsWith(route))

  if (isAccountRoute && !isPublicAccountRoute) {
    // Check for auth token in cookies (set by authStore on login)
    const authCookie = request.cookies.get('mizoke-auth')

    if (!authCookie?.value) {
      const loginUrl = new URL('/account/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match account routes
    '/account/:path*',
  ],
}
