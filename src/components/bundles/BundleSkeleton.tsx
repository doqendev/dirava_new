import { Skeleton } from '@/components/ui/Skeleton'

export function BundleSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-24 rounded-xl" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
