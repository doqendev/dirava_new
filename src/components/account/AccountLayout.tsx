'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  User,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { href: '/account/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/settings', label: 'Settings', icon: Settings },
]

interface AccountLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AccountLayout({ children, title, description }: AccountLayoutProps) {
  const tAuth = useTranslations('auth')
  const router = useRouter()
  const pathname = usePathname()
  const { customer, isLoading } = useRequireAuth()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return null // useRequireAuth will redirect
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* User Info */}
            <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center">
                  <User className="w-6 h-6 text-neon-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-white/50 truncate">{customer.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors relative',
                      'hover:bg-white/5',
                      isActive
                        ? 'text-neon-cyan bg-neon-cyan/5'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="account-nav-indicator"
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-neon-cyan"
                      />
                    )}
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-colors border-t border-border-subtle"
              >
                <LogOut className="w-5 h-5" />
                <span>{tAuth('signOut')}</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <h1
                className="font-display text-2xl md:text-3xl font-bold text-neon-cyan"
                style={{
                  textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
                }}
              >
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-white/60">{description}</p>
              )}
            </div>

            {/* Content */}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
