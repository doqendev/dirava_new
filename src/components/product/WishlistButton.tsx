'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useWishlistStore } from '@/stores/wishlistStore'
import type { WishlistItem } from '@/types/wishlist'

interface WishlistButtonProps {
  product: Omit<WishlistItem, 'addedAt'>
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showOnHover?: boolean
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function WishlistButton({
  product,
  variant = 'icon',
  size = 'md',
  className,
  showOnHover = false,
}: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlistStore()
  const [isInList, setIsInList] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Sync with store on mount and when productId changes
  useEffect(() => {
    setIsInList(isInWishlist(product.productId))
  }, [product.productId, isInWishlist])

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useWishlistStore.subscribe((state) => {
      setIsInList(state.items.some((item) => item.productId === product.productId))
    })
    return unsubscribe
  }, [product.productId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)
    toggleItem(product)

    setTimeout(() => setIsAnimating(false), 300)
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'px-4 py-2 rounded-lg',
          'font-display tracking-wider uppercase text-sm',
          'transition-all duration-200',
          isInList
            ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50'
            : 'bg-bg-card border border-border-subtle text-white hover:border-neon-pink/50 hover:text-neon-pink',
          className
        )}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={cn(iconSizes[size], isInList && 'fill-current')}
          />
        </motion.div>
        <span>{isInList ? 'Saved' : 'Save'}</span>
      </button>
    )
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        sizeStyles[size],
        'rounded-lg flex items-center justify-center',
        'transition-all duration-200',
        isInList
          ? 'bg-neon-pink text-white'
          : 'bg-black/60 backdrop-blur-sm text-white/70 hover:text-neon-pink hover:bg-black/80',
        showOnHover && 'opacity-0 group-hover:opacity-100',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isInList ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(iconSizes[size], isInList && 'fill-current')}
        />
      </motion.div>
    </motion.button>
  )
}
