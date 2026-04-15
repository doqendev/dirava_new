'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg'

interface CornerBracketsProps {
  color: string
  size?: Size
  animated?: boolean
}

const sizeMap: Record<Size, { dim: string; offset: string; border: number; shadow: number }> = {
  sm: { dim: 'w-2.5 h-2.5', offset: 'top-1.5 bottom-1.5 left-1.5 right-1.5', border: 1, shadow: 4 },
  md: { dim: 'w-3 h-3', offset: 'top-2 bottom-2 left-2 right-2', border: 2, shadow: 8 },
  lg: { dim: 'w-4 h-4', offset: 'top-2 bottom-2 left-2 right-2', border: 2, shadow: 10 },
}

const CORNER_CONFIGS = [
  { position: 'top-left', borderProps: ['borderLeft', 'borderTop'], delay: 0 },
  { position: 'top-right', borderProps: ['borderRight', 'borderTop'], delay: 0.5 },
  { position: 'bottom-left', borderProps: ['borderLeft', 'borderBottom'], delay: 1 },
  { position: 'bottom-right', borderProps: ['borderRight', 'borderBottom'], delay: 1.5 },
] as const

const positionClasses: Record<typeof CORNER_CONFIGS[number]['position'], string> = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
}

export function CornerBrackets({ color, size = 'md', animated = true }: CornerBracketsProps) {
  const cfg = sizeMap[size]

  return (
    <>
      {CORNER_CONFIGS.map(({ position, borderProps, delay }) => {
        const borderStyle = borderProps.reduce<Record<string, string>>((acc, prop) => {
          acc[prop] = `${cfg.border}px solid ${color}`
          return acc
        }, {})

        const style = {
          ...borderStyle,
          boxShadow: `0 0 ${cfg.shadow}px ${color}`,
        }

        if (!animated) {
          return (
            <div
              key={position}
              className={`absolute ${positionClasses[position]} ${cfg.dim} pointer-events-none opacity-60`}
              style={style}
            />
          )
        }

        return (
          <motion.div
            key={position}
            className={`absolute ${positionClasses[position]} ${cfg.dim} pointer-events-none`}
            style={style}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay }}
          />
        )
      })}
    </>
  )
}
