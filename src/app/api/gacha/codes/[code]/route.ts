/**
 * GET /api/gacha/codes/[code]
 *
 * Get status of a redemption code
 */

import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { getRedemptionCodeByCode } from '@/lib/gacha/metaobjects'
import { normalizeCode, isValidCodeFormat } from '@/lib/gacha/codeGenerator'
import {
  GET_MYSTERY_BOX,
  GET_PRODUCT_FOR_REVEAL,
  type MysteryBoxQueryResponse,
  type ProductForRevealResponse,
} from '@/lib/gacha/queries'
import type { CodeStatusResponse, MysteryBox, MysteryBoxTheme, LootPool } from '@/types/gacha'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params

    // Normalize and validate code format
    const code = normalizeCode(rawCode)
    if (!isValidCodeFormat(code)) {
      return NextResponse.json<CodeStatusResponse>(
        { success: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Fetch redemption code
    const redemptionCode = await getRedemptionCodeByCode(code)

    if (!redemptionCode) {
      return NextResponse.json<CodeStatusResponse>(
        { success: false, error: 'Code not found' },
        { status: 404 }
      )
    }

    // Fetch mystery box details
    const boxResponse = await shopifyClient.request<MysteryBoxQueryResponse>(
      GET_MYSTERY_BOX,
      { handle: redemptionCode.boxHandle }
    )

    let box: MysteryBox | undefined
    if (boxResponse.product) {
      let lootPool: LootPool | null = null
      let theme: MysteryBoxTheme | null = null

      if (boxResponse.product.lootPool?.value) {
        try {
          lootPool = JSON.parse(boxResponse.product.lootPool.value)
        } catch {
          // Invalid JSON, ignore
        }
      }

      if (boxResponse.product.theme?.value) {
        try {
          theme = JSON.parse(boxResponse.product.theme.value)
        } catch {
          // Invalid JSON, ignore
        }
      }

      box = {
        id: boxResponse.product.id,
        handle: boxResponse.product.handle,
        title: boxResponse.product.title,
        description: boxResponse.product.description,
        image: boxResponse.product.featuredImage,
        price: boxResponse.product.priceRange.minVariantPrice,
        lootPool,
        theme,
      }
    }

    // If revealed, fetch product details with variants
    let revealedProduct
    if (redemptionCode.revealedProductHandle) {
      const productResponse = await shopifyClient.request<ProductForRevealResponse>(
        GET_PRODUCT_FOR_REVEAL,
        { handle: redemptionCode.revealedProductHandle }
      )

      if (productResponse.product) {
        // Map variants for selection
        const variants = productResponse.product.variants.edges.map(({ node }) => ({
          id: node.id,
          title: node.title,
          availableForSale: node.availableForSale,
          price: node.price,
        }))

        revealedProduct = {
          id: productResponse.product.id,
          handle: productResponse.product.handle,
          title: productResponse.product.title,
          description: productResponse.product.description,
          image: productResponse.product.featuredImage,
          price: productResponse.product.priceRange.minVariantPrice,
          variantId: redemptionCode.revealedVariantId,
          variants,
        }
      }
    }

    return NextResponse.json<CodeStatusResponse>({
      success: true,
      code: redemptionCode,
      box,
      revealedProduct,
    })
  } catch (error) {
    console.error('Code status error:', error)
    return NextResponse.json<CodeStatusResponse>(
      { success: false, error: 'Failed to fetch code status' },
      { status: 500 }
    )
  }
}
