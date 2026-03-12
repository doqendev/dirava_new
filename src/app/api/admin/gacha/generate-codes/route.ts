/**
 * POST /api/admin/gacha/generate-codes
 *
 * Admin endpoint to manually generate redemption codes for testing
 * No webhook needed - just call this endpoint with the details
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { generateCodes } from '@/lib/gacha/codeGenerator'
import { createRedemptionCode } from '@/lib/gacha/metaobjects'

interface GenerateCodesRequest {
  email: string
  boxHandle: string
  quantity?: number
  orderId?: string
  orderName?: string
}

interface GenerateCodesResponse {
  success: boolean
  codes?: string[]
  error?: string
}

// Simple admin secret check (set ADMIN_SECRET in .env.local)
function isAuthorized(request: Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET

  // If no secret configured, allow in development only
  if (!adminSecret) {
    return process.env.NODE_ENV === 'development'
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(adminSecret)
    )
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  // Hard fail in production if ADMIN_SECRET is not configured
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
    console.error('CRITICAL: ADMIN_SECRET is not set in production')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json<GenerateCodesResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body: GenerateCodesRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.boxHandle) {
      return NextResponse.json<GenerateCodesResponse>(
        { success: false, error: 'email and boxHandle are required' },
        { status: 400 }
      )
    }

    const quantity = body.quantity || 1
    if (quantity < 1 || quantity > 10) {
      return NextResponse.json<GenerateCodesResponse>(
        { success: false, error: 'quantity must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Generate unique codes
    const codes = generateCodes(quantity)
    const createdCodes: string[] = []

    // Create metaobject for each code
    for (const code of codes) {
      try {
        const redemptionCode = await createRedemptionCode({
          code,
          boxHandle: body.boxHandle,
          purchaseOrderId: body.orderId || `manual-${Date.now()}`,
          purchaseOrderName: body.orderName || 'Manual Generation',
          purchaserEmail: body.email,
          status: 'unused',
        })

        if (redemptionCode) {
          createdCodes.push(code)
        } else {
          console.error('createRedemptionCode returned null for:', code)
        }
      } catch (codeError) {
        console.error('Error creating code:', code, codeError)
      }
    }

    if (createdCodes.length === 0) {
      return NextResponse.json<GenerateCodesResponse>(
        { success: false, error: 'Failed to create codes. Check Shopify Admin API credentials and metaobject definition.' },
        { status: 500 }
      )
    }

    return NextResponse.json<GenerateCodesResponse>({
      success: true,
      codes: createdCodes,
    })
  } catch (error) {
    console.error('Generate codes error:', error)
    return NextResponse.json<GenerateCodesResponse>(
      { success: false, error: 'Failed to generate codes' },
      { status: 500 }
    )
  }
}
