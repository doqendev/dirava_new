// Shopify Customer types

export interface ShopifyCustomerAddress {
  id: string
  firstName: string | null
  lastName: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  provinceCode: string | null
  country: string | null
  countryCodeV2: string | null
  zip: string | null
  phone: string | null
  formatted: string[]
}

export interface ShopifyCustomer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  acceptsMarketing: boolean
  defaultAddress: ShopifyCustomerAddress | null
  addresses: {
    edges: Array<{ node: ShopifyCustomerAddress }>
  }
}

export interface ShopifyCustomerAccessToken {
  accessToken: string
  expiresAt: string
}

export interface ShopifyOrderLineItem {
  title: string
  quantity: number
  variant: {
    title: string
    price: {
      amount: string
      currencyCode: string
    }
    image: {
      url: string
      altText: string | null
    } | null
    product: {
      handle: string
    }
  } | null
}

export interface ShopifyOrder {
  id: string
  name: string
  orderNumber: number
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  subtotalPrice: {
    amount: string
    currencyCode: string
  }
  totalShippingPrice: {
    amount: string
    currencyCode: string
  }
  totalTax: {
    amount: string
    currencyCode: string
  }
  shippingAddress: ShopifyCustomerAddress | null
  lineItems: {
    edges: Array<{ node: ShopifyOrderLineItem }>
  }
}

export interface CustomerUserError {
  field: string[] | null
  message: string
  code?: string
}

// Form data types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AddressFormData {
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  province: string
  country: string
  zip: string
  phone: string
}

export interface SettingsFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  acceptsMarketing: boolean
}

export interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
