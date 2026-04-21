'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'
type GlowColor = 'cyan' | 'pink' | 'orange' | 'green' | 'none'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant
  size?: ButtonSize
  glow?: GlowColor
  isLoading?: boolean
  as?: 'button' | 'a'
  href?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-neon-cyan text-black font-semibold hover:bg-[color:var(--accent,#00f5ff)]/90',
  secondary:
    'bg-transparent border-2 border-neon-cyan text-neon-cyan hover:bg-[color:var(--accent,#00f5ff)]/10',
  ghost: 'bg-transparent text-white hover:bg-white/10',
  outline:
    'bg-bg-card border border-border-subtle text-white hover:border-[color:var(--accent,#00f5ff)] hover:text-[color:var(--accent,#00f5ff)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const glowStyles: Record<GlowColor, string> = {
  cyan: 'hover:shadow-glow-cyan',
  pink: 'hover:shadow-glow-pink',
  orange: 'hover:shadow-glow-orange',
  green: 'hover:shadow-glow-green',
  none: '',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      glow = 'none',
      isLoading = false,
      as = 'button',
      href,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {children}
      </>
    )

    const buttonProps = {
      ref: ref as React.Ref<HTMLButtonElement>,
      className: cn(
        'inline-flex items-center justify-center',
        'font-display tracking-wider uppercase',
        'rounded-lg',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        glow !== 'none' && glowStyles[glow],
        className
      ),
      whileHover: disabled || isLoading ? undefined : { scale: 1.02 },
      whileTap: disabled || isLoading ? undefined : { scale: 0.98 },
      disabled: disabled || isLoading,
      'aria-busy': isLoading,
      ...props,
    }

    if (as === 'a' && href) {
      return (
        <motion.a href={href} {...(buttonProps as HTMLMotionProps<'a'>)}>
          {content}
        </motion.a>
      )
    }

    return (
      <motion.button {...(buttonProps as HTMLMotionProps<'button'>)}>
        {content}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
