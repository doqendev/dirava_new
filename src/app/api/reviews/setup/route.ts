import { NextResponse } from 'next/server'
import { setupReviewMetaobjectDefinition } from '@/lib/reviews/metaobjects'

export async function POST() {
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
