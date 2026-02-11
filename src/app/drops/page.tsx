import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Clock, Flame } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_DROP_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes, getFirstAvailableVariant } from '@/lib/shopify/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import type { ShopifyProduct } from '@/types/shopify'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')

  return {
    title: t('dropsTitle'),
    description: t('dropsDescription'),
    keywords: t('keywords'),
    openGraph: {
      title: t('dropsTitle'),
      description: t('dropsDescription'),
      type: 'website',
      siteName: t('siteName'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('dropsTitle'),
      description: t('dropsDescription'),
    },
  }
}

export const revalidate = 60

interface DropProduct extends ShopifyProduct {
  metafield?: { value: string } | null
  dropDate?: { value: string } | null
}

async function getDropProducts() {
  try {
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: DropProduct }> }
    }>(GET_DROP_PRODUCTS, { first: 20 })

    const products = extractNodes(data.products)

    // Filter for actual drops and map
    return products
      .filter((product) => product.metafield?.value === 'true')
      .map((product) => {
        const firstVariant = getFirstAvailableVariant(product)
        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          price: product.priceRange.minVariantPrice,
          compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
          image: product.featuredImage,
          variantId: firstVariant?.id,
          dropDate: product.dropDate?.value,
        }
      })
  } catch (error) {
    console.error('Failed to fetch drop products:', error)
    return []
  }
}

async function DropsContent() {
  const products = await getDropProducts()
  const t = await getTranslations('drops')

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-secondary mb-4">
          <Clock className="w-8 h-8 text-white/30" />
        </div>
        <h2 className="font-display text-xl text-white mb-2">{t('noActiveDrops')}</h2>
        <p className="text-white/60 max-w-md mx-auto">
          {t('noActiveDropsDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showQuickView={!!product.variantId}
        />
      ))}
    </div>
  )
}

export default async function DropsPage() {
  const t = await getTranslations('drops')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 bg-neon-pink" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 bg-neon-orange" />

        <div className="relative px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-neon-orange" />
            <Badge variant="orange" glow>{t('limited')}</Badge>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider">
            <span className="text-neon-pink">{t('exclusive')}</span>{' '}
            <span className="text-white">{t('dropsWord')}</span>
          </h1>

          <p className="mt-4 text-white/60 max-w-lg mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-6">
        <div className="px-4 max-w-7xl mx-auto">
          <Suspense fallback={<SkeletonProductGrid count={8} />}>
            <DropsContent />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
