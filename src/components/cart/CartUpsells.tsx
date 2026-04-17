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
    <div className="pt-2 pb-2 border-t border-border-subtle">
      <h3 className="px-4 text-[10px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
        {t('youMightLike')}
      </h3>
      <div
        className="flex gap-1.5 overflow-x-auto overflow-y-hidden px-4 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.slice(0, 8).map((product) => {
          const productUrl = product.universe
            ? `/worlds/${product.universe}/${product.handle}`
            : `/products/${product.handle}`

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-[64px] group"
              title={product.title}
            >
              <Link
                href={productUrl}
                onClick={onClose}
                className={cn(
                  'relative block aspect-square rounded-md overflow-hidden',
                  'bg-bg-secondary border border-border-subtle',
                  'group-hover:border-neon-cyan/40 transition-colors'
                )}
              >
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.altText || product.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-bg-secondary" />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleQuickView(product)
                  }}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 backdrop-blur-sm text-white/80 hover:text-neon-cyan hover:bg-black/80 transition-colors"
                  aria-label={t('quickView')}
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </Link>
              <p className="mt-1 text-[9px] font-mono text-neon-cyan text-center leading-tight">
                {formatPrice(product.price.amount, product.price.currencyCode)}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
