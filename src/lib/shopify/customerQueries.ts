import { gql } from 'graphql-request'

/**
 * Get customer profile with addresses
 */
export const GET_CUSTOMER = gql`
  query GetCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        provinceCode
        country
        countryCodeV2
        zip
        phone
        formatted
      }
      addresses(first: 20) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            provinceCode
            country
            countryCodeV2
            zip
            phone
            formatted
          }
        }
      }
    }
  }
`

/**
 * Get customer orders
 */
export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($customerAccessToken: String!, $first: Int = 20) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    title
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                    }
                    product {
                      handle
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
 * Get single order details
 */
export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    node(id: $id) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        financialStatus
        fulfillmentStatus
        totalPrice {
          amount
          currencyCode
        }
        subtotalPrice {
          amount
          currencyCode
        }
        totalShippingPrice {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        shippingAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
          formatted
        }
        lineItems(first: 100) {
          edges {
            node {
              title
              quantity
              variant {
                title
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                product {
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`
