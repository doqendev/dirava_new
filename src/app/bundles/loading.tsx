import { Skeleton } from '@/components/ui/Skeleton'

function BundleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function BundlesLoading() {
  return (
    <div className="min-h-screen">
      {/* Banner skeleton */}
      <div className="relative h-48 md:h-56">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Bundle cards */}
      <div className="px-4 max-w-7xl mx-auto py-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BundleCardSkeleton />
          <BundleCardSkeleton />
          <BundleCardSkeleton />
        </div>
      </div>
    </div>
  )
}
