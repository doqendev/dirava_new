import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shopifyClient } from '@/lib/shopify/client'
import {
  CREATE_CART,
  ADD_TO_CART,
  UPDATE_CART_LINE,
  REMOVE_FROM_CART,
  UPDATE_CART_BUYER,
  CART_DISCOUNT_CODES_UPDATE,
} from '@/lib/shopify/mutations'
import { GET_CART } from '@/lib/shopify/queries'
import { useLocaleStore } from '@/stores/localeStore'
import type { ShopifyCartLine, ShopifyMoney, ShopifyDiscountCode } from '@/types/shopify'

/**
 * Read the shopper's active country from localeStore. Used for @inContext
 * and buyerIdentity on every cart operation so cart totals + checkout stay
 * in the market's presentment currency.
 */
function getCountryForCart(): string {
  return useLocaleStore.getState().country
}

// Debounce tracking for rapid quantity changes
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
const pendingSnapshots = new Map<string, ShopifyCartLine[]>()

interface ShopifyCartResponse {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
  discountCodes: ShopifyDiscountCode[]
  discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
  lines: { edges: Array<{ node: ShopifyCartLine }> }
}

interface CartState {
  cartId: string | null
  checkoutUrl: string | null
  lines: ShopifyCartLine[]
  totalQuantity: number
  subtotal: ShopifyMoney | null
  discountCodes: ShopifyDiscountCode[]
  discountAmount: ShopifyMoney | null
  total: ShopifyMoney | null
  isLoading: boolean
  loadingItems: Set<string>
  isApplyingDiscount: boolean
  error: string | null

  // Actions
  initializeCart: () => Promise<void>
  addItem: (variantId: string, quantity?: number, attributes?: Array<{ key: string; value: string }>) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  applyDiscount: (code: string) => Promise<{ success: boolean; error?: string }>
  addBundle: (items: Array<{ variantId: string; quantity?: number }>, discountCode: string, bundleId: string) => Promise<{ success: boolean; error?: string }>
  removeDiscount: () => Promise<void>
  /**
   * Update the cart's buyer country so Shopify checkout uses the matching
   * presentment currency. Called when the shopper picks a new country.
   * No-op when no cart exists yet.
   */
  syncBuyerCountry: (country: string) => Promise<void>
  clearCart: () => void
  setError: (error: string | null) => void
}

