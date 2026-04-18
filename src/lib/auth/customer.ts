import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER } from '@/lib/shopify/customerQueries'
import type { ShopifyCustomer } from '@/types/customer'
import type { CustomerSession } from '@/lib/auth/session'
import { clearCustomerSessionCookie, getCustomerSessionFromRequest } from '@/lib/auth/session'

export async function getCustomerFromAccessToken(
  accessToken: string
): Promise<ShopifyCustomer | null> {
  const response = await shopifyClient.request<{
    customer: ShopifyCustomer | null
  }>(GET_CUSTOMER, {
    customerAccessToken: accessToken,
  })

  return response.customer
}

export async function getAuthenticatedCustomer(
  request: Request
): Promise<{
  customer: ShopifyCustomer | null
  session: CustomerSession | null
  response?: NextResponse
}> {
  const session = await getCustomerSessionFromRequest(request)
  if (!session) {
    return { customer: null, session: null }
  }

  if (session.mode === 'mock') {
    return { customer: session.customer, session }
  }

  try {
    const customer = await getCustomerFromAccessToken(session.accessToken)
    if (!customer) {
      const response = clearCustomerSessionCookie(
        NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 })
      )
      return { customer: null, session: null, response }
    }

    return { customer, session }
  } catch (error) {
    console.error('Failed to fetch authenticated customer:', error)
    const response = clearCustomerSessionCookie(
      NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 })
    )
    return { customer: null, session: null, response }
  }
}

export function getCustomerAccessToken(session: CustomerSession | null): string | null {
  if (!session || session.mode !== 'shopify') {
    return null
  }

  return session.accessToken
}
