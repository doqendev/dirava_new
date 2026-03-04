import { NextResponse } from 'next/server'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    const [reviews, stats] = await Promise.all([
      getReviewsByProduct(handle, 'approved'),
      getReviewStats(handle),
    ])

    const response: Record<string, unknown> = {
      success: true,
      reviews,
      stats,
    }

    if (debug) {
      response.debug = {
        handle,
        domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
        hasClientId: !!process.env.SHOPIFY_ADMIN_CLIENT_ID,
        hasClientSecret: !!process.env.SHOPIFY_ADMIN_CLIENT_SECRET,
        hasStaticToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      }
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
