import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { RegisterForm } from './RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a Mizoke account to track orders and save your wishlist.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Avatar */}
        <div className="mx-auto w-20 h-20 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
          <UserPlus className="w-10 h-10 text-neon-cyan" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-center text-white mb-2">
          Join the Spirit
        </h1>
        <p className="text-center text-white/60 mb-8">
          Create an account to track orders and get exclusive access
        </p>

        {/* Form */}
        <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
          <RegisterForm />
        </div>

        {/* Sign In Link */}
        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/account/login" className="text-neon-cyan hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
