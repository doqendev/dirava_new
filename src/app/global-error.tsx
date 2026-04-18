'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/Button'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-primary text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="font-display text-2xl text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-white/60 mb-8">
              An unexpected error occurred while loading this page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="primary" glow="cyan">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button as="a" href="/" variant="outline">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
