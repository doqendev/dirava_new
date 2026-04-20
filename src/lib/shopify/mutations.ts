import { gql } from 'graphql-request'

/**
 * Create a new (empty) cart.
 * The `country` is both applied as the query-level @inContext (so the returned
 * cart prices are in the right presentment currency) and set on buyerIdentity
 * so Shopify checkout stays in that currency.
 */
export const CREATE_CART = gql`
  mutation CreateCart($country: CountryCode = PT)
  @inContext(country: $country) {
    cartCreate(input: { buyerIdentity: { countryCode: $country } }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Create cart with initial line items.
 */
export const CREATE_CART_WITH_LINES = gql`
  mutation CreateCartWithLines(
    $lines: [CartLineInput!]!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartCreate(input: {
      lines: $lines
      buyerIdentity: { countryCode: $country }
    }) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
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
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Add lines to cart
 */
export const ADD_TO_CART = gql`
  mutation AddToCart(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
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
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Update cart line quantities
 */
export const UPDATE_CART_LINE = gql`
  mutation UpdateCartLine(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
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
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Remove lines from cart
 */
export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart(
    $cartId: ID!
    $lineIds: [ID!]!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
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
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Update buyer identity. Also used to switch the cart's country when the
 * shopper changes it via the country selector — updates checkout currency.
 */
export const UPDATE_CART_BUYER = gql`
  mutation UpdateCartBuyer(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
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
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Apply discount codes to cart
 */
export const CART_DISCOUNT_CODES_UPDATE = gql`
  mutation CartDiscountCodesUpdate(
    $cartId: ID!
    $discountCodes: [String!]!
    $country: CountryCode = PT
  ) @inContext(country: $country) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
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
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Update cart attributes (used to pass click IDs for cross-domain attribution)
 */
export const CART_ATTRIBUTES_UPDATE = gql`
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(attributes: $attributes, cartId: $cartId) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`
