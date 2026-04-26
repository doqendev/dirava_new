'use client'

import { ShoppingCart, Pencil, Box, Brush, Check, Truck } from 'lucide-react'

const STEPS = [
  { icon: ShoppingCart, title: 'Order placed', body: 'You place your order.' },
  { icon: Pencil, title: 'Designed', body: 'We create your custom design.' },
  { icon: Box, title: '3D printed', body: 'Precision printed just for you.' },
  { icon: Brush, title: 'Hand painted', body: 'Each sign is carefully painted by hand.' },
  { icon: Check, title: 'Quality check', body: 'Every sign is checked for perfect quality.' },
  { icon: Truck, title: 'Shipped', body: 'Packed & shipped to your door.' },
]

interface HowItsMadeProps {
  accent?: string
}

/**
 * 6-step horizontal timeline shown below the feature tiles.
 * Universal flow for every product.
 */
export function HowItsMade({ accent = '#22c55e' }: HowItsMadeProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/90 flex items-center justify-center gap-3">
        <span className="h-px w-6 bg-white/20" aria-hidden />
        <span style={{ color: accent }} aria-hidden>◆</span>
        <span>How it&apos;s made &mdash; just for you</span>
        <span style={{ color: accent }} aria-hidden>◆</span>
        <span className="h-px w-6 bg-white/20" aria-hidden />
      </h2>

      {/* Connecting line behind the dots, hidden on mobile (vertical layout). */}
      <div className="relative">
        <div
          className="absolute left-0 right-0 top-6 hidden h-px md:block"
          style={{ background: `${accent}66` }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-2 gap-y-6 gap-x-3 sm:grid-cols-3 md:grid-cols-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const number = String(i + 1).padStart(2, '0')
            return (
              <li key={i} className="flex flex-col items-center text-center">
                <div
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: accent,
                    background: '#0a0a12',
                    boxShadow: `0 0 14px ${accent}55`,
                  }}
                >
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: accent }}>
                    {number}
                  </span>
                </div>
                <Icon className="mt-3 h-5 w-5" style={{ color: accent }} />
                <h3 className="mt-2 text-xs font-semibold uppercase tracking-wide text-white">{step.title}</h3>
                <p className="mt-1 max-w-[14ch] text-[11px] leading-snug text-white/55">{step.body}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
