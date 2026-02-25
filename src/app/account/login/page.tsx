import Link from 'next/link'
import { User } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
  }
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Avatar */}
        <div className="mx-auto w-20 h-20 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-neon-cyan" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-center text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-white/60 mb-8">
          Sign in to access your account
        </p>

        {/* Form */}
        <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
          <LoginForm />
        </div>

        {/* Create Account Link */}
        <p className="text-center text-white/50 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/account/register"
            className="text-neon-cyan hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
