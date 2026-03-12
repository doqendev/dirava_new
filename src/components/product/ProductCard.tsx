'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { WishlistButton } from '@/components/product/WishlistButton'
import { useUIStore } from '@/stores/uiStore'

interface ProductCardProps {
  product: {
    id: string
    handle: string
    title: string
    price: { amount: string; currencyCode: string }
    compareAtPrice?: { amount: string; currencyCode: string } | null
    image: { url: string; altText: string | null } | null
    variantId?: string
  }
  universe?: string
  showQuickView?: boolean
  compactMode?: boolean
  className?: string
}

export function ProductCard({
  product,
  universe,
  showQuickView = true,
  compactMode = false,
  className,
}: ProductCardProps) {
  const t = useTranslations('product')
  const [isHovered, setIsHovered] = useState(false)

  const openQuickView = useUIStore((state) => state.openQuickView)

  const hasDiscount =
    product.compareAtPrice &&
    parseFloat(product.compareAtPrice.amount) > parseFloat(product.price.amount)

  const discountPercent = hasDiscount
    ? Math.round(
        ((parseFloat(product.compareAtPrice!.amount) - parseFloat(product.price.amount)) /
          parseFloat(product.compareAtPrice!.amount)) *
          100
      )
    : 0

  const productUrl = universe
    ? `/worlds/${universe}/${product.handle}`
    : `/products/${product.handle}`

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView({ handle: product.handle, universe })
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={productUrl}
        className={cn(
          'block rounded-xl overflow-hidden',
          'bg-bg-card border border-border-subtle',
          'transition-all duration-300',
          'hover:border-neon-cyan/50 hover:shadow-glow-sm-cyan',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-bg-secondary overflow-hidden">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <span>{t('noImage')}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {/* Quick View Button */}
            {showQuickView && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8,
                }}
                transition={{ duration: 0.15 }}
                onClick={handleQuickView}
                className={cn(
                  'w-8 h-8 rounded-lg',
                  'flex items-center justify-center',
                  'transition-colors duration-200',
                  'bg-white/90 text-black hover:bg-white'
                )}
                aria-label={t('quickView')}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            )}

            {/* Wishlist Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              <WishlistButton
                product={{
                  productId: product.id,
                  variantId: product.variantId || '',
                  handle: product.handle,
                  title: product.title,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  image: product.image,
                  universe,
                }}
                size="sm"
              />
            </motion.div>
          </div>

          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-holographic opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Product Info - Hidden in compact mode */}
        {!compactMode && (
          <div className="p-3">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-neon-cyan transition-colors">
              {product.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-sm font-mono text-neon-cyan">
                {formatPrice(product.price.amount, product.price.currencyCode)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs font-mono text-white/40 line-through">
                    {formatPrice(
                      product.compareAtPrice!.amount,
                      product.compareAtPrice!.currencyCode
                    )}
                  </span>
                  <span className="px-1 py-0.5 text-[10px] font-medium bg-red-500/90 text-white rounded">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
