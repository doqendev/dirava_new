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
      setIsLoading(true)

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
      setIsLoading(false)
    }
  }, [cartLines.length, detectedUniverse, excludeIds])

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
    <div className="px-4 py-3 border-t border-border-subtle">
      <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
        {t('youMightLike')}
      </h3>
      <div className="flex gap-3">
        {products.map((product) => {
          const productUrl = product.universe
            ? `/worlds/${product.universe}/${product.handle}`
            : `/products/${product.handle}`

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <div className={cn(
                'rounded-lg overflow-hidden',
                'bg-bg-secondary border border-border-subtle',
                'hover:border-neon-cyan/30 transition-colors'
              )}>
                {/* Image */}
                <Link
                  href={productUrl}
                  onClick={onClose}
                  className="block relative aspect-square"
                >
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.altText || product.title}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary" />
                  )}
                </Link>

                {/* Info */}
                <div className="p-2">
                  <Link
                    href={productUrl}
                    onClick={onClose}
                    className="block"
                  >
                    <h4 className="text-xs text-white truncate hover:text-neon-cyan transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-xs font-mono text-neon-cyan mt-0.5">
                      {formatPrice(product.price.amount, product.price.currencyCode)}
                    </p>
                  </Link>

                  {/* Quick View button */}
                  <button
                    onClick={() => handleQuickView(product)}
                    className={cn(
                      'w-full mt-2 py-1.5 rounded text-xs font-medium',
                      'flex items-center justify-center gap-1',
                      'transition-all duration-200',
                      'bg-white/5 text-white/70 hover:bg-neon-cyan/20 hover:text-neon-cyan border border-transparent hover:border-neon-cyan/30'
                    )}
                  >
                    <Eye className="w-3 h-3" />
                    {t('quickView')}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
