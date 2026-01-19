import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem } from '@/types/wishlist'

interface WishlistState {
  items: WishlistItem[]

  // Actions
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()

        // Don't add if already in wishlist
        if (items.some((i) => i.productId === item.productId)) {
          return
        }

        set({
          items: [
            ...items,
            {
              ...item,
              addedAt: new Date().toISOString(),
            },
          ],
        })
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })
      },

      toggleItem: (item) => {
        const { items, addItem, removeItem } = get()
        const isInList = items.some((i) => i.productId === item.productId)

        if (isInList) {
          removeItem(item.productId)
        } else {
          addItem(item)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId)
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'neo-stage-wishlist',
    }
  )
)
