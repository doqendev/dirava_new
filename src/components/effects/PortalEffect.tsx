'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface PortalEffectProps {
  color?: string
  className?: string
}

export function PortalEffect({
  color = '#00f5ff',
  className,
}: PortalEffectProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${color}20 0%, transparent 60%)`,
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Golden gradient for ring */}
          <linearGradient id="portal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="portal-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Inner swirl gradient */}
          <radialGradient id="portal-swirl" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="70%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Outer rotating ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 35px' }}
        >
          <ellipse
            cx="50"
            cy="35"
            rx="35"
            ry="12"
            fill="none"
            stroke="url(#portal-gold)"
            strokeWidth="2"
            filter="url(#portal-glow)"
            opacity="0.8"
          />
          {/* Ring segments */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const x1 = 50 + Math.cos(angle) * 30
            const y1 = 35 + Math.sin(angle) * 10
            const x2 = 50 + Math.cos(angle) * 40
            const y2 = 35 + Math.sin(angle) * 14

            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ffd700"
                strokeWidth="1"
                filter="url(#portal-glow)"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            )
          })}
        </motion.g>

        {/* Inner swirling effect */}
        <motion.ellipse
          cx="50"
          cy="35"
          rx="25"
          ry="8"
          fill="url(#portal-swirl)"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 35px' }}
        />

        {/* Center glow */}
        <motion.ellipse
          cx="50"
          cy="35"
          rx="15"
          ry="5"
          fill={color}
          filter="url(#portal-glow)"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            rx: [15, 18, 15],
            ry: [5, 6, 5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Sparkles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.circle
            key={`sparkle-${i}`}
            cx={50 + (Math.random() - 0.5) * 60}
            cy={35 + (Math.random() - 0.5) * 20}
            r="1"
            fill="#ffffff"
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Floating cards effect (simplified) */}
      <div className="absolute inset-0 flex items-start justify-center pt-[15%]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-10 rounded bg-gradient-to-br from-white/20 to-white/5 border border-white/20"
            style={{
              left: `${40 + i * 10}%`,
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [i * 5 - 5, i * 5, i * 5 - 5],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
