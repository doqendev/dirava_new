import { Skeleton, SkeletonProductGrid } from '@/components/ui/Skeleton'

export default function UniverseLoading() {
  return (
    <div className="min-h-screen">
      {/* Banner skeleton */}
      <div className="relative h-48 md:h-64">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Title + filter bar */}
      <div className="px-4 max-w-7xl mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-8" />

        {/* Filter bar skeleton */}
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        {/* Product grid */}
        <SkeletonProductGrid count={8} />
      </div>
    </div>
  )
}
