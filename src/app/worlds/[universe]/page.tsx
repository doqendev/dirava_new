import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSE_PRODUCTS } from '@/lib/shopify/queries'
import { getCountry } from '@/i18n/country'
import { getFirstAvailableVariant } from '@/lib/shopify/utils'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import { AccentTheme } from '@/components/theme/AccentTheme'
import { SITE_URL } from '@/lib/utils/siteUrl'
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
import { getTranslations } from 'next-intl/server'
import type { ShopifyCollection, ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ universe: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

interface UniverseProductsCollection extends Omit<ShopifyCollection, 'products'> {
  themeColor?: { value: string } | null
  products?: {
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
    edges: Array<{ node: ShopifyProduct }>
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universe } = await params
  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const name = config?.name || universe
  return {
    title: `${name} – Anime Merch & Collectibles | Mizoke`,
    description: `Shop exclusive ${name} merchandise. Premium apparel, collectibles, and limited edition drops from the ${name} universe.`,
    alternates: {
      canonical: `${SITE_URL}/worlds/${universe}`,
    },
    openGraph: {
      title: `${name} – Anime Merch & Collectibles | Mizoke`,
      description: `Shop exclusive ${name} merchandise. Premium apparel, collectibles, and limited edition drops.`,
    },
  }
}

export const revalidate = 60

async function getCollectionThemeColor(handle: string): Promise<string | null> {
  try {
    const data = await shopifyFetch<{
      collection: { themeColor?: { value: string } | null } | null
    }>(`query GetCollectionThemeColor($handle: String!) {
      collection(handle: $handle) {
        themeColor: metafield(namespace: "custom", key: "theme_color") {
          value
        }
      }
    }`, { handle })
    return data.collection?.themeColor?.value || null
  } catch {
    return null
  }
}

async function getUniverseProducts(handle: string) {
  try {
    const country = await getCountry()
    let collection: UniverseProductsCollection | null = null
    const products: ShopifyProduct[] = []
    let after: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      const data: {
        collection: UniverseProductsCollection | null
      } = await shopifyFetch<{
        collection: UniverseProductsCollection | null
      }>(GET_UNIVERSE_PRODUCTS, {
        handle,
        first: 250,
        after,
        country,
      })

      if (!data.collection) {
        return null
      }

      collection = collection || data.collection
      if (data.collection.products) {
        products.push(...data.collection.products.edges.map((edge) => edge.node))
        after = data.collection.products.pageInfo.endCursor
        hasNextPage = data.collection.products.pageInfo.hasNextPage && Boolean(after)
      } else {
        hasNextPage = false
      }
    }

    if (!collection) {
      return null
    }

    const collectionThemeColor = collection.themeColor?.value || null

    return {
      collection,
      themeColorHex: collectionThemeColor,
      products: products.flatMap((product: ShopifyProduct & { metafield?: { value: string } | null }) => {
        const variants = product.variants?.edges?.map((e) => e.node) || []
        const variantsWithImages = variants.filter((v) => v.image)

        if (variantsWithImages.length > 1) {
          // For each option, check if grouping by its values yields distinct images.
          const optionNames = variants[0]?.selectedOptions
            ?.map((o) => o.name)
            .filter((name) => !(name === 'Title' && variants.length === 1)) || []

          // Find which options produce distinct images
          const visualOptions: string[] = []
          for (const optName of optionNames) {
            const groups = new Map<string, typeof variants[0]>()
            for (const v of variants) {
              const val = v.selectedOptions.find((o) => o.name === optName)?.value
              if (val && !groups.has(val)) {
                groups.set(val, v)
              }
            }
            const imageUrls = new Set(
              Array.from(groups.values())
                .map((v) => v.image?.url?.split('?')[0])
                .filter(Boolean)
            )
            if (imageUrls.size > 1) {
              visualOptions.push(optName)
            }
          }

          if (visualOptions.length >= 2) {
            // Multiple visual options (e.g. Devil Fruit + Hoodie Color + Size):
            // group by the combination of visual option values, ignoring non-visual ones (Size etc.)
            const groups = new Map<string, typeof variants[0]>()
            for (const v of variants) {
              const key = visualOptions
                .map((optName) => v.selectedOptions.find((o) => o.name === optName)?.value || '')
                .join(' / ')
              if (!groups.has(key)) {
                groups.set(key, v)
              }
            }
            return Array.from(groups.entries()).map(([comboName, variant]) => ({
              id: `${product.id}__${variant.id}`,
              handle: product.handle,
              title: product.title,
              variantName: comboName as string | null,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              image: variant.image || product.featuredImage,
              variantId: variant.id as string | undefined,
              rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
              productType: product.productType,
              tags: product.tags,
              createdAt: product.createdAt,
            }))
          }

          if (visualOptions.length === 1) {
            // One visual option (e.g. Color on apparel, or Character on name signs):
            // group by that option → one card per value
            const optName = visualOptions[0]!
            const groups = new Map<string, typeof variants[0]>()
            for (const v of variants) {
              const val = v.selectedOptions.find((o) => o.name === optName)?.value
              if (val && !groups.has(val)) {
                groups.set(val, v)
              }
            }
            return Array.from(groups.entries()).map(([value, variant]) => ({
              id: `${product.id}__${optName}__${value}`,
              handle: product.handle,
              title: product.title,
              variantName: value as string | null,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              image: variant.image || product.featuredImage,
              variantId: variant.id as string | undefined,
              rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
              productType: product.productType,
              tags: product.tags,
              createdAt: product.createdAt,
            }))
          }
        }

        // No option had distinct images or single variant → single card
        const firstVariant = getFirstAvailableVariant(product)
        return [{
          id: product.id,
          handle: product.handle,
          title: product.title,
          variantName: null as string | null,
          price: product.priceRange.minVariantPrice,
          compareAtPrice: product.compareAtPriceRange?.minVariantPrice ?? null,
          image: product.featuredImage,
          variantId: firstVariant?.id,
          rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
          productType: product.productType,
          tags: product.tags,
          createdAt: product.createdAt,
        }]
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
  const themeColor = data.themeColorHex || config?.color || '#00f5ff'

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
        currencyCode={data.products[0]?.price.currencyCode}
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
  const t = await getTranslations('worlds')

  // Remove trailing "-1", "-2", etc. that Shopify adds for duplicate handles
  const cleanUniverse = universe.replace(/-\d+$/, '')
  const config = UNIVERSE_CONFIG[cleanUniverse as keyof typeof UNIVERSE_CONFIG]
  const universeName = config?.name || cleanUniverse.replace(/-/g, ' ')
  const metafieldColor = await getCollectionThemeColor(universe)
  const themeColor = metafieldColor || config?.color || '#00f5ff'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('home'),
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('worlds'),
        item: `${SITE_URL}/worlds`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: universeName,
        item: `${SITE_URL}/worlds/${universe}`,
      },
    ],
  }

  return (
    <>
      <AccentTheme themeColor={themeColor} />
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
            {t('home')}
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <Link
            href="/worlds"
            className="text-white/50 hover:text-white transition-colors"
          >
            {t('worlds')}
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
