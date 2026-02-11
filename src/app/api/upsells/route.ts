import { NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_RELATED_PRODUCTS, GET_BEST_SELLERS } from '@/lib/shopify/queries'
import { extractNodes } from '@/lib/shopify/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const universe = searchParams.get('universe')
  const excludeIdsParam = searchParams.get('excludeIds')
  const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : []

  try {
    let upsellProducts: Array<{
      id: string
      handle: string
      title: string
      price: { amount: string; currencyCode: string }
      image: { url: string; altText: string | null } | null
      universe: string | null
    }> = []

    // Try to fetch from same collection if universe is known
    if (universe) {
      const data = await shopifyFetch<{
        collection: {
          products: {
            edges: Array<{
              node: {
                id: string
                handle: string
                title: string
                priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
                featuredImage: { url: string; altText: string | null } | null
              }
            }>
          }
        } | null
      }>(GET_RELATED_PRODUCTS, {
        collectionHandle: universe,
        first: 10,
      })

      if (data.collection) {
        const allProducts = extractNodes(data.collection.products)
        upsellProducts = allProducts
          .filter((p) => !excludeIds.includes(p.id))
          .slice(0, 2)
          .map((p) => ({
            id: p.id,
            handle: p.handle,
            title: p.title,
            price: p.priceRange.minVariantPrice,
            image: p.featuredImage,
            universe: universe,
          }))
      }
    }

    // Fallback to best sellers if no universe-specific products
    if (upsellProducts.length === 0) {
      const data = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              id: string
              handle: string
              title: string
              priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
              featuredImage: { url: string; altText: string | null } | null
              universe?: { value: string } | null
            }
          }>
        }
      }>(GET_BEST_SELLERS, { first: 10 })

      const allProducts = extractNodes(data.products)
      upsellProducts = allProducts
        .filter((p) => !excludeIds.includes(p.id))
        .slice(0, 2)
        .map((p) => ({
          id: p.id,
          handle: p.handle,
          title: p.title,
          price: p.priceRange.minVariantPrice,
          image: p.featuredImage,
          universe: p.universe?.value || null,
        }))
    }

    return NextResponse.json(upsellProducts)
  } catch (error) {
    console.error('Failed to fetch upsells:', error)
    return NextResponse.json([], { status: 500 })
  }
}
