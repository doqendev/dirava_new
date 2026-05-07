import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { readJsonBody } from '@/lib/utils/readJsonBody'
import { CUSTOMER_RECOVER } from '@/lib/shopify/customerMutations'
import type { CustomerUserError } from '@/types/customer'

export const dynamic = 'force-dynamic'

interface RecoverResponse {
  customerRecover: {
    customerUserErrors: CustomerUserError[]
  }
}

export async function POST(request: Request) {
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth-recover:${ip}`, { maxRequests: 3, windowSeconds: 300 })
  if (rl.limited) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 300) } }
    )
  }

  const body = await readJsonBody<{
    email?: string
  }>(request)
  if (!body) {
    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const email = body.email?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      )
    }

    const response = await shopifyClient.request<RecoverResponse>(CUSTOMER_RECOVER, {
      email,
    })

    // Never expose whether the email exists. Log errors server-side, respond
    // success either way to prevent user enumeration.
    const errors = response.customerRecover.customerUserErrors
    if (errors.length > 0) {
      console.warn('customerRecover returned errors:', errors)
    }

    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Customer password recovery failed:', error)
    // Even on infrastructure error, do not distinguish — return success
    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
