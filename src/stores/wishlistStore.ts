import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem } from '@/types/wishlist'

interface WishlistState {
  items: WishlistItem[]
  isSyncing: boolean
  lastSyncedAt: string | null

  // Actions
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number

  // Sync actions
  syncFromShopify: (accessToken: string) => Promise<void>
  syncToShopify: (accessToken: string) => Promise<void>
  mergeWithRemote: (remoteItems: WishlistItem[]) => void
}

// Debounce helper for sync
let syncTimeout: NodeJS.Timeout | null = null
const SYNC_DEBOUNCE_MS = 1000

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSyncedAt: null,

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

        // Trigger debounced sync if logged in
        debouncedSync()
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })

        // Trigger debounced sync if logged in
        debouncedSync()
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
        debouncedSync()
      },

      getItemCount: () => {
        return get().items.length
      },

      // Fetch wishlist from Shopify and merge with local
      syncFromShopify: async (accessToken) => {
        console.log('[Wishlist] syncFromShopify called')
        if (!accessToken) {
          console.log('[Wishlist] No access token, skipping sync')
          return
        }

        set({ isSyncing: true })

        try {
          console.log('[Wishlist] Fetching from API...')
          const response = await fetch('/api/wishlist', {
            headers: {
              'X-Customer-Access-Token': accessToken,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch wishlist')
          }

          const data = await response.json()
          const remoteItems: WishlistItem[] = data.items || []
          console.log('[Wishlist] Received items from Shopify:', remoteItems.length)

          // Merge remote with local
          const localItems = get().items
          console.log('[Wishlist] Local items before merge:', localItems.length)
          get().mergeWithRemote(remoteItems)
          console.log('[Wishlist] Items after merge:', get().items.length)

          set({
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          })

          // After merge, sync back to ensure consistency
          await get().syncToShopify(accessToken)
        } catch (error) {
          console.error('[Wishlist] Failed to sync from Shopify:', error)
          set({ isSyncing: false })
        }
      },

      // Save current wishlist to Shopify
      syncToShopify: async (accessToken) => {
        console.log('[Wishlist] syncToShopify called with token:', accessToken ? accessToken.substring(0, 20) + '...' : 'none')
        if (!accessToken) {
          console.log('[Wishlist] No token, skipping sync')
          return
        }

        const { items } = get()
        console.log('[Wishlist] Saving', items.length, 'items to Shopify')

        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Customer-Access-Token': accessToken,
            },
            body: JSON.stringify({ items }),
          })

          console.log('[Wishlist] Save response status:', response.status)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('[Wishlist] Save failed:', errorData)
            throw new Error('Failed to save wishlist')
          }

          set({ lastSyncedAt: new Date().toISOString() })
          console.log('[Wishlist] Saved successfully')
        } catch (error) {
          console.error('Failed to sync wishlist to Shopify:', error)
        }
      },

      // Merge remote items with local items
      mergeWithRemote: (remoteItems) => {
        const { items: localItems } = get()

        // Create a map of all items by productId
        const mergedMap = new Map<string, WishlistItem>()

        // Add all remote items first
        remoteItems.forEach((item) => {
          mergedMap.set(item.productId, item)
        })

        // Add local items, preferring newer addedAt dates
        localItems.forEach((localItem) => {
          const existing = mergedMap.get(localItem.productId)

          if (!existing) {
            // Item only exists locally, add it
            mergedMap.set(localItem.productId, localItem)
          } else {
            // Item exists in both, keep the one with newer addedAt
            const localDate = new Date(localItem.addedAt)
            const remoteDate = new Date(existing.addedAt)

            if (localDate > remoteDate) {
              mergedMap.set(localItem.productId, localItem)
            }
          }
        })

        // Convert map back to array, sorted by addedAt (newest first)
        const mergedItems = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        )

        set({ items: mergedItems })
      },
    }),
    {
      name: 'tamashii-wishlist',
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)

// Store reference on globalThis to survive HMR
declare global {
  // eslint-disable-next-line no-var
  var __authStore: typeof import('./authStore').useAuthStore | undefined
}

// Helper to get auth store (survives HMR)
async function getAuthStore() {
  if (!globalThis.__authStore) {
    const { useAuthStore } = await import('./authStore')
    globalThis.__authStore = useAuthStore
  }
  return globalThis.__authStore
}

// Debounced sync function that checks auth state
function debouncedSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  syncTimeout = setTimeout(async () => {
    try {
      const useAuthStore = await getAuthStore()
      const authState = useAuthStore.getState()
      const accessToken = authState.accessToken
      const isAuth = authState.isAuthenticated()

      console.log('[Wishlist] Debounced sync - accessToken:', accessToken ? 'present' : 'missing')
      console.log('[Wishlist] Debounced sync - isAuthenticated:', isAuth)

      if (accessToken && isAuth) {
        console.log('[Wishlist] Debounced sync - syncing to Shopify')
        await useWishlistStore.getState().syncToShopify(accessToken)
      } else {
        console.log('[Wishlist] Debounced sync - skipping (not authenticated)')
      }
    } catch (err) {
      console.error('[Wishlist] Debounced sync error:', err)
    }
  }, SYNC_DEBOUNCE_MS)
}
