'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useRequireAuth'

export default function AccountPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized || isLoading) {
      return
    }

    if (isAuthenticated) {
      router.replace('/account/dashboard')
    } else {
      router.replace('/account/login')
    }
  }, [isAuthenticated, isInitialized, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
    </div>
  )
}
