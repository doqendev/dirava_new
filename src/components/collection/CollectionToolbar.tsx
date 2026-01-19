'use client'

import { hasActiveFilters, type FilterState } from '@/lib/utils/filters'
import { MobileFilterButton } from './CollectionFilters'
import { CollectionSort } from './CollectionSort'
import { CollectionViewToggle } from './CollectionViewToggle'

interface CollectionToolbarProps {
  filters: FilterState
  themeColor: string
  basePath: string
  currentParams: Record<string, string>
}

export function CollectionToolbar({
  filters,
  themeColor,
  basePath,
  currentParams,
}: CollectionToolbarProps) {
  const hasFilters = hasActiveFilters(filters)

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <MobileFilterButton
          themeColor={themeColor}
          hasFilters={hasFilters}
        />
        <CollectionSort
          currentSort={filters.sort}
          themeColor={themeColor}
          basePath={basePath}
          currentParams={currentParams}
        />
      </div>
      <CollectionViewToggle themeColor={themeColor} />
    </div>
  )
}
