import { Skeleton, SkeletonProductGrid } from '@/components/ui/Skeleton'

export default function SearchLoading() {
  return (
    <div className="min-h-screen">
      <div className="px-4 max-w-7xl mx-auto py-8">
        {/* Search bar skeleton */}
        <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-lg mb-8" />

        {/* Filter bar */}
        <div className="flex gap-3 mb-8">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>

        {/* Results count */}
        <Skeleton className="h-4 w-36 mb-6" />

        {/* Product grid */}
        <SkeletonProductGrid count={8} />
      </div>
    </div>
  )
}
