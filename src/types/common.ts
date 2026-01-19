/**
 * Common utility types
 */

import type { ReactNode } from 'react'

/**
 * Props that include children
 */
export interface WithChildren {
  children: ReactNode
}

/**
 * Props that include optional className
 */
export interface WithClassName {
  className?: string
}

/**
 * Common component props
 */
export interface BaseComponentProps extends WithClassName {
  id?: string
}

/**
 * Navigation item type
 */
export interface NavItem {
  icon: string
  label: string
  href: string
}

/**
 * Product rarity levels
 */
export type Rarity = 'common' | 'rare' | 'legendary'

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

/**
 * Pagination params
 */
export interface PaginationParams {
  first?: number
  after?: string | null
  last?: number
  before?: string | null
}
