import type { BundleConfig } from '@/types/bundle'

export const BUNDLES: BundleConfig[] = [
  {
    id: 'sign-tee-combo',
    discountCode: 'BUNDLE-SIGN-TEE-10',
    discountPercent: 10,
    products: [
      { handle: 'anime-custom-sign' },
      { handle: 'anime-custom-t-shirt-4' },
    ],
    featured: true,
    badge: 'POPULAR',
    themeColor: 'cyan',
  },
]

export function getBundleById(id: string): BundleConfig | undefined {
  return BUNDLES.find((b) => b.id === id)
}

export function getAllBundles(): BundleConfig[] {
  return BUNDLES
}
