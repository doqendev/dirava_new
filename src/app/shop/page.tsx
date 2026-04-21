import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/utils/siteUrl'
import { PRODUCT_TYPE_OPTIONS, type ProductTypeFilter } from '@/lib/utils/filters'
import { getCategoryPreviews } from '@/lib/shop/getCategoryPreviews'
import { ShopHubHero } from '@/components/shop/ShopHubHero'
import { CategoryCard } from '@/components/shop/CategoryCard'

export const revalidate = 3600

const TYPE_THEMES: Record<ProductTypeFilter, { color: string; glow: string }> = {
  'hoodies': { color: '#ff00aa', glow: 'rgba(255, 0, 170, 0.35)' },
  'tshirts': { color: '#00f5ff', glow: 'rgba(0, 245, 255, 0.35)' },
  'name-signs': { color: '#ffa500', glow: 'rgba(255, 165, 0, 0.35)' },
  'keychains': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.35)' },
  'magnets': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.35)' },
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('shopByType')
  const tSeo = await getTranslations('seo')

  return {
    title: t('hubMetaTitle'),
    description: t('hubMetaDescription'),
    alternates: { canonical: `${SITE_URL}/shop` },
    openGraph: {
      title: t('hubMetaTitle'),
      description: t('hubMetaDescription'),
      type: 'website',
      siteName: tSeo('siteName'),
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function ShopHubPage() {
  const t = await getTranslations('shopByType')
  const tHub = await getTranslations('shopByType.hub')
  const previews = await getCategoryPreviews()

  return (
    <div className="min-h-screen">
      <section className="pt-6 px-4 max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/" className="text-white/50 hover:text-white transition-colors">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="w-4 h-4 text-white/30" />
          <span className="text-neon-cyan">{t('hubTitle')}</span>
        </nav>

        <ShopHubHero
          eyebrow={tHub('eyebrow')}
          title={tHub('title')}
        />
      </section>

      <section className="pb-12 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {PRODUCT_TYPE_OPTIONS.map((option, index) => {
            const theme = TYPE_THEMES[option.value]
            const preview = previews.get(option.value)
            return (
              <CategoryCard
                key={option.value}
                href={`/shop/${option.value}`}
                title={t(`types.${option.value}.title`)}
                subtitle={t(`types.${option.value}.subtitle`)}
                color={theme.color}
                glow={theme.glow}
                itemCount={preview?.count ?? 0}
                itemsLabel={tHub('items')}
                enterLabel={tHub('enter')}
                heroImage={preview?.heroImage}
                index={index}
              />
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/worlds"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[color:var(--accent,#00f5ff)] transition-colors"
          >
            {tHub('crosslink')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
