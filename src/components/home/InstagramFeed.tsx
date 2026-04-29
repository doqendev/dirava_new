'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

// TODO: Replace with actual Instagram images or CMS integration
const instagramPosts = [
  {
    id: '1',
    image: '/instagram/post-1.jpg',
    alt: 'Customer wearing Mizoke anime hoodie',
  },
  {
    id: '2',
    image: '/instagram/post-2.jpg',
    alt: 'Anime collection showcase',
  },
  {
    id: '3',
    image: '/instagram/post-3.jpg',
    alt: 'Limited drop announcement',
  },
  {
    id: '4',
    image: '/instagram/post-4.jpg',
    alt: 'Behind the scenes design process',
  },
  {
    id: '5',
    image: '/instagram/post-5.jpg',
    alt: 'Community fan photo',
  },
  {
    id: '6',
    image: '/instagram/post-6.jpg',
    alt: 'New product teaser',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
}

interface InstagramPostProps {
  post: { id: string; image: string; alt: string }
  instagramUrl: string
}

function InstagramPost({ post, instagramUrl }: InstagramPostProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
    >
      <Link
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        {/* Placeholder gradient background */}
        <div className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-neon-purple/20 via-neon-pink/20 to-neon-orange/20',
          'flex items-center justify-center'
        )}>
          <Camera className="w-6 h-6 text-white/30" />
        </div>

        {/* Image - hidden if error */}
        {!imageError && (
          <Image
            src={post.image}
            alt={post.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}

        {/* Hover overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/60',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'flex items-center justify-center'
        )}>
          <Camera className="w-8 h-8 text-white" />
        </div>
      </Link>
    </motion.div>
  )
}

export function InstagramFeed() {
  const t = useTranslations('home')
  const instagramHandle = '@mizoke.store'
  const instagramUrl = 'https://instagram.com/mizoke.store'

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple via-neon-pink to-neon-orange flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {t('followUs')}
              </h2>
              <p className="text-sm text-white/50">{instagramHandle}</p>
            </div>
          </div>

          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-neon-cyan hover:text-[color:var(--accent,#00f5ff)]/80 transition-colors"
          >
            {t('viewProfile')} →
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {instagramPosts.map((post) => (
            <InstagramPost key={post.id} post={post} instagramUrl={instagramUrl} />
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            {t('tagUsPhotos')}
          </p>
        </div>
      </div>
    </section>
  )
}
