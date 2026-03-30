import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { setupReviewMetaobjectDefinition } from '@/lib/reviews/metaobjects'

function isAuthorized(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return process.env.NODE_ENV === 'development'
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminSecret))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await setupReviewMetaobjectDefinition()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Failed to setup review metaobject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup' },
      { status: 500 }
    )
  }
}
