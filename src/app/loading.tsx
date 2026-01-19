import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mx-auto" />
        <p className="mt-4 text-white/50">Loading...</p>
      </div>
    </div>
  )
}
