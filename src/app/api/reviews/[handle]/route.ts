import { NextResponse } from 'next/server'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'

const EMPTY_STATS = {
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
}

export async function GET(
  _request: Request,
  { params }: { params: { handle: string } }
) {
  const handle = params.handle

  // Reviews are non-critical — never 500 the product page over a review
  // fetch failure. Log and return empty data so the UI renders "no reviews yet".
  try {
    const [reviews, stats] = await Promise.all([
      getReviewsByProduct(handle, 'approved'),
      getReviewStats(handle),
    ])

    return NextResponse.json(
      { success: true, reviews, stats },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' } }
    )
  } catch (error) {
    console.error(
      `[reviews] route handler failed for "${handle}":`,
      error instanceof Error ? error.message : error
    )
    return NextResponse.json(
      { success: true, reviews: [], stats: EMPTY_STATS, degraded: true },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
