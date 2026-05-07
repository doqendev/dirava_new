'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Check, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import {
  PRODUCT_TYPE_OPTIONS,
  type ProductTypeFilter,
  type FilterState,
  hasActiveFilters,
} from '@/lib/utils/filters'

export interface UniverseFilterOption {
  slug: string
  name: string
  color: string
}

interface CollectionFiltersProps {
  filters: FilterState
  priceRange: { min: number; max: number }
  themeColor: string
  productCount: number
  basePath: string
  currentParams: Record<string, string>
  currencyCode?: string
  hideProductTypeFilter?: boolean
  universeOptions?: UniverseFilterOption[]
}

function getCurrencySymbol(currencyCode = 'EUR'): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0)
    return parts.find((part) => part.type === 'currency')?.value || currencyCode
  } catch {
    return currencyCode
  }
}

// Filter Checkbox Component
function FilterCheckbox({
  checked,
  onToggle,
  label,
  themeColor,
}: {
  checked: boolean
  onToggle: () => void
  label: string
  themeColor: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 py-1.5 cursor-pointer group w-full text-left"
    >
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          'transition-all duration-200',
          checked ? 'border-transparent' : 'border-white/30 group-hover:border-white/50'
        )}
        style={{
          backgroundColor: checked ? themeColor : 'transparent',
          boxShadow: checked ? `0 0 10px ${themeColor}50` : 'none',
        }}
      >
        {checked && <Check className="w-3 h-3 text-black" />}
      </div>
      <span
        className={cn(
          'text-sm transition-colors',
          checked ? 'text-white' : 'text-white/70 group-hover:text-white'
        )}
      >
        {label}
      </span>
    </button>
  )
}

// Collapsible Filter Section
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
    <div className="border-b border-white/10 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-white text-sm uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-white/50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Price Range Slider
