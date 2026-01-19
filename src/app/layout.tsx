import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartDrawer } from '@/components/layout/CartDrawer'
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

export const metadata: Metadata = {
  title: {
    default: 'Neo-Stage Collective | Anime Merch Universe',
    template: '%s | Neo-Stage Collective',
  },
  description: 'Drops, bundles, and collectibles — tap a universe. Premium anime merchandise from One Piece, Demon Slayer, Dragon Ball, Hunter x Hunter, and more.',
  keywords: ['anime', 'merchandise', 'one piece', 'demon slayer', 'dragon ball', 'hunter x hunter', 'collectibles', 'apparel'],
  authors: [{ name: 'Neo-Stage Collective' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Neo-Stage Collective',
    title: 'Neo-Stage Collective | Anime Merch Universe',
    description: 'Drops, bundles, and collectibles — tap a universe.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neo-Stage Collective | Anime Merch Universe',
    description: 'Drops, bundles, and collectibles — tap a universe.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen">
        <Header />
        <main className="pt-16 pb-20 lg:pb-0 overflow-visible">
          {children}
        </main>
        <BottomNav />
        <CartDrawer />
      </body>
    </html>
  )
}
