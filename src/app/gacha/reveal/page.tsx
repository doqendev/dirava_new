'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ticket, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { normalizeCode, isValidCodeFormat } from '@/lib/gacha/codeGenerator'

export default function RevealCodeEntryPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format code as user types (add dash after 4 chars)
  const handleCodeChange = (value: string) => {
    // Remove non-alphanumeric characters except dash
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '')

    // Auto-add dash after 4 characters
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      cleaned = cleaned + '-'
    }

    // Limit to 9 characters (XXXX-XXXX)
    if (cleaned.length <= 9) {
      setCode(cleaned)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalizedCode = normalizeCode(code)

    if (!isValidCodeFormat(normalizedCode)) {
      setError('Please enter a valid 8-character code (e.g., ABCD-1234)')
      return
    }

    setIsLoading(true)

    try {
      // Check if code exists and get its status
      const response = await fetch(`/api/gacha/codes/${normalizedCode}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Code not found')
        setIsLoading(false)
        return
      }

      // Navigate to reveal page
      router.push(`/gacha/reveal/${normalizedCode}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Back button */}
      <div className="px-4 py-4 max-w-xl mx-auto">
        <Link
          href="/gacha"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mystery Boxes</span>
        </Link>
      </div>

      <div className="px-4 py-12 max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-cyan/20 mb-4">
            <Ticket className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Redeem Your Code
          </h1>
          <p className="text-white/60">
            Enter your redemption code to reveal your mystery item
          </p>
        </div>

        {/* Code Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm text-white/60 mb-2">
              Redemption Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXXX-XXXX"
              className={cn(
                'w-full px-4 py-4 rounded-xl',
                'bg-bg-card border-2 text-center',
                'font-mono text-2xl tracking-[0.2em] text-white',
                'placeholder:text-white/20',
                'focus:outline-none focus:ring-0 transition-colors',
                error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-border-subtle focus:border-neon-cyan'
              )}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              maxLength={9}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.replace('-', '').length !== 8}
            className={cn(
              'w-full py-4 rounded-xl font-medium text-lg',
              'flex items-center justify-center gap-2',
              'transition-all',
              code.replace('-', '').length === 8 && !isLoading
                ? 'bg-neon-cyan text-black hover:bg-neon-cyan/90'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              'Reveal Mystery'
            )}
          </button>
        </form>

        {/* Help text */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white font-medium mb-2">Where is my code?</h3>
          <p className="text-white/60 text-sm">
            Your redemption code was sent to your email after purchasing a mystery box. Check your
            order confirmation email or your{' '}
            <Link href="/account/codes" className="text-neon-cyan hover:underline">
              account codes page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
