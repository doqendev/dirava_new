'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { openCart, openSearch } = useUIStore()
  const totalQuantity = useCartStore((state) => state.totalQuantity)

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
        {/* Left: Profile Button */}
        <motion.button
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
          aria-label="Profile"
        >
          <User className="w-5 h-5 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.8))' }} />
        </motion.button>

        {/* Center: Logo */}
        <Link href="/" className="flex flex-col items-center group">
          <motion.span
            className={cn(
              'font-display text-xl lg:text-2xl font-bold',
              'text-white',
              'tracking-wider'
            )}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            NEO-STAGE
          </motion.span>
          <span
            className={cn(
              'font-display text-[10px] lg:text-xs',
              'text-white/60',
              'tracking-[4px]',
              'group-hover:text-white/80 transition-colors duration-200'
            )}
          >
            COLLECTIVE
          </span>
        </Link>

        {/* Right: Search & Cart */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={openSearch}
            className={cn(
              'w-10 h-10 flex items-center justify-center',
              'text-neon-cyan/70 hover:text-neon-cyan',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-lg'
            )}
            aria-label="Search"
          >
            <Search className="w-6 h-6" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 245, 255, 0.5))' }} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCart}
            className={cn(
              'relative w-10 h-10 flex items-center justify-center',
              'text-neon-cyan/70 hover:text-neon-cyan',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-lg'
            )}
            aria-label={`Shopping cart${totalQuantity > 0 ? `, ${totalQuantity} items` : ''}`}
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
              >
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  )
}
