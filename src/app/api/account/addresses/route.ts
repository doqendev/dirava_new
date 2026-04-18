import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { shopifyClient } from '@/lib/shopify/client'
import { CUSTOMER_ADDRESS_CREATE } from '@/lib/shopify/customerMutations'
import type { ShopifyCustomer } from '@/types/customer'

export const dynamic = 'force-dynamic'

function toMockAddressId(): string {
  return `gid://shopify/MailingAddress/mock-${Date.now()}`
}

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
    const body = (await request.json()) as Record<string, string>

    if (session.mode === 'mock') {
      const nextAddress = {
        id: toMockAddressId(),
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        company: body.company ?? '',
        address1: body.address1 ?? '',
        address2: body.address2 ?? '',
        city: body.city ?? '',
        province: body.province ?? '',
        provinceCode: null,
        country: body.country ?? '',
        countryCodeV2: body.country ?? '',
        zip: body.zip ?? '',
        phone: body.phone ?? '',
        formatted: [body.address1 ?? '', body.city ?? '', body.country ?? ''].filter(Boolean),
      }

      const updatedCustomer: ShopifyCustomer = {
        ...customer,
        defaultAddress: customer.defaultAddress ?? nextAddress,
        addresses: {
          edges: [...customer.addresses.edges, { node: nextAddress }],
        },
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

    await shopifyClient.request(CUSTOMER_ADDRESS_CREATE, {
      customerAccessToken: session.accessToken,
      address: body,
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
    console.error('Failed to create customer address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save the address.' },
      { status: 500 }
    )
  }
}
