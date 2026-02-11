import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getLocale, getCurrency } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { SearchModal } from '@/components/search/SearchModal'
import { QuickViewModal } from '@/components/product/QuickViewModal'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { LocaleProvider } from '@/components/providers/LocaleProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  const locale = await getLocale()

  // Map locale to OpenGraph locale format
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    de: 'de_DE',
    fr: 'fr_FR',
    pt: 'pt_PT',
  }

  return {
    title: {
      default: t('homeTitle'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('homeDescription'),
    keywords: t('keywords'),
    authors: [{ name: t('siteName') }],
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] || 'en_US',
      siteName: t('siteName'),
      title: t('homeTitle'),
      description: t('homeDescription'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('homeTitle'),
      description: t('homeDescription'),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        'en': '/',
        'es': '/?locale=es',
        'de': '/?locale=de',
        'fr': '/?locale=fr',
        'pt': '/?locale=pt',
      },
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a12',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const currency = await getCurrency()
  const messages = getMessages(locale)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamashii.store'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tamashii',
    description: 'Your Anime Spirit - Premium anime merchandise',
    url: siteUrl,
  }

  return (
    <html
      lang={locale}
      className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-neon-cyan focus:text-bg-dark focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider initialLocale={locale} initialCurrency={currency}>
            <Header />
            <main id="main-content" className="pt-16 pb-20 lg:pb-0 overflow-visible">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <CartDrawer />
            <SearchModal />
            <QuickViewModal />
            <CookieConsent />
            <AnalyticsProvider />
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
