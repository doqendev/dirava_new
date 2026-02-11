'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ProductCard } from '@/components/product/ProductCard'
import { SearchFilters, type SearchFiltersValue, MobileFilterButton } from '@/components/search/SearchFilters'
import { Button } from '@/components/ui/Button'

interface SearchProduct {
  id: string
  handle: string
  title: string
  price: { amount: string; currencyCode: string }
  compareAtPrice?: { amount: string; currencyCode: string } | null
  image: { url: string; altText: string | null } | null
  variantId?: string
  universe?: string | null
  productType?: string | null
}

interface SearchResultsClientProps {
  products: SearchProduct[]
  query: string
}

export function SearchResultsClient({ products, query }: SearchResultsClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Calculate price range from products
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 1000 }
    const prices = products.map((p) => parseFloat(p.price.amount))
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    }
  }, [products])

  // Extract available universes with counts
  const availableUniverses = useMemo(() => {
    const universeCounts = new Map<string, number>()
    products.forEach((p) => {
      if (p.universe) {
        universeCounts.set(p.universe, (universeCounts.get(p.universe) || 0) + 1)
      }
    })
    return Array.from(universeCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  // Extract available product types with counts
  const availableProductTypes = useMemo(() => {
    const typeCounts = new Map<string, number>()
    products.forEach((p) => {
      if (p.productType) {
        typeCounts.set(p.productType, (typeCounts.get(p.productType) || 0) + 1)
      }
    })
    return Array.from(typeCounts.entries())
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  // Initialize filters state
  const [filters, setFilters] = useState<SearchFiltersValue>({
    priceRange: [minPrice, maxPrice],
    universes: [],
    productTypes: [],
  })

  // Reset filters when price range changes (new search)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [minPrice, maxPrice],
    }))
  }, [minPrice, maxPrice])

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = parseFloat(product.price.amount)

      // Price filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false
      }

      // Universe filter
      if (filters.universes.length > 0) {
        if (!product.universe || !filters.universes.includes(product.universe)) {
          return false
        }
      }

      // Product type filter
      if (filters.productTypes.length > 0) {
        if (!product.productType || !filters.productTypes.includes(product.productType)) {
          return false
        }
      }

      return true
    })
  }, [products, filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.priceRange[0] > minPrice) count++
    if (filters.priceRange[1] < maxPrice) count++
    count += filters.universes.length
    count += filters.productTypes.length
    return count
  }, [filters, minPrice, maxPrice])

  // Close mobile filter on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileFilterOpen(false)
    }

    if (isMobileFilterOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isMobileFilterOpen])

  if (!query) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 text-lg">Enter a search term to find products</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-xl text-white mb-2">No results found</h2>
        <p className="text-white/60">
          No products match &quot;{query}&quot;. Try a different search term.
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-8">
      {/* Desktop Filters Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <SearchFilters
            availableUniverses={availableUniverses}
            availableProductTypes={availableProductTypes}
            minPrice={minPrice}
            maxPrice={maxPrice}
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={products.length}
            filteredResults={filteredProducts.length}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Filter Button & Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/60 text-sm">
            {filteredProducts.length} of {products.length} result
            {products.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>
          <MobileFilterButton
            onClick={() => setIsMobileFilterOpen(true)}
            activeCount={activeFilterCount}
          />
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">
              No products match your current filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  priceRange: [minPrice, maxPrice],
                  universes: [],
                  productTypes: [],
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                universe={product.universe || undefined}
                showQuickView
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed top-0 left-0 z-50',
                'w-full max-w-sm h-full',
                'bg-bg-primary border-r border-border-subtle',
                'flex flex-col lg:hidden'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-neon-cyan" />
                  <span className="font-display text-lg text-white">FILTERS</span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <SearchFilters
                  availableUniverses={availableUniverses}
                  availableProductTypes={availableProductTypes}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalResults={products.length}
                  filteredResults={filteredProducts.length}
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border-subtle">
                <Button
                  variant="primary"
                  glow="cyan"
                  className="w-full"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Show {filteredProducts.length} Results
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
