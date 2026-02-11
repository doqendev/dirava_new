'use client'

import { motion } from 'framer-motion'
import { Sparkles, Star, Crown } from 'lucide-react'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import type { Rarity } from '@/types/gacha'

interface RarityBurstProps {
  rarity: Rarity
}

export function RarityBurst({ rarity }: RarityBurstProps) {
  const config = RARITY_CONFIG[rarity]

  const getRarityIcon = () => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-16 h-16 md:w-20 md:h-20" style={{ color: config.color }} />
      case 'epic':
        return <Star className="w-14 h-14 md:w-18 md:h-18" style={{ color: config.color }} />
      case 'rare':
        return <Sparkles className="w-12 h-12 md:w-16 md:h-16" style={{ color: config.color }} />
      default:
        return <Star className="w-10 h-10 md:w-14 md:h-14" style={{ color: config.color }} />
    }
  }

  const particleCount = config.particleCount / 2

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Screen flash for legendary */}
      {rarity === 'legendary' && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: config.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Central glow */}
      <motion.div
        className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full blur-3xl"
        style={{ backgroundColor: config.color }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 2, 1.5],
          opacity: [0, 0.6, 0.4],
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Expanding ring */}
      <motion.div
        className="absolute w-24 h-24 rounded-full border-4"
        style={{ borderColor: config.color }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 4],
          opacity: [1, 0],
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Secondary ring for epic and legendary */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <motion.div
          className="absolute w-24 h-24 rounded-full border-2"
          style={{ borderColor: config.color }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 3],
            opacity: [1, 0],
          }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      )}

      {/* Radial lines burst */}
      {[...Array(rarity === 'legendary' ? 16 : rarity === 'epic' ? 12 : 8)].map((_, i) => {
        const total = rarity === 'legendary' ? 16 : rarity === 'epic' ? 12 : 8
        return (
          <motion.div
            key={`line-${i}`}
            className="absolute w-1 h-48 md:h-64 origin-center"
            style={{
              backgroundColor: config.color,
              rotate: `${(i / total) * 360}deg`,
              boxShadow: `0 0 10px ${config.glowColor}`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.02,
              ease: 'easeOut',
            }}
          />
        )
      })}

      {/* Particle burst */}
      {[...Array(particleCount)].map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const distance = 150 + Math.random() * 100
        const size = 4 + Math.random() * 8

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: config.color,
              boxShadow: `0 0 ${size}px ${config.glowColor}`,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [1, 1, 0],
              scale: [0, 1.5, 0.5],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              delay: Math.random() * 0.2,
              ease: 'easeOut',
            }}
          />
        )
      })}

      {/* Central icon */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: [0, 1.3, 1],
          rotate: [-180, 0],
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: 'easeOut',
        }}
      >
        {getRarityIcon()}
      </motion.div>

      {/* Rarity text */}
      <motion.div
        className="absolute bottom-0 translate-y-24 md:translate-y-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          className="font-display text-3xl md:text-4xl uppercase tracking-widest font-bold"
          style={{
            color: config.color,
            textShadow: `0 0 30px ${config.glowColor}`,
          }}
          animate={{
            textShadow: [
              `0 0 30px ${config.glowColor}`,
              `0 0 50px ${config.glowColor}`,
              `0 0 30px ${config.glowColor}`,
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        >
          {config.displayName}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}
