export interface RecentlyViewedItem {
  productId: string
  handle: string
  title: string
  price: {
    amount: string
    currencyCode: string
  }
  compareAtPrice?: {
    amount: string
    currencyCode: string
  } | null
  image: {
    url: string
    altText: string | null
  } | null
  universe?: string
  variantId?: string
  viewedAt: string
}
