/**
 * Shopify Metaobject Operations for Product Reviews
 *
 * Uses Shopify Metaobjects as a database for product reviews
 */

import { revalidateTag, unstable_cache } from 'next/cache'
import { adminFetch } from '@/lib/shopify/adminClient'
import { calculateReviewStats, mergeDemoReviews } from '@/lib/reviews/demoReviews'
import type { Review, ReviewRating, AdminReview } from '@/types/reviews'

// ============================================================================
// GraphQL Queries & Mutations
// ============================================================================

/**
 * Create metaobject definition (run once to set up)
 */
export const CREATE_REVIEW_METAOBJECT_DEFINITION = `
  mutation CreateReviewDefinition {
    metaobjectDefinitionCreate(definition: {
      type: "shop_review"
      name: "Product Review"
      fieldDefinitions: [
        { key: "product_handle", name: "Product Handle", type: "single_line_text_field", required: true }
        { key: "author_name", name: "Author Name", type: "single_line_text_field", required: true }
        { key: "author_email", name: "Author Email", type: "single_line_text_field", required: true }
        { key: "rating", name: "Rating", type: "number_integer", required: true }
        { key: "title", name: "Title", type: "single_line_text_field" }
        { key: "content", name: "Content", type: "multi_line_text_field", required: true }
        { key: "status", name: "Status", type: "single_line_text_field", required: true }
        { key: "verified_purchase", name: "Verified Purchase", type: "single_line_text_field" }
        { key: "order_id", name: "Order ID", type: "single_line_text_field" }
        { key: "review_images", name: "Review Images", type: "single_line_text_field" }
        { key: "created_at", name: "Created At", type: "single_line_text_field" }
        { key: "country_code", name: "Country Code", type: "single_line_text_field" }
        { key: "source_review_id", name: "Source Review ID", type: "single_line_text_field" }
      ]
    }) {
      metaobjectDefinition {
        id
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Create a new review metaobject
 */
const CREATE_REVIEW = `
  mutation CreateReview($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(metaobject: {
      type: "shop_review"
      handle: $handle
      fields: $fields
    }) {
      metaobject {
        id
        handle
        fields {
          key
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Get all reviews by type
 */
const GET_ALL_REVIEWS = `
  query GetAllReviews($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after, sortKey: "id", reverse: true) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

/**
 * Update review metaobject
 */
const UPDATE_REVIEW = `
  mutation UpdateReview($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
      metaobject {
        id
        handle
        fields {
          key
          value
        }
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`

const GET_REVIEW_DEFINITION = `
  query GetReviewDefinition {
    metaobjectDefinitionByType(type: "shop_review") {
      id
      fieldDefinitions {
        key
      }
    }
  }
`

const GET_REVIEW_IMPORT_SOURCE_IDS = `
  query GetReviewImportSourceIds($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after, sortKey: "id", reverse: true) {
      nodes {
        fields {
          key
          value
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`


// ============================================================================
// Types for API Responses
// ============================================================================

interface MetaobjectField {
  key: string
  value: string | null
}

interface MetaobjectNode {
  id: string
  handle: string
  fields: MetaobjectField[]
  updatedAt?: string
}

interface CreateMetaobjectResponse {
  metaobjectCreate: {
    metaobject: MetaobjectNode | null
    userErrors: Array<{ field: string; message: string }>
  }
}

interface GetMetaobjectsResponse {
  metaobjects: {
    nodes: MetaobjectNode[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

interface UpdateMetaobjectResponse {
  metaobjectUpdate: {
    metaobject: MetaobjectNode | null
    userErrors: Array<{ field: string; message: string }>
  }
}

interface ReviewDefinitionResponse {
  metaobjectDefinitionByType: {
    id: string
    fieldDefinitions: Array<{ key: string }>
  } | null
}

interface ReviewImportSourceIdsResponse {
  metaobjects: {
    nodes: Array<{
      fields: MetaobjectField[]
    }>
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
  }
}

interface PublicReviewData {
  reviews: Review[]
  stats: ReviewRating
}

const PUBLIC_REVIEWS_CACHE_TAG = 'public-reviews'
const PUBLIC_REVIEWS_REVALIDATE_SECONDS = 300

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse metaobject fields into Review
 */
function parseReviewFromMetaobject(node: MetaobjectNode): Review {
  const getField = (key: string) => node.fields.find(f => f.key === key)?.value || ''

  // Parse review_images JSON array, fallback to empty array
  let images: string[] | undefined
  const imagesRaw = getField('review_images')
  if (imagesRaw) {
    try {
      const parsed: unknown = JSON.parse(imagesRaw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed.filter((u): u is string => typeof u === 'string' && u.length > 0)
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  // Prefer the custom `created_at` field (ISO string) when present — it
  // lets seeded reviews carry backdated timestamps, and for organic
  // reviews falls back to the metaobject's updatedAt.
  const customCreatedAt = getField('created_at')
  const createdAt = customCreatedAt && !Number.isNaN(Date.parse(customCreatedAt))
    ? customCreatedAt
    : node.updatedAt || new Date().toISOString()

  return {
    id: node.id,
    author: getField('author_name'),
    rating: parseInt(getField('rating')) || 5,
    title: getField('title') || undefined,
    content: getField('content'),
    images: images && images.length > 0 ? images : undefined,
    createdAt,
    verified: getField('verified_purchase') === 'true',
    countryCode: getField('country_code') || undefined,
  }
}

async function fetchAllReviewMetaobjects(): Promise<MetaobjectNode[]> {
  const nodes: MetaobjectNode[] = []
  let after: string | null = null
  let hasNextPage = true

  while (hasNextPage) {
    const response: GetMetaobjectsResponse = await adminFetch<GetMetaobjectsResponse>(
      GET_ALL_REVIEWS,
      { type: 'shop_review', first: 250, after }
    )

    nodes.push(...response.metaobjects.nodes)
    after = response.metaobjects.pageInfo.endCursor
    hasNextPage = response.metaobjects.pageInfo.hasNextPage && Boolean(after)
  }

  return nodes
}

async function getReviewsByProductUncached(
  productHandle: string,
  status?: string
): Promise<Review[]> {
  // Fetch all shop_review metaobjects and filter in-memory.
  // Shopify metaobject query filtering is unreliable for field values.
  const nodes = await fetchAllReviewMetaobjects()

  const getField = (node: MetaobjectNode, key: string) =>
    node.fields.find(f => f.key === key)?.value || ''

  const filtered = nodes.filter((node) => {
    if (getField(node, 'product_handle') !== productHandle) return false
    if (status && getField(node, 'status') !== status) return false
    return true
  })

  const reviews = filtered.map(parseReviewFromMetaobject)
  return status === undefined || status === 'approved'
    ? mergeDemoReviews(productHandle, reviews)
    : reviews
}

const getCachedApprovedReviewsByProduct = unstable_cache(
  async (productHandle: string) => getReviewsByProductUncached(productHandle, 'approved'),
  ['public-approved-reviews-by-product-v1'],
  {
    revalidate: PUBLIC_REVIEWS_REVALIDATE_SECONDS,
    tags: [PUBLIC_REVIEWS_CACHE_TAG],
  }
)

function revalidatePublicReviews(): void {
  try {
    revalidateTag(PUBLIC_REVIEWS_CACHE_TAG)
  } catch (error) {
    console.warn(
      '[reviews] public review cache revalidation skipped:',
      error instanceof Error ? error.message : error
    )
  }
}

/**
 * Convert review data to metaobject fields
 */
function toReviewFields(data: {
  productHandle: string
  authorName: string
  authorEmail: string
  rating: number
  title?: string
  content?: string
  images?: string[]
  status: string
  verifiedPurchase?: boolean
  orderId?: string
  countryCode?: string
  createdAt?: string
  sourceReviewId?: string
}): Array<{ key: string; value: string }> {
  const fields: Array<{ key: string; value: string }> = [
    { key: 'product_handle', value: data.productHandle },
    { key: 'author_name', value: data.authorName },
    { key: 'author_email', value: data.authorEmail },
    { key: 'rating', value: data.rating.toString() },
    { key: 'content', value: data.content || '' },
    { key: 'status', value: data.status },
  ]

  if (data.title) {
    fields.push({ key: 'title', value: data.title })
  }

  if (data.images && data.images.length > 0) {
    fields.push({ key: 'review_images', value: JSON.stringify(data.images) })
  }

  if (data.verifiedPurchase !== undefined) {
    fields.push({ key: 'verified_purchase', value: data.verifiedPurchase.toString() })
  }

  if (data.orderId) {
    fields.push({ key: 'order_id', value: data.orderId })
  }

  if (data.countryCode) {
    fields.push({ key: 'country_code', value: data.countryCode })
  }

  if (data.createdAt) {
    fields.push({ key: 'created_at', value: data.createdAt })
  }

  if (data.sourceReviewId) {
    fields.push({ key: 'source_review_id', value: data.sourceReviewId })
  }

  return fields
}

/**
 * Parse metaobject fields into AdminReview (includes status, productHandle, authorEmail)
 */
function parseAdminReviewFromMetaobject(node: MetaobjectNode): AdminReview {
  const review = parseReviewFromMetaobject(node)
  const getField = (key: string) => node.fields.find(f => f.key === key)?.value || ''

  const rawStatus = getField('status')
  const status: AdminReview['status'] =
    rawStatus === 'approved' || rawStatus === 'rejected' ? rawStatus : 'pending'

  return {
    ...review,
    status,
    productHandle: getField('product_handle'),
    authorEmail: getField('author_email'),
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create the metaobject definition (run once during setup)
 */
export async function setupReviewMetaobjectDefinition(): Promise<boolean> {
  try {
    const response = await adminFetch<{
      metaobjectDefinitionCreate: {
        metaobjectDefinition: { id: string; type: string } | null
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(CREATE_REVIEW_METAOBJECT_DEFINITION)

    if (response.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error(
        'Failed to create review metaobject definition:',
        response.metaobjectDefinitionCreate.userErrors
      )
      return false
    }

    if (response.metaobjectDefinitionCreate.metaobjectDefinition) {
      return true
    }

    console.error('No review metaobject definition returned')
    return false
  } catch (error) {
    console.error('Error creating review metaobject definition:', error)
    return false
  }
}

/**
 * Existing stores may have an older shop_review definition. Ensure newer
 * import/display fields exist before admin imports write those fields.
 */
export async function ensureReviewOptionalFields(): Promise<boolean> {
  const optionalFields = [
    { key: 'created_at', name: 'Created At', type: 'single_line_text_field' },
    { key: 'country_code', name: 'Country Code', type: 'single_line_text_field' },
    { key: 'source_review_id', name: 'Source Review ID', type: 'single_line_text_field' },
  ]

  try {
    const response = await adminFetch<ReviewDefinitionResponse>(GET_REVIEW_DEFINITION)
    const definition = response.metaobjectDefinitionByType

    if (!definition) {
      console.error('Review metaobject definition not found')
      return false
    }

    const existing = new Set(definition.fieldDefinitions.map((field) => field.key))
    const missing = optionalFields.filter((field) => !existing.has(field.key))

    if (missing.length === 0) return true

    for (const field of missing) {
      const mutation = `
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
      const updateResponse = await adminFetch<{
        metaobjectDefinitionUpdate: {
          metaobjectDefinition: { id: string } | null
          userErrors: Array<{ field: string[]; message: string }>
        }
      }>(mutation, { id: definition.id })

      if (updateResponse.metaobjectDefinitionUpdate.userErrors.length > 0) {
        console.error(
          `Failed to add review field ${field.key}:`,
          updateResponse.metaobjectDefinitionUpdate.userErrors
        )
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error ensuring review optional fields:', error)
    return false
  }
}

/**
 * Return source IDs already imported into Shopify. Used by CSV imports to make
 * retrying a partially completed import skip rows that already exist.
 */
export async function getExistingReviewSourceIds(): Promise<Set<string>> {
  const sourceIds = new Set<string>()
  let after: string | null = null
  let hasNextPage = true

  try {
    while (hasNextPage) {
      const response: ReviewImportSourceIdsResponse = await adminFetch<ReviewImportSourceIdsResponse>(
        GET_REVIEW_IMPORT_SOURCE_IDS,
        { type: 'shop_review', first: 250, after }
      )

      for (const node of response.metaobjects.nodes) {
        const sourceReviewId = node.fields.find((field: MetaobjectField) => field.key === 'source_review_id')?.value
        if (sourceReviewId) {
          sourceIds.add(sourceReviewId)
        }
      }

      after = response.metaobjects.pageInfo.endCursor
      hasNextPage = response.metaobjects.pageInfo.hasNextPage && Boolean(after)
    }
  } catch (error) {
    console.error('Error fetching review import source IDs:', error)
  }

  return sourceIds
}

/**
 * Get all reviews, optionally filtered by status (for admin moderation)
 */
export async function getAllReviews(status?: string): Promise<AdminReview[]> {
  try {
    const nodes = await fetchAllReviewMetaobjects()

    const getField = (node: MetaobjectNode, key: string) =>
      node.fields.find(f => f.key === key)?.value || ''

    const filtered = status
      ? nodes.filter(node => getField(node, 'status') === status)
      : nodes

    return filtered.map(parseAdminReviewFromMetaobject)
  } catch (error) {
    console.error('Error fetching all reviews:', error)
    return []
  }
}

/**
 * Create a new review
 */
export async function createReview(data: {
  productHandle: string
  authorName: string
  authorEmail: string
  rating: number
  title?: string
  content?: string
  images?: string[]
  verifiedPurchase?: boolean
  orderId?: string
  countryCode?: string
  createdAt?: string
  sourceReviewId?: string
  status?: 'pending' | 'approved' | 'rejected'
}): Promise<Review | null> {
  const handleSeed = data.sourceReviewId
    ? `${data.productHandle}-${data.sourceReviewId}`
    : `${data.productHandle}-${data.authorName}-${Date.now()}-${Math.random()}`
  const handleSuffix = Buffer.from(handleSeed)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 24)
  const handlePrefix = data.sourceReviewId ? 'review-import' : `review-${Date.now()}`
  const handle = `${handlePrefix}-${data.productHandle}-${handleSuffix}`.slice(0, 255)
  const fields = toReviewFields({
    ...data,
    status: data.status || 'pending',
  })

  try {
    const response = await adminFetch<CreateMetaobjectResponse>(
      CREATE_REVIEW,
      { handle, fields }
    )

    if (response.metaobjectCreate.userErrors.length > 0) {
      console.error(
        'Failed to create review:',
        response.metaobjectCreate.userErrors
      )
      return null
    }

    if (!response.metaobjectCreate.metaobject) {
      return null
    }

    revalidatePublicReviews()
    return parseReviewFromMetaobject(response.metaobjectCreate.metaobject)
  } catch (error) {
    console.error('Error creating review:', error)
    return null
  }
}

/**
 * Get reviews for a product, optionally filtered by status.
 *
 * Returns [] on any Shopify Admin API failure so that callers (product
 * pages) never break if reviews are temporarily unavailable.
 */
export async function getReviewsByProduct(
  productHandle: string,
  status?: string
): Promise<Review[]> {
  try {
    if (status === 'approved') {
      return await getCachedApprovedReviewsByProduct(productHandle)
    }

    return await getReviewsByProductUncached(productHandle, status)
  } catch (error) {
    console.error(
      `[reviews] getReviewsByProduct failed for "${productHandle}":`,
      error instanceof Error ? error.message : error
    )
    return []
  }
}

/**
 * Get approved public reviews and aggregate stats with a single cached read.
 */
export async function getPublicReviewData(productHandle: string): Promise<PublicReviewData> {
  const reviews = await getReviewsByProduct(productHandle, 'approved')
  return {
    reviews,
    stats: calculateReviewStats(reviews),
  }
}

/**
 * Get aggregate review stats for a product
 */
export async function getReviewStats(productHandle: string): Promise<ReviewRating> {
  try {
    const approvedReviews = await getReviewsByProduct(productHandle, 'approved')
    return calculateReviewStats(approvedReviews)
  } catch (error) {
    console.error('Error calculating review stats:', error)
    return {
      averageRating: 0,
      reviewCount: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }
}

/**
 * Update review status (for moderation)
 */
export async function updateReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected'
): Promise<Review | null> {
  try {
    const fields = [{ key: 'status', value: status }]

    const response = await adminFetch<UpdateMetaobjectResponse>(
      UPDATE_REVIEW,
      { id: reviewId, fields }
    )

    if (response.metaobjectUpdate.userErrors.length > 0) {
      console.error(
        'Failed to update review status:',
        response.metaobjectUpdate.userErrors
      )
      return null
    }

    if (!response.metaobjectUpdate.metaobject) {
      return null
    }

    revalidatePublicReviews()
    return parseReviewFromMetaobject(response.metaobjectUpdate.metaobject)
  } catch (error) {
    console.error('Error updating review status:', error)
    return null
  }
}

/**
 * Update review content fields (author, rating, title, content, verified)
 * Only provided fields are updated.
 */
export async function updateReview(
  reviewId: string,
  data: {
    authorName?: string
    rating?: number
    title?: string
    content?: string
    verifiedPurchase?: boolean
    countryCode?: string
  }
): Promise<Review | null> {
  try {
    const fields: Array<{ key: string; value: string }> = []

    if (data.authorName !== undefined) {
      fields.push({ key: 'author_name', value: data.authorName })
    }
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        console.error('Rating must be between 1 and 5')
        return null
      }
      fields.push({ key: 'rating', value: data.rating.toString() })
    }
    if (data.title !== undefined) {
      fields.push({ key: 'title', value: data.title })
    }
    if (data.content !== undefined) {
      fields.push({ key: 'content', value: data.content })
    }
    if (data.verifiedPurchase !== undefined) {
      fields.push({ key: 'verified_purchase', value: data.verifiedPurchase.toString() })
    }
    if (data.countryCode !== undefined) {
      fields.push({ key: 'country_code', value: data.countryCode })
    }

    if (fields.length === 0) {
      console.error('No fields provided to update')
      return null
    }

    const response = await adminFetch<UpdateMetaobjectResponse>(
      UPDATE_REVIEW,
      { id: reviewId, fields }
    )

    if (response.metaobjectUpdate.userErrors.length > 0) {
      console.error(
        'Failed to update review:',
        response.metaobjectUpdate.userErrors
      )
      return null
    }

    if (!response.metaobjectUpdate.metaobject) {
      return null
    }

    revalidatePublicReviews()
    return parseReviewFromMetaobject(response.metaobjectUpdate.metaobject)
  } catch (error) {
    console.error('Error updating review:', error)
    return null
  }
}

/**
 * Get all reviews by a specific email
 */
export async function getReviewsByEmail(email: string): Promise<Review[]> {
  try {
    // Fetch all reviews and filter by email
    const nodes = await fetchAllReviewMetaobjects()

    // Filter by exact email match
    const matchingNodes = nodes.filter(node => {
      const emailField = node.fields.find(f => f.key === 'author_email')
      return emailField?.value === email
    })

    return matchingNodes.map(parseReviewFromMetaobject)
  } catch (error) {
    console.error('Error fetching reviews by email:', error)
    return []
  }
}
