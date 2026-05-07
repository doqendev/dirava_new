'use client'

import { Star } from 'lucide-react'
import type { ReviewRating } from '@/types/reviews'

interface RatingOrdersChipProps {
  rating?: ReviewRating | null
  productHandle: string
  accent?: string
}

const ORDER_COUNT_LABEL = '1k+'

/**
 * Compact chip shown right below the product title:
 *   Star 4.8 - 1k+ orders
 * Star average is real (from reviews); order count is a fixed display
 * label used across every product.
 */
export function RatingOrdersChip({ rating, accent = '#22c55e' }: RatingOrdersChipProps) {
  const hasReviews = (rating?.reviewCount ?? 0) > 0

  if (!hasReviews) {
    // No real reviews yet: surface social proof as orders only,
    // never fake a rating. Reads as a confidence signal without
    // implying a 0.0 score the product hasn't earned.
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
        <Star className="h-4 w-4" style={{ color: accent, fill: accent }} />
        <span>
          Trusted by <strong className="text-white">{ORDER_COUNT_LABEL}</strong>
        </span>
      </div>
    )
  }

  const showAvg = rating!.averageRating.toFixed(1)
  return (
    <div className="mt-3 flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1.5">
        <Star className="h-4 w-4" style={{ color: accent, fill: accent }} />
        <span className="font-semibold text-white">{showAvg}</span>
      </div>
      <span className="h-4 w-px bg-white/15" aria-hidden />
      <span className="text-white/70">
        <strong className="text-white">{ORDER_COUNT_LABEL}</strong> orders
      </span>
    </div>
  )
}
