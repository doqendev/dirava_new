'use client'

import { BadgeCheck, CheckCircle2, PackageCheck, ShieldCheck, Truck } from 'lucide-react'

interface TrustStripProps {
  productType?: string
  isPersonalized?: boolean
}

const SIGN_ITEMS = [
  { icon: PackageCheck, title: 'Made to order', sub: 'Production starts after checkout.' },
  { icon: CheckCircle2, title: 'Checked before packing', sub: 'Name and finish inspected.' },
  { icon: ShieldCheck, title: 'Damage replacement', sub: 'Arrives damaged? We replace it.' },
  { icon: Truck, title: 'Free shipping €45+', sub: 'Rates shown at checkout.' },
]

const STANDARD_ITEMS = [
  { icon: CheckCircle2, title: 'Checked before packing', sub: 'Item and finish inspected.' },
  { icon: PackageCheck, title: 'Protected packing', sub: 'Packed to prevent transit wear.' },
  { icon: ShieldCheck, title: 'Damage replacement', sub: 'Arrives damaged? We replace it.' },
  { icon: Truck, title: 'Free shipping €45+', sub: 'Rates shown at checkout.' },
]

function isSignProduct(productType?: string, isPersonalized?: boolean) {
  return Boolean(isPersonalized || productType?.toLowerCase().includes('sign'))
}

/**
 * Compact assurance strip shown near the cart action.
 * Copy is intentionally concrete and safe for personalized products.
 */
export function TrustStrip({ productType, isPersonalized = false }: TrustStripProps) {
  const signProduct = isSignProduct(productType, isPersonalized)
  const items = signProduct ? SIGN_ITEMS : STANDARD_ITEMS
  const heading = signProduct ? 'Made for your order' : 'Checked before shipping'
  const description = signProduct
    ? 'We make your sign after you order and check it before it ships.'
    : 'We inspect and pack your item before it leaves our studio.'

  return (
    <section
      aria-label={heading}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#06080d]/75 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4 sm:py-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(var(--accent-rgb, 0, 245, 255), 0.5), transparent)',
        }}
      />

      <header className="flex items-start gap-2.5 border-b border-white/[0.07] pb-3 sm:gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border sm:h-9 sm:w-9"
          style={{
            borderColor: 'rgba(var(--accent-rgb, 0, 245, 255), 0.2)',
            background: 'rgba(var(--accent-rgb, 0, 245, 255), 0.07)',
            boxShadow: '0 0 18px rgba(var(--accent-rgb, 0, 245, 255), 0.1)',
          }}
        >
          <BadgeCheck
            className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
            style={{ color: 'rgba(var(--accent-rgb, 0, 245, 255), 0.9)' }}
          />
        </span>
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white sm:text-[12px]">
            {heading}
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-white/55 sm:text-[12.5px]">
            {description}
          </p>
        </div>
      </header>

      <ul className="mt-2.5 grid grid-cols-2 gap-0">
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <li
              key={i}
              className="group flex gap-2.5 border-t border-white/[0.06] py-2.5 odd:pr-2.5 even:border-l even:border-l-white/[0.06] even:pl-2.5 [&:nth-child(-n+2)]:border-t-0 sm:gap-3 sm:py-3 sm:odd:pr-4 sm:even:pl-4"
            >
              <Icon
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-white/42 transition-colors group-hover:text-white/65 sm:h-4 sm:w-4"
              />
              <div className="min-w-0">
                <div className="text-[10.5px] font-bold uppercase leading-tight tracking-[0.07em] text-white/82 sm:text-[12px]">
                  {it.title}
                </div>
                <div className="mt-1 text-[10.5px] leading-snug text-white/48 sm:text-[11.5px]">
                  {it.sub}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
