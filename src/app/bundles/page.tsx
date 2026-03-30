import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Layers } from 'lucide-react'
import { getAllBundles } from '@/data/bundles'
import { resolveBundleProducts } from '@/lib/bundles/resolve'
import { BundleCard } from '@/components/bundles/BundleCard'
import { BundleSkeleton } from '@/components/bundles/BundleSkeleton'
import { BundleHowItWorks } from '@/components/bundles/BundleHowItWorks'
import { Badge } from '@/components/ui/Badge'
import type { BundleResolved } from '@/types/bundle'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/utils/siteUrl'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')

  return {
    title: t('bundlesTitle'),
    description: t('bundlesDescription'),
    keywords: t('keywords'),
    alternates: {
      canonical: `${SITE_URL}/bundles`,
    },
    openGraph: {
      title: t('bundlesTitle'),
      description: t('bundlesDescription'),
      type: 'website',
      siteName: t('siteName'),
      images: [`${SITE_URL}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('bundlesTitle'),
      description: t('bundlesDescription'),
    },
  }
}

export const revalidate = 60

async function BundlesContent() {
  const configs = getAllBundles()
  const t = await getTranslations('bundles')

  const resolvedBundles: BundleResolved[] = []

  const results = await Promise.all(
    configs.map((config) => resolveBundleProducts(config))
  )

  for (const result of results) {
    if (result) resolvedBundles.push(result)
  }

  if (resolvedBundles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-secondary mb-4">
          <Layers className="w-8 h-8 text-white/30" />
        </div>
        <h2 className="font-display text-xl text-white mb-2">{t('noBundles')}</h2>
        <p className="text-white/60 max-w-md mx-auto">
          {t('noBundlesDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {resolvedBundles.map((bundle) => (
        <BundleCard key={bundle.config.id} bundle={bundle} />
      ))}
    </div>
  )
}

export default async function BundlesPage() {
  const t = await getTranslations('bundles')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 bg-neon-orange" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[200px] rounded-full blur-[100px] opacity-20 bg-neon-cyan" />

        <div className="relative px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Layers className="w-6 h-6 text-neon-cyan" />
            <Badge variant="cyan" glow>{t('saveMore')}</Badge>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider">
            <span className="text-neon-orange">{t('combo')}</span>{' '}
            <span className="text-white">{t('bundlesWord')}</span>
          </h1>

          <p className="mt-4 text-white/60 max-w-lg mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="py-6">
        <div className="px-4 max-w-7xl mx-auto">
          <Suspense fallback={<BundleSkeleton />}>
            <BundlesContent />
          </Suspense>
        </div>
      </section>

      {/* How It Works */}
      <BundleHowItWorks />
    </div>
  )
}
