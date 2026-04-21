'use client'

import { useTranslations } from 'next-intl'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils/cn'

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
  /**
   * Accent color for every card on this section.
   * Set to the *current page's* product universe color so the whole page
   * reads in one tone — recommended cards inherit the page's palette.
   */
  themeColor?: string
}

export function YouMightAlsoLike({
  products,
  className,
  themeColor,
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
        {products.map((product) => (
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
            themeColor={themeColor}
            showQuickView={!!product.variantId}
          />
        ))}
      </div>
    </section>
  )
}
