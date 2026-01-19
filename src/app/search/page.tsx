import { Suspense } from 'react'
import { shopifyFetch } from '@/lib/shopify/client'
import { SEARCH_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes, getFirstAvailableVariant } from '@/lib/shopify/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { SearchBar } from '@/components/search/SearchBar'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import type { ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'

interface Props {
  searchParams: { q?: string }
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const query = searchParams.q

  return {
    title: query ? `Search: ${query}` : 'Search',
    description: query
      ? `Search results for "${query}" - Find anime merchandise, collectibles, and more.`
      : 'Search for anime merchandise, collectibles, and more.',
  }
}

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct }> }
    }>(SEARCH_PRODUCTS, {
      query,
      first: 24,
    })

    const products = extractNodes(data.products)

    return products.map((product) => {
      const firstVariant = getFirstAvailableVariant(product)
      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
        image: product.featuredImage,
        variantId: firstVariant?.id,
      }
    })
  } catch (error) {
    console.error('Search failed:', error)
    return []
  }
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query)

  if (!query) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 text-lg">Enter a search term to find products</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-xl text-white mb-2">No results found</h2>
        <p className="text-white/60">
          No products match &quot;{query}&quot;. Try a different search term.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-white/60 mb-6">
        {products.length} result{products.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickAdd={!!product.variantId}
          />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''

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
          <Suspense fallback={<SkeletonProductGrid count={8} />}>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
