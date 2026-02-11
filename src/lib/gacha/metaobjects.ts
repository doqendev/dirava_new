/**
 * Shopify Metaobject Operations for Redemption Codes
 *
 * Uses Shopify Metaobjects as a database for redemption codes
 */

import { adminFetch } from '@/lib/shopify/adminClient'
import type {
  RedemptionCode,
  CodeStatus,
  ShippingAddress,
  Rarity,
} from '@/types/gacha'

// ============================================================================
// GraphQL Queries & Mutations
// ============================================================================

/**
 * Create metaobject definition (run once to set up)
 */
export const CREATE_METAOBJECT_DEFINITION = `
  mutation CreateRedemptionCodeDefinition {
    metaobjectDefinitionCreate(definition: {
      type: "redemption_code"
      name: "Redemption Code"
      fieldDefinitions: [
        { key: "code", name: "Code", type: "single_line_text_field", required: true }
        { key: "box_handle", name: "Box Handle", type: "single_line_text_field", required: true }
        { key: "purchase_order_id", name: "Purchase Order ID", type: "single_line_text_field", required: true }
        { key: "purchase_order_name", name: "Purchase Order Name", type: "single_line_text_field" }
        { key: "purchaser_email", name: "Purchaser Email", type: "single_line_text_field", required: true }
        { key: "status", name: "Status", type: "single_line_text_field", required: true }
        { key: "revealed_product_handle", name: "Revealed Product Handle", type: "single_line_text_field" }
        { key: "revealed_variant_id", name: "Revealed Variant ID", type: "single_line_text_field" }
        { key: "revealed_rarity", name: "Revealed Rarity", type: "single_line_text_field" }
        { key: "revealed_at", name: "Revealed At", type: "single_line_text_field" }
        { key: "seed", name: "Seed", type: "single_line_text_field" }
        { key: "shipping_address", name: "Shipping Address", type: "json" }
        { key: "claimed_at", name: "Claimed At", type: "single_line_text_field" }
        { key: "fulfillment_order_id", name: "Fulfillment Order ID", type: "single_line_text_field" }
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
 * Create a new redemption code metaobject
 */
const CREATE_REDEMPTION_CODE = `
  mutation CreateRedemptionCode($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(metaobject: {
      type: "redemption_code"
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
 * Get redemption code by handle prefix (code without dashes)
 */
const GET_REDEMPTION_CODE_BY_HANDLE = `
  query GetRedemptionCodeByHandle($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first, sortKey: "id", reverse: true) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`


/**
 * Update redemption code
 */
const UPDATE_REDEMPTION_CODE = `
  mutation UpdateRedemptionCode($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
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
 * Parse metaobject fields into RedemptionCode
 */
function parseMetaobjectToCode(node: MetaobjectNode): RedemptionCode {
  const fields = new Map(node.fields.map((f) => [f.key, f.value]))

  return {
    id: node.id,
    code: fields.get('code') || '',
    boxHandle: fields.get('box_handle') || '',
    purchaseOrderId: fields.get('purchase_order_id') || '',
    purchaseOrderName: fields.get('purchase_order_name') || undefined,
    purchaserEmail: fields.get('purchaser_email') || '',
    status: (fields.get('status') as CodeStatus) || 'unused',
    revealedProductHandle: fields.get('revealed_product_handle') || undefined,
    revealedVariantId: fields.get('revealed_variant_id') || undefined,
    revealedRarity: (fields.get('revealed_rarity') as Rarity) || undefined,
    revealedAt: fields.get('revealed_at') || undefined,
    seed: fields.get('seed') || undefined,
    shippingAddress: fields.get('shipping_address')
      ? JSON.parse(fields.get('shipping_address')!)
      : undefined,
    claimedAt: fields.get('claimed_at') || undefined,
    fulfillmentOrderId: fields.get('fulfillment_order_id') || undefined,
    createdAt: node.handle.split('-').pop() || new Date().toISOString(),
  }
}

/**
 * Convert fields to metaobject input format
 */
function toMetaobjectFields(
  data: Partial<RedemptionCode>
): Array<{ key: string; value: string }> {
  const fields: Array<{ key: string; value: string }> = []

  if (data.code) fields.push({ key: 'code', value: data.code })
  if (data.boxHandle) fields.push({ key: 'box_handle', value: data.boxHandle })
  if (data.purchaseOrderId)
    fields.push({ key: 'purchase_order_id', value: data.purchaseOrderId })
  if (data.purchaseOrderName)
    fields.push({ key: 'purchase_order_name', value: data.purchaseOrderName })
  if (data.purchaserEmail)
    fields.push({ key: 'purchaser_email', value: data.purchaserEmail })
  if (data.status) fields.push({ key: 'status', value: data.status })
  if (data.revealedProductHandle)
    fields.push({ key: 'revealed_product_handle', value: data.revealedProductHandle })
  if (data.revealedVariantId)
    fields.push({ key: 'revealed_variant_id', value: data.revealedVariantId })
  if (data.revealedRarity)
    fields.push({ key: 'revealed_rarity', value: data.revealedRarity })
  if (data.revealedAt)
    fields.push({ key: 'revealed_at', value: data.revealedAt })
  if (data.seed) fields.push({ key: 'seed', value: data.seed })
  if (data.shippingAddress)
    fields.push({ key: 'shipping_address', value: JSON.stringify(data.shippingAddress) })
  if (data.claimedAt)
    fields.push({ key: 'claimed_at', value: data.claimedAt })
  if (data.fulfillmentOrderId)
    fields.push({ key: 'fulfillment_order_id', value: data.fulfillmentOrderId })

  return fields
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create the metaobject definition (run once during setup)
 */
export async function setupMetaobjectDefinition(): Promise<boolean> {
  try {
    console.log('Setting up metaobject definition...')
    const response = await adminFetch<{
      metaobjectDefinitionCreate: {
        metaobjectDefinition: { id: string; type: string } | null
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(CREATE_METAOBJECT_DEFINITION)

    console.log('Setup response:', JSON.stringify(response, null, 2))

    if (response.metaobjectDefinitionCreate.userErrors.length > 0) {
      console.error(
        'Failed to create metaobject definition:',
        response.metaobjectDefinitionCreate.userErrors
      )
      return false
    }

    if (response.metaobjectDefinitionCreate.metaobjectDefinition) {
      console.log('Metaobject definition created:', response.metaobjectDefinitionCreate.metaobjectDefinition)
      return true
    }

    console.error('No metaobject definition returned')
    return false
  } catch (error) {
    console.error('Error creating metaobject definition:', error)
    return false
  }
}

/**
 * Create a new redemption code
 */
export async function createRedemptionCode(
  data: Omit<RedemptionCode, 'id' | 'createdAt'>
): Promise<RedemptionCode | null> {
  const handle = `${data.code.toLowerCase().replace(/-/g, '')}-${Date.now()}`
  const fields = toMetaobjectFields({ ...data, status: 'unused' })

  try {
    const response = await adminFetch<CreateMetaobjectResponse>(
      CREATE_REDEMPTION_CODE,
      { handle, fields }
    )

    if (response.metaobjectCreate.userErrors.length > 0) {
      console.error(
        'Failed to create redemption code:',
        response.metaobjectCreate.userErrors
      )
      return null
    }

    if (!response.metaobjectCreate.metaobject) {
      return null
    }

    return parseMetaobjectToCode(response.metaobjectCreate.metaobject)
  } catch (error) {
    console.error('Error creating redemption code:', error)
    return null
  }
}

/**
 * Get redemption code by code string
 */
export async function getRedemptionCodeByCode(
  code: string
): Promise<RedemptionCode | null> {
  try {
    console.log('[getRedemptionCodeByCode] Searching for code:', code)

    // Fetch recent metaobjects and filter by exact code match
    // Shopify's query parameter does full-text search, not exact field match
    const response = await adminFetch<GetMetaobjectsResponse>(
      GET_REDEMPTION_CODE_BY_HANDLE,
      { type: 'redemption_code', first: 100 }
    )

    console.log('[getRedemptionCodeByCode] Fetched nodes:', response.metaobjects.nodes.length)

    // Find the exact match by code field
    const matchingNode = response.metaobjects.nodes.find(node => {
      const codeField = node.fields.find(f => f.key === 'code')
      return codeField?.value === code
    })

    if (!matchingNode) {
      console.log('[getRedemptionCodeByCode] No exact match found for:', code)
      return null
    }

    console.log('[getRedemptionCodeByCode] Found exact match:', matchingNode.handle)
    return parseMetaobjectToCode(matchingNode)
  } catch (error) {
    console.error('Error fetching redemption code:', error)
    return null
  }
}

/**
 * Get all redemption codes for a customer email
 */
export async function getRedemptionCodesByEmail(
  email: string
): Promise<RedemptionCode[]> {
  try {
    // Fetch all metaobjects and filter by email
    const response = await adminFetch<GetMetaobjectsResponse>(
      GET_REDEMPTION_CODE_BY_HANDLE,
      { type: 'redemption_code', first: 100 }
    )

    // Filter by exact email match
    const matchingNodes = response.metaobjects.nodes.filter(node => {
      const emailField = node.fields.find(f => f.key === 'purchaser_email')
      return emailField?.value === email
    })

    return matchingNodes.map(parseMetaobjectToCode)
  } catch (error) {
    console.error('Error fetching redemption codes by email:', error)
    return []
  }
}

/**
 * Update redemption code (for reveal and claim)
 */
export async function updateRedemptionCode(
  id: string,
  updates: Partial<RedemptionCode>
): Promise<RedemptionCode | null> {
  const fields = toMetaobjectFields(updates)

  try {
    const response = await adminFetch<UpdateMetaobjectResponse>(
      UPDATE_REDEMPTION_CODE,
      { id, fields }
    )

    if (response.metaobjectUpdate.userErrors.length > 0) {
      console.error(
        'Failed to update redemption code:',
        response.metaobjectUpdate.userErrors
      )
      return null
    }

    if (!response.metaobjectUpdate.metaobject) {
      return null
    }

    return parseMetaobjectToCode(response.metaobjectUpdate.metaobject)
  } catch (error) {
    console.error('Error updating redemption code:', error)
    return null
  }
}

/**
 * Mark code as revealed
 */
export async function markCodeRevealed(
  id: string,
  revealData: {
    revealedProductHandle: string
    revealedVariantId?: string
    revealedRarity: Rarity
    seed: string
  }
): Promise<RedemptionCode | null> {
  return updateRedemptionCode(id, {
    status: 'revealed',
    revealedProductHandle: revealData.revealedProductHandle,
    revealedVariantId: revealData.revealedVariantId,
    revealedRarity: revealData.revealedRarity,
    revealedAt: new Date().toISOString(),
    seed: revealData.seed,
  })
}

/**
 * Mark code as claimed with shipping address
 * @param claimedVariantId - Optional variant ID if user selected a different size at claim time
 */
export async function markCodeClaimed(
  id: string,
  shippingAddress: ShippingAddress,
  fulfillmentOrderId?: string,
  claimedVariantId?: string
): Promise<RedemptionCode | null> {
  const updates: Partial<RedemptionCode> = {
    status: 'claimed',
    shippingAddress,
    claimedAt: new Date().toISOString(),
    fulfillmentOrderId,
  }

  // If a different variant was selected at claim time, update it
  if (claimedVariantId) {
    updates.revealedVariantId = claimedVariantId
  }

  return updateRedemptionCode(id, updates)
}

/**
 * Mark code as shipped
 */
export async function markCodeShipped(
  id: string
): Promise<RedemptionCode | null> {
  return updateRedemptionCode(id, {
    status: 'shipped',
  })
}
