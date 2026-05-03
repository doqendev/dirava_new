import { createHash } from 'crypto'

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected'])

export interface ReviewImportRow {
  productHandle: string
  authorName: string
  authorEmail: string
  rating: number
  title?: string
  content: string
  createdAt?: string
  countryCode?: string
  verifiedPurchase?: boolean
  images?: string[]
  status: 'pending' | 'approved' | 'rejected'
  sourceReviewId?: string
}

export interface ReviewImportResult {
  rows: ReviewImportRow[]
  errors: string[]
}

interface NormalizeDefaults {
  status?: string
  productHandle?: string
}

function hashValue(value: string, length = 12) {
  return createHash('sha256').update(value).digest('hex').slice(0, length)
}

function normalizeBoolean(value: unknown): boolean | undefined {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return undefined
  if (['true', 'yes', 'y', '1', 'verified'].includes(raw)) return true
  if (['false', 'no', 'n', '0', 'unverified'].includes(raw)) return false
  throw new Error(`verifiedPurchase must be true or false: ${String(value)}`)
}

function normalizeDate(value: unknown): string | undefined {
  const raw = String(value || '').trim()
  if (!raw) return undefined

  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T10:00:00.000Z`)
    : new Date(raw)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`createdAt must be a valid date: ${raw}`)
  }

  return date.toISOString()
}

function normalizeCountryCode(value: unknown): string | undefined {
  const raw = String(value || '').trim().toUpperCase()
  if (!raw) return undefined
  if (!/^[A-Z]{2}$/.test(raw)) {
    throw new Error(`countryCode must be a 2-letter ISO code: ${raw}`)
  }
  return raw
}

function parseImages(value: unknown): string[] | undefined {
  const raw = String(value || '').trim()
  if (!raw) return undefined

  let images: unknown
  if (raw.startsWith('[')) {
    images = JSON.parse(raw)
  } else {
    images = raw.split('|').map((url) => url.trim()).filter(Boolean)
  }

  if (!Array.isArray(images) || !images.every((url) => typeof url === 'string' && /^https?:\/\//.test(url))) {
    throw new Error('reviewImages must be absolute URLs, pipe-separated or as a JSON array')
  }

  return images.length > 0 ? images : undefined
}

export function parseReviewCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  row.push(field)
  if (row.some((cell) => cell.trim().length > 0)) rows.push(row)
  if (rows.length === 0) return []

  const headerRow = rows[0]
  if (!headerRow) return []

  const headers = headerRow.map((header) => header.trim())
  return rows.slice(1).map((values) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = (values[index] || '').trim()
    })
    return record
  })
}

export function normalizeReviewImportRows(
  rawRows: Array<Record<string, unknown>>,
  defaults: NormalizeDefaults = {}
): ReviewImportResult {
  const rows: ReviewImportRow[] = []
  const errors: string[] = []

  rawRows.forEach((raw, index) => {
    try {
      const productHandle = String(raw.productHandle || defaults.productHandle || '').trim()
      const authorName = String(raw.authorName || raw.author || raw.name || '').trim()
      const content = String(raw.content || raw.review || raw.body || '').trim()
      const title = String(raw.title || '').trim()
      const rating = Number(raw.rating)
      const status = String(defaults.status || raw.status || 'pending').trim().toLowerCase()
      const sourceReviewId = String(raw.sourceReviewId || raw.reviewId || raw.id || '').trim()

      if (!productHandle) throw new Error('productHandle is required')
      if (!authorName) throw new Error('authorName is required')
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('rating must be an integer from 1 to 5')
      }
      if (!content) throw new Error('content is required')
      if (!VALID_STATUSES.has(status)) {
        throw new Error('status must be pending, approved, or rejected')
      }

      const stableKey = [
        productHandle,
        sourceReviewId,
        authorName,
        String(raw.authorEmail || ''),
        rating,
        title,
        content,
        String(raw.createdAt || ''),
      ].join('|')
      const importHash = hashValue(stableKey)
      const authorEmail = String(raw.authorEmail || raw.email || '').trim() ||
        `imported+${importHash}@mizoke.local`

      rows.push({
        productHandle,
        authorName,
        authorEmail,
        rating,
        title: title || undefined,
        content,
        createdAt: normalizeDate(raw.createdAt || raw.date || raw.publishedAt),
        countryCode: normalizeCountryCode(raw.countryCode || raw.country),
        verifiedPurchase: normalizeBoolean(raw.verifiedPurchase || raw.verified),
        images: parseImages(raw.reviewImages || raw.images || raw.imageUrls),
        status: status as ReviewImportRow['status'],
        sourceReviewId: sourceReviewId || `row-${index + 1}-${importHash}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Row ${index + 2}: ${message}`)
    }
  })

  return { rows, errors }
}
