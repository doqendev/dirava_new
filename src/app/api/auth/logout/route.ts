import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import {
  clearCustomerSessionCookie,
  getCustomerSessionFromRequest,
} from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { CUSTOMER_ACCESS_TOKEN_DELETE } from '@/lib/shopify/customerMutations'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  const session = await getCustomerSessionFromRequest(request)

  if (session?.mode === 'shopify') {
    try {
      await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_DELETE, {
        customerAccessToken: session.accessToken,
      })
    } catch (error) {
      console.error('Failed to delete customer access token during logout:', error)
    }
  }

  return clearCustomerSessionCookie(
    NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  )
}
