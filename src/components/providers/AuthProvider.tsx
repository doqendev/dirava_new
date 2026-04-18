'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeSession = useAuthStore((state) => state.initializeSession)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      void initializeSession()
    }
  }, [initializeSession, isInitialized, isLoading])

  return <>{children}</>
}
