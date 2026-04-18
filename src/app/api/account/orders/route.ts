import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerAccessToken } from '@/lib/auth/customer'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER_ORDERS } from '@/lib/shopify/customerQueries'
import type { ShopifyOrder } from '@/types/customer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { customer, response, session } = await getAuthenticatedCustomer(request)
  if (response) {
    return response
  }

  if (!customer || !session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (session.mode === 'mock') {
    return NextResponse.json(
      { success: true, orders: [] as ShopifyOrder[] },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const accessToken = getCustomerAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const orderResponse = await shopifyClient.request<{
      customer: {
        orders: {
          edges: Array<{ node: ShopifyOrder }>
        }
      } | null
    }>(GET_CUSTOMER_ORDERS, {
      customerAccessToken: accessToken,
      first: 100,
    })

    const orders = orderResponse.customer?.orders.edges.map((edge) => edge.node) ?? []

    return NextResponse.json(
      { success: true, orders },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to fetch customer orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders.' },
      { status: 500 }
    )
  }
}
