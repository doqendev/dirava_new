import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Mizoke account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
          <KeyRound className="w-10 h-10 text-neon-cyan" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-center text-white mb-2">
          Forgot Password?
        </h1>
        <p className="text-center text-white/60 mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {/* Form */}
        <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
          <ForgotPasswordForm />
        </div>

        {/* Back to Login */}
        <p className="text-center text-white/50 text-sm mt-6">
          Remember your password?{' '}
          <Link href="/account/login" className="text-neon-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
