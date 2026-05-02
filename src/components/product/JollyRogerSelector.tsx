'use client'

import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'
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
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-gradient-to-l from-[#06080d] via-[#06080d]/80 to-transparent pr-1 sm:hidden">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border bg-black/70 backdrop-blur-sm"
            style={{
              borderColor: themeColor ? `${themeColor}66` : 'rgba(0,245,255,0.4)',
              boxShadow: themeColor ? `0 0 14px ${themeColor}24` : undefined,
            }}
          >
            <ChevronRight
              className="h-4 w-4"
              style={{ color: themeColor ?? '#00f5ff' }}
              strokeWidth={2.5}
            />
          </span>
        </div>
      </div>
    </div>
  )
}
