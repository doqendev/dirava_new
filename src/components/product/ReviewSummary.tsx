'use client'

import { StarRating } from '@/components/product/StarRating'
import { cn } from '@/lib/utils/cn'
import type { ReviewRating } from '@/types/reviews'

interface ReviewSummaryProps {
  rating: ReviewRating
  showBreakdown?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Universe accent color for stars + breakdown bars (defaults to yellow). */
  color?: string
}

export function ReviewSummary({
  rating,
  showBreakdown = false,
  size = 'md',
  className,
  color,
}: ReviewSummaryProps) {
  const { averageRating, reviewCount, ratingBreakdown } = rating

  // Don't show anything if there are no reviews
  if (reviewCount === 0) {
    return null
  }

  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Main rating display */}
      <div className="flex items-center gap-2">
        <StarRating rating={averageRating} size={size} color={color} />
        <span
          className={cn(
            'text-white/60',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {averageRating.toFixed(1)} ({formatReviewCount(reviewCount)}{' '}
          {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {/* Rating breakdown bars */}
      {showBreakdown && ratingBreakdown && (
        <div className="mt-4 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star as keyof typeof ratingBreakdown] || 0
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-white/60 w-6">{star}★</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      !color && 'bg-yellow-400'
                    )}
                    style={{
                      width: `${percentage}%`,
                      ...(color ? { backgroundColor: color } : {}),
                    }}
                  />
                </div>
                <span className="text-xs text-white/40 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
