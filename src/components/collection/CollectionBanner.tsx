'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface CollectionBannerProps {
  universe: string
  universeName: string
  themeColor: string
  imageUrl?: string
}

// Map universe slugs to their images (reusing the universe card images)
const universeImages: Record<string, string> = {
  'one-piece': '/images/universes/one-piece.png',
  'demon-slayer': '/images/universes/demon-slayer.png',
  'dragon-ball': '/images/universes/dragon-ball.png',
  'hunter-hunter': '/images/universes/hunter-hunter.png',
  'attack-on-titan': '/images/universes/attack-on-titan.png',
  'digimon': '/images/universes/digimon.png',
  'jujutsu-kaisen': '/images/universes/jujutsu-kaisen.png',
  'bleach': '/images/universes/bleach.png',
}

// Get universe image by checking the slug
function getUniverseImage(slug: string): string | null {
  if (universeImages[slug]) {
    return universeImages[slug]
  }
  for (const [key, image] of Object.entries(universeImages)) {
    if (slug.includes(key)) {
      return image
    }
  }
  return null
}

// Decorative elements for each universe (subtle anime-inspired)
function UniverseDecoration({ universe, color }: { universe: string; color: string }) {
  // Common floating particles
  const particles = Array.from({ length: 6 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
        left: `${10 + Math.random() * 80}%`,
        bottom: `${10 + Math.random() * 40}%`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: i * 0.5,
        ease: 'easeInOut',
      }}
    />
  ))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}

      {/* Universe-specific subtle decoration */}
      {universe.includes('one-piece') && (
        <motion.div
          className="absolute bottom-4 right-8 w-16 h-16 opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="w-full h-full rounded-full border-2"
            style={{ borderColor: color }}
          />
        </motion.div>
      )}

      {universe.includes('demon-slayer') && (
        <>
          {/* Subtle ember effect */}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                left: `${20 + i * 20}%`,
                bottom: '20%',
              }}
              animate={{
                y: [0, -60],
                opacity: [0.6, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </>
      )}

      {universe.includes('dragon-ball') && (
        <motion.div
          className="absolute bottom-6 right-12 w-8 h-8 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            boxShadow: `0 0 20px ${color}`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {universe.includes('hunter') && (
        <motion.div
          className="absolute bottom-8 right-16 w-12 h-12 opacity-20"
          style={{ border: `2px solid ${color}` }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{ border: `1px solid ${color}` }}
          />
        </motion.div>
      )}
    </div>
  )
}

export function CollectionBanner({
  universe,
  universeName,
  themeColor,
  imageUrl,
}: CollectionBannerProps) {
  const universeImage = imageUrl || getUniverseImage(universe)
  const hasImage = !!universeImage

  return (
    <div className="relative w-full h-32 md:h-48 overflow-hidden">
      {/* Background */}
      {hasImage ? (
        <Image
          src={universeImage}
          alt={`${universeName} collection banner`}
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
          style={{
            objectPosition: 'center 20%',
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${themeColor}20 0%, transparent 50%, ${themeColor}10 100%)`,
          }}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(10, 10, 18, 1) 0%, rgba(10, 10, 18, 0.7) 40%, rgba(10, 10, 18, 0.3) 100%)`,
        }}
      />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
        }}
      />

      {/* Decorative elements */}
      <UniverseDecoration universe={universe} color={themeColor} />

      {/* Title */}
      <div className="absolute bottom-4 left-4 md:left-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'font-display text-2xl md:text-3xl lg:text-4xl font-bold',
            'tracking-wider uppercase'
          )}
          style={{
            color: themeColor,
            textShadow: `0 0 20px ${themeColor}60, 0 0 40px ${themeColor}30`,
          }}
        >
          {universeName}
        </motion.h1>
      </div>
    </div>
  )
}
