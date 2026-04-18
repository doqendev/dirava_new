import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerFromAccessToken } from '@/lib/auth/customer'
import { setCustomerSessionCookie } from '@/lib/auth/session'
import { enforceSameOrigin } from '@/lib/auth/csrf'
import { CUSTOMER_UPDATE } from '@/lib/shopify/customerMutations'
import { shopifyClient } from '@/lib/shopify/client'
import type { CustomerUserError, ShopifyCustomer } from '@/types/customer'

export const dynamic = 'force-dynamic'

interface CustomerUpdateResponse {
  customerUpdate: {
    customer: ShopifyCustomer | null
    customerUserErrors: CustomerUserError[]
  }
}

export async function GET(request: Request) {
  const { customer, response } = await getAuthenticatedCustomer(request)
  if (response) {
    return response
  }

  if (!customer) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    { success: true, customer },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function PATCH(request: Request) {
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
    const body = (await request.json()) as {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      acceptsMarketing?: boolean
    }

    if (session.mode === 'mock') {
      const updatedCustomer: ShopifyCustomer = {
        ...customer,
        firstName: body.firstName ?? customer.firstName,
        lastName: body.lastName ?? customer.lastName,
        email: body.email ?? customer.email,
        phone: body.phone ?? customer.phone,
        acceptsMarketing: body.acceptsMarketing ?? customer.acceptsMarketing,
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

    const updateResponse = await shopifyClient.request<CustomerUpdateResponse>(
      CUSTOMER_UPDATE,
      {
        customerAccessToken: session.accessToken,
        customer: body,
      }
    )

    const { customerUserErrors } = updateResponse.customerUpdate
    if (customerUserErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: customerUserErrors[0]?.message ?? 'Failed to update the profile.',
          errors: customerUserErrors,
        },
        { status: 400 }
      )
    }

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
    console.error('Failed to update the customer profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update the profile.' },
      { status: 500 }
    )
  }
}
