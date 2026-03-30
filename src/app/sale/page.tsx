import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, Tag } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_ALL_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes } from '@/lib/shopify/utils'
import {
  CollectionFilters,
  CollectionGrid,
  CollectionToolbar,
} from '@/components/collection'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import {
  parseFiltersFromParams,
  calculatePriceRange,
} from '@/lib/utils/filters'
import type { ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/utils/siteUrl'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')

  return {
    title: t('saleTitle'),
    description: t('saleDescription'),
    keywords: t('keywords'),
    alternates: {
      canonical: `${SITE_URL}/sale`,
    },
    openGraph: {
      title: t('saleTitle'),
      description: t('saleDescription'),
      type: 'website',
      siteName: t('siteName'),
      images: [`${SITE_URL}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('saleTitle'),
      description: t('saleDescription'),
    },
  }
}

export const revalidate = 60

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getSaleProducts() {
  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct & { universe?: { value: string } | null } }> }
    }>(GET_ALL_PRODUCTS, {
      first: 250,
    })

    const allProducts = extractNodes(data.products)

    // Filter to only products on sale (compareAtPrice > price)
    const saleProducts = allProducts.filter((product) => {
      const price = parseFloat(product.priceRange.minVariantPrice.amount)
      const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
        : null

      return compareAtPrice && compareAtPrice > price
    })

    return saleProducts.map((product) => {
      const price = parseFloat(product.priceRange.minVariantPrice.amount)
      const compareAtPrice = parseFloat(product.compareAtPriceRange!.minVariantPrice.amount)
      const discountPercent = Math.round(((compareAtPrice - price) / compareAtPrice) * 100)

      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
        image: product.featuredImage,
        universe: product.universe?.value || null,
        productType: product.productType,
        tags: product.tags,
        createdAt: product.createdAt,
        discountPercent,
      }
    }).sort((a, b) => b.discountPercent - a.discountPercent) // Sort by biggest discount first
  } catch (error) {
    console.error('Failed to fetch sale products:', error)
    return []
  }
}

async function SaleContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const products = await getSaleProducts()
  const t = await getTranslations('salePage')

  const themeColor = '#ff2d6a' // Pink/red for sale

  // Parse filters from URL
  const filters = parseFiltersFromParams(searchParams)

  // Calculate price range from products
  const priceRange = calculatePriceRange(products)

  // Prepare URL data for client components
  const basePath = '/sale'
  const currentParams: Record<string, string> = {}
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      currentParams[key] = value
    } else if (Array.isArray(value) && value.length > 0 && value[0]) {
      currentParams[key] = value[0]
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <Tag className="w-10 h-10 text-white/30" />
        </div>
        <h2 className="text-xl font-display text-white mb-2">{t('noSaleItems')}</h2>
        <p className="text-white/50 mb-6">
          {t('noSaleItemsDescription')}
        </p>
        <Link
          href="/worlds"
          className="inline-flex items-center px-6 py-3 bg-neon-cyan text-black font-semibold rounded-lg hover:bg-neon-cyan/90 transition-colors"
        >
          {t('browseAllProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar Filters */}
      <CollectionFilters
        filters={filters}
        priceRange={priceRange}
        themeColor={themeColor}
        productCount={products.length}
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
          products={products}
          filters={filters}
          themeColor={themeColor}
        />
      </div>
    </div>
  )
}

function SaleSkeleton() {
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
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="h-10 w-44 bg-bg-secondary rounded-lg skeleton" />
          <div className="h-10 w-32 bg-bg-secondary rounded-lg skeleton" />
        </div>
        <SkeletonProductGrid count={12} />
      </div>
    </div>
  )
}

export default async function SalePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const t = await getTranslations('salePage')

  return (
    <div className="min-h-screen">
      {/* Hero Header Section */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        {/* Gradient mesh blobs */}
        <div className="absolute top-0 left-1/4 w-[450px] h-[220px] rounded-full blur-[110px] opacity-25 bg-[#ff2d6a]" />
        <div className="absolute top-4 right-1/4 w-[380px] h-[180px] rounded-full blur-[90px] opacity-20 bg-[#ff8c00]" />

        {/* Subtle diagonal accent line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(125deg, transparent, transparent 60px, rgba(255,107,53,0.03) 60px, rgba(255,107,53,0.03) 61px)',
          }}
        />

        <div className="relative px-4 max-w-7xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm mb-5">
            <Link
              href="/"
              className="text-white/50 hover:text-white transition-colors"
            >
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-neon-orange">{t('title')}</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/5 border border-[#ff6b35]/30 text-sm font-medium text-[#ff8c00]">
            <Tag className="w-4 h-4" />
            {t('saleBadge')}
          </div>

          {/* Title */}
          <h1
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider uppercase bg-gradient-to-r from-[#ff2d6a] via-[#ff6b35] to-[#ff8c00] bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(255, 107, 53, 0.25)',
            }}
          >
            {t('title')}
          </h1>

          <p className="mt-4 text-white/60 max-w-lg mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-6 px-4 max-w-7xl mx-auto">
        <Suspense fallback={<SaleSkeleton />}>
          <SaleContent searchParams={resolvedSearchParams} />
        </Suspense>
      </section>
    </div>
  )
}
