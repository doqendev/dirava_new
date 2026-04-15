/**
 * Shopify Metaobject Operations for Product Reviews
 *
 * Uses Shopify Metaobjects as a database for product reviews
 */

import { adminFetch } from '@/lib/shopify/adminClient'
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
  query GetAllReviews($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first, sortKey: "id", reverse: true) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
        updatedAt
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
  }
}

interface UpdateMetaobjectResponse {
  metaobjectUpdate: {
    metaobject: MetaobjectNode | null
    userErrors: Array<{ field: string; message: string }>
  }
}

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

  return {
    id: node.id,
    author: getField('author_name'),
    rating: parseInt(getField('rating')) || 5,
    title: getField('title') || undefined,
    content: getField('content'),
    images: images && images.length > 0 ? images : undefined,
    createdAt: node.updatedAt || new Date().toISOString(),
    verified: getField('verified_purchase') === 'true',
    countryCode: getField('country_code') || undefined,
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
 * Get all reviews, optionally filtered by status (for admin moderation)
 */
export async function getAllReviews(status?: string): Promise<AdminReview[]> {
  try {
    const response = await adminFetch<GetMetaobjectsResponse>(
      GET_ALL_REVIEWS,
      { type: 'shop_review', first: 250 }
    )

    const getField = (node: MetaobjectNode, key: string) =>
      node.fields.find(f => f.key === key)?.value || ''

    const filtered = status
      ? response.metaobjects.nodes.filter(node => getField(node, 'status') === status)
      : response.metaobjects.nodes

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
}): Promise<Review | null> {
  const handle = `review-${data.productHandle}-${Date.now()}`
  const fields = toReviewFields({
    ...data,
    status: 'pending',
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

    return parseReviewFromMetaobject(response.metaobjectCreate.metaobject)
  } catch (error) {
    console.error('Error creating review:', error)
    return null
  }
}

/**
 * Get reviews for a product, optionally filtered by status
 */
export async function getReviewsByProduct(
  productHandle: string,
  status?: string
): Promise<Review[]> {
  // Fetch all shop_review metaobjects and filter in-memory
  // Shopify metaobject query filtering is unreliable for field values
  const response = await adminFetch<GetMetaobjectsResponse>(
    GET_ALL_REVIEWS,
    { type: 'shop_review', first: 250 }
  )

  const getField = (node: MetaobjectNode, key: string) =>
    node.fields.find(f => f.key === key)?.value || ''

  const filtered = response.metaobjects.nodes.filter((node) => {
    if (getField(node, 'product_handle') !== productHandle) return false
    if (status && getField(node, 'status') !== status) return false
    return true
  })

  return filtered.map(parseReviewFromMetaobject)
}

/**
 * Get aggregate review stats for a product
 */
export async function getReviewStats(productHandle: string): Promise<ReviewRating> {
  try {
    const approvedReviews = await getReviewsByProduct(productHandle, 'approved')

    if (approvedReviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    for (const review of approvedReviews) {
      const rating = Math.min(5, Math.max(1, review.rating)) as 1 | 2 | 3 | 4 | 5
      breakdown[rating]++
      totalRating += rating
    }

    return {
      averageRating: totalRating / approvedReviews.length,
      reviewCount: approvedReviews.length,
      ratingBreakdown: breakdown,
    }
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
    const response = await adminFetch<GetMetaobjectsResponse>(
      GET_ALL_REVIEWS,
      { type: 'shop_review', first: 100 }
    )

    // Filter by exact email match
    const matchingNodes = response.metaobjects.nodes.filter(node => {
      const emailField = node.fields.find(f => f.key === 'author_email')
      return emailField?.value === email
    })

    return matchingNodes.map(parseReviewFromMetaobject)
  } catch (error) {
    console.error('Error fetching reviews by email:', error)
    return []
  }
}
