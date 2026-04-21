'use client'

import { useTranslations } from 'next-intl'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils/cn'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'

interface RecommendedProduct {
  id: string
  handle: string
  title: string
  price: { amount: string; currencyCode: string }
  compareAtPrice?: { amount: string; currencyCode: string } | null
  image: { url: string; altText: string | null } | null
  variantId?: string
  universe?: string | null
}

interface YouMightAlsoLikeProps {
  products: RecommendedProduct[]
  className?: string
}

export function YouMightAlsoLike({
  products,
  className,
}: YouMightAlsoLikeProps) {
  const t = useTranslations('product')

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={cn('w-full', className)}>
      <h2 className="font-display text-xl md:text-2xl text-white mb-6 tracking-wide">
        {t('youMightAlsoLike')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {products.map((product) => {
          const cardThemeColor =
            UNIVERSE_CONFIG[product.universe as keyof typeof UNIVERSE_CONFIG]?.color
          return (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.image,
                variantId: product.variantId,
              }}
              universe={product.universe || undefined}
              themeColor={cardThemeColor}
              showQuickView={!!product.variantId}
            />
          )
        })}
      </div>
    </section>
  )
}
