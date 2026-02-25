'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useRequireAuth'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/account/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Show nothing while checking auth or redirecting
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Avatar placeholder */}
        <div className="mx-auto w-24 h-24 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
          <User className="w-12 h-12 text-neon-cyan" />
        </div>

        <h1 className="font-display text-2xl text-white mb-2">
          Welcome to <span className="text-neon-cyan">Mizoke</span>
        </h1>
        <p className="text-white/60 mb-8">
          Sign in to track orders, save your wishlist, and get exclusive access to drops.
        </p>

        <div className="space-y-3">
          <Link
            href="/account/login"
            className="inline-flex items-center justify-center w-full px-4 py-2 font-display tracking-wider uppercase rounded-lg bg-neon-cyan text-black font-semibold hover:bg-neon-cyan/90 hover:shadow-glow-cyan transition-all duration-200"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Link>
          <Link
            href="/account/register"
            className="inline-flex items-center justify-center w-full px-4 py-2 font-display tracking-wider uppercase rounded-lg bg-bg-card border border-border-subtle text-white hover:border-neon-cyan hover:text-neon-cyan transition-all duration-200"
          >
            Create Account
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/40">
          By continuing, you agree to our{' '}
          <Link href="/policies/terms-of-service" className="text-neon-cyan hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/policies/privacy-policy" className="text-neon-cyan hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
