/**
 * Import real customer reviews into Shopify `shop_review` metaobjects.
 *
 * Usage:
 *   pnpm import:reviews -- --file data/reviews.csv
 *   pnpm import:reviews -- --file data/reviews.csv --apply --status approved
 *   pnpm import:reviews -- --file data/reviews.json --product one-piece-custom-sign --apply
 *
 * CSV/JSON fields:
 *   productHandle      required unless --product is passed
 *   authorName         required
 *   rating             required, integer 1-5
 *   content            required
 *   title              optional
 *   authorEmail        optional; internal placeholder generated when missing
 *   createdAt          optional; ISO date or YYYY-MM-DD
 *   countryCode        optional, ISO alpha-2
 *   verifiedPurchase   optional, true/false
 *   orderId            optional
 *   reviewImages       optional, JSON array or pipe-separated URLs
 *   sourceReviewId     optional, recommended for idempotent imports
 *   status             optional, approved|pending|rejected; overridden by --status
 */

import { GraphQLClient } from 'graphql-request'
import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const API_VERSION = '2024-01'
const METAOBJECT_TYPE = 'shop_review'
const VALID_STATUSES = new Set(['approved', 'pending', 'rejected'])

function loadEnv(filename) {
  try {
    const envContent = readFileSync(resolve(process.cwd(), filename), 'utf-8')
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  } catch {
    // Optional env file.
  }
}

function parseArgs(argv) {
  const args = {
    apply: false,
    file: '',
    productHandle: '',
    status: '',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--apply') {
      args.apply = true
    } else if (arg === '--file') {
      args.file = argv[i + 1] || ''
      i += 1
    } else if (arg === '--product' || arg === '--product-handle') {
      args.productHandle = argv[i + 1] || ''
      i += 1
    } else if (arg === '--status') {
      args.status = argv[i + 1] || ''
      i += 1
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!args.file) {
    throw new Error('Missing --file path')
  }
  if (args.status && !VALID_STATUSES.has(args.status)) {
    throw new Error('--status must be one of: approved, pending, rejected')
  }

  return args
}

function printHelp() {
  console.log(`Import real customer reviews into Shopify.

Required:
  --file <path>              CSV or JSON file to import

Optional:
  --apply                    Actually write to Shopify. Omit for dry-run.
  --product <handle>         Product handle for every row unless row has productHandle.
  --status <status>          Force approved, pending, or rejected for every row.

Examples:
  pnpm import:reviews -- --file data/reviews.csv
  pnpm import:reviews -- --file data/reviews.csv --apply --status approved
`)
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 46)
}

function hashValue(value, length = 12) {
  return createHash('sha256').update(value).digest('hex').slice(0, length)
}

function normalizeBoolean(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return undefined
  if (['true', 'yes', 'y', '1', 'verified'].includes(raw)) return true
  if (['false', 'no', 'n', '0', 'unverified'].includes(raw)) return false
  throw new Error(`Invalid boolean value: ${value}`)
}

function normalizeDate(value) {
  const raw = String(value || '').trim()
  if (!raw) return undefined
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T10:00:00.000Z`)
    : new Date(raw)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid createdAt date: ${value}`)
  }
  return date.toISOString()
}

function normalizeCountryCode(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (!raw) return undefined
  if (!/^[A-Z]{2}$/.test(raw)) {
    throw new Error(`countryCode must be a 2-letter ISO code: ${value}`)
  }
  return raw
}

function parseImages(value) {
  const raw = String(value || '').trim()
  if (!raw) return undefined

  let images
  if (raw.startsWith('[')) {
    images = JSON.parse(raw)
  } else {
    images = raw.split('|').map((url) => url.trim()).filter(Boolean)
  }

  if (!Array.isArray(images) || !images.every((url) => typeof url === 'string' && /^https?:\/\//.test(url))) {
    throw new Error('reviewImages must be a JSON array or pipe-separated list of absolute URLs')
  }

  return images.length > 0 ? images : undefined
}

function parseCsv(text) {
  const rows = []
  let row = []
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

  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((values) => {
    const record = {}
    headers.forEach((header, index) => {
      record[header] = (values[index] || '').trim()
    })
    return record
  })
}

function readInputRows(filePath) {
  const absolutePath = resolve(process.cwd(), filePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const text = readFileSync(absolutePath, 'utf-8')
  if (filePath.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed)) {
      throw new Error('JSON import file must be an array of review objects')
    }
    return parsed
  }

  return parseCsv(text)
}

