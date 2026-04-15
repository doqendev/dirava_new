import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateReviewStatus, updateReview } from '@/lib/reviews/metaobjects'

function isAuthorized(request: Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret) {
    return process.env.NODE_ENV === 'development'
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(adminSecret)
    )
  } catch {
    return false
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json() as {
      status?: string
      authorName?: string
      rating?: number
      title?: string
      content?: string
      verifiedPurchase?: boolean
      countryCode?: string
    }

    // Shopify metaobject IDs are GIDs — the route param is the raw ID portion
    // The frontend sends the full GID (e.g. "gid://shopify/Metaobject/12345")
    const reviewId = decodeURIComponent(params.id)

    // Status-only update path (backwards compatible)
    if (body.status !== undefined) {
      if (body.status !== 'approved' && body.status !== 'rejected') {
        return NextResponse.json(
          { success: false, error: 'Status must be "approved" or "rejected"' },
          { status: 400 }
        )
      }

      const review = await updateReviewStatus(reviewId, body.status)

      if (!review) {
        return NextResponse.json(
          { success: false, error: 'Failed to update review' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: true, review },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Content edit path
    const hasEditFields =
      body.authorName !== undefined ||
      body.rating !== undefined ||
      body.title !== undefined ||
      body.content !== undefined ||
      body.verifiedPurchase !== undefined ||
      body.countryCode !== undefined

    if (!hasEditFields) {
      return NextResponse.json(
        { success: false, error: 'No update fields provided' },
        { status: 400 }
      )
    }

    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const review = await updateReview(reviewId, body)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Failed to update review' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, review },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Admin review update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
