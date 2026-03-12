'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GachaRevealError({ error, reset }: ErrorProps) {
  const t = useTranslations('errors')

  useEffect(() => {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error)
    })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="font-display text-2xl text-white mb-2">
          {t('revealFailed')}
        </h1>
        <p className="text-white/60 mb-8">
          {t('revealFailedDescription')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="primary" glow="cyan">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('tryAgain')}
          </Button>
          <Button as="a" href="/" variant="outline">
            <Home className="w-4 h-4 mr-2" />
            {t('goHome')}
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 p-4 bg-red-500/10 rounded-lg text-left">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
