'use client'

import { cn } from '@/lib/utils/cn'
import { RARITY_CONFIG, RARITY_ORDER } from '@/lib/gacha/constants'
import type { RarityOdds, Rarity } from '@/types/gacha'

interface OddsDisplayProps {
  odds: RarityOdds
  compact?: boolean
  className?: string
}

export function OddsDisplay({ odds, compact = false, className }: OddsDisplayProps) {
  // Display rarities from common to legendary
  const displayOrder: Rarity[] = [...RARITY_ORDER].reverse()

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {displayOrder.map((rarity) => {
          const percentage = odds[rarity]
          const config = RARITY_CONFIG[rarity]

          return (
            <div key={rarity} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-white/60 flex-1">{config.displayName}</span>
              <span
                className="text-xs font-mono font-medium"
                style={{ color: config.color }}
              >
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">
        Drop Rates
      </h4>
      <div className="space-y-2">
        {displayOrder.map((rarity) => {
          const percentage = odds[rarity]
          const config = RARITY_CONFIG[rarity]

          return (
            <div key={rarity} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.glowColor}` }}
                  />
                  <span className="text-white">{config.displayName}</span>
                </div>
                <span
                  className="font-mono font-semibold"
                  style={{ color: config.color }}
                >
                  {percentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color,
                    boxShadow: `0 0 10px ${config.glowColor}`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-white/40 mt-3">
        * Odds are displayed for transparency. Actual results may vary due to randomization.
      </p>
    </div>
  )
}

interface OddsComparisonProps {
  tiers: Array<{
    tier: string
    odds: RarityOdds
  }>
  className?: string
}

export function OddsComparison({ tiers, className }: OddsComparisonProps) {
  const displayOrder: Rarity[] = [...RARITY_ORDER].reverse()

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-white/60 font-medium">Rarity</th>
            {tiers.map(({ tier }) => (
              <th
                key={tier}
                className="text-center py-3 px-4 text-white font-medium capitalize"
              >
                {tier}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayOrder.map((rarity) => {
            const config = RARITY_CONFIG[rarity]
            return (
              <tr key={rarity} className="border-b border-white/5">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: config.color }}
                    />
                    <span style={{ color: config.color }}>{config.displayName}</span>
                  </div>
                </td>
                {tiers.map(({ tier, odds }) => (
                  <td
                    key={`${tier}-${rarity}`}
                    className="text-center py-3 px-4 font-mono"
                    style={{ color: config.color }}
                  >
                    {odds[rarity]}%
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
