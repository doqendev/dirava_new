import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { readJsonBody } from '@/lib/utils/readJsonBody'
import { CUSTOMER_ACCESS_TOKEN_CREATE } from '@/lib/shopify/customerMutations'
import type { CustomerUserError, ShopifyCustomerAccessToken } from '@/types/customer'

export const dynamic = 'force-dynamic'

interface LoginResponse {
  customerAccessTokenCreate: {
    customerAccessToken: ShopifyCustomerAccessToken | null
    customerUserErrors: CustomerUserError[]
  }
}

export async function POST(request: Request) {
  // CSRF: require same-origin for state-changing requests
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  // Rate limit: 5 login attempts per minute per IP
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth-login:${ip}`, { maxRequests: 5, windowSeconds: 60 })
  if (rl.limited) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    )
  }

  const body = await readJsonBody<{
    email?: string
    password?: string
  }>(request)
  if (!body) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  try {
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password || password.length > 1024) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const response = await shopifyClient.request<LoginResponse>(
      CUSTOMER_ACCESS_TOKEN_CREATE,
      {
        input: {
          email,
          password,
        },
      }
    )

    const { customerAccessToken, customerUserErrors } = response.customerAccessTokenCreate
    if (customerUserErrors.length > 0) {
      // Generic error — do not leak whether email exists or password is wrong
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    if (!customerAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Failed to create a customer session.' },
        { status: 500 }
      )
    }

    const customer = await getCustomerFromAccessToken(customerAccessToken.accessToken)
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Failed to load the customer profile.' },
        { status: 500 }
      )
    }

    const sessionResponse = NextResponse.json(
      { success: true, customer },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return setCustomerSessionCookie(sessionResponse, {
      version: 1,
      mode: 'shopify',
      accessToken: customerAccessToken.accessToken,
      expiresAt: customerAccessToken.expiresAt,
    })
  } catch (error) {
    console.error('Customer login failed:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
