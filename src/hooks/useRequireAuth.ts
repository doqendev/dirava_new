'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook to protect routes that require authentication
 * Redirects to login page if not authenticated
 * Returns customer data if authenticated
 */
export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const { customer, accessToken, isAuthenticated, fetchCustomer, isLoading } = useAuthStore()

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated()) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname)
      router.replace(`/account/login?returnUrl=${returnUrl}`)
      return
    }

    // Fetch fresh customer data if we have a token but no customer data
    if (accessToken && !customer && !isLoading) {
      fetchCustomer()
    }
  }, [accessToken, customer, isAuthenticated, fetchCustomer, isLoading, pathname, router])

  return {
    customer,
    isLoading: isLoading || (!customer && isAuthenticated()),
    isAuthenticated: isAuthenticated(),
  }
}

/**
 * Hook to check if user is authenticated (without redirect)
 */
export function useAuth() {
  const { customer, accessToken, isAuthenticated, isLoading, error } = useAuthStore()

  return {
    customer,
    accessToken,
    isAuthenticated: isAuthenticated(),
    isLoading,
    error,
  }
}
