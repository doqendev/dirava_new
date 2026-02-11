'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StarRatingProps {
  rating: number // 0-5, supports decimals
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  // Clamp rating between 0 and maxRating
  const clampedRating = Math.min(Math.max(0, rating), maxRating)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const fillPercentage = Math.min(Math.max(0, clampedRating - index), 1) * 100

          return (
            <div key={index} className="relative">
              {/* Empty star (background) */}
              <Star
                className={cn(sizeClasses[size], 'text-white/20')}
                fill="currentColor"
              />

              {/* Filled star (overlay with clip) */}
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(sizeClasses[size], 'text-yellow-400')}
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showValue && (
        <span className={cn('font-medium text-white/80', textSizeClasses[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
