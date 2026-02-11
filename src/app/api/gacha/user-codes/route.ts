/**
 * GET /api/gacha/user-codes
 *
 * Get all redemption codes for a user by email
 */

import { NextResponse } from 'next/server'
import { getRedemptionCodesByEmail } from '@/lib/gacha/metaobjects'
import type { RedemptionCode } from '@/types/gacha'

export interface UserCodesResponse {
  success: boolean
  codes?: RedemptionCode[]
  error?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json<UserCodesResponse>(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!email.includes('@')) {
      return NextResponse.json<UserCodesResponse>(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const codes = await getRedemptionCodesByEmail(email)

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
