'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import type { Rarity } from '@/types/gacha'

interface CelebrationEffectsProps {
  rarity: Rarity
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
  angle: number
}

export function CelebrationEffects({ rarity }: CelebrationEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const config = RARITY_CONFIG[rarity]

  useEffect(() => {
    const colors = getParticleColors(rarity)
    const count = config.particleCount

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)] || '#ffffff',
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      angle: -30 + Math.random() * 60,
    }))

    setParticles(newParticles)
  }, [rarity, config.particleCount])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Confetti particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size * 1.5,
            backgroundColor: particle.color,
            borderRadius: '2px',
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
          initial={{
            y: particle.y,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: particle.angle * 10,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Side burst effects */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <>
          <SideBurst side="left" color={config.color} />
          <SideBurst side="right" color={config.color} />
        </>
      )}

      {/* Screen edge glow for legendary */}
      {rarity === 'legendary' && (
        <motion.div
          className="absolute inset-0"
          style={{
            boxShadow: `inset 0 0 100px ${config.glowColor}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3] }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Sparkle trail */}
      <SparkleTrail color={config.color} count={rarity === 'legendary' ? 20 : 10} />
    </div>
  )
}

function SideBurst({ side, color }: { side: 'left' | 'right'; color: string }) {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    angle: (side === 'left' ? 45 : 135) + (Math.random() - 0.5) * 60,
    distance: 100 + Math.random() * 200,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.3,
  }))

  return (
    <div
      className="absolute top-1/2"
      style={{
        [side]: 0,
        transform: 'translateY(-50%)',
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            boxShadow: `0 0 ${particle.size * 2}px ${color}`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            x:
              Math.cos((particle.angle * Math.PI) / 180) *
              particle.distance *
              (side === 'left' ? 1 : -1),
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

function SparkleTrail({ color, count }: { color: string; count: number }) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
  }))

  return (
    <>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: color,
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size * 3}px ${color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 0.8,
            delay: sparkle.delay,
            repeat: 2,
            repeatDelay: 0.5,
          }}
        />
      ))}
    </>
  )
}

function getParticleColors(rarity: Rarity): string[] {
  switch (rarity) {
    case 'legendary':
      return ['#ffd700', '#ffec8b', '#fff8dc', '#ffa500', '#ff8c00']
    case 'epic':
      return ['#00f5ff', '#00ced1', '#40e0d0', '#7fffd4', '#e0ffff']
    case 'rare':
      return ['#a855f7', '#9333ea', '#c084fc', '#d8b4fe', '#e9d5ff']
    default:
      return ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0']
  }
}
