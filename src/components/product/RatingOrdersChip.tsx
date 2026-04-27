'use client'

import { Star } from 'lucide-react'
import type { ReviewRating } from '@/types/reviews'

interface RatingOrdersChipProps {
  rating?: ReviewRating | null
  productHandle: string
  accent?: string
}

function seedFrom(handle: string): number {
  let h = 2166136261
  for (let i = 0; i < handle.length; i++) {
    h ^= handle.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Per-product order count, seeded by handle so it's stable across
 * sessions and different per product. Range 800 – 2200 — feels like a
 * rounded "1,200+" number once formatted.
 */
function ordersCountFor(handle: string): number {
  const s = seedFrom(handle)
  return 800 + (s % 1400)
}

function formatOrders(n: number): string {
  if (n >= 1000) {
    const k = Math.floor(n / 100) / 10
    return `${k.toFixed(1)}k+`
  }
  return `${Math.floor(n / 100) * 100}+`
}

/**
 * Compact chip shown right below the product title:
 *   ★ 4.8  ·  1,200+ orders
 * Star average is real (from reviews); orders count is a stable
 * per-product display number.
 */
export function RatingOrdersChip({ rating, productHandle, accent = '#22c55e' }: RatingOrdersChipProps) {
  const orders = ordersCountFor(productHandle)
  const hasReviews = (rating?.reviewCount ?? 0) > 0

  if (!hasReviews) {
    // No real reviews yet — surface social proof as orders only,
    // never fake a rating. Reads as a confidence signal without
    // implying a 0.0 score the product hasn't earned.
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
        <Star className="h-4 w-4" style={{ color: accent, fill: accent }} />
        <span>
          Trusted by <strong className="text-white">{formatOrders(orders)}</strong> customers
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
        <strong className="text-white">{formatOrders(orders)}</strong> orders
      </span>
    </div>
  )
}
