import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { shopifyClient } from '@/lib/shopify/client'
import { CUSTOMER_DEFAULT_ADDRESS_UPDATE } from '@/lib/shopify/customerMutations'
import type { ShopifyCustomer } from '@/types/customer'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const csrfBlock = enforceSameOrigin(request)
  if (csrfBlock) return csrfBlock

  const { customer, response, session } = await getAuthenticatedCustomer(request)
  if (response) {
    return response
  }

  if (!customer || !session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { addressId?: string }
    const addressId = body.addressId

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address id is required.' },
        { status: 400 }
      )
    }

    if (session.mode === 'mock') {
      const nextDefault =
        customer.addresses.edges.find((edge) => edge.node.id === addressId)?.node ?? null

      const updatedCustomer: ShopifyCustomer = {
        ...customer,
        defaultAddress: nextDefault,
      }

      const mockResponse = NextResponse.json(
        { success: true, customer: updatedCustomer },
        { headers: { 'Cache-Control': 'no-store' } }
      )

      return setCustomerSessionCookie(mockResponse, {
        ...session,
        customer: updatedCustomer,
      })
    }

    await shopifyClient.request(CUSTOMER_DEFAULT_ADDRESS_UPDATE, {
      customerAccessToken: session.accessToken,
      addressId,
    })

    const freshCustomer = await getCustomerFromAccessToken(session.accessToken)
    if (!freshCustomer) {
      return NextResponse.json(
        { success: false, error: 'Failed to load the updated customer profile.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, customer: freshCustomer },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to set the default address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set the default address.' },
      { status: 500 }
    )
  }
}
