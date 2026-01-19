'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface NenPatternProps {
  color?: string
  secondaryColor?: string
  className?: string
}

export function NenPattern({
  color = '#00ff88',
  secondaryColor = '#a855f7',
  className,
}: NenPatternProps) {
  // Generate hexagonal pattern points
  const hexagons = Array.from({ length: 7 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180
    const radius = i === 0 ? 0 : 40
    return {
      id: i,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      delay: i * 0.1,
    }
  })

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient for the pattern */}
          <linearGradient id="nen-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="50%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>

          {/* Glow filter */}
          <filter id="nen-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rotating outer ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#nen-gradient)"
          strokeWidth="0.5"
          strokeDasharray="10 5"
          filter="url(#nen-glow)"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Inner geometric pattern */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        >
          {/* Hexagonal nodes */}
          {hexagons.map((hex) => (
            <motion.circle
              key={hex.id}
              cx={hex.x}
              cy={hex.y}
              r="3"
              fill={color}
              filter="url(#nen-glow)"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: hex.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Connecting lines */}
          {hexagons.slice(1).map((hex, i) => {
            const next = hexagons[(i + 2) % 6 + 1] || hexagons[1]
            return (
              <motion.line
                key={`line-${hex.id}`}
                x1={hex.x}
                y1={hex.y}
                x2={next?.x}
                y2={next?.y}
                stroke={secondaryColor}
                strokeWidth="0.5"
                filter="url(#nen-glow)"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: hex.delay,
                  ease: 'easeInOut',
                }}
              />
            )
          })}

          {/* Center to outer lines */}
          {hexagons.slice(1).map((hex) => (
            <motion.line
              key={`center-${hex.id}`}
              x1="50"
              y1="50"
              x2={hex.x}
              y2={hex.y}
              stroke={color}
              strokeWidth="0.3"
              strokeDasharray="2 2"
              filter="url(#nen-glow)"
              animate={{
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: hex.delay + 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.g>

        {/* Pulsing center */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="none"
          stroke={color}
          strokeWidth="1"
          filter="url(#nen-glow)"
          animate={{
            r: [8, 12, 8],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  )
}
