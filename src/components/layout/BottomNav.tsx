'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Home, Globe, Package, User, Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const navItems = [
    {
      icon: <Home className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Home className="w-5 h-5" strokeWidth={2} />,
      label: t('home').toUpperCase(),
      href: '/'
    },
    {
      icon: <Globe className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Globe className="w-5 h-5" strokeWidth={2} />,
      label: t('worlds').toUpperCase(),
      href: '/worlds'
    },
    {
      icon: <Package className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <Package className="w-5 h-5" strokeWidth={2} />,
      label: t('drops').toUpperCase(),
      href: '/drops'
    },
    {
      icon: <User className="w-5 h-5" strokeWidth={1.5} />,
      activeIcon: <User className="w-5 h-5" strokeWidth={2} />,
      label: t('profile').toUpperCase(),
      href: '/profile',
      hasBadge: true
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
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
        {navItems.map((item) => {
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[60px] h-full py-2',
                'transition-all duration-200',
                'focus-visible:outline-none'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator - top line */}
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

              {/* Icon container */}
              <div className="relative">
                <motion.div
                  className={cn(
                    'transition-all duration-200',
                    active ? 'text-neon-cyan' : 'text-white/40'
                  )}
                  style={active ? { filter: 'drop-shadow(0 0 6px rgba(0, 245, 255, 0.8))' } : {}}
                  animate={active ? { y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {active ? item.activeIcon : item.icon}
                </motion.div>

                {/* Star badge for profile */}
                {item.hasBadge && (
                  <Star
                    className="absolute -top-1 -right-2 w-3 h-3 text-white/50 fill-white/30"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-1 text-[10px] font-medium tracking-wider',
                  'transition-all duration-200',
                  active ? 'text-neon-cyan' : 'text-white/40'
                )}
                style={active ? { textShadow: '0 0 8px rgba(0, 245, 255, 0.6)' } : {}}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
