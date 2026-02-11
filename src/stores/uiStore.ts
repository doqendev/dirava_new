import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GridColumns = 1 | 2 | 3

interface QuickViewProduct {
  handle: string
  universe?: string
}

interface UIState {
  // Cart drawer
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Search
  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  // Quick view modal
  quickViewProduct: QuickViewProduct | null
  openQuickView: (product: QuickViewProduct) => void
  closeQuickView: () => void

  // Mobile menu
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void

  // Filter drawer (mobile)
  isFilterDrawerOpen: boolean
  openFilterDrawer: () => void
  closeFilterDrawer: () => void

  // Active universe (for theming)
  activeUniverse: string | null
  setActiveUniverse: (universe: string | null) => void

  // Collection view preferences (persisted)
  gridColumns: GridColumns
  setGridColumns: (columns: GridColumns) => void
  showProductInfo: boolean
  setShowProductInfo: (show: boolean) => void
  toggleProductInfo: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Cart drawer
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      // Search
      isSearchOpen: false,
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),

      // Quick view modal
      quickViewProduct: null,
      openQuickView: (product) => set({ quickViewProduct: product }),
      closeQuickView: () => set({ quickViewProduct: null }),

      // Mobile menu
      isMobileMenuOpen: false,
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      // Filter drawer (mobile)
      isFilterDrawerOpen: false,
      openFilterDrawer: () => set({ isFilterDrawerOpen: true }),
      closeFilterDrawer: () => set({ isFilterDrawerOpen: false }),

      // Active universe
      activeUniverse: null,
      setActiveUniverse: (universe) => set({ activeUniverse: universe }),

      // Collection view preferences
      gridColumns: 2,
      setGridColumns: (columns) => set({ gridColumns: columns }),
      showProductInfo: true,
      setShowProductInfo: (show) => set({ showProductInfo: show }),
      toggleProductInfo: () => set((state) => ({ showProductInfo: !state.showProductInfo })),
    }),
    {
      name: 'tamashii-ui',
      partialize: (state) => ({
        gridColumns: state.gridColumns,
        showProductInfo: state.showProductInfo,
      }),
    }
  )
)
