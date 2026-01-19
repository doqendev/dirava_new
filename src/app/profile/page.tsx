import Link from 'next/link'
import { User, Package, Heart, Settings, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your Neo-Stage Collective account, orders, and wishlist.',
}

const menuItems = [
  {
    icon: Package,
    label: 'Order History',
    description: 'View your past orders',
    href: '/profile/orders',
  },
  {
    icon: Heart,
    label: 'Wishlist',
    description: 'Items you&apos;ve saved',
    href: '/profile/wishlist',
  },
  {
    icon: Settings,
    label: 'Account Settings',
    description: 'Manage your account',
    href: '/profile/settings',
  },
]

export default function ProfilePage() {
  // In a real app, this would check authentication status
  const isLoggedIn = false

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Avatar placeholder */}
          <div className="mx-auto w-24 h-24 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center mb-6">
            <User className="w-12 h-12 text-neon-cyan" />
          </div>

          <h1 className="font-display text-2xl text-white mb-2">
            Welcome to <span className="text-neon-cyan">Neo-Stage</span>
          </h1>
          <p className="text-white/60 mb-8">
            Sign in to track orders, save your wishlist, and get exclusive access to drops.
          </p>

          <div className="space-y-3">
            <Button variant="primary" glow="cyan" className="w-full">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </div>

          <p className="mt-8 text-sm text-white/40">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8">
        <div className="px-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center">
              <User className="w-8 h-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-display text-xl text-white">Welcome back!</h1>
              <p className="text-white/60 text-sm">user@example.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="py-6">
        <div className="px-4 max-w-2xl mx-auto space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 p-4',
                'bg-bg-card rounded-xl border border-border-subtle',
                'transition-all duration-200',
                'hover:border-neon-cyan/50 hover:shadow-glow-sm-cyan'
              )}
            >
              <div className="w-12 h-12 rounded-lg bg-bg-secondary flex items-center justify-center">
                <item.icon className="w-6 h-6 text-neon-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{item.label}</h3>
                <p className="text-sm text-white/50">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sign out */}
      <section className="py-6">
        <div className="px-4 max-w-2xl mx-auto">
          <Button variant="ghost" className="w-full text-white/50">
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  )
}