function normalizeReview(raw, index, defaults) {
  const productHandle = String(raw.productHandle || defaults.productHandle || '').trim()
  const authorName = String(raw.authorName || raw.author || raw.name || '').trim()
  const content = String(raw.content || raw.review || raw.body || '').trim()
  const title = String(raw.title || '').trim()
  const rating = Number(raw.rating)
  const status = defaults.status || String(raw.status || 'pending').trim().toLowerCase()
  const sourceReviewId = String(raw.sourceReviewId || raw.reviewId || raw.id || '').trim()

  if (!productHandle) throw new Error('productHandle is required')
  if (!authorName) throw new Error('authorName is required')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('rating must be an integer from 1 to 5')
  }
  if (!content) throw new Error('content is required')
  if (!VALID_STATUSES.has(status)) {
    throw new Error('status must be one of: approved, pending, rejected')
  }

  const stableKey = sourceReviewId || [
    productHandle,
    authorName,
    String(raw.authorEmail || ''),
    rating,
    title,
    content,
    String(raw.createdAt || ''),
  ].join('|')

  const importHash = hashValue(stableKey)
  const handle = [
    'imported-review',
    slugify(productHandle),
    slugify(sourceReviewId || authorName || `row-${index + 1}`),
    importHash,
  ].filter(Boolean).join('-').slice(0, 255)

  const authorEmail = String(raw.authorEmail || raw.email || '').trim() ||
    `imported+${importHash}@mizoke.local`

  return {
    productHandle,
    authorName,
    authorEmail,
    rating,
    title: title || undefined,
    content,
    status,
    createdAt: normalizeDate(raw.createdAt || raw.date || raw.publishedAt),
    countryCode: normalizeCountryCode(raw.countryCode || raw.country),
    verifiedPurchase: normalizeBoolean(raw.verifiedPurchase || raw.verified),
    orderId: String(raw.orderId || raw.order || '').trim() || undefined,
    images: parseImages(raw.reviewImages || raw.images || raw.imageUrls),
    sourceReviewId: sourceReviewId || undefined,
    handle,
  }
}

const GET_ALL_REVIEWS = /* GraphQL */ `
  query GetAllReviews($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first, sortKey: "id", reverse: true) {
      nodes {
        id
        handle
        fields { key value }
      }
    }
  }
`

const CREATE_REVIEW = /* GraphQL */ `
  mutation CreateReview($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(
      metaobject: { type: "shop_review", handle: $handle, fields: $fields }
    ) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`

const GET_REVIEW_DEFINITION = /* GraphQL */ `
  query GetReviewDefinition {
    metaobjectDefinitionByType(type: "shop_review") {
      id
      fieldDefinitions { key }
    }
  }
`

async function getAdminToken(domain) {
  const legacyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  if (legacyToken) return legacyToken

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Missing Shopify Admin credentials')
  }

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) {
    throw new Error(`Shopify OAuth failed (${res.status}): ${await res.text()}`)
  }
  const json = await res.json()
  return json.access_token
}

async function createClient() {
  loadEnv('.env')
  loadEnv('.env.local')

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  if (!domain) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is missing')
  }

  return new GraphQLClient(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    headers: {
      'X-Shopify-Access-Token': await getAdminToken(domain),
      'Content-Type': 'application/json',
    },
  })
}

