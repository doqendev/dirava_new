/**
 * GraphQL queries for Gacha / Mystery Box
 *
 * Themed mystery box system with redeemable codes
 */

import { gql } from 'graphql-request'

// ============================================================================
// Storefront API Queries
// ============================================================================

/**
 * Get mystery box product with loot pool and theme metafields
 */
export const GET_MYSTERY_BOX = gql`
  query GetMysteryBox($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
      }
      variants(first: 1) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
      lootPool: metafield(namespace: "gacha", key: "loot_pool") {
        value
      }
      theme: metafield(namespace: "gacha", key: "theme") {
        value
      }
    }
  }
`

/**
 * Get all mystery box products
 */
export const GET_ALL_MYSTERY_BOXES = gql`
  query GetAllMysteryBoxes {
    products(first: 20, query: "tag:mystery-box OR product_type:'Mystery Box'") {
      edges {
        node {
          id
          handle
          title
          description
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          lootPool: metafield(namespace: "gacha", key: "loot_pool") {
            value
          }
          theme: metafield(namespace: "gacha", key: "theme") {
            value
          }
        }
      }
    }
  }
`

/**
 * Get product by handle (for reveal)
 */
export const GET_PRODUCT_FOR_REVEAL = gql`
  query GetProductForReveal($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

/**
 * Get multiple products by handles (for loot pool display)
 */
export const GET_PRODUCTS_BY_HANDLES = gql`
  query GetProductsByHandles($handles: [String!]!) {
    products(first: 50, query: $handles) {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    }
  }
`

// ============================================================================
// Admin API Queries
// ============================================================================

/**
 * Admin API: Get order by ID
 */
export const ADMIN_GET_ORDER = gql`
  query AdminGetOrder($id: ID!) {
    order(id: $id) {
      id
      name
      email
      displayFinancialStatus
      displayFulfillmentStatus
      tags
      customer {
        id
        email
      }
      lineItems(first: 20) {
        edges {
          node {
            id
            name
            quantity
            customAttributes {
              key
              value
            }
            variant {
              id
              product {
                id
                handle
                productType
                tags
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Admin API: Get order by name (e.g., "#1001")
 */
export const ADMIN_GET_ORDER_BY_NAME = gql`
  query AdminGetOrderByName($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          id
          name
          email
          displayFinancialStatus
          customer {
            id
            email
          }
          lineItems(first: 20) {
            edges {
              node {
                id
                name
                quantity
                variant {
                  id
                  product {
                    id
                    handle
                    productType
                    tags
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Admin API: Create draft order for fulfillment
 */
export const ADMIN_CREATE_DRAFT_ORDER = gql`
  mutation AdminCreateDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        order {
          id
          name
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
 * Admin API: Complete draft order (marks as paid)
 */
export const ADMIN_COMPLETE_DRAFT_ORDER = gql`
  mutation AdminCompleteDraftOrder($id: ID!) {
    draftOrderComplete(id: $id, paymentPending: false) {
      draftOrder {
        id
        order {
          id
          name
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
 * Admin API: Add tags to order (for tracking)
 */
export const ADMIN_ADD_ORDER_TAGS = gql`
  mutation AdminAddOrderTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Admin API: Get product variant by ID
 */
export const ADMIN_GET_VARIANT = gql`
  query AdminGetVariant($id: ID!) {
    productVariant(id: $id) {
      id
      title
      price
      product {
        id
        handle
        title
      }
    }
  }
`

// ============================================================================
// Types for Query Responses
// ============================================================================

export interface MysteryBoxQueryResponse {
  product: {
    id: string
    handle: string
    title: string
    description: string
    productType: string
    tags: string[]
    priceRange: {
      minVariantPrice: {
        amount: string
        currencyCode: string
      }
    }
    featuredImage: {
      url: string
      altText: string | null
    } | null
    variants: {
      edges: Array<{
        node: {
          id: string
          title: string
          availableForSale: boolean
          price: {
            amount: string
            currencyCode: string
          }
        }
      }>
    }
    lootPool: {
      value: string
    } | null
    theme: {
      value: string
    } | null
  } | null
}

export interface AllMysteryBoxesResponse {
  products: {
    edges: Array<{
      node: MysteryBoxQueryResponse['product']
    }>
  }
}

export interface ProductForRevealResponse {
  product: {
    id: string
    handle: string
    title: string
    description: string
    priceRange: {
      minVariantPrice: {
        amount: string
        currencyCode: string
      }
    }
    featuredImage: {
      url: string
      altText: string | null
      width: number
      height: number
    } | null
    images: {
      edges: Array<{
        node: {
          url: string
          altText: string | null
        }
      }>
    }
    variants: {
      edges: Array<{
        node: {
          id: string
          title: string
          availableForSale: boolean
          price: {
            amount: string
            currencyCode: string
          }
        }
      }>
    }
  } | null
}

export interface OrderQueryResponse {
  order: {
    id: string
    name: string
    email: string
    displayFinancialStatus: string
    displayFulfillmentStatus: string
    tags: string[]
    customer: {
      id: string
      email: string
    } | null
    lineItems: {
      edges: Array<{
        node: {
          id: string
          name: string
          quantity: number
          customAttributes: Array<{
            key: string
            value: string
          }>
          variant: {
            id: string
            product: {
              id: string
              handle: string
              productType: string
              tags: string[]
            }
          } | null
        }
      }>
    }
  } | null
}

export interface DraftOrderCreateResponse {
  draftOrderCreate: {
    draftOrder: {
      id: string
      name: string
      invoiceUrl: string
      order: {
        id: string
        name: string
      } | null
    } | null
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}

export interface DraftOrderCompleteResponse {
  draftOrderComplete: {
    draftOrder: {
      id: string
      order: {
        id: string
        name: string
      } | null
    } | null
    userErrors: Array<{
      field: string[]
      message: string
    }>
  }
}
