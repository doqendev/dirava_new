import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCartStore } from '../cartStore'

// Mock shopify client
vi.mock('@/lib/shopify/client', () => ({
  shopifyClient: {
    request: vi.fn(),
  },
}))

// Mock mutations and queries
vi.mock('@/lib/shopify/mutations', () => ({
  CREATE_CART: 'CREATE_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_LINE: 'UPDATE_CART_LINE',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CART_DISCOUNT_CODES_UPDATE: 'CART_DISCOUNT_CODES_UPDATE',
}))

vi.mock('@/lib/shopify/queries', () => ({
  GET_CART: 'GET_CART',
}))

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store state
    useCartStore.setState({
      cartId: null,
      checkoutUrl: null,
      lines: [],
      totalQuantity: 0,
      subtotal: null,
      discountCodes: [],
      discountAmount: null,
      total: null,
      isLoading: false,
      isApplyingDiscount: false,
      error: null,
    })
    vi.clearAllMocks()
  })

  it('has correct initial state', () => {
    const state = useCartStore.getState()
    expect(state.cartId).toBeNull()
    expect(state.lines).toEqual([])
    expect(state.totalQuantity).toBe(0)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('clearCart resets all state', () => {
    useCartStore.setState({
      cartId: 'test-cart',
      lines: [{ id: 'line1' }] as never[],
      totalQuantity: 3,
      isLoading: true,
      error: 'some error',
    })

    useCartStore.getState().clearCart()

    const state = useCartStore.getState()
    expect(state.cartId).toBeNull()
    expect(state.lines).toEqual([])
    expect(state.totalQuantity).toBe(0)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('setError sets and clears error', () => {
    useCartStore.getState().setError('test error')
    expect(useCartStore.getState().error).toBe('test error')

    useCartStore.getState().setError(null)
    expect(useCartStore.getState().error).toBeNull()
  })

  it('addItem creates cart if none exists', async () => {
    const { shopifyClient } = await import('@/lib/shopify/client')
    const mockRequest = shopifyClient.request as ReturnType<typeof vi.fn>

    // Mock cart creation
    mockRequest.mockResolvedValueOnce({
      cartCreate: { cart: { id: 'new-cart', checkoutUrl: 'https://checkout.test' } },
    })
    // Mock add to cart
    mockRequest.mockResolvedValueOnce({
      cartLinesAdd: {
        cart: {
          id: 'new-cart',
          checkoutUrl: 'https://checkout.test',
          totalQuantity: 1,
          cost: {
            subtotalAmount: { amount: '29.99', currencyCode: 'USD' },
            totalAmount: { amount: '29.99', currencyCode: 'USD' },
          },
          discountCodes: [],
          discountAllocations: [],
          lines: { edges: [{ node: { id: 'line1', quantity: 1 } }] },
        },
      },
    })

    await useCartStore.getState().addItem('variant-1')

    const state = useCartStore.getState()
    expect(state.cartId).toBe('new-cart')
    expect(state.totalQuantity).toBe(1)
    expect(state.isLoading).toBe(false)
    expect(mockRequest).toHaveBeenCalledTimes(2)
  })

  it('addItem handles errors gracefully', async () => {
    const { shopifyClient } = await import('@/lib/shopify/client')
    const mockRequest = shopifyClient.request as ReturnType<typeof vi.fn>
    mockRequest.mockRejectedValueOnce(new Error('Network error'))

    await useCartStore.getState().addItem('variant-1')

    const state = useCartStore.getState()
    expect(state.error).toBe('Failed to add item to cart')
    expect(state.isLoading).toBe(false)
  })

  it('removeItem removes from cart', async () => {
    useCartStore.setState({ cartId: 'test-cart' })

    const { shopifyClient } = await import('@/lib/shopify/client')
    const mockRequest = shopifyClient.request as ReturnType<typeof vi.fn>
    mockRequest.mockResolvedValueOnce({
      cartLinesRemove: {
        cart: {
          id: 'test-cart',
          checkoutUrl: 'https://checkout.test',
          totalQuantity: 0,
          cost: {
            subtotalAmount: { amount: '0', currencyCode: 'USD' },
            totalAmount: { amount: '0', currencyCode: 'USD' },
          },
          discountCodes: [],
          discountAllocations: [],
          lines: { edges: [] },
        },
      },
    })

    await useCartStore.getState().removeItem('line1')

    const state = useCartStore.getState()
    expect(state.lines).toEqual([])
    expect(state.totalQuantity).toBe(0)
  })

  it('applyDiscount returns error when no cart', async () => {
    const result = await useCartStore.getState().applyDiscount('TEST10')
    expect(result).toEqual({ success: false, error: 'No cart found' })
  })

  it('updateItem delegates to removeItem when quantity is 0', async () => {
    useCartStore.setState({ cartId: 'test-cart' })

    const { shopifyClient } = await import('@/lib/shopify/client')
    const mockRequest = shopifyClient.request as ReturnType<typeof vi.fn>
    mockRequest.mockResolvedValueOnce({
      cartLinesRemove: {
        cart: {
          id: 'test-cart',
          checkoutUrl: 'https://checkout.test',
          totalQuantity: 0,
          cost: {
            subtotalAmount: { amount: '0', currencyCode: 'USD' },
            totalAmount: { amount: '0', currencyCode: 'USD' },
          },
          discountCodes: [],
          discountAllocations: [],
          lines: { edges: [] },
        },
      },
    })

    await useCartStore.getState().updateItem('line1', 0)
    expect(useCartStore.getState().totalQuantity).toBe(0)
  })

  it('applyDiscount calculates discount amount', async () => {
    useCartStore.setState({ cartId: 'test-cart' })

    const { shopifyClient } = await import('@/lib/shopify/client')
    const mockRequest = shopifyClient.request as ReturnType<typeof vi.fn>
    mockRequest.mockResolvedValueOnce({
      cartDiscountCodesUpdate: {
        cart: {
          id: 'test-cart',
          checkoutUrl: 'https://checkout.test',
          totalQuantity: 1,
          cost: {
            subtotalAmount: { amount: '29.99', currencyCode: 'USD' },
            totalAmount: { amount: '26.99', currencyCode: 'USD' },
          },
          discountCodes: [{ code: 'TEST10', applicable: true }],
          discountAllocations: [{ discountedAmount: { amount: '3.00', currencyCode: 'USD' } }],
          lines: { edges: [{ node: { id: 'line1', quantity: 1 } }] },
        },
        userErrors: [],
      },
    })

    const result = await useCartStore.getState().applyDiscount('TEST10')

    expect(result).toEqual({ success: true })
    const state = useCartStore.getState()
    expect(state.discountAmount).toEqual({ amount: '3', currencyCode: 'USD' })
    expect(state.isApplyingDiscount).toBe(false)
  })
})
