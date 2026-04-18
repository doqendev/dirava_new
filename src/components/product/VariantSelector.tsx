'use client'

import Image from 'next/image'
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
  /** Map option value → image URL for visual tile selector */
  optionImages?: Record<string, string>
  /** Which option name should use image tiles (e.g. "Color") */
  imageOptionName?: string
  className?: string
}

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
  optionImages,
  imageOptionName,
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

  const shouldUseImageTiles = (optionName: string) =>
    !!optionImages && optionName === imageOptionName

  return (
    <div className={cn('space-y-4', className)}>
      {options.map((option) => (
        <div key={option.name}>
          {/* Label hidden — option name not needed for visual selector */}

          {shouldUseImageTiles(option.name) ? (
            /* Image tile grid */
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value
                const isAvailable = isOptionAvailable(option.name, value)
                const imageUrl = optionImages![value]

                return (
                  <button
                    key={value}
                    onClick={() => onOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    title={value}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden',
                      'border-2 transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
                      isSelected
                        ? 'border-neon-cyan shadow-glow-sm-cyan bg-white/10'
                        : isAvailable
                        ? 'border-transparent bg-white/5 hover:border-white/30 hover:bg-white/10'
                        : 'border-transparent bg-white/5 opacity-30 cursor-not-allowed'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${option.name}: ${value}${!isAvailable ? ' (unavailable)' : ''}`}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={value}
                        fill
                        className="object-contain p-1.5"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white/70 text-center px-1 leading-tight">
                          {value}
                        </span>
                      </div>
                    )}

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute bottom-0 inset-x-0 bg-neon-cyan/90 py-0.5">
                        <span className="block text-[8px] font-bold text-black text-center truncate px-0.5">
                          {value}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            /* Default text button layout */
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
          )}
        </div>
      ))}
    </div>
  )
}
