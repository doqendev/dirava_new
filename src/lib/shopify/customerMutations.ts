import { gql } from 'graphql-request'

/**
 * Create a new customer account
 */
export const CUSTOMER_CREATE = gql`
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Login - Create customer access token
 */
export const CUSTOMER_ACCESS_TOKEN_CREATE = gql`
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Renew customer access token before it expires
 */
export const CUSTOMER_ACCESS_TOKEN_RENEW = gql`
  mutation CustomerAccessTokenRenew($customerAccessToken: String!) {
    customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Delete customer access token (logout)
 */
export const CUSTOMER_ACCESS_TOKEN_DELETE = gql`
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Send password recovery email
 */
export const CUSTOMER_RECOVER = gql`
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Reset password with reset token from email
 */
export const CUSTOMER_RESET_BY_URL = gql`
  mutation CustomerResetByUrl($password: String!, $resetUrl: URL!) {
    customerResetByUrl(password: $password, resetUrl: $resetUrl) {
      customer {
        id
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Update customer profile
 */
export const CUSTOMER_UPDATE = gql`
  mutation CustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        email
        firstName
        lastName
        phone
        acceptsMarketing
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Create a new customer address
 */
export const CUSTOMER_ADDRESS_CREATE = gql`
  mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
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
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Update an existing customer address
 */
export const CUSTOMER_ADDRESS_UPDATE = gql`
  mutation CustomerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
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
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Delete a customer address
 */
export const CUSTOMER_ADDRESS_DELETE = gql`
  mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Set default customer address
 */
export const CUSTOMER_DEFAULT_ADDRESS_UPDATE = gql`
  mutation CustomerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`
