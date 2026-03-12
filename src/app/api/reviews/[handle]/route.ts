import { NextResponse } from 'next/server'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'

export async function GET(
  _request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle

    const [reviews, stats] = await Promise.all([
      getReviewsByProduct(handle, 'approved'),
      getReviewStats(handle),
    ])

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    }, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
