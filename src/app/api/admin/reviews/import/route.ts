import { NextResponse } from 'next/server'
import { enforceAdminRateLimit, requireAdminSession } from '@/lib/auth/admin'
import { requireSameOrigin } from '@/lib/utils/csrf'
import { createReview, ensureReviewOptionalFields } from '@/lib/reviews/metaobjects'
import { normalizeReviewImportRows, parseReviewCsv } from '@/lib/reviews/importRows'

const MAX_IMPORT_BYTES = 750 * 1024
const VALID_STATUSES = new Set(['pending', 'approved', 'rejected'])

export async function POST(request: Request) {
  const csrfReject = requireSameOrigin(request)
  if (csrfReject) return csrfReject

  const rateLimitReject = await enforceAdminRateLimit(request, 'reviews-import', {
    maxRequests: 10,
    windowSeconds: 300,
  })
  if (rateLimitReject) return rateLimitReject

  const authReject = requireAdminSession(request)
  if (authReject) return authReject

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const status = String(formData.get('status') || 'pending').trim().toLowerCase()
    const dryRun = formData.get('dryRun') === 'true'

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'CSV file is required' },
        { status: 400 }
      )
    }

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { success: false, error: 'Import status must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMPORT_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Import file is too large. Keep it under 750 KB.' },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Upload a CSV exported from Excel, not the .xlsx file directly.' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const parsedRows = parseReviewCsv(csvText)
    const result = normalizeReviewImportRows(parsedRows, { status })

    if (result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Some rows are invalid',
          errors: result.errors.slice(0, 25),
          prepared: result.rows.length,
        },
        { status: 400 }
      )
    }

    if (dryRun) {
      return NextResponse.json(
        {
          success: true,
          dryRun: true,
          prepared: result.rows.length,
          created: 0,
          failed: 0,
          errors: [],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const fieldsReady = await ensureReviewOptionalFields()
    if (!fieldsReady) {
      return NextResponse.json(
        { success: false, error: 'Review fields are not ready. Run review setup first.' },
        { status: 500 }
      )
    }

    let created = 0
    let failed = 0
    const errors: string[] = []

    for (let index = 0; index < result.rows.length; index += 1) {
      const row = result.rows[index]
      if (!row) continue

      const review = await createReview({
        productHandle: row.productHandle,
        authorName: row.authorName,
        authorEmail: row.authorEmail,
        rating: row.rating,
        title: row.title,
        content: row.content,
        images: row.images,
        verifiedPurchase: row.verifiedPurchase,
        countryCode: row.countryCode,
        createdAt: row.createdAt,
        sourceReviewId: row.sourceReviewId,
        status: row.status,
      })

      if (review) {
        created += 1
      } else {
        failed += 1
        errors.push(`Row ${index + 2}: failed to create review`)
      }
    }

    return NextResponse.json(
      {
        success: failed === 0,
        prepared: result.rows.length,
        created,
        failed,
        errors,
      },
      {
        status: failed === 0 ? 200 : 207,
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (error) {
    console.error('Admin review import error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import reviews' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
