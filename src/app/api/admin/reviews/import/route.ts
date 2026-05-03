import { NextResponse } from 'next/server'
import { enforceAdminRateLimit, requireAdminSession } from '@/lib/auth/admin'
import { requireSameOrigin } from '@/lib/utils/csrf'
import { createReview, ensureReviewOptionalFields, getExistingReviewSourceIds } from '@/lib/reviews/metaobjects'
import { normalizeReviewImportRows, parseReviewCsv } from '@/lib/reviews/importRows'

const MAX_IMPORT_BYTES = 750 * 1024
const DEFAULT_BATCH_SIZE = 20
const MAX_BATCH_SIZE = 40
const VALID_STATUSES = new Set(['pending', 'approved', 'rejected'])

function parsePositiveInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return fallback
  return parsed
}

export async function POST(request: Request) {
  const csrfReject = requireSameOrigin(request)
  if (csrfReject) return csrfReject

  const rateLimitReject = await enforceAdminRateLimit(request, 'reviews-import', {
    maxRequests: 120,
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
    const offset = parsePositiveInteger(formData.get('offset'), 0)
    const requestedBatchSize = parsePositiveInteger(formData.get('batchSize'), DEFAULT_BATCH_SIZE)
    const batchSize = Math.min(Math.max(requestedBatchSize, 1), MAX_BATCH_SIZE)
    const ensureFields = formData.get('ensureFields') !== 'false'

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
          total: result.rows.length,
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
          total: result.rows.length,
          created: 0,
          failed: 0,
          skipped: 0,
          processed: 0,
          offset: 0,
          batchSize,
          nextOffset: 0,
          hasMore: false,
          errors: [],
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    if (ensureFields && !(await ensureReviewOptionalFields())) {
      return NextResponse.json(
        { success: false, error: 'Review fields are not ready. Run review setup first.' },
        { status: 500 }
      )
    }

    let created = 0
    let failed = 0
    let skipped = 0
    const errors: string[] = []
    const batchRows = result.rows.slice(offset, offset + batchSize)
    const nextOffset = Math.min(offset + batchRows.length, result.rows.length)
    const existingSourceReviewIds = await getExistingReviewSourceIds()

    for (let index = 0; index < batchRows.length; index += 1) {
      const row = batchRows[index]
      if (!row) continue

      if (row.sourceReviewId && existingSourceReviewIds.has(row.sourceReviewId)) {
        skipped += 1
        continue
      }

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
        if (row.sourceReviewId) {
          existingSourceReviewIds.add(row.sourceReviewId)
        }
      } else {
        failed += 1
        errors.push(`Row ${offset + index + 2}: failed to create review`)
      }
    }

    return NextResponse.json(
      {
        success: failed === 0,
        prepared: result.rows.length,
        total: result.rows.length,
        created,
        failed,
        skipped,
        processed: batchRows.length,
        offset,
        batchSize,
        nextOffset,
        hasMore: nextOffset < result.rows.length,
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
