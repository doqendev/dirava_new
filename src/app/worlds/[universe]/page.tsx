import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSE_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes, getFirstAvailableVariant } from '@/lib/shopify/utils'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import {
  parseFiltersFromParams,
  calculatePriceRange,
} from '@/lib/utils/filters'
import {
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mizoke.com'

  return {
    title: `${name} – Anime Merch & Collectibles | Mizoke`,
    description: `Shop exclusive ${name} merchandise. Premium apparel, collectibles, and limited edition drops from the ${name} universe.`,
    alternates: {
      canonical: `${siteUrl}/worlds/${universe}`,
    },
    openGraph: {
      title: `${name} – Anime Merch & Collectibles | Mizoke`,
      description: `Shop exclusive ${name} merchandise. Premium apparel, collectibles, and limited edition drops.`,
    },
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

  // Remove trailing "-1", "-2", etc. that Shopify adds for duplicate handles
  const cleanUniverse = universe.replace(/-\d+$/, '')
  const config = UNIVERSE_CONFIG[cleanUniverse as keyof typeof UNIVERSE_CONFIG]
  const themeColor = config?.color || '#00f5ff'

  // Parse filters from URL
  const filters = parseFiltersFromParams(searchParams)

  // Calculate price range from products
  const priceRange = calculatePriceRange(data.products)

  // Prepare URL data for client components
  const basePath = `/worlds/${universe}`
  const currentParams: Record<string, string> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      currentParams[key] = value
    } else if (Array.isArray(value) && value.length > 0 && value[0]) {
      currentParams[key] = value[0]
    }
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar Filters */}
      <CollectionFilters
        filters={filters}
        priceRange={priceRange}
        themeColor={themeColor}
        productCount={data.products.length}
        basePath={basePath}
        currentParams={currentParams}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <CollectionToolbar
          filters={filters}
          themeColor={themeColor}
          basePath={basePath}
          currentParams={currentParams}
        />

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

  // Remove trailing "-1", "-2", etc. that Shopify adds for duplicate handles
  const cleanUniverse = universe.replace(/-\d+$/, '')
  const config = UNIVERSE_CONFIG[cleanUniverse as keyof typeof UNIVERSE_CONFIG]
  const universeName = config?.name || cleanUniverse.replace(/-/g, ' ')
  const themeColor = config?.color || '#00f5ff'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mizoke.com'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Worlds',
        item: `${siteUrl}/worlds`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: universeName,
        item: `${siteUrl}/worlds/${universe}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen">
      {/* Header Section */}
      <section className="pt-6 px-4 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            href="/"
            className="text-white/50 hover:text-white transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <Link
            href="/worlds"
            className="text-white/50 hover:text-white transition-colors"
          >
            Worlds
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span style={{ color: themeColor }}>{universeName}</span>
        </nav>

        {/* Collection Title */}
        <h1
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider uppercase mb-6"
          style={{
            color: themeColor,
            textShadow: `0 0 20px ${themeColor}60, 0 0 40px ${themeColor}30`,
          }}
        >
          {universeName}
        </h1>
      </section>

      {/* Main Content */}
      <section className="pb-6 px-4 max-w-7xl mx-auto">
        <Suspense fallback={<UniverseContentSkeleton />}>
          <UniverseContent
            universe={universe}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </section>
    </div>
    </>
  )
}
