import { KeyRound } from 'lucide-react'
import { ResetPasswordForm } from './ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Neo-Stage Collective account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
          <KeyRound className="w-10 h-10 text-neon-cyan" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-center text-white mb-2">
          Reset Password
        </h1>
        <p className="text-center text-white/60 mb-8">
          Enter your new password below
        </p>

        {/* Form */}
        <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
