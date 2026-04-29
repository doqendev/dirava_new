import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { shopifyClient } from '@/lib/shopify/client'
import {
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_ADDRESS_UPDATE,
} from '@/lib/shopify/customerMutations'
import type { ShopifyCustomer } from '@/types/customer'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const addressId = decodeURIComponent(id)

    if (session.mode === 'mock') {
      const updatedCustomer: ShopifyCustomer = {
        ...customer,
        defaultAddress:
          customer.defaultAddress?.id === addressId
            ? {
                ...customer.defaultAddress,
                ...body,
                countryCodeV2: body.country ?? customer.defaultAddress.countryCodeV2,
              }
            : customer.defaultAddress,
        addresses: {
          edges: customer.addresses.edges.map((edge) =>
            edge.node.id === addressId
              ? {
                  node: {
                    ...edge.node,
                    ...body,
                    countryCodeV2: body.country ?? edge.node.countryCodeV2,
                  },
                }
              : edge
          ),
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

    await shopifyClient.request(CUSTOMER_ADDRESS_UPDATE, {
      customerAccessToken: session.accessToken,
      id: addressId,
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
    console.error('Failed to update customer address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save the address.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const addressId = decodeURIComponent(id)

    if (session.mode === 'mock') {
      const nextEdges = customer.addresses.edges.filter((edge) => edge.node.id !== addressId)
      const updatedCustomer: ShopifyCustomer = {
        ...customer,
        defaultAddress:
          customer.defaultAddress?.id === addressId
            ? nextEdges[0]?.node ?? null
            : customer.defaultAddress,
        addresses: {
          edges: nextEdges,
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

    await shopifyClient.request(CUSTOMER_ADDRESS_DELETE, {
      customerAccessToken: session.accessToken,
      id: addressId,
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
    console.error('Failed to delete customer address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete the address.' },
      { status: 500 }
    )
  }
}
