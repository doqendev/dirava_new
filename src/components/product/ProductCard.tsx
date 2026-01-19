'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import type { Rarity } from '@/types/common'

interface ProductCardProps {
  product: {
    id: string
    handle: string
    title: string
    price: { amount: string; currencyCode: string }
    compareAtPrice?: { amount: string; currencyCode: string } | null
    image: { url: string; altText: string | null } | null
    variantId?: string
    rarity?: Rarity | null
  }
  universe?: string
  showQuickAdd?: boolean
  compactMode?: boolean
  className?: string
}

const rarityColors: Record<Rarity, 'default' | 'purple' | 'yellow'> = {
  common: 'default',
  rare: 'purple',
  legendary: 'yellow',
}

export function ProductCard({
  product,
  universe,
  showQuickAdd = true,
  compactMode = false,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)

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

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId || isAdding) return

    setIsAdding(true)
    try {
      await addItem(product.variantId, 1)
      setIsAdded(true)
      setTimeout(() => {
        setIsAdded(false)
        openCart()
      }, 1000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
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
              <span>No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="pink" size="sm">
                -{discountPercent}%
              </Badge>
            )}
            {product.rarity && product.rarity !== 'common' && (
              <Badge variant={rarityColors[product.rarity]} size="sm">
                {product.rarity}
              </Badge>
            )}
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && product.variantId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.15 }}
              onClick={handleQuickAdd}
              disabled={isAdding}
              className={cn(
                'absolute top-2 right-2',
                'w-8 h-8 rounded-lg',
                'flex items-center justify-center',
                'transition-colors duration-200',
                isAdded
                  ? 'bg-neon-green text-black'
                  : 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
                'disabled:opacity-50'
              )}
              aria-label="Add to cart"
            >
              {isAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-holographic opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Product Info - Hidden in compact mode */}
        {!compactMode && (
          <div className="p-3">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-neon-cyan transition-colors">
              {product.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-mono text-neon-cyan">
                {formatPrice(product.price.amount, product.price.currencyCode)}
              </span>
              {hasDiscount && (
                <span className="text-xs font-mono text-white/40 line-through">
                  {formatPrice(
                    product.compareAtPrice!.amount,
                    product.compareAtPrice!.currencyCode
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
