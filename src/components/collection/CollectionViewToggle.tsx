'use client'

import { LayoutGrid, Grid2X2, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore, type GridColumns } from '@/stores/uiStore'

interface CollectionViewToggleProps {
  themeColor: string
}

const columnOptions: Array<{
  cols: GridColumns
  icon: React.ComponentType<{ className?: string }>
  label: string
}> = [
  { cols: 1, icon: LayoutGrid, label: '2 columns (large)' },
  { cols: 2, icon: Grid2X2, label: '4 columns' },
  { cols: 3, icon: Grid3X3, label: '4 columns (compact)' },
]

export function CollectionViewToggle({ themeColor }: CollectionViewToggleProps) {
  const gridColumns = useUIStore((state) => state.gridColumns)
  const setGridColumns = useUIStore((state) => state.setGridColumns)

  return (
    <div className="flex items-center bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
      {columnOptions.map(({ cols, icon: Icon, label }) => {
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
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
