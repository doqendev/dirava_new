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
    variantName?: string | null
    price: { amount: string; currencyCode: string }
    compareAtPrice?: { amount: string; currencyCode: string } | null
    image: { url: string; altText: string | null } | null
    variantId?: string
  }
  universe?: string
  showQuickView?: boolean
  compactMode?: boolean
  themeColor?: string
  className?: string
}

export function ProductCard({
  product,
  universe,
  showQuickView = true,
  compactMode = false,
  themeColor,
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

  const variantQuery = product.variantName
    ? `?variant=${encodeURIComponent(product.variantName)}`
    : ''
  const productUrl = universe
    ? `/worlds/${universe}/${product.handle}${variantQuery}`
    : `/products/${product.handle}${variantQuery}`

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView({ handle: product.handle, universe, variantName: product.variantName || undefined })
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
          !themeColor && 'hover:border-neon-cyan/50 hover:shadow-glow-sm-cyan',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'
        )}
        style={themeColor ? {
          '--card-theme': themeColor,
        } as React.CSSProperties : undefined}
        onMouseEnter={(e) => {
          if (themeColor) {
            e.currentTarget.style.borderColor = `${themeColor}80`
            e.currentTarget.style.boxShadow = `0 0 10px ${themeColor}66`
          }
        }}
        onMouseLeave={(e) => {
          if (themeColor) {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.boxShadow = ''
          }
        }}
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

          {/* Action Buttons — horizontal row on all breakpoints */}
          <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex gap-1 md:gap-1.5">
            {/* Quick View Button */}
            {showQuickView && (
              <motion.button
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : undefined,
                  scale: isHovered ? 1 : undefined,
                }}
                transition={{ duration: 0.15 }}
                onClick={handleQuickView}
                className={cn(
                  'w-7 h-7 md:w-8 md:h-8 rounded-full md:rounded-lg',
                  'flex items-center justify-center',
                  'transition-all duration-200',
                  'bg-black/50 backdrop-blur-sm text-white/80 hover:text-white',
                  'md:bg-white/90 md:text-black md:hover:bg-white md:backdrop-blur-none',
                  'md:opacity-0 md:scale-[0.8] md:group-hover:opacity-100 md:group-hover:scale-100'
                )}
                aria-label={t('quickView')}
              >
                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </motion.button>
            )}

            {/* Wishlist Button — sized to match eye button */}
            <motion.div
              initial={false}
              animate={{
                opacity: isHovered ? 1 : undefined,
                scale: isHovered ? 1 : undefined,
              }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className={cn(
                'md:opacity-0 md:scale-[0.8] md:group-hover:opacity-100 md:group-hover:scale-100 md:transition-all md:duration-150',
                '[&>button]:w-7 [&>button]:h-7 md:[&>button]:w-8 md:[&>button]:h-8',
                '[&>button]:rounded-full md:[&>button]:rounded-lg'
              )}
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
            <h3
              className={cn('text-sm font-medium text-white truncate transition-colors', !themeColor && 'group-hover:text-neon-cyan')}
              style={themeColor && isHovered ? { color: themeColor } : undefined}
            >
              {product.variantName
                ? `${product.title} – ${product.variantName}`
                : product.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-sm font-mono" style={{ color: themeColor || '#00f5ff' }}>
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
