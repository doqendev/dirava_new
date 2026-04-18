'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  product?: string
}

// TODO: Replace with actual customer reviews from Shopify metafields or reviews app
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alex M.',
    location: 'Germany',
    rating: 5,
    text: "The quality is insane. I've bought anime merch before but this is on another level. The hoodie is thick, the print is perfect, and it actually fits well.",
    product: 'Gear 5 Luffy Hoodie',
  },
  {
    id: '2',
    name: 'Sarah K.',
    location: 'France',
    rating: 5,
    text: "Finally found a store that gets it. The designs are unique, not the same stuff you see everywhere. Already ordered my third piece.",
  },
  {
    id: '3',
    name: 'Marcus T.',
    location: 'Netherlands',
    rating: 5,
    text: 'Shipping was fast and the packaging was sick. The tee quality is premium - washed it multiple times and it still looks brand new.',
    product: 'Demon Slayer Tee',
  },
  {
    id: '4',
    name: 'Emma L.',
    location: 'UK',
    rating: 5,
    text: "My boyfriend loved his gift. The attention to detail on the embroidery is crazy. Will definitely be back for the next drop.",
    product: 'Hunter x Hunter Collection',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-white/20'
          )}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, t }: { testimonial: Testimonial; t: ReturnType<typeof useTranslations> }) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'relative p-6 rounded-2xl',
        'bg-white/[0.03] border border-white/10',
        'hover:border-neon-cyan/30 hover:bg-white/[0.05]',
        'transition-colors duration-300'
      )}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-2">
        <Quote className="w-8 h-8 text-neon-cyan/20" />
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Review text */}
      <p className="text-white/70 text-sm md:text-base leading-relaxed mb-4">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Product tag */}
      {testimonial.product && (
        <p className="text-xs text-neon-cyan/70 mb-4">
          {t('purchased')}: {testimonial.product}
        </p>
      )}

      {/* Customer info */}
      <div className="flex items-center gap-3">
        {/* Avatar with initials */}
        <div className={cn(
          'w-10 h-10 rounded-full',
          'bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20',
          'border border-white/10',
          'flex items-center justify-center',
          'text-sm font-semibold text-white/80'
        )}>
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {testimonial.name}
          </p>
          <p className="text-xs text-white/60">
            {testimonial.location}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function Testimonials() {
  const t = useTranslations('home')

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t('whatCommunitySays')}
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-md mx-auto">
            {t('communitySubtitle')}
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} t={t} />
          ))}
        </motion.div>

        {/* Trust stats */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-neon-cyan">10K+</p>
            <p className="text-xs md:text-sm text-white/60">{t('happyCustomers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-neon-cyan">4.9</p>
            <p className="text-xs md:text-sm text-white/60">{t('averageRating')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-neon-cyan">50+</p>
            <p className="text-xs md:text-sm text-white/60">{t('countriesShipped')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