function applyCartResponse(
  set: (state: Partial<CartState>) => void,
  cart: ShopifyCartResponse,
  extraState?: Partial<CartState>
) {
  const discountTotal = cart.discountAllocations?.reduce(
    (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
    0
  ) || 0

  set({
    lines: cart.lines.edges.map((edge) => edge.node),
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    discountCodes: cart.discountCodes || [],
    discountAmount: discountTotal > 0
      ? { amount: discountTotal.toString(), currencyCode: cart.cost.subtotalAmount.currencyCode }
      : null,
    total: cart.cost.totalAmount || null,
    checkoutUrl: cart.checkoutUrl,
    isLoading: false,
    ...extraState,
  })
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      lines: [],
      totalQuantity: 0,
      subtotal: null,
      discountCodes: [],
      discountAmount: null,
      total: null,
      isLoading: false,
      loadingItems: new Set<string>(),
      isApplyingDiscount: false,
      error: null,

      initializeCart: async () => {
        const { cartId } = get()

        if (cartId) {
          // Fetch existing cart
          try {
            set({ isLoading: true, error: null })
            const response = await shopifyClient.request<{
              cart: ShopifyCartResponse | null
            }>(GET_CART, { cartId, country: getCountryForCart() })

            if (response.cart) {
              applyCartResponse(set, response.cart)
            } else {
              // Cart expired, create new one
              get().clearCart()
            }
          } catch (error) {
            console.error('Failed to fetch cart:', error)
            get().clearCart()
          }
        }
      },

      addItem: async (variantId, quantity = 1, attributes) => {
        const { cartId } = get()
        set({ isLoading: true, error: null })

        try {
          let currentCartId = cartId
          const country = getCountryForCart()

          // Create cart if doesn't exist
          if (!currentCartId) {
            const createResponse = await shopifyClient.request<{
              cartCreate: { cart: { id: string; checkoutUrl: string } }
            }>(CREATE_CART, { country })

            currentCartId = createResponse.cartCreate.cart.id
            set({
              cartId: currentCartId,
              checkoutUrl: createResponse.cartCreate.cart.checkoutUrl,
            })
          }

          // Build line item with optional attributes
          const lineItem: { merchandiseId: string; quantity: number; attributes?: Array<{ key: string; value: string }> } = {
            merchandiseId: variantId,
            quantity,
          }

          if (attributes && attributes.length > 0) {
            lineItem.attributes = attributes
          }

          // Add item to cart
          const response = await shopifyClient.request<{
            cartLinesAdd: { cart: ShopifyCartResponse; userErrors?: Array<{ message: string }> }
          }>(ADD_TO_CART, {
            cartId: currentCartId,
            lines: [lineItem],
            country,
          })

          const { cart, userErrors } = response.cartLinesAdd
          if (userErrors && userErrors.length > 0) {
            set({ error: userErrors[0]!.message, isLoading: false })
            return
          }

          applyCartResponse(set, cart)
        } catch (error) {
          console.error('Failed to add item:', error)
          set({
            error: 'Failed to add item to cart',
            isLoading: false,
          })
        }
      },

      addBundle: async (items, discountCode, bundleId) => {
        const { cartId } = get()
        set({ isLoading: true, error: null })

        try {
          let currentCartId = cartId
          const country = getCountryForCart()

          // Create cart if doesn't exist
          if (!currentCartId) {
            const createResponse = await shopifyClient.request<{
              cartCreate: { cart: { id: string; checkoutUrl: string } }
            }>(CREATE_CART, { country })

            currentCartId = createResponse.cartCreate.cart.id
            set({
              cartId: currentCartId,
              checkoutUrl: createResponse.cartCreate.cart.checkoutUrl,
            })
          }

          // Build line items with bundle attribute
          const lines = items.map((item) => ({
            merchandiseId: item.variantId,
            quantity: item.quantity || 1,
            attributes: [{ key: '_bundle', value: bundleId }],
          }))

          // Add all items to cart
          const response = await shopifyClient.request<{
            cartLinesAdd: { cart: ShopifyCartResponse }
          }>(ADD_TO_CART, {
            cartId: currentCartId,
            lines,
            country,
          })

          const cart = response.cartLinesAdd.cart
          applyCartResponse(set, cart)

          // Auto-apply discount code
          const discountResult = await get().applyDiscount(discountCode)
          return discountResult

        } catch (error) {
          console.error('Failed to add bundle:', error)
          set({
            error: 'Failed to add bundle to cart',
            isLoading: false,
          })
          return { success: false, error: 'Failed to add bundle to cart' }
        }
      },

      updateItem: async (lineId, quantity) => {
        const { cartId } = get()
        if (!cartId) return

        if (quantity === 0) {
          await get().removeItem(lineId)
          return
        }

        // Capture original snapshot for rollback (only on first rapid change)
        if (!pendingSnapshots.has(lineId)) {
          pendingSnapshots.set(lineId, [...get().lines])
        }

        // Optimistic update — immediately reflect new quantity
        const newLines = get().lines.map((l) => l.id === lineId ? { ...l, quantity } : l)
        const newTotal = newLines.reduce((sum, l) => sum + l.quantity, 0)
        set({
          lines: newLines,
          totalQuantity: newTotal,
          loadingItems: new Set([...Array.from(get().loadingItems), lineId]),
          error: null,
        })

        // Debounce API call (300ms)
        const existing = debounceTimers.get(lineId)
        if (existing) clearTimeout(existing)

        debounceTimers.set(lineId, setTimeout(async () => {
          debounceTimers.delete(lineId)
          const currentCartId = get().cartId
          if (!currentCartId) { pendingSnapshots.delete(lineId); return }
          try {
            const response = await shopifyClient.request<{
              cartLinesUpdate: { cart: ShopifyCartResponse }
            }>(UPDATE_CART_LINE, {
              cartId: currentCartId,
              lines: [{ id: lineId, quantity: get().lines.find((l) => l.id === lineId)?.quantity ?? quantity }],
              country: getCountryForCart(),
            })

            const cart = response.cartLinesUpdate.cart
            pendingSnapshots.delete(lineId)
            const nextLoading = new Set(get().loadingItems)
            nextLoading.delete(lineId)
            applyCartResponse(set, cart, { loadingItems: nextLoading })
          } catch (error) {
            console.error('Failed to update item:', error)
            const snapshot = pendingSnapshots.get(lineId)
            const nextLoading = new Set(get().loadingItems)
            nextLoading.delete(lineId)
            if (snapshot) {
              const snapshotTotal = snapshot.reduce((sum, l) => sum + l.quantity, 0)
              set({ lines: snapshot, totalQuantity: snapshotTotal, loadingItems: nextLoading })
              pendingSnapshots.delete(lineId)
            } else {
              set({ loadingItems: nextLoading })
            }
          }
        }, 300))
      },

      removeItem: async (lineId) => {
        const { cartId } = get()
        if (!cartId) return

        // Cancel any pending debounce for this item
        const timer = debounceTimers.get(lineId)
        if (timer) {
          clearTimeout(timer)
          debounceTimers.delete(lineId)
          pendingSnapshots.delete(lineId)
        }

        // Optimistic remove
        const previousLines = [...get().lines]
        const previousTotal = get().totalQuantity
        const newLines = get().lines.filter((l) => l.id !== lineId)
        const newTotal = newLines.reduce((sum, l) => sum + l.quantity, 0)
        const nextLoading = new Set([...Array.from(get().loadingItems), lineId])
        set({ lines: newLines, totalQuantity: newTotal, loadingItems: nextLoading, error: null })

        try {
          const response = await shopifyClient.request<{
            cartLinesRemove: { cart: ShopifyCartResponse }
          }>(REMOVE_FROM_CART, {
            cartId,
            lineIds: [lineId],
            country: getCountryForCart(),
          })

          const cart = response.cartLinesRemove.cart
          const doneLoading = new Set(get().loadingItems)
          doneLoading.delete(lineId)
          applyCartResponse(set, cart, { loadingItems: doneLoading })
        } catch (error) {
          console.error('Failed to remove item:', error)
          const doneLoading = new Set(get().loadingItems)
          doneLoading.delete(lineId)
          set({ lines: previousLines, totalQuantity: previousTotal, loadingItems: doneLoading })
        }
      },

      applyDiscount: async (code) => {
        const { cartId } = get()
        if (!cartId) {
          return { success: false, error: 'No cart found' }
        }

        set({ isApplyingDiscount: true, error: null })

        try {
          const response = await shopifyClient.request<{
            cartDiscountCodesUpdate: {
              cart: ShopifyCartResponse
              userErrors: Array<{ field: string[]; message: string }>
            }
          }>(CART_DISCOUNT_CODES_UPDATE, {
            cartId,
            discountCodes: [code],
            country: getCountryForCart(),
          })

          if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
            const errorMessage = response.cartDiscountCodesUpdate.userErrors[0]?.message || 'Invalid discount code'
            set({ isApplyingDiscount: false, error: errorMessage })
            return { success: false, error: errorMessage }
          }

          const cart = response.cartDiscountCodesUpdate.cart
          applyCartResponse(set, cart, { isApplyingDiscount: false })

          return { success: true }
        } catch (error) {
          console.error('Failed to apply discount:', error)
          const errorMessage = 'Failed to apply discount code'
          set({ error: errorMessage, isApplyingDiscount: false })
          return { success: false, error: errorMessage }
        }
      },

      removeDiscount: async () => {
        const { cartId } = get()
        if (!cartId) return

        set({ isApplyingDiscount: true, error: null })

        try {
          const response = await shopifyClient.request<{
            cartDiscountCodesUpdate: {
              cart: ShopifyCartResponse
              userErrors: Array<{ field: string[]; message: string }>
            }
          }>(CART_DISCOUNT_CODES_UPDATE, {
            cartId,
            discountCodes: [],
            country: getCountryForCart(),
          })

          const cart = response.cartDiscountCodesUpdate.cart
          applyCartResponse(set, cart, { isApplyingDiscount: false, discountCodes: [], discountAmount: null })
        } catch (error) {
          console.error('Failed to remove discount:', error)
          set({ error: 'Failed to remove discount code', isApplyingDiscount: false })
        }
      },

      syncBuyerCountry: async (country: string) => {
        const { cartId } = get()
        if (!cartId) return
        const upper = country.toUpperCase()
        if (!/^[A-Z]{2}$/.test(upper)) return
        try {
          const response = await shopifyClient.request<{
            cartBuyerIdentityUpdate: {
              cart: (ShopifyCartResponse & { checkoutUrl: string }) | null
              userErrors: Array<{ field: string[]; message: string }>
            }
          }>(UPDATE_CART_BUYER, {
            cartId,
            buyerIdentity: { countryCode: upper },
            country: upper,
          })
          const cart = response.cartBuyerIdentityUpdate.cart
          if (cart) {
            // Checkout URL + cost currency can change after market switch.
            set({ checkoutUrl: cart.checkoutUrl })
            // Refresh full cart so line prices re-render in new currency.
            await get().initializeCart()
          }
        } catch (error) {
          console.error('Failed to sync cart buyer country:', error)
        }
      },

      clearCart: () => {
        debounceTimers.forEach((timer) => clearTimeout(timer))
        debounceTimers.clear()
        pendingSnapshots.clear()
        set({
          cartId: null,
          checkoutUrl: null,
          lines: [],
          totalQuantity: 0,
          subtotal: null,
          discountCodes: [],
          discountAmount: null,
          total: null,
          isLoading: false,
          loadingItems: new Set<string>(),
          isApplyingDiscount: false,
          error: null,
        })
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'mizoke-cart',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
)
