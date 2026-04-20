import { redirect, notFound } from 'next/navigation'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCT } from '@/lib/shopify/queries'
import { getCountry } from '@/i18n/country'
import type { ShopifyProduct, ShopifyMetafield } from '@/types/shopify'
import type { Metadata } from 'next'

type ProductWithCollections = ShopifyProduct

interface Props {
  params: Promise<{ handle: string }>
}

// This page always redirects — skip metadata fetch to save an API call
export const metadata: Metadata = {
  title: 'Product',
  robots: { index: false, follow: true },
}

async function getProduct(handle: string) {
  try {
    const country = await getCountry()
    const data = await shopifyFetch<{ product: ProductWithCollections | null }>(GET_PRODUCT, {
      handle,
      country,
    })
    return data.product
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

function getUniverseFromProduct(product: ProductWithCollections): string | null {
  // First, try to get universe from product's own metafields
  const universeMetafield = product.metafields?.find(
    (mf: ShopifyMetafield | null) => mf?.key === 'universe'
  )
  if (universeMetafield?.value) {
    return universeMetafield.value
  }

  // If not found, try to get universe from the product's collections
  // We use the collection HANDLE (not the metafield value) because routes use handles
  if (product.collections?.edges) {
    // Find first collection that has a universe metafield set
    for (const edge of product.collections.edges) {
      if (edge.node.metafield?.value) {
        // Return the collection handle, not the metafield value
        return edge.node.handle
      }
    }

    // If no collection has universe metafield, use the first collection's handle
    const firstCollection = product.collections.edges[0]
    if (firstCollection) {
      return firstCollection.node.handle
    }
  }

  return null
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  // Get universe from product metafields or collections
  const universe = getUniverseFromProduct(product)

  // If we have a universe, redirect to the universe-specific product page
  if (universe) {
    redirect(`/worlds/${universe}/${handle}`)
  }

  // If still no universe found, redirect to home
  // In a real app, you might want to show a generic product page instead
  redirect('/')
}
