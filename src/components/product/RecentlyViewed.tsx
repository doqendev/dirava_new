'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore'
import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils/cn'

interface RecentlyViewedProps {
  excludeProductId?: string
  maxItems?: number
  title?: string
  className?: string
  /**
   * Accent color forced on every card (e.g. the current page's product
   * universe color), so the whole page reads in one tone.
   */
  themeColor?: string
}

export function RecentlyViewed({
  excludeProductId,
  maxItems = 8,
  title,
  className,
  themeColor,
}: RecentlyViewedProps) {
  const t = useTranslations('product')
  const [mounted, setMounted] = useState(false)
  const items = useRecentlyViewedStore((state) => state.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter and limit items
  const displayItems = items
    .filter((item) => item.productId !== excludeProductId)
    .slice(0, maxItems)

  // Don't render until mounted (hydration safety)
  if (!mounted || displayItems.length === 0) {
    return null
  }

  return (
    <section className={cn('w-full', className)}>
      <h2 className="font-display text-xl md:text-2xl text-white mb-6 tracking-wide">
        {title ?? t('recentlyViewed')}
      </h2>

      <div className="relative">
        {/* Horizontal scroll container on mobile, grid on larger screens */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {displayItems.map((item) => (
            <div
              key={item.productId}
              className="flex-shrink-0 w-[200px] snap-start md:w-auto"
            >
              <ProductCard
                product={{
                  id: item.productId,
                  handle: item.handle,
                  title: item.title,
                  price: item.price,
                  compareAtPrice: item.compareAtPrice,
                  image: item.image,
                  variantId: item.variantId,
                }}
                universe={item.universe}
                themeColor={themeColor}
                showQuickView={!!item.variantId}
              />
            </div>
          ))}
        </div>

        {/* Fade edges on mobile for scroll indication */}
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none md:hidden" />
      </div>
    </section>
  )
}
