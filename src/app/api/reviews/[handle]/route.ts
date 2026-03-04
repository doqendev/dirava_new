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

    // debug=2: test getReviewsByProduct directly, surfacing errors
    if (url.searchParams.get('debug') === '2') {
      try {
        const reviews = await getReviewsByProduct(handle, 'approved')
        return NextResponse.json({ debug2: { count: reviews.length, reviews } })
      } catch (e) {
        return NextResponse.json({ debug2: { error: e instanceof Error ? e.message : String(e) } })
      }
    }

    // debug=3: test GET_ALL_REVIEWS query with variable
    if (url.searchParams.get('debug') === '3') {
      try {
        const raw = await adminFetch<{ metaobjects: { nodes: unknown[] } }>(
          `query GetAllReviews($type: String!, $first: Int!) { metaobjects(type: $type, first: $first, sortKey: "id", reverse: true) { nodes { id handle fields { key value } } } }`,
          { type: 'shop_review', first: 10 }
        )
        return NextResponse.json({ debug3: { count: raw.metaobjects.nodes.length, nodes: raw.metaobjects.nodes } })
      } catch (e) {
        return NextResponse.json({ debug3: { error: e instanceof Error ? e.message : String(e) } })
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
