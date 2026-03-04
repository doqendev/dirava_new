/**
 * POST /api/gacha/reveal
 *
 * Reveal a mystery box using a redemption code
 */

import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import {
  getRedemptionCodeByCode,
  markCodeRevealed,
} from '@/lib/gacha/metaobjects'
import { performGachaSelection } from '@/lib/gacha/randomSelection'
import { normalizeCode, isValidCodeFormat } from '@/lib/gacha/codeGenerator'
import {
  GET_MYSTERY_BOX,
  GET_PRODUCT_FOR_REVEAL,
  type MysteryBoxQueryResponse,
  type ProductForRevealResponse,
} from '@/lib/gacha/queries'
import type {
  LootPool,
  GachaRevealResult,
  RevealApiResponse,
} from '@/types/gacha'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

export async function POST(request: Request) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`reveal:${ip}`, { maxRequests: 10, windowSeconds: 60 })
    if (rl.limited) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { code: rawCode } = body

    if (!rawCode) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Redemption code is required' },
        { status: 400 }
      )
    }

    // Normalize and validate code format
    const code = normalizeCode(rawCode)
    if (!isValidCodeFormat(code)) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Fetch redemption code from metaobjects
    const redemptionCode = await getRedemptionCodeByCode(code)

    if (!redemptionCode) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Code not found' },
        { status: 404 }
      )
    }

    // Check if already revealed
    if (redemptionCode.status !== 'unused') {
      // Return existing reveal result
      if (redemptionCode.revealedProductHandle) {
        const productResponse = await shopifyClient.request<ProductForRevealResponse>(
          GET_PRODUCT_FOR_REVEAL,
          { handle: redemptionCode.revealedProductHandle }
        )

        if (productResponse.product) {
          // Fetch box info for title
          const boxResponse = await shopifyClient.request<MysteryBoxQueryResponse>(
            GET_MYSTERY_BOX,
            { handle: redemptionCode.boxHandle }
          )

          return NextResponse.json<RevealApiResponse>(
            {
              success: true,
              alreadyRevealed: true,
              result: {
                code: redemptionCode.code,
                boxHandle: redemptionCode.boxHandle,
                boxTitle: boxResponse.product?.title || 'Mystery Box',
                revealedProduct: {
                  id: productResponse.product.id,
                  handle: productResponse.product.handle,
                  title: productResponse.product.title,
                  description: productResponse.product.description,
                  image: productResponse.product.featuredImage,
                  price: productResponse.product.priceRange.minVariantPrice,
                  variantId: redemptionCode.revealedVariantId,
                },
                rarity: redemptionCode.revealedRarity ?? 'common',
                revealedAt: redemptionCode.revealedAt ?? new Date().toISOString(),
                seed: redemptionCode.seed ?? '0',
              },
            },
            { headers: { 'Cache-Control': 'no-store' } }
          )
        }
      }

      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Code already used' },
        { status: 400 }
      )
    }

    // Fetch mystery box with loot pool
    const boxResponse = await shopifyClient.request<MysteryBoxQueryResponse>(
      GET_MYSTERY_BOX,
      { handle: redemptionCode.boxHandle }
    )

    if (!boxResponse.product) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Mystery box not found' },
        { status: 404 }
      )
    }

    if (!boxResponse.product.lootPool?.value) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Mystery box has no loot pool configured' },
        { status: 500 }
      )
    }

    // Parse loot pool
    let lootPool: LootPool
    try {
      lootPool = JSON.parse(boxResponse.product.lootPool.value)
    } catch {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Invalid loot pool configuration' },
        { status: 500 }
      )
    }

    if (!lootPool.items || lootPool.items.length === 0) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Loot pool is empty' },
        { status: 500 }
      )
    }

    // Perform gacha selection
    const selection = performGachaSelection(lootPool.items, lootPool.odds)

    // Fetch selected product details
    const productResponse = await shopifyClient.request<ProductForRevealResponse>(
      GET_PRODUCT_FOR_REVEAL,
      { handle: selection.item.productHandle }
    )

    if (!productResponse.product) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Selected product not found' },
        { status: 500 }
      )
    }

    // Mark code as revealed
    const updatedCode = await markCodeRevealed(redemptionCode.id, {
      revealedProductHandle: selection.item.productHandle,
      revealedVariantId: selection.item.variantId,
      revealedRarity: selection.rarity,
      seed: selection.seed,
    })

    if (!updatedCode) {
      return NextResponse.json<RevealApiResponse>(
        { success: false, error: 'Failed to update code status' },
        { status: 500 }
      )
    }

    // Build result
    const result: GachaRevealResult = {
      code: redemptionCode.code,
      boxHandle: redemptionCode.boxHandle,
      boxTitle: boxResponse.product.title,
      revealedProduct: {
        id: productResponse.product.id,
        handle: productResponse.product.handle,
        title: productResponse.product.title,
        description: productResponse.product.description,
        image: productResponse.product.featuredImage,
        price: productResponse.product.priceRange.minVariantPrice,
        variantId: selection.item.variantId,
      },
      rarity: selection.rarity,
      revealedAt: updatedCode.revealedAt ?? new Date().toISOString(),
      seed: selection.seed,
    }

    return NextResponse.json<RevealApiResponse>(
      { success: true, alreadyRevealed: false, result },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Reveal error:', error)
    return NextResponse.json<RevealApiResponse>(
      { success: false, error: 'Failed to perform reveal' },
      { status: 500 }
    )
  }
}
