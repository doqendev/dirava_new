import type { ShopifyProduct } from './shopify'

export interface BundleProduct {
  handle: string
}

export interface BundleConfig {
  id: string
  discountCode: string
  discountPercent: number
  products: BundleProduct[]
  featured?: boolean
  badge?: string
  themeColor?: 'cyan' | 'pink' | 'orange'
}

export interface BundleResolved {
  config: BundleConfig
  products: ShopifyProduct[]
  originalTotal: number
  bundleTotal: number
  savings: number
  currencyCode: string
  allAvailable: boolean
}
