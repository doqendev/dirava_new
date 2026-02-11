'use client'

import { cn } from '@/lib/utils/cn'
import { getStockStatus, getStockStatusColor } from '@/lib/utils/stockStatus'

interface StockIndicatorProps {
  availableForSale: boolean
  quantityAvailable?: number | null
  className?: string
}

export function StockIndicator({
  availableForSale,
  quantityAvailable,
  className,
}: StockIndicatorProps) {
  const { status, label } = getStockStatus(availableForSale, quantityAvailable)
  const color = getStockStatusColor(status)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'relative w-2.5 h-2.5 rounded-full',
          status === 'low_stock' && 'animate-pulse'
        )}
        style={{ backgroundColor: color }}
      >
        {status === 'low_stock' && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: color }}
          />
        )}
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          status === 'out_of_stock' && 'text-red-500'
        )}
        style={{ color: status !== 'out_of_stock' ? color : undefined }}
      >
        {label}
      </span>
    </div>
  )
}
