import { NextResponse } from 'next/server'
import { createReview } from '@/lib/reviews/metaobjects'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { validateReview } from '@/lib/utils/validation'

export async function POST(request: Request) {
  try {
    // Rate limit: 3 requests per minute per IP
    const ip = getClientIp(request)
    const rl = checkRateLimit(`review:${ip}`, { maxRequests: 3, windowSeconds: 60 })
    if (rl.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate and sanitize
    const result = validateReview(body)
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    const { productHandle, authorName, authorEmail, rating, title, content } = result.sanitized!

    const review = await createReview({
      productHandle,
      authorName,
      authorEmail,
      rating,
      title,
      content,
    })

    return NextResponse.json(
      { success: true, review },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
