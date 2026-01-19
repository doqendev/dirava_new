import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shopifyClient } from '@/lib/shopify/client'
import { CREATE_CART, ADD_TO_CART, UPDATE_CART_LINE, REMOVE_FROM_CART } from '@/lib/shopify/mutations'
import { GET_CART } from '@/lib/shopify/queries'
import type { ShopifyCartLine, ShopifyMoney } from '@/types/shopify'

interface CartState {
  cartId: string | null
  checkoutUrl: string | null
  lines: ShopifyCartLine[]
  totalQuantity: number
  subtotal: ShopifyMoney | null
  isLoading: boolean
  error: string | null

  // Actions
  initializeCart: () => Promise<void>
  addItem: (variantId: string, quantity?: number, attributes?: Array<{ key: string; value: string }>) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
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
      isLoading: false,
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
                cost: { subtotalAmount: ShopifyMoney }
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              } | null
            }>(GET_CART, { cartId })

            if (response.cart) {
              set({
                lines: response.cart.lines.edges.map((edge) => edge.node),
                totalQuantity: response.cart.totalQuantity,
                subtotal: response.cart.cost.subtotalAmount,
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
                cost: { subtotalAmount: ShopifyMoney }
                checkoutUrl: string
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(ADD_TO_CART, {
            cartId: currentCartId,
            lines: [lineItem],
          })

          const cart = response.cartLinesAdd.cart
          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
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
                cost: { subtotalAmount: ShopifyMoney }
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(UPDATE_CART_LINE, {
            cartId,
            lines: [{ id: lineId, quantity }],
          })

          const cart = response.cartLinesUpdate.cart
          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
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
                cost: { subtotalAmount: ShopifyMoney }
                lines: { edges: Array<{ node: ShopifyCartLine }> }
              }
            }
          }>(REMOVE_FROM_CART, {
            cartId,
            lineIds: [lineId],
          })

          const cart = response.cartLinesRemove.cart
          set({
            lines: cart.lines.edges.map((edge) => edge.node),
            totalQuantity: cart.totalQuantity,
            subtotal: cart.cost.subtotalAmount,
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

      clearCart: () => {
        set({
          cartId: null,
          checkoutUrl: null,
          lines: [],
          totalQuantity: 0,
          subtotal: null,
          isLoading: false,
          error: null,
        })
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'neo-stage-cart',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
)
