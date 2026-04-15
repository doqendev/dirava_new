'use client'

import { motion } from 'framer-motion'

type Amplitude = 'subtle' | 'standard' | 'intense'

interface ParticlesProps {
  color: string
  amplitude?: Amplitude
}

const amplitudeMap: Record<Amplitude, { count: number; baseDuration: number }> = {
  subtle: { count: 3, baseDuration: 3 },
  standard: { count: 6, baseDuration: 2.5 },
  intense: { count: 8, baseDuration: 2 },
}

export function Particles({ color, amplitude = 'standard' }: ParticlesProps) {
  const { count, baseDuration } = amplitudeMap[amplitude]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 6px 2px ${color}`,
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() > 0.5 ? 10 : -10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: baseDuration + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
