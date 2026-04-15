'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, PackageX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { ProductCard } from '@/components/product/ProductCard'
import {
  filterAndSortProducts,
  hasActiveFilters,
  type FilterState,
} from '@/lib/utils/filters'

interface Product {
  id: string
  handle: string
  title: string
  variantName?: string | null
  price: { amount: string; currencyCode: string }
  compareAtPrice?: { amount: string; currencyCode: string } | null
  image: { url: string; altText: string | null } | null
  variantId?: string
  rarity?: 'common' | 'rare' | 'legendary' | null
  productType?: string
  tags?: string[]
  createdAt?: string
  universe?: string | null
}

interface CollectionGridProps {
  products: Product[]
  universe?: string
  filters: FilterState
  themeColor: string
}

const ITEMS_PER_PAGE = 12

export function CollectionGrid({
  products,
  universe,
  filters,
  themeColor,
}: CollectionGridProps) {
  const gridColumns = useUIStore((state) => state.gridColumns)

  // Grid option 3 = compact mode (4 columns, no details)
  const compactMode = gridColumns === 3

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters)
  }, [products, filters])

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [filters])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          displayCount < filteredProducts.length &&
          !isLoadingMore
        ) {
          setIsLoadingMore(true)
          // Simulate loading delay for smoother UX
          setTimeout(() => {
            setDisplayCount((prev) =>
              Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length)
            )
            setIsLoadingMore(false)
          }, 300)
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [displayCount, filteredProducts.length, isLoadingMore])

  const visibleProducts = filteredProducts.slice(0, displayCount)
  const hasMore = displayCount < filteredProducts.length
  const hasFiltersActive = hasActiveFilters(filters)

  // Grid column classes:
  // Option 1: 1 column mobile / 2 columns desktop (largest cards)
  // Option 2: 2 columns mobile / 4 columns desktop (default)
  // Option 3: 2 columns mobile / 4 columns desktop compact (no details)
  const gridClasses = cn(
    'grid gap-4',
    gridColumns === 1 && 'grid-cols-1 lg:grid-cols-2',
    gridColumns === 2 && 'grid-cols-2 lg:grid-cols-4',
    gridColumns === 3 && 'grid-cols-2 lg:grid-cols-4',
    // Default to option 2 (4 columns)
    !gridColumns && 'grid-cols-2 lg:grid-cols-4'
  )

  // Empty state
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-20 h-20 mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}20` }}
        >
          <PackageX className="w-10 h-10" style={{ color: themeColor }} />
        </div>
        {hasFiltersActive ? (
          <>
            <h3 className="text-lg font-display text-white mb-2">
              No products match your filters
            </h3>
            <p className="text-white/50 text-sm max-w-md">
              Try adjusting your filters or clearing them to see more products.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-display text-white mb-2">
              No products available
            </h3>
            <p className="text-white/50 text-sm max-w-md">
              Check back soon for new drops in this collection!
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Product Grid */}
      <motion.div className={gridClasses} layout>
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index < ITEMS_PER_PAGE ? index * 0.05 : 0,
              }}
            >
              <ProductCard
                product={product}
                universe={universe || product.universe || undefined}
                showQuickView={!!product.variantId}
                compactMode={compactMode}
                themeColor={themeColor}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Trigger / Loading Indicator */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-3">
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: themeColor }}
              />
              <span className="text-white/50 text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center py-8">
          <span className="text-white/30 text-sm">
            Showing all {filteredProducts.length} products
          </span>
        </div>
      )}
    </div>
  )
}
