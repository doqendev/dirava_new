'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MizokeLogo } from '@/components/ui/MizokeLogo'
import { useUIStore } from '@/stores/uiStore'

const navLinks = [
  { href: '/worlds', labelKey: 'worlds' as const },
  { href: '/shop', labelKey: 'shop' as const },
  { href: '/new', labelKey: 'newArrivals' as const },
  { href: '/sale', labelKey: 'sale' as const },
]

const secondaryLinks = [
  { href: '/contact', labelKey: 'contact' as const },
  { href: '/faq', labelKey: 'faq' as const },
]

const policyLinks = [
  { href: '/policies/privacy', labelKey: 'privacyPolicy' as const },
  { href: '/policies/terms', labelKey: 'termsOfService' as const },
  { href: '/policies/shipping', labelKey: 'shippingPolicy' as const },
  { href: '/policies/returns', labelKey: 'returnsRefunds' as const },
  { href: '/policies/imprint', labelKey: 'imprint' as const },
]

export function MobileMenu() {
  const t = useTranslations('common')
  const tFooter = useTranslations('footer')
  const tHeader = useTranslations('header')
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore()
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  // Lock body scroll when open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed top-0 left-0 bottom-0 z-[61] w-64',
              'bg-bg-primary border-r border-border-subtle',
              'flex flex-col',
              'lg:hidden'
            )}
            aria-label={tHeader('mobileNavigation')}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle">
              <MizokeLogo className="h-6 w-auto" />
              <button
                onClick={closeMobileMenu}
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label={tHeader('closeMenu')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main links */}
            <div className="flex-1 overflow-y-auto py-6">
              <ul className="space-y-1 px-4">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href)
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'block px-3 py-3',
                          'font-display text-sm tracking-widest uppercase',
                          'transition-colors duration-200',
                          isActive
                            ? 'text-neon-cyan'
                            : 'text-white/70 hover:text-white'
                        )}
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Divider */}
              <div className="mx-7 my-5 h-px bg-border-subtle" />

              {/* Secondary links */}
              <ul className="space-y-1 px-4">
                {secondaryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="mx-7 my-5 h-px bg-border-subtle" />

              {/* Policy links */}
              <ul className="space-y-1 px-4">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-xs text-white/30 hover:text-white/50 transition-colors"
                    >
                      {tFooter(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
