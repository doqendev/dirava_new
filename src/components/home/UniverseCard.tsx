'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { UniverseColorName } from '@/types/universe'

interface UniverseCardProps {
  slug: string
  name: string
  itemCount: number
  themeColor: UniverseColorName
  backgroundImage?: string
  className?: string
}

// Map universe slugs to their custom card images
const universeCardImages: Record<string, string> = {
  'one-piece': '/images/universes/one-piece.png',
  'demon-slayer': '/images/universes/demon-slayer.png',
  'dragon-ball': '/images/universes/dragon-ball.png',
  'hunter-hunter': '/images/universes/hunter-hunter.png',
  'attack-on-titan': '/images/universes/attack-on-titan.png',
  'digimon': '/images/universes/digimon.png',
}

// Get card image by checking the slug or collection handle
function getCardImage(slug: string): string | null {
  if (universeCardImages[slug]) {
    return universeCardImages[slug]
  }
  for (const [key, image] of Object.entries(universeCardImages)) {
    if (slug.includes(key)) {
      return image
    }
  }
  return null
}

// Particle component for floating effects
function Particles({ color, count = 6 }: { color: string; count?: number }) {
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
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// Border pulse effect component
function BorderPulse({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        border: `2px solid ${color}`,
      }}
      animate={{
        opacity: [0.3, 0.8, 0.3],
        boxShadow: [
          `0 0 5px ${color}40, inset 0 0 5px ${color}20`,
          `0 0 20px ${color}60, inset 0 0 10px ${color}30`,
          `0 0 5px ${color}40, inset 0 0 5px ${color}20`,
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

export function UniverseCard({
  slug,
  name,
  itemCount,
  themeColor,
  backgroundImage,
  className,
}: UniverseCardProps) {
  const customCardImage = getCardImage(slug)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position for tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for heavy tilt
  const springConfig = { damping: 20, stiffness: 200 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), springConfig)

  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  // Color-based glow colors
  const glowColors: Record<UniverseColorName, string> = {
    cyan: '#00f5ff',
    pink: '#ff2d6a',
    orange: '#ff8c00',
    green: '#00ff88',
  }

  const currentColor = glowColors[themeColor]

  // If we have a custom card image, use the enhanced design
  if (customCardImage) {
    return (
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        whileTap={{ scale: 0.98 }}
        className={cn('relative z-0', className)}
      >
        {/* Glow effect behind the card */}
        <motion.div
          className="absolute inset-0 rounded-3xl -z-10"
          style={{
            backgroundColor: currentColor,
            filter: 'blur(40px)',
            transform: 'scale(0.85)',
          }}
          animate={{
            opacity: isHovered ? 0.6 : 0.4,
          }}
          transition={{ duration: 0.3 }}
        />

        <Link
          href={`/worlds/${slug}`}
          className="block relative z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
        >
          <div className="relative aspect-[3/4]">
            {/* Card image */}
            <Image
              src={customCardImage}
              alt={name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority
            />

            {/* Item count and ENTER button overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 md:pb-10 pointer-events-none">
              {/* Item count badge */}
              <div
                className="px-2.5 md:px-4 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: `1px solid ${currentColor}`,
                  color: 'white',
                  boxShadow: `0 0 6px ${currentColor}40`,
                }}
              >
                {itemCount} items
              </div>

              {/* ENTER button */}
              <div
                className="mt-1.5 md:mt-2.5 px-4 md:px-6 py-1 md:py-1.5 rounded-full font-display text-[9px] md:text-xs tracking-[1px] uppercase"
                style={{
                  backgroundColor: `${currentColor}50`,
                  border: `1px solid ${currentColor}`,
                  color: 'white',
                  boxShadow: `0 0 8px ${currentColor}60`,
                }}
              >
                ENTER
              </div>
            </div>

            {/* Particle effects */}
            <Particles color={currentColor} count={8} />

            {/* Border pulse effect */}
            <BorderPulse color={currentColor} />

            {/* Corner energy effects */}
            <motion.div
              className="absolute top-2 left-2 w-3 h-3"
              style={{
                borderLeft: `2px solid ${currentColor}`,
                borderTop: `2px solid ${currentColor}`,
                boxShadow: `0 0 8px ${currentColor}`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-2 right-2 w-3 h-3"
              style={{
                borderRight: `2px solid ${currentColor}`,
                borderTop: `2px solid ${currentColor}`,
                boxShadow: `0 0 8px ${currentColor}`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-2 left-2 w-3 h-3"
              style={{
                borderLeft: `2px solid ${currentColor}`,
                borderBottom: `2px solid ${currentColor}`,
                boxShadow: `0 0 8px ${currentColor}`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute bottom-2 right-2 w-3 h-3"
              style={{
                borderRight: `2px solid ${currentColor}`,
                borderBottom: `2px solid ${currentColor}`,
                boxShadow: `0 0 8px ${currentColor}`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
            />
          </div>
        </Link>
      </motion.div>
    )
  }

  // Fallback to the original design for collections without custom cards
  const colorConfig: Record<UniverseColorName, { border: string; glow: string; text: string; bg: string; buttonBg: string }> = {
    cyan: {
      border: 'border-neon-cyan',
      glow: 'shadow-glow-cyan',
      text: 'text-neon-cyan',
      bg: 'from-neon-cyan/20 to-transparent',
      buttonBg: 'bg-neon-cyan/20 border-neon-cyan hover:bg-neon-cyan/30',
    },
    pink: {
      border: 'border-neon-pink',
      glow: 'shadow-glow-pink',
      text: 'text-neon-pink',
      bg: 'from-neon-pink/20 to-transparent',
      buttonBg: 'bg-neon-pink/20 border-neon-pink hover:bg-neon-pink/30',
    },
    orange: {
      border: 'border-neon-orange',
      glow: 'shadow-glow-orange',
      text: 'text-neon-orange',
      bg: 'from-neon-orange/20 to-transparent',
      buttonBg: 'bg-neon-orange/20 border-neon-orange hover:bg-neon-orange/30',
    },
    green: {
      border: 'border-neon-green',
      glow: 'shadow-glow-green',
      text: 'text-neon-green',
      bg: 'from-neon-green/20 to-transparent',
      buttonBg: 'bg-neon-green/20 border-neon-green hover:bg-neon-green/30',
    },
  }

  const colors = colorConfig[themeColor]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('relative', className)}
    >
      <Link
        href={`/worlds/${slug}`}
        className={cn(
          'block relative overflow-hidden',
          'aspect-[3/4] rounded-xl',
          'border-2',
          colors.border,
          'transition-shadow duration-300',
          'hover:' + colors.glow,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary'
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-bg-secondary">
          <div className={cn('absolute inset-0 bg-gradient-to-b', colors.bg)} />
          {backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
          )}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[60px] opacity-60"
            style={{
              backgroundColor: themeColor === 'cyan' ? '#00f5ff' :
                             themeColor === 'pink' ? '#ff2d6a' :
                             themeColor === 'orange' ? '#ff8c00' : '#00ff88'
            }}
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
          <h3 className={cn('font-display text-xl md:text-2xl font-bold text-white tracking-wider uppercase drop-shadow-lg')}>
            {name.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h3>
          <div className={cn('mt-4 px-3 py-1 rounded-full bg-black/50 border text-xs font-medium', colors.border, colors.text)}>
            {itemCount} items
          </div>
          <div className={cn('mt-6 px-6 py-2 rounded-lg border transition-colors duration-200 font-display text-xs tracking-[2px] uppercase', colors.buttonBg, colors.text)}>
            ENTER
          </div>
        </div>

        {/* Corner accents */}
        <div className={cn('absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2', colors.border, 'opacity-50')} />
        <div className={cn('absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2', colors.border, 'opacity-50')} />
        <div className={cn('absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2', colors.border, 'opacity-50')} />
        <div className={cn('absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2', colors.border, 'opacity-50')} />
      </Link>
    </motion.div>
  )
}
