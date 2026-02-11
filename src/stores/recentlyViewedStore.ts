import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecentlyViewedItem } from '@/types/recentlyViewed'

const MAX_ITEMS = 12

interface RecentlyViewedState {
  items: RecentlyViewedItem[]

  // Actions
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void
  removeItem: (productId: string) => void
  clearAll: () => void
  getItems: () => RecentlyViewedItem[]
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()

        // Remove existing item with same productId (for deduplication)
        const filteredItems = items.filter((i) => i.productId !== item.productId)

        // Add new item at the beginning
        const newItem: RecentlyViewedItem = {
          ...item,
          viewedAt: new Date().toISOString(),
        }

        // Keep only the most recent MAX_ITEMS
        const newItems = [newItem, ...filteredItems].slice(0, MAX_ITEMS)

        set({ items: newItems })
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })
      },

      clearAll: () => {
        set({ items: [] })
      },

      getItems: () => {
        return get().items
      },
    }),
    {
      name: 'tamashii-recently-viewed',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
