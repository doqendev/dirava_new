import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shopifyClient } from '@/lib/shopify/client'
import { CREATE_CART, ADD_TO_CART, UPDATE_CART_LINE, REMOVE_FROM_CART, CART_DISCOUNT_CODES_UPDATE } from '@/lib/shopify/mutations'
import { GET_CART } from '@/lib/shopify/queries'
import type { ShopifyCartLine, ShopifyMoney, ShopifyDiscountCode } from '@/types/shopify'

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
  isApplyingDiscount: boolean
  error: string | null

  // Actions
  initializeCart: () => Promise<void>
  addItem: (variantId: string, quantity?: number, attributes?: Array<{ key: string; value: string }>) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  applyDiscount: (code: string) => Promise<{ success: boolean; error?: string }>
  removeDiscount: () => Promise<void>
  clearCart: () => void
  setError: (error: string | null) => void
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
      isApplyingDiscount: false,
      error: null,

      initializeCart: async () => {
        const { cartId } = get()

        if (cartId) {
          // Fetch existing cart
          try {
            set({ isLoading: true, error: null })
            const response = await shopifyClient.request<{
              cart: {
                id: string
                checkoutUrl: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              } | null
            }>(GET_CART, { cartId })

            if (response.cart) {
              const discountTotal = response.cart.discountAllocations?.reduce(
                (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
                0
              ) || 0

              set({
                lines: response.cart.lines.edges.map((edge) => edge.node),
                totalQuantity: response.cart.totalQuantity,
                subtotal: response.cart.cost.subtotalAmount,
                discountCodes: response.cart.discountCodes || [],
                discountAmount: discountTotal > 0 ? { amount: discountTotal.toString(), currencyCode: response.cart.cost.subtotalAmount.currencyCode } : null,
                total: response.cart.cost.totalAmount || null,
                checkoutUrl: response.cart.checkoutUrl,
                isLoading: false,
              })
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

          // Create cart if doesn't exist
          if (!currentCartId) {
            const createResponse = await shopifyClient.request<{
              cartCreate: { cart: { id: string; checkoutUrl: string } }
            }>(CREATE_CART)

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
            cartLinesAdd: {
              cart: {
                id: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                checkoutUrl: string
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(ADD_TO_CART, {
            cartId: currentCartId,
            lines: [lineItem],
          })

          const cart = response.cartLinesAdd.cart
          const discountTotal = cart.discountAllocations?.reduce(
            (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
            0
          ) || 0

          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
            discountCodes: cart.discountCodes || [],
            discountAmount: discountTotal > 0 ? { amount: discountTotal.toString(), currencyCode: cart.cost.subtotalAmount.currencyCode } : null,
            total: cart.cost.totalAmount || null,
            checkoutUrl: cart.checkoutUrl,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to add item:', error)
          set({
            error: 'Failed to add item to cart',
            isLoading: false,
          })
        }
      },

      updateItem: async (lineId, quantity) => {
        const { cartId } = get()
        if (!cartId) return

        set({ isLoading: true, error: null })

        try {
          if (quantity === 0) {
            // Remove item if quantity is 0
            await get().removeItem(lineId)
            return
          }

          const response = await shopifyClient.request<{
            cartLinesUpdate: {
              cart: {
                id: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(UPDATE_CART_LINE, {
            cartId,
            lines: [{ id: lineId, quantity }],
          })

          const cart = response.cartLinesUpdate.cart
          const discountTotal = cart.discountAllocations?.reduce(
            (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
            0
          ) || 0

          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
            discountCodes: cart.discountCodes || [],
            discountAmount: discountTotal > 0 ? { amount: discountTotal.toString(), currencyCode: cart.cost.subtotalAmount.currencyCode } : null,
            total: cart.cost.totalAmount || null,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to update item:', error)
          set({
            error: 'Failed to update item',
            isLoading: false,
          })
        }
      },

      removeItem: async (lineId) => {
        const { cartId } = get()
        if (!cartId) return

        set({ isLoading: true, error: null })

        try {
          const response = await shopifyClient.request<{
            cartLinesRemove: {
              cart: {
                id: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(REMOVE_FROM_CART, {
            cartId,
            lineIds: [lineId],
          })

          const cart = response.cartLinesRemove.cart
          const discountTotal = cart.discountAllocations?.reduce(
            (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
            0
          ) || 0

          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
            discountCodes: cart.discountCodes || [],
            discountAmount: discountTotal > 0 ? { amount: discountTotal.toString(), currencyCode: cart.cost.subtotalAmount.currencyCode } : null,
            total: cart.cost.totalAmount || null,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to remove item:', error)
          set({
            error: 'Failed to remove item',
            isLoading: false,
          })
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
              cart: {
                id: string
                checkoutUrl: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
              userErrors: Array<{ field: string[]; message: string }>
            }
          }>(CART_DISCOUNT_CODES_UPDATE, {
            cartId,
            discountCodes: [code],
          })

          if (response.cartDiscountCodesUpdate.userErrors.length > 0) {
            const errorMessage = response.cartDiscountCodesUpdate.userErrors[0]?.message || 'Invalid discount code'
            set({ isApplyingDiscount: false, error: errorMessage })
            return { success: false, error: errorMessage }
          }

          const cart = response.cartDiscountCodesUpdate.cart
          const discountTotal = cart.discountAllocations?.reduce(
            (sum: number, a: { discountedAmount: ShopifyMoney }) => sum + parseFloat(a.discountedAmount.amount),
            0
          ) || 0

          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
            discountCodes: cart.discountCodes || [],
            discountAmount: discountTotal > 0 ? { amount: discountTotal.toString(), currencyCode: cart.cost.subtotalAmount.currencyCode } : null,
            total: cart.cost.totalAmount || null,
            checkoutUrl: cart.checkoutUrl,
            isApplyingDiscount: false,
          })

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
              cart: {
                id: string
                checkoutUrl: string
                totalQuantity: number
                cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney }
                discountCodes: ShopifyDiscountCode[]
                discountAllocations: Array<{ discountedAmount: ShopifyMoney }>
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
              userErrors: Array<{ field: string[]; message: string }>
            }
          }>(CART_DISCOUNT_CODES_UPDATE, {
            cartId,
            discountCodes: [],
          })

          const cart = response.cartDiscountCodesUpdate.cart
          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
            discountCodes: [],
            discountAmount: null,
            total: cart.cost.totalAmount || null,
            checkoutUrl: cart.checkoutUrl,
            isApplyingDiscount: false,
          })
        } catch (error) {
          console.error('Failed to remove discount:', error)
          set({ error: 'Failed to remove discount code', isApplyingDiscount: false })
        }
      },

      clearCart: () => {
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
          isApplyingDiscount: false,
          error: null,
        })
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'tamashii-cart',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
)
