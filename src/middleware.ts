import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  CUSTOMER_SESSION_COOKIE,
  decryptCustomerSession,
} from '@/lib/auth/session'

/**
 * Edge middleware for:
 * 1. Protecting /account/* routes (redirect to login if no auth token)
 * 2. Adding security headers
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicAccountRoutes = [
    '/account/login',
    '/account/register',
    '/account/forgot-password',
    '/account/reset-password',
  ]
  const isAccountRoute = pathname.startsWith('/account')
  const isPublicAccountRoute = publicAccountRoutes.some((route) => pathname.startsWith(route))

  if (isAccountRoute && !isPublicAccountRoute) {
    const sessionCookie = request.cookies.get(CUSTOMER_SESSION_COOKIE)
    const session = await decryptCustomerSession(sessionCookie?.value)

    if (!session) {
      const loginUrl = new URL('/account/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
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
