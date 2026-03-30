/**
 * POST /api/gacha/claim
 *
 * Claim a revealed prize by submitting shipping address
 * Creates a draft order in Shopify for fulfillment
 */

import { NextResponse } from 'next/server'
import { adminFetch } from '@/lib/shopify/adminClient'
import {
  getRedemptionCodeByCode,
  markCodeClaimed,
} from '@/lib/gacha/metaobjects'
import { normalizeCode, isValidCodeFormat } from '@/lib/gacha/codeGenerator'
import {
  ADMIN_CREATE_DRAFT_ORDER,
  ADMIN_COMPLETE_DRAFT_ORDER,
  type DraftOrderCreateResponse,
  type DraftOrderCompleteResponse,
} from '@/lib/gacha/queries'
import type { ClaimApiResponse, ShippingAddress } from '@/types/gacha'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { validateShippingAddress } from '@/lib/utils/validation'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`claim:${ip}`, { maxRequests: 5, windowSeconds: 60 })
    if (rl.limited) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { code: rawCode, shippingAddress, variantId: requestedVariantId } = body as {
      code: string
      shippingAddress: ShippingAddress
      variantId?: string // Optional - user can select variant/size at claim time
    }

    // Validate inputs
    if (!rawCode) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Redemption code is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize shipping address
    const addressResult = validateShippingAddress(shippingAddress)
    if (!addressResult.valid) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: addressResult.error! },
        { status: 400 }
      )
    }

    // Normalize and validate code
    const code = normalizeCode(rawCode)
    if (!isValidCodeFormat(code)) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Fetch redemption code
    const redemptionCode = await getRedemptionCodeByCode(code)

    if (!redemptionCode) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Code not found' },
        { status: 404 }
      )
    }

    // Check code status
    if (redemptionCode.status === 'unused') {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Code has not been revealed yet' },
        { status: 400 }
      )
    }

    if (redemptionCode.status === 'claimed' || redemptionCode.status === 'shipped') {
      // Idempotency: if already claimed, return success with existing order ID
      // so refreshes / retries don't show an error to the user
      return NextResponse.json<ClaimApiResponse>(
        {
          success: true,
          fulfillmentOrderId: redemptionCode.fulfillmentOrderId ?? redemptionCode.id,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Use requested variant if provided, otherwise fall back to revealed variant
    // This allows users to select their preferred size at claim time
    const variantIdToUse = requestedVariantId || redemptionCode.revealedVariantId

    if (!variantIdToUse) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'No variant selected for the prize' },
        { status: 400 }
      )
    }

    // Validate that the requested variant belongs to the revealed product
    if (requestedVariantId && redemptionCode.revealedProductHandle) {
      const { shopifyClient } = await import('@/lib/shopify/client')
      const { GET_PRODUCT_FOR_REVEAL } = await import('@/lib/gacha/queries')
      type ProductForRevealResponse = {
        product: {
          variants: { edges: Array<{ node: { id: string } }> }
        } | null
      }
      const productData = await shopifyClient.request<ProductForRevealResponse>(
        GET_PRODUCT_FOR_REVEAL,
        { handle: redemptionCode.revealedProductHandle }
      )
      const validVariantIds = productData.product?.variants.edges.map(e => e.node.id) || []
      if (!validVariantIds.includes(requestedVariantId)) {
        return NextResponse.json<ClaimApiResponse>(
          { success: false, error: 'Invalid variant for this product' },
          { status: 400 }
        )
      }
    }

    const sanitizedAddress = addressResult.sanitized!

    // Create draft order for fulfillment
    const draftOrderInput = {
      lineItems: [
        {
          variantId: variantIdToUse,
          quantity: 1,
        },
      ],
      shippingAddress: {
        firstName: sanitizedAddress.firstName,
        lastName: sanitizedAddress.lastName,
        address1: sanitizedAddress.address1,
        address2: sanitizedAddress.address2,
        city: sanitizedAddress.city,
        province: sanitizedAddress.province,
        country: sanitizedAddress.country,
        zip: sanitizedAddress.zip,
        phone: sanitizedAddress.phone,
      },
      note: `Mystery Box Claim - Code: ${code} | Original Order: ${redemptionCode.purchaseOrderName || redemptionCode.purchaseOrderId}`,
      tags: ['mystery-box-claim', `code:${code}`],
      // Don't charge customer - this is fulfillment only
      appliedDiscount: {
        value: 100,
        valueType: 'PERCENTAGE',
        title: 'Mystery Box Prize',
        description: 'Pre-paid mystery box reveal',
      },
    }

    const createResponse = await adminFetch<DraftOrderCreateResponse>(
      ADMIN_CREATE_DRAFT_ORDER,
      { input: draftOrderInput }
    )

    if (createResponse.draftOrderCreate.userErrors.length > 0) {
      console.error('Draft order errors:', createResponse.draftOrderCreate.userErrors)
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      )
    }

    const draftOrder = createResponse.draftOrderCreate.draftOrder
    if (!draftOrder) {
      return NextResponse.json<ClaimApiResponse>(
        { success: false, error: 'Failed to create draft order' },
        { status: 500 }
      )
    }

    // Complete the draft order (marks as paid)
    const completeResponse = await adminFetch<DraftOrderCompleteResponse>(
      ADMIN_COMPLETE_DRAFT_ORDER,
      { id: draftOrder.id }
    )

    if (completeResponse.draftOrderComplete.userErrors.length > 0) {
      console.error('Complete order errors:', completeResponse.draftOrderComplete.userErrors)
      // Order was created but not completed - still update code
    }

    const fulfillmentOrderId = completeResponse.draftOrderComplete.draftOrder?.order?.id || draftOrder.id

    // Mark code as claimed (pass variant if user selected a different size)
    const claimAddress: ShippingAddress = {
      firstName: sanitizedAddress.firstName,
      lastName: sanitizedAddress.lastName,
      address1: sanitizedAddress.address1,
      address2: sanitizedAddress.address2 ?? undefined,
      city: sanitizedAddress.city,
      province: sanitizedAddress.province ?? undefined,
      provinceCode: sanitizedAddress.provinceCode ?? undefined,
      country: sanitizedAddress.country,
      countryCode: sanitizedAddress.countryCode,
      zip: sanitizedAddress.zip,
      phone: sanitizedAddress.phone ?? undefined,
    }
    const updatedCode = await markCodeClaimed(
      redemptionCode.id,
      claimAddress,
      fulfillmentOrderId,
      requestedVariantId // Pass the user-selected variant if provided
    )

    if (!updatedCode) {
      console.error('Failed to update code status')
      // Order is created, but code status update failed
      // This is not critical, but should be logged
    }

    return NextResponse.json<ClaimApiResponse>(
      { success: true, fulfillmentOrderId },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Claim error:', error)
    return NextResponse.json<ClaimApiResponse>(
      { success: false, error: 'Failed to claim prize' },
      { status: 500 }
    )
  }
}
