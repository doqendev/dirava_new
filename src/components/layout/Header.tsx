'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Menu, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MizokeLogo } from '@/components/ui/MizokeLogo'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const tCommon = useTranslations('common')
  const { openCart, openSearch, openMobileMenu } = useUIStore()
  const totalQuantity = useCartStore((state) => state.totalQuantity)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const wishlistCount = useWishlistStore((state) => state.getItemCount())

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-16 lg:h-[72px]',
        'bg-bg-primary/90 backdrop-blur-xl',
        'border-b border-border-subtle',
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        {/* Left: Hamburger (mobile) + Logo + Desktop Nav */}
        <div className="flex items-center">
          {/* Hamburger - Mobile only */}
          <button
            onClick={openMobileMenu}
            className={cn(
              'lg:hidden w-10 h-10 -ml-2 mr-0 flex items-center justify-center',
              'text-white/70 hover:text-white transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded-lg'
            )}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center">
              <MizokeLogo className="h-6 lg:h-8 w-auto" />
            </motion.div>
          </Link>
          {/* Desktop navigation links */}
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            {[
              { href: '/worlds', label: tCommon('worlds') },
              { href: '/shop', label: tCommon('shop') },
              { href: '/new', label: tCommon('newArrivals') },
              { href: '/drops', label: tCommon('drops') },
              { href: '/sale', label: tCommon('sale') },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-display tracking-wider text-white/60 hover:text-[color:var(--accent,#00f5ff)] transition-colors duration-200 uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Search, Wishlist, Cart & Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search - Desktop only (mobile has bottom nav) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openSearch}
            title={tCommon('search')}
            className={cn(
              'hidden lg:flex items-center justify-center',
              'text-neon-cyan/70 hover:text-[color:var(--accent,#00f5ff)]',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-lg',
              'lg:w-auto lg:h-auto lg:px-4 lg:py-2 lg:border lg:border-white/20 lg:hover:border-[color:var(--accent,#00f5ff)]/50 lg:hover:bg-[color:var(--accent,#00f5ff)]/5 lg:rounded-full'
            )}
            aria-label={tCommon('search')}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Search className="w-4 h-4" />
              {tCommon('search')}
            </span>
          </motion.button>

          {/* Icon group with consistent spacing */}
          <div className="flex items-center gap-2 lg:gap-4 lg:ml-4 lg:pl-4 lg:border-l lg:border-white/10">
            <Link href="/account/wishlist" title={wishlistCount > 0 ? `${tCommon('wishlist')} (${wishlistCount})` : tCommon('wishlist')}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative w-10 h-10 flex items-center justify-center',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-lg',
                  wishlistCount > 0
                    ? 'text-neon-pink hover:text-neon-pink focus-visible:ring-neon-pink'
                    : 'text-neon-cyan/70 hover:text-[color:var(--accent,#00f5ff)] focus-visible:ring-neon-cyan'
                )}
                aria-label={wishlistCount > 0 ? `${tCommon('wishlist')}, ${wishlistCount}` : tCommon('wishlist')}
              >
                <Heart
                  className={cn('w-6 h-6', wishlistCount > 0 && 'fill-current')}
                  style={{
                    filter: wishlistCount > 0
                      ? 'drop-shadow(0 0 3px rgba(255, 0, 170, 0.5))'
                      : 'drop-shadow(0 0 3px rgba(0, 245, 255, 0.5))'
                  }}
                />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[20px] h-5 px-1.5',
                      'flex items-center justify-center',
                      'bg-neon-pink text-white',
                      'text-xs font-bold rounded-full'
                    )}
                    style={{
                      boxShadow: '0 0 10px rgba(255, 0, 170, 0.8)',
                    }}
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              title={totalQuantity > 0 ? `${tCommon('cart')} (${totalQuantity})` : tCommon('cart')}
              className={cn(
                'relative w-10 h-10 flex items-center justify-center',
                'text-neon-cyan/70 hover:text-[color:var(--accent,#00f5ff)]',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-lg'
              )}
              aria-label={totalQuantity > 0 ? `${tCommon('cart')}, ${totalQuantity}` : tCommon('cart')}
            >
              <ShoppingBag className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 245, 255, 0.5))' }} />
              {totalQuantity > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'absolute -top-1 -right-1',
                    'min-w-[20px] h-5 px-1.5',
                    'flex items-center justify-center',
                    'bg-neon-cyan text-black',
                    'text-xs font-bold rounded-full'
                  )}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)',
                  }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </motion.span>
              )}
            </motion.button>

            {/* Profile - Desktop only (mobile has bottom nav) */}
            <Link
              href={isAuthenticated ? '/account/dashboard' : '/account/login'}
              className="hidden lg:block"
              title={isAuthenticated ? tCommon('account') : tCommon('login')}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-10 h-10 rounded-full',
                  'bg-transparent',
                  'border-2 border-neon-cyan',
                  'flex items-center justify-center',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary'
                )}
                style={{
                  boxShadow: '0 0 15px rgba(0, 245, 255, 0.5), inset 0 0 10px rgba(0, 245, 255, 0.1)',
                }}
                aria-label={isAuthenticated ? tCommon('account') : tCommon('login')}
              >
                <User className="w-5 h-5 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.8))' }} />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
