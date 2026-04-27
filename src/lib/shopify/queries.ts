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
 * Get all universes (collections with custom.universe metafield).
 * No @inContext needed — returns no money fields.
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
          themeColor: metafield(namespace: "custom", key: "theme_color") {
            value
          }
          products(first: 250) {
            edges {
              node {
                id
                variants(first: 100) {
                  edges {
                    node {
                      id
                      image {
                        url
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
      }
    }
  }
`

/**
 * Get products for a specific universe/collection
 */
export const GET_UNIVERSE_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetUniverseProducts(
    $handle: String!
    $first: Int!
    $after: String
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      themeColor: metafield(namespace: "custom", key: "theme_color") {
        value
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
                  image {
                    url
                    altText
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
 * Get a single product by handle
 */
export const GET_PRODUCT = gql`
  query GetProduct($handle: String!, $country: CountryCode = PT)
  @inContext(country: $country) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      tags
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
      images(first: 50) {
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
            image {
              url
              altText
            }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "universe" }
        { namespace: "custom", key: "rarity" }
        { namespace: "custom", key: "personalization" }
        { namespace: "custom", key: "features" }
        { namespace: "custom", key: "lifestyle_scenes" }
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
  query GetDropProducts($first: Int!, $country: CountryCode = PT)
  @inContext(country: $country) {
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
  query GetCart($cartId: ID!, $country: CountryCode = PT)
  @inContext(country: $country) {
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
      discountCodes {
        code
        applicable
      }
      discountAllocations {
        discountedAmount {
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
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                product {
                  id
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
  query SearchProducts($query: String!, $first: Int!, $country: CountryCode = PT)
  @inContext(country: $country) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductFields
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
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
 * Predictive search
 */
export const PREDICTIVE_SEARCH = gql`
  query PredictiveSearch($query: String!, $country: CountryCode = PT)
  @inContext(country: $country) {
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
        collections(first: 1) {
          edges {
            node {
              metafield(namespace: "custom", key: "universe") {
                value
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Get Shopify ML-based product recommendations
 */
export const GET_PRODUCT_RECOMMENDATIONS = gql`
  query GetProductRecommendations($productId: ID!, $country: CountryCode = PT)
  @inContext(country: $country) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
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
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
      collections(first: 1) {
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
 * Get related products from the same collection
 */
export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts(
    $collectionHandle: String!
    $first: Int!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    collection(handle: $collectionHandle) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
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
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
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
 * Get new arrivals (latest products sorted by created date)
 */
export const GET_NEW_ARRIVALS = gql`
  ${PRODUCT_FRAGMENT}
  query GetNewArrivals($first: Int!, $country: CountryCode = PT)
  @inContext(country: $country) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ...ProductFields
          universe: metafield(namespace: "custom", key: "universe") {
            value
          }
        }
      }
    }
  }
`

/**
 * Get best sellers (products with is_bestseller metafield)
 */
export const GET_BEST_SELLERS = gql`
  ${PRODUCT_FRAGMENT}
  query GetBestSellers($first: Int!, $country: CountryCode = PT)
  @inContext(country: $country) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          ...ProductFields
          isBestseller: metafield(namespace: "custom", key: "is_bestseller") {
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
 * Get all products (for filtering on sale items client-side)
 */
export const GET_ALL_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetAllProducts($first: Int!, $country: CountryCode = PT)
  @inContext(country: $country) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ...ProductFields
          universe: metafield(namespace: "custom", key: "universe") {
            value
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
                image {
                  url
                  altText
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
 * Get all products for sitemap (no money fields).
 */
export const GET_SITEMAP_PRODUCTS = gql`
  query GetSitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          updatedAt
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
    }
  }
`
