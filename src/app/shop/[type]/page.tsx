import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_ALL_PRODUCTS } from '@/lib/shopify/queries'
import { getCountry } from '@/i18n/country'
import {
  CollectionFilters,
  CollectionGrid,
  CollectionToolbar,
} from '@/components/collection'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import {
  parseFiltersFromParams,
  calculatePriceRange,
  filterProducts,
  PRODUCT_TYPE_OPTIONS,
  type ProductTypeFilter,
} from '@/lib/utils/filters'
import { expandProductsToVariantCards } from '@/lib/utils/variantExpansion'
import { UNIVERSE_CONFIG, type UniverseSlug } from '@/lib/utils/constants'
import { getUniverseThemeColors } from '@/lib/shop/getUniverseThemeColors'
import type { ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/utils/siteUrl'

const VALID_TYPES = PRODUCT_TYPE_OPTIONS.map((opt) => opt.value)

const TYPE_THEMES: Record<ProductTypeFilter, { color: string; glow: string }> = {
  'hoodies': { color: '#ff00aa', glow: 'rgba(255, 0, 170, 0.4)' },
  'tshirts': { color: '#00f5ff', glow: 'rgba(0, 245, 255, 0.4)' },
  'name-signs': { color: '#ffa500', glow: 'rgba(255, 165, 0, 0.4)' },
  'keychains': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  'magnets': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
}

function isValidType(type: string): type is ProductTypeFilter {
  return (VALID_TYPES as string[]).includes(type)
}

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params

  if (!isValidType(type)) {
    return { title: 'Not Found' }
  }

  const t = await getTranslations('shopByType')
  const tSeo = await getTranslations('seo')
  const typeLabel = t(`types.${type}.title`)

  return {
    title: t('metaTitle', { type: typeLabel }),
    description: t('metaDescription', { type: typeLabel }),
    alternates: {
      canonical: `${SITE_URL}/shop/${type}`,
    },
    openGraph: {
      title: t('metaTitle', { type: typeLabel }),
      description: t('metaDescription', { type: typeLabel }),
      type: 'website',
      siteName: tSeo('siteName'),
      images: [`${SITE_URL}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle', { type: typeLabel }),
      description: t('metaDescription', { type: typeLabel }),
    },
  }
}

export const revalidate = 60

interface Props {
  params: Promise<{ type: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type ProductWithUniverse = ShopifyProduct & { universe?: { value: string } | null }

interface AllProductsResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
    edges: Array<{ node: ProductWithUniverse }>
  }
}

async function getProductsOfType(type: ProductTypeFilter) {
  try {
    const country = await getCountry()
    const rawProducts: ProductWithUniverse[] = []
    let after: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      const data: AllProductsResponse = await shopifyFetch<AllProductsResponse>(GET_ALL_PRODUCTS, {
        first: 250,
        after,
        country,
      })

      rawProducts.push(...data.products.edges.map((edge) => edge.node))
      after = data.products.pageInfo.endCursor
      hasNextPage = data.products.pageInfo.hasNextPage && Boolean(after)
    }

    // Pre-filter to this product type only (server-side, on raw Shopify shape)
    const matchingProducts = filterProducts(
      rawProducts.map((p) => ({
        price: p.priceRange.minVariantPrice,
        productType: p.productType,
        tags: p.tags,
        // pass-through ref so we can re-select after filter
        _ref: p,
      })),
      {
        productTypes: [type],
        universes: [],
        priceMin: 0,
        priceMax: Number.MAX_SAFE_INTEGER,
        sort: 'featured',
      }
    ).map((p) => (p as unknown as { _ref: typeof rawProducts[number] })._ref)

    // Expand each matching product into per-variant cards (same logic as /worlds)
    return expandProductsToVariantCards(matchingProducts)
  } catch (error) {
    console.error(`Failed to fetch ${type}:`, error)
    return []
  }
}

async function ShopByTypeContent({
  type,
  searchParams,
}: {
  type: ProductTypeFilter
  searchParams: Record<string, string | string[] | undefined>
}) {
  const [products, metafieldColors] = await Promise.all([
    getProductsOfType(type),
    getUniverseThemeColors(),
  ])
  const theme = TYPE_THEMES[type]

  // Parse filters from URL (note: productType filter is not used here since we've
  // already filtered server-side; the sidebar will still show other filters)
  const filters = parseFiltersFromParams(searchParams)

  // Force the productType to this page's type so the sidebar doesn't let users
  // filter to other types on this page
  filters.productTypes = [type]

  const priceRange = calculatePriceRange(products)

  // Compute unique universes present in this category, mapped to display config.
  // Use Shopify metafield (theme_color) as the source of truth for color when
  // available; fall back to static UNIVERSE_CONFIG color.
  const universesInCategory = new Set<string>()
  for (const p of products) {
    if (p.universe) universesInCategory.add(p.universe)
  }
  const universeOptions = Array.from(universesInCategory)
    .filter((slug): slug is UniverseSlug => slug in UNIVERSE_CONFIG)
    .map((slug) => ({
      slug,
      name: UNIVERSE_CONFIG[slug].name,
      color: metafieldColors.get(slug) ?? UNIVERSE_CONFIG[slug].color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const basePath = `/shop/${type}`
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
      <CollectionFilters
        filters={filters}
        priceRange={priceRange}
        themeColor={theme.color}
        productCount={products.length}
        basePath={basePath}
        currentParams={currentParams}
        currencyCode={products[0]?.price.currencyCode}
        hideProductTypeFilter
        universeOptions={universeOptions}
      />

      <div className="flex-1 min-w-0">
        <CollectionToolbar
          filters={filters}
          themeColor={theme.color}
          basePath={basePath}
          currentParams={currentParams}
        />

        <CollectionGrid
          products={products}
          filters={filters}
          themeColor={theme.color}
        />
      </div>
    </div>
  )
}

function ShopByTypeSkeleton() {
  return (
    <div className="flex gap-6">
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

export default async function ShopByTypePage({ params, searchParams }: Props) {
  const { type } = await params

  if (!isValidType(type)) {
    notFound()
  }

  const resolvedSearchParams = await searchParams
  const t = await getTranslations('shopByType')
  const theme = TYPE_THEMES[type]

  return (
    <div className="min-h-screen">
      <section className="pt-6 px-4 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            href="/"
            className="text-white/50 hover:text-white transition-colors"
          >
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <Link
            href="/shop"
            className="text-white/50 hover:text-white transition-colors"
          >
            {t('breadcrumbShop')}
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span style={{ color: theme.color }}>{t(`types.${type}.title`)}</span>
        </nav>

        <h1
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider uppercase mb-2"
          style={{
            color: theme.color,
            textShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow.replace('0.4', '0.2')}`,
          }}
        >
          {t(`types.${type}.title`)}
        </h1>
        <p className="text-white/60 text-sm md:text-base mb-6 max-w-2xl">
          {t(`types.${type}.subtitle`)}
        </p>
      </section>

      <section className="pb-6 px-4 max-w-7xl mx-auto">
        <Suspense fallback={<ShopByTypeSkeleton />}>
          <ShopByTypeContent type={type} searchParams={resolvedSearchParams} />
        </Suspense>
      </section>
    </div>
  )
}
