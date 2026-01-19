import { gql } from 'graphql-request'

/**
 * Product fragment for consistent product data
 */
const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    createdAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
    }
  }
`

/**
 * Get all universes (collections with custom.universe metafield)
 */
export const GET_UNIVERSES = gql`
  query GetUniverses {
    collections(first: 50) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          metafield(namespace: "custom", key: "universe") {
            value
          }
          products(first: 250) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Get products for a specific universe/collection
 */
export const GET_UNIVERSE_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetUniverseProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...ProductFields
            metafield(namespace: "custom", key: "rarity") {
              value
            }
          }
        }
      }
    }
  }
`

/**
 * Get a single product by handle
 */
export const GET_PRODUCT = gql`
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "universe" }
        { namespace: "custom", key: "rarity" }
        { namespace: "custom", key: "personalization" }
      ]) {
        key
        value
      }
      collections(first: 10) {
        edges {
          node {
            handle
            metafield(namespace: "custom", key: "universe") {
              value
            }
          }
        }
      }
    }
  }
`

/**
 * Get drop products (products with is_drop: true)
 */
export const GET_DROP_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetDropProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ...ProductFields
          metafield(namespace: "custom", key: "is_drop") {
            value
          }
          dropDate: metafield(namespace: "custom", key: "drop_date") {
            value
          }
          universe: metafield(namespace: "custom", key: "universe") {
            value
          }
        }
      }
    }
  }
`

/**
 * Get cart by ID
 */
export const GET_CART = gql`
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            attributes {
              key
              value
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
                selectedOptions {
                  name
                  value
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
 * Search products
 */
export const SEARCH_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`

/**
 * Predictive search
 */
export const PREDICTIVE_SEARCH = gql`
  query PredictiveSearch($query: String!) {
    predictiveSearch(query: $query, limit: 10, types: [PRODUCT]) {
      products {
        id
        handle
        title
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
      }
    }
  }
`
