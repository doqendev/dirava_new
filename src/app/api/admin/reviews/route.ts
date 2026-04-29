import { NextResponse } from 'next/server'
import { enforceAdminRateLimit, requireAdminSession } from '@/lib/auth/admin'
import { getAllReviews } from '@/lib/reviews/metaobjects'

export async function GET(request: Request) {
  const rateLimitReject = await enforceAdminRateLimit(request, 'reviews-list')
  if (rateLimitReject) return rateLimitReject

  const authReject = requireAdminSession(request)
  if (authReject) return authReject

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const reviews = await getAllReviews(status)

    return NextResponse.json(
      { success: true, reviews },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Admin reviews fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