async function ensureOptionalFields(client) {
  const def = await client.request(GET_REVIEW_DEFINITION)
  const node = def.metaobjectDefinitionByType
  if (!node) {
    throw new Error('shop_review metaobject definition not found. Run /api/reviews/setup first.')
  }

  const existing = new Set(node.fieldDefinitions.map((field) => field.key))
  const optionalFields = [
    { key: 'created_at', name: 'Created At', type: 'single_line_text_field' },
    { key: 'country_code', name: 'Country Code', type: 'single_line_text_field' },
    { key: 'source_review_id', name: 'Source Review ID', type: 'single_line_text_field' },
  ].filter((field) => !existing.has(field.key))

  if (optionalFields.length === 0) return

  for (const field of optionalFields) {
    const mutation = /* GraphQL */ `
      mutation AddOptionalReviewField($id: ID!) {
        metaobjectDefinitionUpdate(
          id: $id
          definition: {
            fieldDefinitions: [
              { create: { key: "${field.key}", name: "${field.name}", type: "${field.type}" } }
            ]
          }
        ) {
          metaobjectDefinition { id }
          userErrors { field message }
        }
      }
    `
    const res = await client.request(mutation, { id: node.id })
    const errors = res.metaobjectDefinitionUpdate.userErrors
    if (errors.length > 0) {
      throw new Error(`Failed to add ${field.key}: ${errors.map((error) => error.message).join('; ')}`)
    }
    console.log(`Added optional field: ${field.key}`)
  }
}

async function getExistingReviewKeys(client) {
  const data = await client.request(GET_ALL_REVIEWS, { type: METAOBJECT_TYPE, first: 250 })
  const keys = new Set()

  for (const node of data.metaobjects.nodes) {
    keys.add(`handle:${node.handle}`)
    const getField = (key) => node.fields.find((field) => field.key === key)?.value || ''
    const productHandle = getField('product_handle')
    const sourceReviewId = getField('source_review_id')
    if (productHandle && sourceReviewId) {
      keys.add(`source:${productHandle}:${sourceReviewId}`)
    }
  }

  return keys
}

function toFields(review) {
  const fields = [
    { key: 'product_handle', value: review.productHandle },
    { key: 'author_name', value: review.authorName },
    { key: 'author_email', value: review.authorEmail },
    { key: 'rating', value: String(review.rating) },
    { key: 'content', value: review.content },
    { key: 'status', value: review.status },
  ]

  if (review.title) fields.push({ key: 'title', value: review.title })
  if (review.createdAt) fields.push({ key: 'created_at', value: review.createdAt })
  if (review.countryCode) fields.push({ key: 'country_code', value: review.countryCode })
  if (review.verifiedPurchase !== undefined) {
    fields.push({ key: 'verified_purchase', value: String(review.verifiedPurchase) })
  }
  if (review.orderId) fields.push({ key: 'order_id', value: review.orderId })
  if (review.images) fields.push({ key: 'review_images', value: JSON.stringify(review.images) })
  if (review.sourceReviewId) fields.push({ key: 'source_review_id', value: review.sourceReviewId })

  return fields
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const rows = readInputRows(args.file)
  const normalized = rows.map((row, index) => {
    try {
      return normalizeReview(row, index, {
        productHandle: args.productHandle,
        status: args.status,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Row ${index + 2}: ${message}`)
    }
  })

  console.log(`Prepared ${normalized.length} review(s) from ${args.file}`)
  const productCounts = normalized.reduce((counts, review) => {
    counts.set(review.productHandle, (counts.get(review.productHandle) || 0) + 1)
    return counts
  }, new Map())
  for (const [productHandle, count] of productCounts) {
    console.log(`  ${productHandle}: ${count}`)
  }

  if (!args.apply) {
    console.log('\nDry run only. Re-run with --apply to write these reviews to Shopify.')
    return
  }

  const client = await createClient()
  await ensureOptionalFields(client)
  const existingKeys = await getExistingReviewKeys(client)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const review of normalized) {
    const sourceKey = review.sourceReviewId
      ? `source:${review.productHandle}:${review.sourceReviewId}`
      : ''

    if (existingKeys.has(`handle:${review.handle}`) || (sourceKey && existingKeys.has(sourceKey))) {
      console.log(`  skip: ${review.productHandle} / ${review.authorName} / ${review.title || '(no title)'}`)
      skipped += 1
      continue
    }

    const res = await client.request(CREATE_REVIEW, {
      handle: review.handle,
      fields: toFields(review),
    })
    const errors = res.metaobjectCreate.userErrors
    if (errors.length > 0) {
      console.log(`  failed: ${review.productHandle} / ${review.authorName}: ${errors.map((error) => error.message).join('; ')}`)
      failed += 1
      continue
    }

    existingKeys.add(`handle:${review.handle}`)
    if (sourceKey) existingKeys.add(sourceKey)
    created += 1
    console.log(`  created: ${review.productHandle} / ${review.authorName} (${review.rating}*)`)
  }

  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
