/**
 * GET /api/account/data-export
 *
 * GDPR: Export all customer data as JSON.
 */

import { NextResponse } from 'next/server'
import { getAuthenticatedCustomer, getCustomerAccessToken } from '@/lib/auth/customer'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER, GET_CUSTOMER_ORDERS } from '@/lib/shopify/customerQueries'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { appendCustomerComplianceEvent } from '@/lib/shopify/customerCompliance'

export const dynamic = 'force-dynamic'

interface CustomerResponse {
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    acceptsMarketing: boolean
    defaultAddress: Record<string, unknown> | null
    addresses: {
      edges: Array<{ node: Record<string, unknown> }>
    }
  } | null
}

interface OrdersResponse {
  customer: {
    orders: {
      edges: Array<{ node: Record<string, unknown> }>
    }
  } | null
}

export async function GET(request: Request) {
  try {
    // Rate limit: 3 exports per hour
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`data-export:${ip}`, { maxRequests: 3, windowSeconds: 3600 })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { customer: authenticatedCustomer, response, session } =
      await getAuthenticatedCustomer(request)
    if (response) {
      return response
    }

    if (!authenticatedCustomer || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (session.mode === 'mock') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          email: authenticatedCustomer.email,
          firstName: authenticatedCustomer.firstName,
          lastName: authenticatedCustomer.lastName,
          phone: authenticatedCustomer.phone,
          acceptsMarketing: authenticatedCustomer.acceptsMarketing,
        },
        addresses: authenticatedCustomer.addresses.edges.map((edge) => edge.node),
        orders: [],
      }

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="mizoke-data-export-${Date.now()}.json"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const accessToken = getCustomerAccessToken(session)
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const [customerData, ordersData] = await Promise.all([
      shopifyClient.request<CustomerResponse>(GET_CUSTOMER, {
        customerAccessToken: accessToken,
      }),
      shopifyClient.request<OrdersResponse>(GET_CUSTOMER_ORDERS, {
        customerAccessToken: accessToken,
        first: 100,
      }),
    ])

    if (!customerData.customer) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const customer = customerData.customer
    const orders = ordersData.customer?.orders.edges.map((e) => e.node) ?? []
    const addresses = customer.addresses.edges.map((e) => e.node)

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        acceptsMarketing: customer.acceptsMarketing,
      },
      addresses,
      orders,
    }

    try {
      await appendCustomerComplianceEvent(customer.id, 'data_export_requests', {
        requestedAt: exportData.exportedAt,
        email: customer.email,
        orderCount: orders.length,
      })
    } catch (auditError) {
      console.error('Failed to record data export audit event:', auditError)
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="mizoke-data-export-${Date.now()}.json"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
