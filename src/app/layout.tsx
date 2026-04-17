import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getLocale, getCurrency } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { SOCIAL_LINKS } from '@/lib/utils/constants'
import { SITE_URL } from '@/lib/utils/siteUrl'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { SearchModal } from '@/components/search/SearchModal'
import { QuickViewModal } from '@/components/product/QuickViewModal'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { ToastContainer } from '@/components/ui/Toast'
import { LocaleProvider } from '@/components/providers/LocaleProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { TrackingProvider } from '@/components/providers/TrackingProvider'
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
    metadataBase: new URL(SITE_URL),
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
    // Note: alternates.languages removed — cookie-based i18n has no path-based
    // locale routing, so /de, /fr etc. URLs don't exist. Re-add when switching
    // to path-based locale routing.
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mizoke',
    alternateName: 'Mizoke Anime Store',
    description:
      'Mizoke is an online store for custom anime merchandise — LED signs, lightbox signs, keychains, magnets, and apparel personalized with characters from One Piece, Demon Slayer, Dragon Ball, Attack on Titan, Hunter x Hunter, Jujutsu Kaisen, Bleach, and Digimon.',
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@mizoke.com',
      url: `${SITE_URL}/contact`,
      availableLanguage: ['English', 'German', 'French', 'Spanish', 'Portuguese'],
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mizoke',
    url: SITE_URL,
    inLanguage: ['en', 'de', 'fr', 'es', 'pt'],
    publisher: {
      '@type': 'Organization',
      name: 'Mizoke',
      url: SITE_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
          {messages.common?.skipToContent || 'Skip to content'}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <MotionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <LocaleProvider initialLocale={locale} initialCurrency={currency}>
              <AuthProvider>
                <Header />
                <main id="main-content" className="pt-16 pb-20 lg:pb-0 overflow-visible">
                  {children}
                </main>
                <Footer />
                <BottomNav />
                <CartDrawer />
                <MobileMenu />
                <SearchModal />
                <QuickViewModal />
                <CookieConsent />
                <ToastContainer />
                <TrackingProvider />
                <AnalyticsProvider />
              </AuthProvider>
            </LocaleProvider>
          </NextIntlClientProvider>
        </MotionProvider>
      </body>
    </html>
  )
}
