export interface LifestyleImage {
  url: string
  alt: string
}

/**
 * Lifestyle/product-in-context images keyed by product handle.
 * When a product has no entry here, the gallery section is hidden.
 */
export const productLifestyleImages: Record<string, LifestyleImage[]> = {
  // Add entries per product handle, e.g.:
  // 'one-piece-custom-sign': [
  //   { url: 'https://cdn.shopify.com/...', alt: 'One Piece sign on a gaming desk' },
  // ],
}

export function getProductLifestyleImages(handle: string): LifestyleImage[] | null {
  const images = productLifestyleImages[handle]
  return images && images.length > 0 ? images : null
}
