import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSE_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes, getFirstAvailableVariant } from '@/lib/shopify/utils'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import {
  parseFiltersFromParams,
  calculatePriceRange,
} from '@/lib/utils/filters'
import {
  CollectionBanner,
  CollectionFilters,
  CollectionGrid,
  CollectionToolbar,
} from '@/components/collection'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import type { ShopifyCollection, ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ universe: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universe } = await params
  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const name = config?.name || universe

  return {
    title: name,
    description: `Shop exclusive ${name} merchandise. Apparel, collectibles, and limited drops.`,
  }
}

export const revalidate = 60

async function getUniverseProducts(handle: string) {
  try {
    const data = await shopifyFetch<{
      collection: ShopifyCollection | null
    }>(GET_UNIVERSE_PRODUCTS, {
      handle,
      first: 250, // Fetch all products for client-side filtering
    })

    if (!data.collection) {
      return null
    }

    const products = data.collection.products
      ? extractNodes(data.collection.products as { edges: Array<{ node: ShopifyProduct }> })
      : []

    return {
      collection: data.collection,
      products: products.map((product: ShopifyProduct & { metafield?: { value: string } | null }) => {
        const firstVariant = getFirstAvailableVariant(product)
        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          price: product.priceRange.minVariantPrice,
          compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
          image: product.featuredImage,
          variantId: firstVariant?.id,
          rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
          productType: product.productType,
          tags: product.tags,
          createdAt: product.createdAt,
        }
      }),
    }
  } catch (error) {
    console.error('Failed to fetch universe products:', error)
    return null
  }
}

// Main Content Component
async function UniverseContent({
  universe,
  searchParams,
}: {
  universe: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  const data = await getUniverseProducts(universe)

  if (!data) {
    notFound()
  }

  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const themeColor = config?.color || '#00f5ff'

  // Parse filters from URL
  const filters = parseFiltersFromParams(searchParams)

  // Calculate price range from products
  const priceRange = calculatePriceRange(data.products)

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar Filters */}
      <CollectionFilters
        filters={filters}
        priceRange={priceRange}
        themeColor={themeColor}
        productCount={data.products.length}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <CollectionToolbar filters={filters} themeColor={themeColor} />

        {/* Product Grid */}
        <CollectionGrid
          products={data.products}
          universe={universe}
          filters={filters}
          themeColor={themeColor}
        />
      </div>
    </div>
  )
}

// Loading Skeleton
function UniverseContentSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar Skeleton */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="h-6 w-24 bg-bg-secondary rounded skeleton mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full bg-bg-secondary rounded skeleton" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 min-w-0">
        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="h-10 w-44 bg-bg-secondary rounded-lg skeleton" />
          <div className="h-10 w-32 bg-bg-secondary rounded-lg skeleton" />
        </div>

        {/* Grid Skeleton */}
        <SkeletonProductGrid count={12} />
      </div>
    </div>
  )
}

export default async function UniversePage({ params, searchParams }: Props) {
  const { universe } = await params
  const resolvedSearchParams = await searchParams

  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const universeName = config?.name || universe.replace(/-/g, ' ')
  const themeColor = config?.color || '#00f5ff'

  return (
    <div className="min-h-screen">
      {/* Compact Banner */}
      <CollectionBanner
        universe={universe}
        universeName={universeName}
        themeColor={themeColor}
      />

      {/* Main Content */}
      <section className="py-6 px-4 max-w-7xl mx-auto">
        <Suspense fallback={<UniverseContentSkeleton />}>
          <UniverseContent
            universe={universe}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </section>
    </div>
  )
}
