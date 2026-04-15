'use client'

import { motion } from 'framer-motion'

type Amplitude = 'subtle' | 'standard' | 'intense'

interface BorderPulseProps {
  color: string
  amplitude?: Amplitude
  radius?: 'lg' | 'xl' | '2xl' | '3xl'
}

const amplitudeMap: Record<Amplitude, {
  opacityRange: [number, number, number]
  blurOuter: [number, number, number]
  blurInner: [number, number, number]
  alphaOuter: [number, number, number]
  alphaInner: [number, number, number]
  borderWidth: number
}> = {
  subtle: {
    opacityRange: [0.2, 0.5, 0.2],
    blurOuter: [3, 12, 3],
    blurInner: [3, 6, 3],
    alphaOuter: [25, 40, 25],
    alphaInner: [10, 20, 10],
    borderWidth: 1,
  },
  standard: {
    opacityRange: [0.3, 0.7, 0.3],
    blurOuter: [4, 16, 4],
    blurInner: [4, 8, 4],
    alphaOuter: [30, 50, 30],
    alphaInner: [15, 25, 15],
    borderWidth: 1,
  },
  intense: {
    opacityRange: [0.3, 0.8, 0.3],
    blurOuter: [5, 20, 5],
    blurInner: [5, 10, 5],
    alphaOuter: [40, 60, 40],
    alphaInner: [20, 30, 20],
    borderWidth: 2,
  },
}

const radiusMap = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

function hex(val: number): string {
  return val.toString(16).padStart(2, '0')
}

export function BorderPulse({ color, amplitude = 'standard', radius = 'xl' }: BorderPulseProps) {
  const cfg = amplitudeMap[amplitude]

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${radiusMap[radius]}`}
      style={{
        border: `${cfg.borderWidth}px solid ${color}`,
      }}
      animate={{
        opacity: cfg.opacityRange,
        boxShadow: [
          `0 0 ${cfg.blurOuter[0]}px ${color}${hex(cfg.alphaOuter[0])}, inset 0 0 ${cfg.blurInner[0]}px ${color}${hex(cfg.alphaInner[0])}`,
          `0 0 ${cfg.blurOuter[1]}px ${color}${hex(cfg.alphaOuter[1])}, inset 0 0 ${cfg.blurInner[1]}px ${color}${hex(cfg.alphaInner[1])}`,
          `0 0 ${cfg.blurOuter[2]}px ${color}${hex(cfg.alphaOuter[2])}, inset 0 0 ${cfg.blurInner[2]}px ${color}${hex(cfg.alphaInner[2])}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
