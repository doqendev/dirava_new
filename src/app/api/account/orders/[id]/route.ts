import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerAccessToken } from '@/lib/auth/customer'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER_ORDERS, GET_ORDER } from '@/lib/shopify/customerQueries'
import type { ShopifyOrder } from '@/types/customer'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { customer, response, session } = await getAuthenticatedCustomer(request)
  if (response) {
    return response
  }

  if (!customer || !session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (session.mode === 'mock') {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  try {
    const accessToken = getCustomerAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const orderId = atob(decodeURIComponent(id))

    const orderListResponse = await shopifyClient.request<{
      customer: {
        orders: {
          edges: Array<{ node: Pick<ShopifyOrder, 'id'> }>
        }
      } | null
    }>(GET_CUSTOMER_ORDERS, {
      customerAccessToken: accessToken,
      first: 100,
    })

    const ownsOrder = orderListResponse.customer?.orders.edges.some(
      (edge) => edge.node.id === orderId
    )

    if (!ownsOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const orderResponse = await shopifyClient.request<{
      node: ShopifyOrder | null
    }>(GET_ORDER, { id: orderId })

    if (!orderResponse.node) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, order: orderResponse.node },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to fetch order details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load order details.' },
      { status: 500 }
    )
  }
}
