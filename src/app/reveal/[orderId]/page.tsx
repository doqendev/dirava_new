import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { RevealClient } from './RevealClient'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('revealOrderTitle'),
    description: t('revealOrderDescription'),
    robots: { index: false, follow: false },
  }
}

interface RevealPageProps {
  params: Promise<{ orderId: string }>
}

function RevealLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 font-display">Preparing your reveal...</p>
      </div>
    </div>
  )
}

export default async function RevealPage({ params }: RevealPageProps) {
  const { orderId } = await params

  if (!orderId) {
    notFound()
  }

  return (
    <Suspense fallback={<RevealLoading />}>
      <RevealClient orderId={orderId} />
    </Suspense>
  )
}
