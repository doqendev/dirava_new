'use client'

import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SORT_OPTIONS, type SortOption } from '@/lib/utils/filters'

// Map sort option values to translation keys
const SORT_TRANSLATION_KEYS: Record<SortOption, string> = {
  featured: 'featured',
  'price-asc': 'priceLowHigh',
  'price-desc': 'priceHighLow',
  newest: 'newest',
  az: 'nameAZ',
}

interface CollectionSortProps {
  currentSort: SortOption
  themeColor: string
  basePath: string
  currentParams: Record<string, string>
}

export function CollectionSort({
  currentSort,
  basePath,
  currentParams,
}: CollectionSortProps) {
  const t = useTranslations('filters')

  const handleSortChange = (newSort: SortOption) => {
    const params = new URLSearchParams(currentParams)

    if (newSort === 'featured') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }

    const queryString = params.toString()
    window.location.href = queryString ? `${basePath}?${queryString}` : basePath
  }

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value as SortOption)}
        className={cn(
          'appearance-none cursor-pointer',
          'pl-4 pr-10 py-2',
          'bg-bg-card border border-border-subtle rounded-lg',
          'text-white text-sm',
          'focus:outline-none focus:border-neon-cyan',
          'transition-colors duration-200'
        )}
        style={{
          minWidth: '180px',
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-bg-primary text-white"
          >
            {t(SORT_TRANSLATION_KEYS[option.value])}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
    </div>
  )
}
