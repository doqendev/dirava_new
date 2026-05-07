'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { VariantSelector } from '@/components/product/VariantSelector'

interface Option {
  name: string
  value: string
}

interface Variant {
  id: string
  availableForSale: boolean
  selectedOptions: Option[]
}

interface JollyRogerSelectorProps {
  options: {
    name: string
    values: string[]
  }[]
  variants: Variant[]
  selectedOptions: Record<string, string>
  onOptionChange: (name: string, value: string) => void
  variantImages: Record<string, string>
  imageOptionName: string
  themeColor?: string
  mode?: 'buy-box' | 'preview'
  className?: string
  ignoreAvailability?: boolean
}

export function JollyRogerSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
  variantImages,
  imageOptionName,
  themeColor,
  mode = 'buy-box',
  className,
  ignoreAvailability = false,
}: JollyRogerSelectorProps) {
  const t = useTranslations('product')
  const isCompact = mode === 'preview'

  return (
    <div className={cn('space-y-3', isCompact && 'max-sm:space-y-2.5', className)}>
      <div>
        <p
          className={cn(
            'font-bold uppercase text-white',
            isCompact
              ? 'text-[11px] tracking-[0.14em]'
              : 'text-[13px] tracking-[0.12em]'
          )}
        >
          {t('chooseYourJollyRoger')}
        </p>
        <p
          className={cn(
            'mt-1 hidden leading-snug text-white/55 sm:block',
            isCompact ? 'text-[11px]' : 'text-[12px]'
          )}
        >
          {t('jollyRogerSubhead')}
        </p>
        <p
          className={cn(
            'mt-1 font-semibold leading-snug text-white/55 sm:hidden',
            isCompact ? 'text-[11px]' : 'text-[12px]'
          )}
        >
          {t('jollyRogerSwipeHint')}
        </p>
      </div>

      <div className="relative">
        <VariantSelector
          options={options}
          variants={variants}
          selectedOptions={selectedOptions}
          onOptionChange={onOptionChange}
          optionImages={variantImages}
          imageOptionName={imageOptionName}
          themeColor={themeColor}
          showImageLabels
          mobileImageRail
          ignoreAvailability={ignoreAvailability}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-9 bg-gradient-to-l from-[#06080d] via-[#06080d]/70 to-transparent sm:hidden" />
      </div>
    </div>
  )
}
