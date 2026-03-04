import { NextResponse } from 'next/server'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'
import { adminFetch } from '@/lib/shopify/adminClient'

export async function GET(
  request: Request,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle
    const url = new URL(request.url)
    const debug = url.searchParams.get('debug') === '1'

    if (debug) {
      // Debug mode: call admin API directly to surface any errors
      try {
        const raw = await adminFetch<{ metaobjects: { nodes: unknown[] } }>(
          `{ metaobjects(type: "shop_review", first: 10) { nodes { id handle fields { key value } } } }`
        )
        return NextResponse.json({
          debug: {
            handle,
            domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
            hasClientId: !!process.env.SHOPIFY_ADMIN_CLIENT_ID,
            hasClientSecret: !!process.env.SHOPIFY_ADMIN_CLIENT_SECRET,
            hasStaticToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
            rawCount: raw.metaobjects.nodes.length,
            rawNodes: raw.metaobjects.nodes,
          },
        })
      } catch (debugError) {
        return NextResponse.json({
          debug: {
            domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
            hasClientId: !!process.env.SHOPIFY_ADMIN_CLIENT_ID,
            hasClientSecret: !!process.env.SHOPIFY_ADMIN_CLIENT_SECRET,
            hasStaticToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
            error: debugError instanceof Error ? debugError.message : String(debugError),
          },
        })
      }
    }

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
      { success: false, error: 'Failed to fetch reviews', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
