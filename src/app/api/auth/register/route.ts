import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_CREATE,
} from '@/lib/shopify/customerMutations'
import type { CustomerUserError, ShopifyCustomerAccessToken } from '@/types/customer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const dynamic = 'force-dynamic'

interface RegisterResponse {
  customerCreate: {
    customer: { id: string; email: string } | null
    customerUserErrors: CustomerUserError[]
  }
}

interface LoginResponse {
  customerAccessTokenCreate: {
    customerAccessToken: ShopifyCustomerAccessToken | null
    customerUserErrors: CustomerUserError[]
  }
}

export async function POST(request: Request) {
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth-register:${ip}`, { maxRequests: 3, windowSeconds: 300 })
  if (rl.limited) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 300) } }
    )
  }

  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
    }

    const email = body.email?.trim().toLowerCase()
    const password = body.password ?? ''
    const firstName = body.firstName?.trim() ?? ''
    const lastName = body.lastName?.trim() ?? ''

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, email, and password are required.' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (password.length < 8 || password.length > 256) {
      return NextResponse.json(
        { success: false, error: 'Password must be between 8 and 256 characters.' },
        { status: 400 }
      )
    }

    const registerResponse = await shopifyClient.request<RegisterResponse>(CUSTOMER_CREATE, {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    })

    const { customer, customerUserErrors } = registerResponse.customerCreate
    if (customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: customerUserErrors[0]?.message ?? 'Failed to create account.',
          errors: customerUserErrors,
        },
        { status: 400 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Failed to create account.' },
        { status: 500 }
      )
    }

    const loginResponse = await shopifyClient.request<LoginResponse>(
      CUSTOMER_ACCESS_TOKEN_CREATE,
      {
        input: {
          email,
          password,
        },
      }
    )

    const { customerAccessToken, customerUserErrors: loginErrors } =
      loginResponse.customerAccessTokenCreate

    if (loginErrors.length > 0 || !customerAccessToken) {
      return NextResponse.json(
        { success: true, requiresActivation: true },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const customerProfile = await getCustomerFromAccessToken(customerAccessToken.accessToken)
    if (!customerProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to load the customer profile.' },
        { status: 500 }
      )
    }

    const sessionResponse = NextResponse.json(
      { success: true, customer: customerProfile },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return setCustomerSessionCookie(sessionResponse, {
      version: 1,
      mode: 'shopify',
      accessToken: customerAccessToken.accessToken,
      expiresAt: customerAccessToken.expiresAt,
    })
  } catch (error) {
    console.error('Customer registration failed:', error)
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
