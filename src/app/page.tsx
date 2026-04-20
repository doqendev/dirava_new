import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { HeroSection } from '@/components/home/HeroSection'
import { UniverseGrid, UniverseGridSkeleton } from '@/components/home/UniverseGrid'
import { DropRunway, DropRunwaySkeleton } from '@/components/home/DropRunway'
import { TrustBadges } from '@/components/home/TrustBadges'
import { AboutIntro } from '@/components/home/AboutIntro'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSES, GET_DROP_PRODUCTS, GET_NEW_ARRIVALS, GET_BEST_SELLERS } from '@/lib/shopify/queries'
import { getCountry } from '@/i18n/country'
import { extractNodes, getCollectionUniverse, getCollectionProductCount } from '@/lib/shopify/utils'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import { SITE_URL } from '@/lib/utils/siteUrl'
import type { ShopifyCollection, ShopifyProduct } from '@/types/shopify'
import type { UniverseColorName } from '@/types/universe'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: SITE_URL,
    },
  }
}

// Revalidate every 60 seconds
export const revalidate = 60

// Valid universe slugs
const VALID_UNIVERSES = ['one-piece', 'demon-slayer', 'dragon-ball', 'hunter-hunter', 'attack-on-titan', 'digimon', 'jujutsu-kaisen', 'bleach']

async function getUniverses() {
  try {
    const data = await shopifyFetch<{
      collections: { edges: Array<{ node: ShopifyCollection & { themeColor?: { value: string } | null } }> }
    }>(GET_UNIVERSES)

    const collections = extractNodes(data.collections)

    // Filter to only collections with a valid universe metafield
    const universes = collections
      .filter((collection) => {
        const universeValue = getCollectionUniverse(collection)
        return universeValue && VALID_UNIVERSES.includes(universeValue)
      })
      .map((collection) => {
        const universeSlug = getCollectionUniverse(collection)!
        const config = UNIVERSE_CONFIG[universeSlug as keyof typeof UNIVERSE_CONFIG]
        const metafieldColor = (collection as ShopifyCollection & { themeColor?: { value: string } | null }).themeColor?.value

        return {
          slug: collection.handle,
          name: config?.name || collection.title,
          itemCount: getCollectionProductCount(collection),
          themeColor: (config?.colorName || 'cyan') as UniverseColorName,
          themeColorHex: metafieldColor || undefined,
          backgroundImage: collection.image?.url,
        }
      })

    return universes
  } catch (error) {
    console.error('Failed to fetch universes:', error)
    return []
  }
}

async function getDropProducts() {
  try {
    const country = await getCountry()
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct & {
        metafield?: { value: string } | null
        universe?: { value: string } | null
      } }> }
    }>(GET_DROP_PRODUCTS, { first: 10, country })

    const products = extractNodes(data.products)

    // Filter products that are drops
    return products
      .filter((product) => product.metafield?.value === 'true')
      .map((product) => ({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        image: product.featuredImage,
        universe: product.universe?.value || null,
      }))
  } catch (error) {
    console.error('Failed to fetch drop products:', error)
    return []
  }
}

async function getNewArrivals() {
  try {
    const country = await getCountry()
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct & {
        universe?: { value: string } | null
      } }> }
    }>(GET_NEW_ARRIVALS, { first: 12, country })

    const products = extractNodes(data.products)

    return products.map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
      price: product.priceRange.minVariantPrice,
      image: product.featuredImage,
      universe: product.universe?.value || null,
    }))
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error)
    return []
  }
}

async function getBestSellers() {
  try {
    const country = await getCountry()
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProduct & {
        isBestseller?: { value: string } | null
        universe?: { value: string } | null
      } }> }
    }>(GET_BEST_SELLERS, { first: 20, country })

    const products = extractNodes(data.products)

    // Filter to products with is_bestseller metafield
    return products
      .filter((product) => product.isBestseller?.value === 'true')
      .slice(0, 12)
      .map((product) => ({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice,
        image: product.featuredImage,
        universe: product.universe?.value || null,
      }))
  } catch (error) {
    console.error('Failed to fetch best sellers:', error)
    return []
  }
}

async function UniversesSection() {
  const universes = await getUniverses()
  return <UniverseGrid universes={universes} />
}

async function NewArrivalsSection() {
  const products = await getNewArrivals()
  if (products.length === 0) return null
  return <DropRunway products={products} titleKey="newArrivals" />
}

async function DropsSection() {
  const products = await getDropProducts()
  if (products.length === 0) return null
  return <DropRunway products={products} titleKey="dropRunway" />
}

async function BestSellersSection() {
  const products = await getBestSellers()
  if (products.length === 0) return null
  return <DropRunway products={products} titleKey="bestSellers" />
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-visible">
      <HeroSection />

      <Suspense fallback={<UniverseGridSkeleton />}>
        <UniversesSection />
      </Suspense>

      <Suspense fallback={<DropRunwaySkeleton />}>
        <NewArrivalsSection />
      </Suspense>

      <Suspense fallback={<DropRunwaySkeleton />}>
        <DropsSection />
      </Suspense>

      <Suspense fallback={<DropRunwaySkeleton />}>
        <BestSellersSection />
      </Suspense>

      <AboutIntro />

      <TrustBadges />

    </div>
  )
}
