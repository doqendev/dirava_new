import { Ghost } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated ghost icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-bg-secondary border-2 border-neon-cyan flex items-center justify-center">
            <Ghost className="w-12 h-12 text-neon-cyan" />
          </div>
        </div>

        <h1 className="font-display text-6xl font-bold text-neon-cyan mb-2">
          404
        </h1>

        <h2 className="font-display text-xl text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-white/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button as="a" href="/" variant="primary" glow="cyan">
            Return Home
          </Button>
          <Button as="a" href="/worlds" variant="outline">
            Explore Worlds
          </Button>
        </div>
      </div>
    </div>
  )
}
