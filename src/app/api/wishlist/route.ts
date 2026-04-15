import { NextRequest, NextResponse } from 'next/server'
import { gql } from 'graphql-request'
import { shopifyClient } from '@/lib/shopify/client'
import { adminFetch } from '@/lib/shopify/adminClient'
import type { WishlistItem } from '@/types/wishlist'

const METAFIELD_NAMESPACE = 'custom'
const METAFIELD_KEY = 'wishlist'

// Storefront API query to get customer ID from access token
const GET_CUSTOMER_ID = gql`
  query GetCustomerId($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
    }
  }
`

// Admin API query to get customer metafield
const GET_CUSTOMER_METAFIELD = gql`
  query GetCustomerMetafield($customerId: ID!) {
    customer(id: $customerId) {
      metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
        id
        value
      }
    }
  }
`

// Admin API mutation to set customer metafield
const SET_CUSTOMER_METAFIELD = gql`
  mutation SetCustomerMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`

// Helper to validate customer and get their ID
async function getCustomerIdFromToken(accessToken: string): Promise<string | null> {
  try {
    const response = await shopifyClient.request<{
      customer: { id: string } | null
    }>(GET_CUSTOMER_ID, { customerAccessToken: accessToken })

    return response.customer?.id || null
  } catch (error) {
    console.error('Failed to validate customer token:', error)
    return null
  }
}

// GET - Fetch customer's wishlist
export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('X-Customer-Access-Token')

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Validate token and get customer ID
    const customerId = await getCustomerIdFromToken(accessToken)

    if (!customerId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch wishlist metafield using Admin API
    const response = await adminFetch<{
      customer: {
        metafield: { id: string; value: string } | null
      } | null
    }>(GET_CUSTOMER_METAFIELD, { customerId })

    const metafieldValue = response.customer?.metafield?.value

    if (!metafieldValue) {
      return NextResponse.json({ items: [] }, {
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    try {
      const items: WishlistItem[] = JSON.parse(metafieldValue)
      return NextResponse.json({ items }, {
        headers: { 'Cache-Control': 'no-store' },
      })
    } catch {
      // Invalid JSON in metafield, return empty
      return NextResponse.json({ items: [] }, {
        headers: { 'Cache-Control': 'no-store' },
      })
    }
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

// POST - Save customer's wishlist
export async function POST(request: NextRequest) {
  const accessToken = request.headers.get('X-Customer-Access-Token')

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Validate token and get customer ID
    const customerId = await getCustomerIdFromToken(accessToken)

    if (!customerId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const items: WishlistItem[] = body.items || []

    // Save wishlist to metafield using Admin API
    const response = await adminFetch<{
      metafieldsSet: {
        metafields: Array<{ id: string; key: string; value: string }> | null
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(SET_CUSTOMER_METAFIELD, {
      metafields: [
        {
          ownerId: customerId,
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          type: 'json',
          value: JSON.stringify(items),
        },
      ],
    })

    if (response.metafieldsSet.userErrors.length > 0) {
      console.error('Metafield update errors:', response.metafieldsSet.userErrors)
      return NextResponse.json(
        { error: response.metafieldsSet.userErrors[0]?.message || 'Failed to save wishlist' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to save wishlist' },
      { status: 500 }
    )
  }
}
