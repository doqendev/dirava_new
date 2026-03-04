import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAllReviews } from '@/lib/reviews/metaobjects'

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

export async function GET(request: Request) {
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
      { status: 500 }
    )
  }
}
