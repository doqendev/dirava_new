'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Package, Sparkles } from 'lucide-react'
import type { RevealPhase } from '@/types/gacha'

interface MysteryBox3DProps {
  themeColor?: string
  phase: RevealPhase
}

export function MysteryBox3D({ themeColor = '#00f5ff', phase }: MysteryBox3DProps) {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: themeColor }}
        animate={{
          opacity: phase === 'shake' ? [0.2, 0.4, 0.2] : 0.15,
          scale: phase === 'shake' ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: phase === 'shake' ? 0.2 : 0.5,
          repeat: phase === 'shake' ? Infinity : 0,
        }}
      />

      {/* Main box container */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ scale: 0, rotateY: 0 }}
        animate={{
          scale: phase === 'intro' ? [0, 1.1, 1] : phase === 'open' ? [1, 1.2, 0] : 1,
          rotateY: phase === 'intro' ? [0, 360] : 0,
          x: phase === 'shake' ? [0, -10, 10, -10, 10, 0] : 0,
          y: phase === 'shake' ? [0, -5, 5, -5, 5, 0] : 0,
        }}
        transition={{
          scale: {
            duration: phase === 'intro' ? 1.5 : phase === 'open' ? 0.8 : 0.3,
            ease: phase === 'intro' ? 'easeOut' : 'easeInOut',
          },
          rotateY: { duration: 1.5, ease: 'easeOut' },
          x: {
            duration: 0.15,
            repeat: phase === 'shake' ? Infinity : 0,
            repeatType: 'reverse',
          },
          y: {
            duration: 0.12,
            repeat: phase === 'shake' ? Infinity : 0,
            repeatType: 'reverse',
          },
        }}
      >
        {/* Box shape */}
        <motion.div
          className="relative"
          style={{
            perspective: '1000px',
          }}
        >
          {/* Box body */}
          <motion.div
            className="w-48 h-48 md:w-56 md:h-56 relative rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${themeColor}40 0%, ${themeColor}20 100%)`,
              border: `3px solid ${themeColor}`,
              boxShadow: `0 0 30px ${themeColor}50, inset 0 0 30px ${themeColor}20`,
            }}
            animate={{
              boxShadow:
                phase === 'shake'
                  ? [
                      `0 0 30px ${themeColor}50, inset 0 0 30px ${themeColor}20`,
                      `0 0 50px ${themeColor}80, inset 0 0 40px ${themeColor}40`,
                      `0 0 30px ${themeColor}50, inset 0 0 30px ${themeColor}20`,
                    ]
                  : `0 0 30px ${themeColor}50, inset 0 0 30px ${themeColor}20`,
            }}
            transition={{
              duration: 0.3,
              repeat: phase === 'shake' ? Infinity : 0,
            }}
          >
            {/* Question mark / icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: phase === 'shake' ? [1, 1.1, 1] : 1,
                  rotate: phase === 'shake' ? [0, -5, 5, 0] : 0,
                }}
                transition={{
                  duration: 0.2,
                  repeat: phase === 'shake' ? Infinity : 0,
                }}
              >
                <Package
                  className="w-20 h-20 md:w-24 md:h-24"
                  style={{ color: themeColor }}
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>

            {/* Lid line */}
            <div
              className="absolute top-1/4 left-0 right-0 h-0.5"
              style={{ backgroundColor: themeColor }}
            />

            {/* Ribbon vertical */}
            <div
              className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6"
              style={{
                background: `linear-gradient(180deg, ${themeColor}60 0%, ${themeColor}30 100%)`,
              }}
            />

            {/* Ribbon horizontal */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6"
              style={{
                background: `linear-gradient(90deg, ${themeColor}30 0%, ${themeColor}60 50%, ${themeColor}30 100%)`,
              }}
            />

            {/* Bow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
              style={{
                background: `radial-gradient(circle, ${themeColor} 0%, ${themeColor}80 100%)`,
                boxShadow: `0 0 20px ${themeColor}80`,
              }}
            />
          </motion.div>

          {/* Floating sparkles */}
          <AnimatePresence>
            {(phase === 'intro' || phase === 'shake') &&
              [...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 6) * Math.PI * 2) * 80,
                    y: Math.sin((i / 6) * Math.PI * 2) * 80,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-8px',
                    marginTop: '-8px',
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Opening burst effect */}
      <AnimatePresence>
        {phase === 'open' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Radial burst lines */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-20 origin-bottom"
                style={{
                  backgroundColor: themeColor,
                  rotate: `${i * 30}deg`,
                  boxShadow: `0 0 10px ${themeColor}`,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1, 2],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.02,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
