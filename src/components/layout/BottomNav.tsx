'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { openSearch } = useUIStore()

  const linkItems = [
    {
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Home className="w-5 h-5" strokeWidth={2} />,
      label: t('home').toUpperCase(),
      href: '/',
    },
    {
      icon: <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <ShoppingBag className="w-5 h-5" strokeWidth={2} />,
      label: t('shop').toUpperCase(),
      href: '/worlds',
    },
  ]

  const accountItem = {
    icon: <User className="w-5 h-5" strokeWidth={1.5} />,
    activeIcon: <User className="w-5 h-5" strokeWidth={2} />,
    label: t('account').toUpperCase(),
    href: '/account',
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const itemClassName = cn(
    'relative flex flex-col items-center justify-center',
    'min-w-[60px] h-full py-2',
    'transition-all duration-200',
    'focus-visible:outline-none'
  )

  function NavContent({ active, icon, activeIcon, label }: { active: boolean; icon: React.ReactNode; activeIcon: React.ReactNode; label: string }) {
    return (
      <>
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute top-0 w-8 h-[3px] rounded-full"
            style={{
              backgroundColor: '#00f5ff',
              boxShadow: '0 0 10px rgba(0, 245, 255, 0.8), 0 2px 15px rgba(0, 245, 255, 0.6)',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <div className="relative">
          <motion.div
            className={cn(
              'transition-all duration-200',
              active ? 'text-neon-cyan' : 'text-white/60'
            )}
            style={active ? { filter: 'drop-shadow(0 0 6px rgba(0, 245, 255, 0.8))' } : {}}
            animate={active ? { y: [0, -2, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {active ? activeIcon : icon}
          </motion.div>
        </div>
        <span
          className={cn(
            'mt-1 text-[10px] font-medium tracking-wider',
            'transition-all duration-200',
            active ? 'text-neon-cyan' : 'text-white/60'
          )}
          style={active ? { textShadow: '0 0 8px rgba(0, 245, 255, 0.6)' } : {}}
        >
          {label}
        </span>
      </>
    )
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'lg:hidden',
        'bg-bg-primary/95 backdrop-blur-xl',
        'border-t border-white/10',
        className
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-[70px] pb-safe px-4">
        {linkItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={itemClassName}
              aria-current={active ? 'page' : undefined}
            >
              <NavContent active={active} icon={item.icon} activeIcon={item.activeIcon} label={item.label} />
            </Link>
          )
        })}

        {/* Search - button, not a link */}
        <button
          type="button"
          onClick={openSearch}
          className={itemClassName}
        >
          <NavContent
            active={false}
            icon={<Search className="w-5 h-5" strokeWidth={1.5} />}
            activeIcon={<Search className="w-5 h-5" strokeWidth={2} />}
            label={t('search').toUpperCase()}
          />
        </button>

        {/* Account */}
        {(() => {
          const active = isActive(accountItem.href)
          return (
            <Link
              href={accountItem.href}
              className={itemClassName}
              aria-current={active ? 'page' : undefined}
            >
              <NavContent active={active} icon={accountItem.icon} activeIcon={accountItem.activeIcon} label={accountItem.label} />
            </Link>
          )
        })()}
      </div>
    </nav>
  )
}
