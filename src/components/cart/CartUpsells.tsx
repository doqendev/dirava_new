'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Eye, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useUIStore } from '@/stores/uiStore'
import type { ShopifyCartLine } from '@/types/shopify'

interface UpsellProduct {
  id: string
  handle: string
  title: string
  price: { amount: string; currencyCode: string }
  image: { url: string; altText: string | null } | null
  universe?: string | null
}

interface CartUpsellsProps {
  cartLines: ShopifyCartLine[]
  onClose: () => void
}

export function CartUpsells({ cartLines, onClose }: CartUpsellsProps) {
  const t = useTranslations('cart')
  const [products, setProducts] = useState<UpsellProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { openQuickView, closeCart } = useUIStore()

  // Get product IDs from cart to exclude
  const excludeIds = useMemo(() =>
    cartLines.map(l => l.merchandise?.product?.id).filter(Boolean),
    [cartLines]
  )

  // Try to detect universe from cart line attributes
  const detectedUniverse = useMemo(() => {
    for (const line of cartLines) {
      const universeAttr = line.attributes?.find(a => a.key === '_universe')
      if (universeAttr?.value) return universeAttr.value
    }
    return null
  }, [cartLines])

  useEffect(() => {
    async function fetchUpsells() {
      // Only show loading spinner on initial fetch, not re-fetches
      if (products.length === 0) {
        setIsLoading(true)
      }

      try {
        const params = new URLSearchParams()
        if (detectedUniverse) {
          params.set('universe', detectedUniverse)
        }
        if (excludeIds.length > 0) {
          params.set('excludeIds', excludeIds.join(','))
        }

        const response = await fetch(`/api/upsells?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Failed to fetch upsells:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (cartLines.length > 0) {
      fetchUpsells()
    } else {
      setProducts([])
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartLines.length, detectedUniverse])

  const handleQuickView = (product: UpsellProduct) => {
    // Close cart drawer first, then open quick view
    closeCart()
    openQuickView({
      handle: product.handle,
      universe: product.universe || undefined
    })
  }

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-t border-border-subtle">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="pt-3 pb-2 border-t border-border-subtle">
      <h3 className="px-4 text-[11px] font-medium text-white/50 uppercase tracking-wider mb-2">
        {t('youMightLike')}
      </h3>
      <div
        className="cart-upsells-scroll flex gap-2 overflow-x-auto overflow-y-hidden px-4 pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.slice(0, 6).map((product) => {
          const productUrl = product.universe
            ? `/worlds/${product.universe}/${product.handle}`
            : `/products/${product.handle}`

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="snap-start flex-shrink-0 w-[110px]"
            >
              <div className={cn(
                'relative rounded-lg overflow-hidden',
                'bg-bg-secondary border border-border-subtle',
                'hover:border-neon-cyan/30 transition-colors'
              )}>
                {/* Thumbnail */}
                <Link
                  href={productUrl}
                  onClick={onClose}
                  className="relative block aspect-square"
                >
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.altText || product.title}
                      fill
                      className="object-cover"
                      sizes="110px"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary" />
                  )}
                </Link>

                {/* Quick View — overlaid on thumb */}
                <button
                  onClick={() => handleQuickView(product)}
                  className="absolute top-1 right-1 p-1 rounded bg-black/60 backdrop-blur-sm text-white/80 hover:text-neon-cyan hover:bg-black/80 transition-colors"
                  title={t('quickView')}
                  aria-label={t('quickView')}
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>

              {/* Info below thumb */}
              <Link
                href={productUrl}
                onClick={onClose}
                className="block mt-1.5"
              >
                <h4 className="text-[11px] text-white truncate hover:text-neon-cyan transition-colors leading-tight">
                  {product.title}
                </h4>
                <p className="text-[10px] font-mono text-neon-cyan mt-0.5">
                  {formatPrice(product.price.amount, product.price.currencyCode)}
                </p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
