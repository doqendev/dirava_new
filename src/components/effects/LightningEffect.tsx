'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface LightningEffectProps {
  color?: string
  frequency?: number // How often lightning strikes (in ms)
  className?: string
}

interface LightningBolt {
  id: number
  path: string
  opacity: number
}

function generateLightningPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  segments: number = 8
): string {
  const points: { x: number; y: number }[] = [{ x: startX, y: startY }]

  for (let i = 1; i < segments; i++) {
    const progress = i / segments
    const baseX = startX + (endX - startX) * progress
    const baseY = startY + (endY - startY) * progress
    const offset = (Math.random() - 0.5) * 30

    points.push({
      x: baseX + offset,
      y: baseY + (Math.random() - 0.5) * 10,
    })
  }

  points.push({ x: endX, y: endY })

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

export function LightningEffect({
  color = '#ff8c00',
  frequency = 3000,
  className,
}: LightningEffectProps) {
  const [bolts, setBolts] = useState<LightningBolt[]>([])
  const [dimensions, setDimensions] = useState({ width: 200, height: 300 })

  useEffect(() => {
    const createBolt = () => {
      const startX = Math.random() * dimensions.width
      const endX = startX + (Math.random() - 0.5) * 50

      const newBolt: LightningBolt = {
        id: Date.now(),
        path: generateLightningPath(startX, 0, endX, dimensions.height),
        opacity: Math.random() * 0.5 + 0.5,
      }

      setBolts((prev) => [...prev.slice(-2), newBolt])

      // Remove bolt after animation
      setTimeout(() => {
        setBolts((prev) => prev.filter((b) => b.id !== newBolt.id))
      }, 300)
    }

    // Random interval for natural feel
    const scheduleNext = () => {
      const randomDelay = frequency * (0.5 + Math.random())
      return setTimeout(() => {
        createBolt()
        scheduleNext()
      }, randomDelay)
    }

    const timeoutId = scheduleNext()

    return () => clearTimeout(timeoutId)
  }, [frequency, dimensions])

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        ref={(el) => {
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.width !== dimensions.width || rect.height !== dimensions.height) {
              setDimensions({ width: rect.width, height: rect.height })
            }
          }
        }}
      >
        <defs>
          <filter id="lightning-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence>
          {bolts.map((bolt) => (
            <motion.path
              key={bolt.id}
              d={bolt.path}
              fill="none"
              stroke={color}
              strokeWidth="2"
              filter="url(#lightning-glow)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: bolt.opacity, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </svg>

      {/* Flash effect */}
      <AnimatePresence>
        {bolts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0"
            style={{ backgroundColor: color }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
