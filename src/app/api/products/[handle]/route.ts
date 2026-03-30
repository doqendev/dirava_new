import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_PRODUCT } from '@/lib/shopify/queries'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params

    const response = await shopifyClient.request<{
      product: {
        id: string
        handle: string
        title: string
        description: string
        images: { edges: Array<{ node: { url: string; altText: string | null } }> }
        variants: {
          edges: Array<{
            node: {
              id: string
              title: string
              availableForSale: boolean
              price: { amount: string; currencyCode: string }
              compareAtPrice?: { amount: string; currencyCode: string } | null
              selectedOptions: Array<{ name: string; value: string }>
              image?: { url: string; altText: string | null } | null
            }
          }>
        }
        metafields: Array<{ key: string; value: string } | null> | null
      } | null
    }>(GET_PRODUCT, { handle })

    if (!response.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { product: p } = response

    // Extract variants
    const variants = p.variants.edges.map((e) => e.node)

    // Extract unique options from variants
    const optionMap = new Map<string, Set<string>>()
    variants.forEach((variant) => {
      variant.selectedOptions.forEach((option) => {
        if (!optionMap.has(option.name)) {
          optionMap.set(option.name, new Set())
        }
        optionMap.get(option.name)!.add(option.value)
      })
    })
    const options = Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))

    // Check personalization metafield (metafields array can contain null items)
    const personalization = p.metafields?.some(
      (m) => m && m.key === 'personalization' && m.value === 'true'
    ) ?? false

    // Extract universe from metafields
    const universeMetafield = p.metafields?.find(
      (m) => m && m.key === 'universe'
    )
    const universe = universeMetafield?.value || null

    return NextResponse.json({
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description,
      images: p.images.edges.map((e) => e.node),
      variants,
      personalization,
      options,
      universe,
    }, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
