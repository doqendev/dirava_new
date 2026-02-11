import { NextResponse } from 'next/server'
import { createReview } from '@/lib/reviews/metaobjects'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { productHandle, authorName, authorEmail, rating, title, content } = body

    // Validation
    if (!productHandle || !authorName || !authorEmail || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const review = await createReview({
      productHandle,
      authorName,
      authorEmail,
      rating: Math.round(rating),
      title: title || undefined,
      content,
    })

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
