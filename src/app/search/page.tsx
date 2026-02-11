import { Suspense } from 'react'
import { shopifyFetch } from '@/lib/shopify/client'
import { SEARCH_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes } from '@/lib/shopify/utils'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResultsClient } from '@/components/search/SearchResultsClient'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import type { Metadata } from 'next'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q: query } = await searchParams

  return {
    title: query ? `Search: ${query}` : 'Search',
    description: query
      ? `Search results for "${query}" - Find anime merchandise, collectibles, and more.`
      : 'Search for anime merchandise, collectibles, and more.',
  }
}

interface SearchProductResult {
  id: string
  handle: string
  title: string
  productType?: string | null
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string }
  } | null
  featuredImage: { url: string; altText: string | null } | null
  variants: {
    edges: Array<{ node: { id: string } }>
  }
  universe?: { value: string } | null
}

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: SearchProductResult }> }
    }>(SEARCH_PRODUCTS, {
      query,
      first: 50, // Fetch more to have good filter results
    })

    const products = extractNodes(data.products)

    return products.map((product) => {
      const firstVariantId = product.variants?.edges?.[0]?.node?.id
      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
        image: product.featuredImage,
        variantId: firstVariantId,
        universe: product.universe?.value || null,
        productType: product.productType || null,
      }
    })
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query)

  return <SearchResultsClient products={products} query={query} />
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: query = '' } = await searchParams

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8">
        <div className="px-4 max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl text-white text-center mb-6">
            <span className="text-neon-cyan">SEARCH</span> PRODUCTS
          </h1>
          <SearchBar autoFocus placeholder="Search for products, collections..." />
        </div>
      </section>

      {/* Results */}
      <section className="py-6">
        <div className="px-4 max-w-7xl mx-auto">
          <Suspense fallback={<SkeletonProductGrid count={12} />}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
