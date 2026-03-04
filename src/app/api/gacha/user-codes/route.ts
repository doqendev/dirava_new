/**
 * GET /api/gacha/user-codes
 *
 * Get all redemption codes for a user by email.
 * Requires X-Customer-Access-Token header; the token's email must match
 * the requested email to prevent IDOR enumeration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { gql } from 'graphql-request'
import { shopifyClient } from '@/lib/shopify/client'
import { getRedemptionCodesByEmail } from '@/lib/gacha/metaobjects'
import type { RedemptionCode } from '@/types/gacha'

export interface UserCodesResponse {
  success: boolean
  codes?: RedemptionCode[]
  error?: string
}

const GET_CUSTOMER_EMAIL = gql`
  query GetCustomerEmail($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      email
    }
  }
`

async function getCustomerEmailFromToken(accessToken: string): Promise<string | null> {
  try {
    const response = await shopifyClient.request<{
      customer: { email: string } | null
    }>(GET_CUSTOMER_EMAIL, { customerAccessToken: accessToken })
    return response.customer?.email ?? null
  } catch (error) {
    console.error('Failed to validate customer token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('X-Customer-Access-Token')

  if (!accessToken) {
    return NextResponse.json<UserCodesResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const customerEmail = await getCustomerEmailFromToken(accessToken)

  if (!customerEmail) {
    return NextResponse.json<UserCodesResponse>(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // If email param provided, verify it matches the authenticated customer
    if (email && email.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json<UserCodesResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Always use the verified email from the token
    const codes = await getRedemptionCodesByEmail(customerEmail)

    // Sort by creation date (newest first)
    codes.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    return NextResponse.json<UserCodesResponse>({
      success: true,
      codes,
    })
  } catch (error) {
    console.error('Error fetching user codes:', error)
    return NextResponse.json<UserCodesResponse>(
      { success: false, error: 'Failed to fetch codes' },
      { status: 500 }
    )
  }
}
