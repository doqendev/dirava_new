'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SORT_OPTIONS, type SortOption } from '@/lib/utils/filters'

interface CollectionSortProps {
  currentSort: SortOption
  themeColor: string
}

export function CollectionSort({ currentSort }: CollectionSortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      const params = new URLSearchParams(searchParams.toString())

      if (newSort === 'featured') {
        params.delete('sort')
      } else {
        params.set('sort', newSort)
      }

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [router, pathname, searchParams]
  )

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
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
    </div>
  )
}
