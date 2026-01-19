'use client'

import { cn } from '@/lib/utils/cn'

interface Option {
  name: string
  value: string
}

interface Variant {
  id: string
  availableForSale: boolean
  selectedOptions: Option[]
}

interface VariantSelectorProps {
  options: {
    name: string
    values: string[]
  }[]
  variants: Variant[]
  selectedOptions: Record<string, string>
  onOptionChange: (name: string, value: string) => void
  className?: string
}

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
  className,
}: VariantSelectorProps) {
  // Check if a specific option value is available
  const isOptionAvailable = (optionName: string, optionValue: string) => {
    // Create a hypothetical selection with this option
    const hypotheticalSelection = {
      ...selectedOptions,
      [optionName]: optionValue,
    }

    // Check if any variant matches this selection and is available
    return variants.some((variant) => {
      const matches = variant.selectedOptions.every(
        (opt) => hypotheticalSelection[opt.name] === opt.value
      )
      return matches && variant.availableForSale
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {options.map((option) => (
        <div key={option.name}>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value
              const isAvailable = isOptionAvailable(option.name, value)

              return (
                <button
                  key={value}
                  onClick={() => onOptionChange(option.name, value)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'text-sm font-medium',
                    'border transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
                    isSelected
                      ? 'bg-neon-cyan text-black border-neon-cyan shadow-glow-sm-cyan'
                      : isAvailable
                      ? 'bg-bg-secondary border-border-subtle text-white hover:border-neon-cyan/50'
                      : 'bg-bg-secondary/50 border-border-subtle text-white/30 cursor-not-allowed line-through'
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${option.name}: ${value}${!isAvailable ? ' (unavailable)' : ''}`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
