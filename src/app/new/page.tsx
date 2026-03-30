import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronRight, Rocket } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_NEW_ARRIVALS } from '@/lib/shopify/queries'
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
    title: t('newArrivalsTitle'),
    description: t('newArrivalsDescription'),
    keywords: t('keywords'),
    alternates: {
      canonical: `${SITE_URL}/new`,
    },
    openGraph: {
      title: t('newArrivalsTitle'),
      description: t('newArrivalsDescription'),
      type: 'website',
      siteName: t('siteName'),
      images: [`${SITE_URL}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('newArrivalsTitle'),
      description: t('newArrivalsDescription'),
    },
  }
}

export const revalidate = 60

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getNewArrivals() {
  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct & { universe?: { value: string } | null } }> }
    }>(GET_NEW_ARRIVALS, {
      first: 100,
    })

    const products = extractNodes(data.products)

    return products.map((product) => ({
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
    }))
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error)
    return []
  }
}

async function NewArrivalsContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const products = await getNewArrivals()

  const themeColor = '#7c3aed' // Purple for new arrivals

  // Parse filters from URL
  const filters = parseFiltersFromParams(searchParams)

  // Calculate price range from products
  const priceRange = calculatePriceRange(products)

  // Prepare URL data for client components
  const basePath = '/new'
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

function NewArrivalsSkeleton() {
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

export default async function NewArrivalsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams
  const t = await getTranslations('newArrivalsPage')

  return (
    <div className="min-h-screen">
      {/* Hero Header Section */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        {/* Aurora mesh blobs */}
        <div className="absolute top-0 left-1/4 w-[350px] h-[180px] rounded-full blur-[100px] opacity-20 bg-[#00f5ff]" />
        <div className="absolute top-0 right-1/4 w-[350px] h-[180px] rounded-full blur-[100px] opacity-20 bg-[#a855f7]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[250px] h-[120px] rounded-full blur-[80px] opacity-15 bg-[#3b82f6]" />

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
            <span className="text-neon-cyan">{t('title')}</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-[#00f5ff]/30 bg-[#00f5ff]/10">
            <Rocket className="w-4 h-4 text-[#00f5ff]" />
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#00f5ff]">
              JUST LANDED
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider uppercase bg-gradient-to-r from-[#00f5ff] via-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 40px rgba(0, 245, 255, 0.25), 0 0 80px rgba(168, 85, 247, 0.15)',
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
        <Suspense fallback={<NewArrivalsSkeleton />}>
          <NewArrivalsContent searchParams={resolvedSearchParams} />
        </Suspense>
      </section>
    </div>
  )
}
