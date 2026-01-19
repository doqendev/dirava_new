'use client'

import { LayoutGrid, Grid2X2, Grid3X3, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore, type GridColumns } from '@/stores/uiStore'

interface CollectionViewToggleProps {
  themeColor: string
}

const columnIcons: Record<GridColumns, React.ComponentType<{ className?: string }>> = {
  1: LayoutGrid,
  2: Grid2X2,
  3: Grid3X3,
}

export function CollectionViewToggle({ themeColor }: CollectionViewToggleProps) {
  const gridColumns = useUIStore((state) => state.gridColumns)
  const setGridColumns = useUIStore((state) => state.setGridColumns)
  const showProductInfo = useUIStore((state) => state.showProductInfo)
  const toggleProductInfo = useUIStore((state) => state.toggleProductInfo)

  return (
    <div className="flex items-center gap-2">
      {/* Grid Column Toggles */}
      <div className="flex items-center bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
        {([1, 2, 3] as GridColumns[]).map((cols) => {
          const Icon = columnIcons[cols]
          const isActive = gridColumns === cols

          return (
            <button
              key={cols}
              onClick={() => setGridColumns(cols)}
              className={cn(
                'w-9 h-9 flex items-center justify-center',
                'transition-all duration-200',
                isActive ? 'text-black' : 'text-white/50 hover:text-white'
              )}
              style={{
                backgroundColor: isActive ? themeColor : 'transparent',
              }}
              title={`${cols} column${cols > 1 ? 's' : ''}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      {/* Show/Hide Product Info Toggle */}
      <button
        onClick={toggleProductInfo}
        className={cn(
          'w-9 h-9 flex items-center justify-center',
          'bg-bg-card border border-border-subtle rounded-lg',
          'transition-all duration-200',
          showProductInfo ? 'text-white/50 hover:text-white' : 'text-white/50'
        )}
        style={{
          borderColor: !showProductInfo ? themeColor : undefined,
          color: !showProductInfo ? themeColor : undefined,
        }}
        title={showProductInfo ? 'Hide product info' : 'Show product info'}
      >
        {showProductInfo ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
