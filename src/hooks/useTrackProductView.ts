'use client'

import { useEffect } from 'react'
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore'
import type { RecentlyViewedItem } from '@/types/recentlyViewed'

type TrackProductData = Omit<RecentlyViewedItem, 'viewedAt'>

export function useTrackProductView(product: TrackProductData | null) {
  const addItem = useRecentlyViewedStore((state) => state.addItem)

  useEffect(() => {
    if (!product || !product.productId) return

    // Small delay to ensure the component is properly mounted
    const timeoutId = setTimeout(() => {
      addItem(product)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [product?.productId, addItem])
}
