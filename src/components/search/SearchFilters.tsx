'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

export interface SearchFiltersValue {
  priceRange: [number, number]
  universes: string[]
  productTypes: string[]
}

interface SearchFiltersProps {
  availableUniverses: Array<{ value: string; label: string; count: number }>
  availableProductTypes: Array<{ value: string; label: string; count: number }>
  minPrice: number
  maxPrice: number
  filters: SearchFiltersValue
  onFiltersChange: (filters: SearchFiltersValue) => void
  totalResults: number
  filteredResults: number
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-subtle py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
  const [localMin, setLocalMin] = useState(value[0])
  const [localMax, setLocalMax] = useState(value[1])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localMax - 1)
    setLocalMin(newMin)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localMin + 1)
    setLocalMax(newMax)
  }

  const handleBlur = () => {
    onChange([localMin, localMax])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-white/50 mb-1 block">Min</label>
          <input
            type="number"
            min={min}
            max={max}
            value={localMin}
            onChange={handleMinChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-white focus:outline-none focus:border-neon-cyan"
          />
        </div>
        <span className="text-white/30 mt-5">-</span>
        <div className="flex-1">
          <label className="text-xs text-white/50 mb-1 block">Max</label>
          <input
            type="number"
            min={min}
            max={max}
            value={localMax}
            onChange={handleMaxChange}
            onBlur={handleBlur}
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-white focus:outline-none focus:border-neon-cyan"
          />
        </div>
      </div>
      {/* Visual slider */}
      <div className="relative h-2 bg-bg-secondary rounded-full">
        <div
          className="absolute h-full bg-neon-cyan/50 rounded-full"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: Array<{ value: string; label: string; count?: number }>
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className={cn(
              'w-4 h-4 rounded border transition-colors duration-200',
              selected.includes(option.value)
                ? 'bg-neon-cyan border-neon-cyan'
                : 'border-border-subtle group-hover:border-white/50'
            )}
          >
            {selected.includes(option.value) && (
              <svg
                className="w-4 h-4 text-black"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M6.5 11.5L3 8l1-1 2.5 2.5L11 5l1 1-5.5 5.5z" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggleOption(option.value)}
            className="sr-only"
          />
          <span className="text-sm text-white/70 group-hover:text-white flex-1">
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="text-xs text-white/40">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  )
}

export function SearchFilters({
  availableUniverses,
  availableProductTypes,
  minPrice,
  maxPrice,
  filters,
  onFiltersChange,
  totalResults,
  filteredResults,
}: SearchFiltersProps) {
  const t = useTranslations('filters')
  const hasActiveFilters =
    filters.priceRange[0] > minPrice ||
    filters.priceRange[1] < maxPrice ||
    filters.universes.length > 0 ||
    filters.productTypes.length > 0

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [minPrice, maxPrice],
      universes: [],
      productTypes: [],
    })
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm font-medium text-white">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-neon-cyan hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="py-3 text-xs text-white/50">
        Showing {filteredResults} of {totalResults} results
      </div>

      {/* Price Range */}
      <FilterSection title={t('priceRange')}>
        <PriceRangeSlider
          min={minPrice}
          max={maxPrice}
          value={filters.priceRange}
          onChange={(priceRange) =>
            onFiltersChange({ ...filters, priceRange })
          }
        />
      </FilterSection>

      {/* Universe */}
      {availableUniverses.length > 0 && (
        <FilterSection title={t('world')}>
          <CheckboxGroup
            options={availableUniverses}
            selected={filters.universes}
            onChange={(universes) =>
              onFiltersChange({ ...filters, universes })
            }
          />
        </FilterSection>
      )}

      {/* Product Type */}
      {availableProductTypes.length > 0 && (
        <FilterSection title={t('productType')}>
          <CheckboxGroup
            options={availableProductTypes}
            selected={filters.productTypes}
            onChange={(productTypes) =>
              onFiltersChange({ ...filters, productTypes })
            }
          />
        </FilterSection>
      )}

      {/* Active filters pills */}
      {hasActiveFilters && (
        <div className="pt-4 flex flex-wrap gap-2">
          {filters.priceRange[0] > minPrice && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-neon-cyan/10 text-neon-cyan rounded-full">
              Min: ${filters.priceRange[0]}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [minPrice, filters.priceRange[1]],
                  })
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priceRange[1] < maxPrice && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-neon-cyan/10 text-neon-cyan rounded-full">
              Max: ${filters.priceRange[1]}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], maxPrice],
                  })
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.universes.map((universe) => (
            <span
              key={universe}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-neon-pink/10 text-neon-pink rounded-full"
            >
              {universe.replace(/-/g, ' ')}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    universes: filters.universes.filter((u) => u !== universe),
                  })
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.productTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-neon-green/10 text-neon-green rounded-full"
            >
              {type}
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    productTypes: filters.productTypes.filter((t) => t !== type),
                  })
                }
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile filter drawer trigger
export function MobileFilterButton({
  onClick,
  activeCount,
}: {
  onClick: () => void
  activeCount: number
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="lg:hidden"
    >
      <SlidersHorizontal className="w-4 h-4 mr-2" />
      Filters
      {activeCount > 0 && (
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-neon-cyan text-black rounded-full">
          {activeCount}
        </span>
      )}
    </Button>
  )
}
