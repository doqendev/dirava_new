import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Breadcrumb {
  label: string
  href: string
}

interface ContentPageLayoutProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  glowColor?: 'cyan' | 'pink' | 'orange' | 'green'
  children: React.ReactNode
  className?: string
}

const glowColors = {
  cyan: {
    text: 'text-neon-cyan',
    shadow: '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
  },
  pink: {
    text: 'text-neon-pink',
    shadow: '0 0 20px rgba(255, 45, 106, 0.5), 0 0 40px rgba(255, 45, 106, 0.3)',
  },
  orange: {
    text: 'text-neon-orange',
    shadow: '0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
  },
  green: {
    text: 'text-neon-green',
    shadow: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
  },
}

export function ContentPageLayout({
  title,
  description,
  breadcrumbs,
  glowColor = 'cyan',
  children,
  className,
}: ContentPageLayoutProps) {
  const glow = glowColors[glowColor]

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="pt-6 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
              <Link
                href="/"
                className="text-white/50 hover:text-white transition-colors"
              >
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-white/30" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className={glow.text}>{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1
            className={cn(
              'font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider uppercase',
              glow.text
            )}
            style={{ textShadow: glow.shadow }}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-4 text-white/60 text-lg max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-16 px-4">
        <div className={cn('max-w-4xl mx-auto', className)}>
          {children}
        </div>
      </section>
    </div>
  )
}
