import { vi } from 'vitest'

export const mockShopifyClient = {
  request: vi.fn(),
}

vi.mock('@/lib/shopify/client', () => ({
  shopifyClient: mockShopifyClient,
  shopifyFetch: mockShopifyClient.request,
}))
