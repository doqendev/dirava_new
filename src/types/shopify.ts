/**
 * Shopify Storefront API Types
 */

export interface ShopifyImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface ShopifyMoney {
  amount: string
  currencyCode: string
}

export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney
  maxVariantPrice?: ShopifyMoney
}

export interface ShopifyMetafield {
  key: string
  value: string
  namespace?: string
  type?: string
}

export interface ShopifySelectedOption {
  name: string
  value: string
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable?: number | null
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  selectedOptions: ShopifySelectedOption[]
  image?: ShopifyImage
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml?: string
  priceRange: ShopifyPriceRange
  compareAtPriceRange?: ShopifyPriceRange
  featuredImage: ShopifyImage | null
  images?: {
    edges: Array<{ node: ShopifyImage }>
  }
  variants?: {
    edges: Array<{ node: ShopifyProductVariant }>
  }
  metafields?: ShopifyMetafield[] | null
  collections?: {
    edges: Array<{
      node: {
        handle: string
        metafield?: ShopifyMetafield | null
      }
    }>
  }
  tags?: string[]
  productType?: string
  vendor?: string
  availableForSale?: boolean
  createdAt?: string
}

export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  products?: {
    totalCount?: number
    pageInfo?: {
      hasNextPage: boolean
      endCursor: string | null
    }
    edges: Array<{ node: ShopifyProduct }>
  }
  metafield?: ShopifyMetafield | null
}

export interface ShopifyCartLineAttribute {
  key: string
  value: string
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  attributes?: ShopifyCartLineAttribute[]
  merchandise: {
    id: string
    title: string
    price: ShopifyMoney
    compareAtPrice?: ShopifyMoney | null
    product: {
      id: string
      title: string
      handle: string
      featuredImage: ShopifyImage | null
    }
    selectedOptions: ShopifySelectedOption[]
  }
}

export interface ShopifyDiscountCode {
  code: string
  applicable: boolean
}

export interface ShopifyDiscountAllocation {
  discountedAmount: ShopifyMoney
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: ShopifyMoney
    totalAmount: ShopifyMoney
    totalTaxAmount?: ShopifyMoney
  }
  discountCodes?: ShopifyDiscountCode[]
  discountAllocations?: ShopifyDiscountAllocation[]
  lines: {
    edges: Array<{ node: ShopifyCartLine }>
  }
}

export interface ShopifyPageInfo {
  hasNextPage: boolean
  hasPreviousPage?: boolean
  startCursor?: string | null
  endCursor: string | null
}

// GraphQL Response Types
export interface ShopifyConnection<T> {
  edges: Array<{ node: T; cursor?: string }>
  pageInfo?: ShopifyPageInfo
}
