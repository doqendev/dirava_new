import { Suspense } from 'react'
import { UniverseGrid, UniverseGridSkeleton } from '@/components/home/UniverseGrid'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSES } from '@/lib/shopify/queries'
import { extractNodes, getCollectionUniverse, getCollectionProductCount } from '@/lib/shopify/utils'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import type { ShopifyCollection } from '@/types/shopify'
import type { UniverseColorName } from '@/types/universe'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mizoke.com'
  return {
    title: t('worldsTitle'),
    description: t('worldsDescription'),
    alternates: {
      canonical: `${siteUrl}/worlds`,
    },
    openGraph: {
      title: t('worldsTitle'),
      description: t('worldsDescription'),
      images: [`${siteUrl}/opengraph-image`],
    },
  }
}

export const revalidate = 60

// Valid universe slugs - derived from UNIVERSE_CONFIG
const VALID_UNIVERSES = Object.keys(UNIVERSE_CONFIG)

async function getUniverses() {
  try {
    const data = await shopifyFetch<{
      collections: { edges: Array<{ node: ShopifyCollection }> }
    }>(GET_UNIVERSES)

    const collections = extractNodes(data.collections)

    // Filter to only collections with a valid universe metafield
    return collections
      .filter((collection) => {
        const universeValue = getCollectionUniverse(collection)
        return universeValue && VALID_UNIVERSES.includes(universeValue)
      })
      .map((collection) => {
        const universeSlug = getCollectionUniverse(collection)!
        const config = UNIVERSE_CONFIG[universeSlug as keyof typeof UNIVERSE_CONFIG]

        return {
          slug: collection.handle,
          name: config?.name || collection.title,
          itemCount: getCollectionProductCount(collection),
          themeColor: (config?.colorName || 'cyan') as UniverseColorName,
          backgroundImage: collection.image?.url,
        }
      })
  } catch (error) {
    console.error('Failed to fetch universes:', error)
    return []
  }
}

async function UniversesContent() {
  const universes = await getUniverses()
  return <UniverseGrid universes={universes} />
}

export default async function WorldsPage() {
  const t = await getTranslations('worlds')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8 lg:py-12">
        <div className="px-4 max-w-7xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider">
            {t('exploreTitle')} <span className="text-neon-cyan text-glow-cyan">{t('worldsHighlight')}</span>
          </h1>
          <p className="mt-4 text-white/60 max-w-md mx-auto">
            {t('exploreDescription')}
          </p>
        </div>
      </section>

      {/* Universe Grid */}
      <Suspense fallback={<UniverseGridSkeleton />}>
        <UniversesContent />
      </Suspense>
    </div>
  )
}
