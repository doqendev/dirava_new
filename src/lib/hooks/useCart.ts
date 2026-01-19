'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'

/**
 * Hook to initialize and access cart state
 */
export function useCart() {
  const cart = useCartStore()

  // Initialize cart on mount
  useEffect(() => {
    if (cart.cartId && cart.lines.length === 0) {
      cart.initializeCart()
    }
  }, [cart])

  return {
    lines: cart.lines,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.subtotal,
    checkoutUrl: cart.checkoutUrl,
    isLoading: cart.isLoading,
    error: cart.error,
    addItem: cart.addItem,
    updateItem: cart.updateItem,
    removeItem: cart.removeItem,
    clearCart: cart.clearCart,
  }
}
