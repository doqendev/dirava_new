'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import type { ShopifyMoney } from '@/types/shopify'

interface StickyAddToCartProps {
  productTitle: string
  price: ShopifyMoney
  variantId: string
  available: boolean
  requiresPersonalization: boolean
  personalizationValue: string
  onPersonalizationError: () => void
  attributes?: Array<{ key: string; value: string }>
  quantity?: number
  /** Ref to the main Add to Cart area — used to detect when it scrolls out of view */
  cartButtonRef: React.RefObject<HTMLDivElement | null>
}

export function StickyAddToCart({
  productTitle,
  price,
  variantId,
  available,
  requiresPersonalization,
  personalizationValue,
  onPersonalizationError,
  attributes,
  quantity = 1,
  cartButtonRef,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const target = cartButtonRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show the sticky bar after the main purchase block has been
        // scrolled past. If the block is still below the fold on first load,
        // keep the sticky bar hidden.
        if (entry) {
          const hasScrolledPast = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
          setIsVisible(hasScrolledPast)
        }
      },
      { threshold: 0 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [cartButtonRef])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-bg-primary/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-area-pb">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{productTitle}</p>
          <p className="text-neon-cyan font-mono text-sm font-bold">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
        <div className="flex-shrink-0 w-36">
          <AddToCartButton
            variantId={variantId}
            quantity={quantity}
            available={available}
            requiresPersonalization={requiresPersonalization}
            personalizationValue={personalizationValue}
            onPersonalizationError={onPersonalizationError}
            attributes={attributes}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