function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  themeColor,
  currencyCode,
  t,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  themeColor: string
  currencyCode?: string
  t: ReturnType<typeof useTranslations>
}) {
  const [localMin, setLocalMin] = useState(value[0])
  const [localMax, setLocalMax] = useState(value[1])
  const currencySymbol = getCurrencySymbol(currencyCode)
  const range = Math.max(max - min, 1)

  // Sync with external value
  useEffect(() => {
    setLocalMin(value[0])
    setLocalMax(value[1])
  }, [value])

  const handleMinChange = (newMin: number) => {
    const clamped = Math.min(newMin, localMax - 1)
    setLocalMin(clamped)
  }

  const handleMaxChange = (newMax: number) => {
    const clamped = Math.max(newMax, localMin + 1)
    setLocalMax(clamped)
  }

  const handleBlur = () => {
    onChange([localMin, localMax])
  }

  return (
    <div className="space-y-4">
      {/* Price Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-white/50 mb-1 block">{t('min')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              onBlur={handleBlur}
              min={min}
              max={max}
              className="w-full pl-7 pr-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>
        <span className="text-white/30 mt-5">—</span>
        <div className="flex-1">
          <label className="text-xs text-white/50 mb-1 block">{t('max')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
              {currencySymbol}
            </span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              onBlur={handleBlur}
              min={min}
              max={max}
              className="w-full pl-7 pr-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>
      </div>

      {/* Range Slider (visual only, inputs are primary) */}
      <div className="relative h-2">
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${((localMin - min) / range) * 100}%`,
            right: `${100 - ((localMax - min) / range) * 100}%`,
            backgroundColor: themeColor,
          }}
        />
      </div>
    </div>
  )
}

// Desktop Sidebar Filters
function DesktopFilters({
  filters,
  priceRange,
  themeColor,
  productCount,
  onFilterChange,
  onClearFilters,
  hideProductTypeFilter,
  universeOptions,
  currencyCode,
  t,
}: {
  filters: FilterState
  priceRange: { min: number; max: number }
  themeColor: string
  productCount: number
  onFilterChange: (key: string, value: unknown) => void
  onClearFilters: () => void
  hideProductTypeFilter?: boolean
  universeOptions?: UniverseFilterOption[]
  currencyCode?: string
  t: ReturnType<typeof useTranslations>
}) {
  const toggleProductType = (type: ProductTypeFilter) => {
    const current = filters.productTypes
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    onFilterChange('types', newTypes.length > 0 ? newTypes.join(',') : null)
  }

  const toggleUniverse = (slug: string) => {
    const current = filters.universes
    const next = current.includes(slug)
      ? current.filter((u) => u !== slug)
      : [...current, slug]
    onFilterChange('universes', next.length > 0 ? next.join(',') : null)
  }

  const hasFilters = hasActiveFilters(filters)

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-4">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-white/70" />
              <span className="font-medium text-white">{t('title')}</span>
            </div>
            {hasFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-white/50 hover:text-[color:var(--accent,#00f5ff)] transition-colors"
              >
                {t('clearAll')}
              </button>
            )}
          </div>

          {/* Product count */}
          <p className="text-sm text-white/50 mb-4">
            {productCount} {productCount === 1 ? t('product') : t('products')}
          </p>

          {/* Product Type */}
          {!hideProductTypeFilter && (
            <FilterSection title={t('productType')}>
              <div className="space-y-1">
                {/* Apparel Group */}
                <p className="text-xs text-white/40 uppercase tracking-wider mt-2 mb-1">
                  {t('apparel')}
                </p>
                {PRODUCT_TYPE_OPTIONS.filter((opt) => opt.group === 'Apparel').map(
                  (option) => (
                    <FilterCheckbox
                      key={option.value}
                      checked={filters.productTypes.includes(option.value)}
                      onToggle={() => toggleProductType(option.value)}
                      label={option.label}
                      themeColor={themeColor}
                    />
                  )
                )}

                {/* Other Products */}
                <p className="text-xs text-white/40 uppercase tracking-wider mt-4 mb-1">
                  {t('accessories')}
                </p>
                {PRODUCT_TYPE_OPTIONS.filter((opt) => !opt.group).map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    checked={filters.productTypes.includes(option.value)}
                    onToggle={() => toggleProductType(option.value)}
                    label={option.label}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Universe (World) */}
          {universeOptions && universeOptions.length > 0 && (
            <FilterSection title={t('world')}>
              <div className="space-y-1">
                {universeOptions.map((option) => (
                  <FilterCheckbox
                    key={option.slug}
                    checked={filters.universes.includes(option.slug)}
                    onToggle={() => toggleUniverse(option.slug)}
                    label={option.name}
                    themeColor={option.color}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title={t('priceRange')}>
            <PriceRangeSlider
              min={priceRange.min}
              max={priceRange.max}
              value={[filters.priceMin, filters.priceMax]}
              onChange={([min, max]) => {
                onFilterChange('priceMin', min > 0 ? String(min) : null)
                onFilterChange('priceMax', max < priceRange.max ? String(max) : null)
              }}
              themeColor={themeColor}
              currencyCode={currencyCode}
              t={t}
            />
          </FilterSection>
        </div>
      </div>
    </div>
  )
}

// Mobile Filter Drawer
function MobileFilterDrawer({
  filters,
  priceRange,
  themeColor,
  productCount,
  onFilterChange,
  onClearFilters,
  onClose,
  hideProductTypeFilter,
  universeOptions,
  currencyCode,
  t,
}: {
  filters: FilterState
  priceRange: { min: number; max: number }
  themeColor: string
  productCount: number
  onFilterChange: (key: string, value: unknown) => void
  onClearFilters: () => void
  onClose: () => void
  hideProductTypeFilter?: boolean
  universeOptions?: UniverseFilterOption[]
  currencyCode?: string
  t: ReturnType<typeof useTranslations>
}) {
  const toggleProductType = (type: ProductTypeFilter) => {
    const current = filters.productTypes
    const newTypes = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    onFilterChange('types', newTypes.length > 0 ? newTypes.join(',') : null)
  }

  const toggleUniverse = (slug: string) => {
    const current = filters.universes
    const next = current.includes(slug)
      ? current.filter((u) => u !== slug)
      : [...current, slug]
    onFilterChange('universes', next.length > 0 ? next.join(',') : null)
  }

  const hasFilters = hasActiveFilters(filters)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-bg-primary border-r border-border-subtle z-50 overflow-y-auto"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" style={{ color: themeColor }} />
              <span className="font-display text-lg text-white">{t('title')}</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Product count */}
          <p className="text-sm text-white/50 mb-4">
            {productCount} {productCount === 1 ? t('product') : t('products')}
          </p>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-neon-cyan hover:text-[color:var(--accent,#00f5ff)]/80 mb-4 transition-colors"
            >
              {t('clearAllFilters')}
            </button>
          )}

          {/* Product Type */}
          {!hideProductTypeFilter && (
            <FilterSection title={t('productType')}>
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-wider mt-2 mb-1">
                  {t('apparel')}
                </p>
                {PRODUCT_TYPE_OPTIONS.filter((opt) => opt.group === 'Apparel').map(
                  (option) => (
                    <FilterCheckbox
                      key={option.value}
                      checked={filters.productTypes.includes(option.value)}
                      onToggle={() => toggleProductType(option.value)}
                      label={option.label}
                      themeColor={themeColor}
                    />
                  )
                )}

                <p className="text-xs text-white/40 uppercase tracking-wider mt-4 mb-1">
                  {t('accessories')}
                </p>
                {PRODUCT_TYPE_OPTIONS.filter((opt) => !opt.group).map((option) => (
                  <FilterCheckbox
                    key={option.value}
                    checked={filters.productTypes.includes(option.value)}
                    onToggle={() => toggleProductType(option.value)}
                    label={option.label}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Universe (World) */}
          {universeOptions && universeOptions.length > 0 && (
            <FilterSection title={t('world')}>
              <div className="space-y-1">
                {universeOptions.map((option) => (
                  <FilterCheckbox
                    key={option.slug}
                    checked={filters.universes.includes(option.slug)}
                    onToggle={() => toggleUniverse(option.slug)}
                    label={option.name}
                    themeColor={option.color}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Price Range */}
          <FilterSection title={t('priceRange')}>
            <PriceRangeSlider
              min={priceRange.min}
              max={priceRange.max}
              value={[filters.priceMin, filters.priceMax]}
              onChange={([min, max]) => {
                onFilterChange('priceMin', min > 0 ? String(min) : null)
                onFilterChange('priceMax', max < priceRange.max ? String(max) : null)
              }}
              themeColor={themeColor}
              currencyCode={currencyCode}
              t={t}
            />
          </FilterSection>

          {/* Apply button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-lg font-display text-sm tracking-wider"
            style={{
              backgroundColor: themeColor,
              color: 'black',
            }}
          >
            {t('applyFilters')}
          </button>
        </div>
      </motion.div>
    </>
  )
}

export function CollectionFilters({
  filters,
  priceRange,
  themeColor,
  productCount,
  basePath,
  currentParams,
  currencyCode,
  hideProductTypeFilter,
  universeOptions,
}: CollectionFiltersProps) {
  const t = useTranslations('filters')
  const { isFilterDrawerOpen, closeFilterDrawer } = useUIStore()

  const updateFilters = (key: string, value: unknown) => {
    const params = new URLSearchParams(currentParams)

    if (value === null || value === undefined || value === '') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }

    const queryString = params.toString()
    window.location.href = queryString ? `${basePath}?${queryString}` : basePath
  }

  const clearFilters = () => {
    window.location.href = basePath
  }

  return (
    <>
      {/* Desktop Filters */}
      <DesktopFilters
        filters={filters}
        priceRange={priceRange}
        themeColor={themeColor}
        productCount={productCount}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
        hideProductTypeFilter={hideProductTypeFilter}
        universeOptions={universeOptions}
        currencyCode={currencyCode}
        t={t}
      />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <MobileFilterDrawer
            filters={filters}
            priceRange={priceRange}
            themeColor={themeColor}
            productCount={productCount}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
            onClose={closeFilterDrawer}
            hideProductTypeFilter={hideProductTypeFilter}
            universeOptions={universeOptions}
            currencyCode={currencyCode}
            t={t}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Mobile Filter Button (for toolbar)
export function MobileFilterButton({
  themeColor,
  hasFilters,
}: {
  themeColor: string
  hasFilters: boolean
}) {
  const t = useTranslations('filters')
  const { openFilterDrawer } = useUIStore()

  return (
    <button
      onClick={openFilterDrawer}
      className={cn(
        'lg:hidden flex items-center gap-2 px-4 py-2',
        'bg-bg-card border border-border-subtle rounded-lg',
        'text-white text-sm',
        'transition-all duration-200',
        hasFilters && 'border-opacity-100'
      )}
      style={{
        borderColor: hasFilters ? themeColor : undefined,
      }}
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span>{t('title')}</span>
      {hasFilters && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeColor }}
        />
      )}
    </button>
  )
}
