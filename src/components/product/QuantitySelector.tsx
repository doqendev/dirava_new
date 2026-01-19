'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: {
    container: 'h-8',
    button: 'w-8 h-8',
    icon: 'w-3 h-3',
    text: 'text-sm w-8',
  },
  md: {
    container: 'h-10',
    button: 'w-10 h-10',
    icon: 'w-4 h-4',
    text: 'text-base w-10',
  },
  lg: {
    container: 'h-12',
    button: 'w-12 h-12',
    icon: 'w-5 h-5',
    text: 'text-lg w-12',
  },
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const styles = sizeStyles[size]

  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value)
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center',
        'border border-border-subtle rounded-lg overflow-hidden',
        'bg-bg-secondary',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={cn(
          styles.button,
          'flex items-center justify-center',
          'text-white/50 hover:text-white hover:bg-white/10',
          'transition-colors duration-200',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neon-cyan'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={styles.icon} />
      </button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          styles.text,
          'text-center font-mono',
          'bg-transparent border-x border-border-subtle',
          'text-white',
          'focus:outline-none',
          'disabled:cursor-not-allowed',
          // Hide number input spinners
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
        aria-label="Quantity"
      />

      <button
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={cn(
          styles.button,
          'flex items-center justify-center',
          'text-white/50 hover:text-white hover:bg-white/10',
          'transition-colors duration-200',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neon-cyan'
        )}
        aria-label="Increase quantity"
      >
        <Plus className={styles.icon} />
      </button>
    </div>
  )
}
