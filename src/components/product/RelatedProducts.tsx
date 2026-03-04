'use client'

import { useTranslations } from 'next-intl'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils/cn'

interface RelatedProduct {
  id: string
  handle: string
  title: string
  price: { amount: string; currencyCode: string }
  compareAtPrice?: { amount: string; currencyCode: string } | null
  image: { url: string; altText: string | null } | null
  variantId?: string
}

interface RelatedProductsProps {
  products: RelatedProduct[]
  universe: string
  title?: string
  className?: string
}

export function RelatedProducts({
  products,
  universe,
  title,
  className,
}: RelatedProductsProps) {
  const t = useTranslations('product')

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={cn('w-full', className)}>
      <h2 className="font-display text-xl md:text-2xl text-white mb-6 tracking-wide">
        {title ?? t('relatedProducts')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
            universe={universe}
            showQuickView={!!product.variantId}
          />
        ))}
      </div>
    </section>
  )
}
