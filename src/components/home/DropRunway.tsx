'use client'

import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'

interface DropProduct {
  id: string
  handle: string
  title: string
  price: { amount: string; currencyCode: string }
  image: { url: string; altText: string | null } | null
  universe: string | null
}

interface DropRunwayProps {
  products: DropProduct[]
  titleKey?: 'newArrivals' | 'dropRunway' | 'bestSellers'
  className?: string
}

export function DropRunway({
  products,
  titleKey = 'dropRunway',
  className,
}: DropRunwayProps) {
  const t = useTranslations('home')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  const updateScrollState = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    setScrollProgress(scrollLeft / (scrollWidth - clientWidth))
  }

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollState)
      updateScrollState()
    }
    return () => {
      scrollContainer?.removeEventListener('scroll', updateScrollState)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = direction === 'left' ? -200 : 200
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className={cn('py-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="font-display text-sm tracking-[3px] text-white/60 uppercase">
            {t(titleKey)}
          </h2>

          {/* Navigation arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg',
                'border border-border-subtle',
                'text-white/50 hover:text-white hover:border-neon-cyan',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg',
                'border border-border-subtle',
                'text-white/50 hover:text-white hover:border-neon-cyan',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-3 overflow-x-auto px-4',
            'snap-x-mandatory hide-scrollbar'
          )}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex-shrink-0 w-40 snap-start"
            >
              <ProductCard product={product} t={t} />
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="px-4 mt-4">
          <div className="h-0.5 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neon-cyan rounded-full"
              style={{ width: `${Math.max(20, scrollProgress * 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Product Card Component
function ProductCard({ product, t }: { product: DropProduct; t: ReturnType<typeof useTranslations> }) {
  const [isHovered, setIsHovered] = useState(false)
  const tProduct = useTranslations('product')

  // Build the product URL - use universe path if available, otherwise fallback to /products
  const productUrl = product.universe
    ? `/worlds/${product.universe}/${product.handle}`
    : `/products/${product.handle}`

  return (
    <Link
      href={productUrl}
      className={cn(
        'block rounded-xl overflow-hidden',
        'bg-gradient-to-br from-white/5 via-transparent to-white/5',
        'border border-border-subtle',
        'transition-all duration-200',
        'hover:border-neon-cyan/50 hover:shadow-glow-sm-cyan',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-bg-secondary">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.altText || product.title}
            fill
            className="object-cover"
            sizes="160px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            {tProduct('noImage')}
          </div>
        )}

        {/* Quick add button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute top-2 right-2',
            'px-2 py-1 rounded-md',
            'bg-neon-cyan text-black',
            'text-[10px] font-bold',
            'flex items-center gap-1',
            'hover:bg-neon-cyan/90'
          )}
          onClick={(e) => {
            e.preventDefault()
            // TODO: Quick add to cart functionality
          }}
        >
          <Plus className="w-3 h-3" />
          {t('add')}
        </motion.button>

        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-holographic opacity-20 pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="text-sm font-medium text-white truncate">
          {product.title}
        </h3>
        <p className="text-sm font-mono text-neon-cyan">
          {formatPrice(product.price.amount, product.price.currencyCode)}
        </p>
      </div>
    </Link>
  )
}

// Loading skeleton
export function DropRunwaySkeleton() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="w-32 h-4 skeleton" />
          <div className="flex gap-2">
            <div className="w-8 h-8 skeleton rounded-lg" />
            <div className="w-8 h-8 skeleton rounded-lg" />
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40">
              <div className="aspect-square skeleton rounded-xl" />
              <div className="mt-2 h-4 skeleton w-3/4" />
              <div className="mt-1 h-4 skeleton w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
