/**
 * GET /api/gacha/boxes
 *
 * Get all available mystery boxes
 */

import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import {
  GET_ALL_MYSTERY_BOXES,
  type AllMysteryBoxesResponse,
} from '@/lib/gacha/queries'
import type { BoxesApiResponse, MysteryBox, MysteryBoxTheme, LootPool } from '@/types/gacha'

export async function GET() {
  try {
    const response = await shopifyClient.request<AllMysteryBoxesResponse>(
      GET_ALL_MYSTERY_BOXES
    )

    const boxes: MysteryBox[] = response.products.edges
      .filter((edge) => edge.node !== null)
      .map((edge) => {
        const product = edge.node!

        let lootPool: LootPool | null = null
        let theme: MysteryBoxTheme | null = null

        if (product.lootPool?.value) {
          try {
            lootPool = JSON.parse(product.lootPool.value)
          } catch {
            // Invalid JSON, ignore
          }
        }

        if (product.theme?.value) {
          try {
            theme = JSON.parse(product.theme.value)
          } catch {
            // Invalid JSON, ignore
          }
        }

        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          description: product.description,
          image: product.featuredImage,
          price: product.priceRange.minVariantPrice,
          lootPool,
          theme,
        }
      })

    return NextResponse.json<BoxesApiResponse>({
      success: true,
      boxes,
    }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('Boxes API error:', error)
    return NextResponse.json<BoxesApiResponse>(
      { success: false, error: 'Failed to fetch mystery boxes' },
      { status: 500 }
    )
  }
}
