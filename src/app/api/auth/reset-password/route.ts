import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { CUSTOMER_RESET_BY_URL } from '@/lib/shopify/customerMutations'
import type { CustomerUserError, ShopifyCustomerAccessToken } from '@/types/customer'

export const dynamic = 'force-dynamic'

interface ResetPasswordResponse {
  customerResetByUrl: {
    customerAccessToken: ShopifyCustomerAccessToken | null
    customerUserErrors: CustomerUserError[]
  }
}

function isValidResetUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    const expectedHost = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    if (!expectedHost) return false
    // Pin to the exact storefront host only. Suffix matches on *.myshopify.com
    // let any attacker-registered store pass.
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === expectedHost &&
      parsed.pathname.startsWith('/account/reset/')
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth-reset:${ip}`, { maxRequests: 5, windowSeconds: 300 })
  if (rl.limited) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 300) } }
    )
  }

  try {
    const body = (await request.json()) as {
      password?: string
      resetUrl?: string
    }

    const password = body.password ?? ''
    const resetUrl = body.resetUrl ?? ''

    if (!password || !resetUrl || !isValidResetUrl(resetUrl)) {
      return NextResponse.json(
        { success: false, error: 'A valid reset link and password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8 || password.length > 256) {
      return NextResponse.json(
        { success: false, error: 'Password must be between 8 and 256 characters.' },
        { status: 400 }
      )
    }

    const response = await shopifyClient.request<ResetPasswordResponse>(
      CUSTOMER_RESET_BY_URL,
      {
        password,
        resetUrl,
      }
    )

    const { customerAccessToken, customerUserErrors } = response.customerResetByUrl
    if (customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: customerUserErrors[0]?.message ?? 'Failed to reset the password.',
          errors: customerUserErrors,
        },
        { status: 400 }
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
    console.error('Customer password reset failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset the password.' },
      { status: 500 }
    )
  }
}
