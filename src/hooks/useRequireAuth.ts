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
  const { customer, initializeSession, isAuthenticated, fetchCustomer, isLoading, isInitialized } =
    useAuthStore()

  useEffect(() => {
    if (!isInitialized) {
      void initializeSession()
      return
    }

    if (!isAuthenticated()) {
      const returnUrl = encodeURIComponent(pathname)
      router.replace(`/account/login?returnUrl=${returnUrl}`)
      return
    }

    if (!customer && !isLoading) {
      void fetchCustomer()
    }
  }, [
    customer,
    fetchCustomer,
    initializeSession,
    isAuthenticated,
    isInitialized,
    isLoading,
    pathname,
    router,
  ])

  return {
    customer,
    isLoading: !isInitialized || isLoading || (!customer && isAuthenticated()),
    isAuthenticated: isAuthenticated(),
  }
}

/**
 * Hook to check if user is authenticated (without redirect)
 */
export function useAuth() {
  const { customer, isAuthenticated, isLoading, error, isInitialized, initializeSession } =
    useAuthStore()

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      void initializeSession()
    }
  }, [initializeSession, isInitialized, isLoading])

  return {
    customer,
    isAuthenticated: isAuthenticated(),
    isLoading,
    isInitialized,
    error,
  }
}
