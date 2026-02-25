import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'

export default function ProductLoading() {
  return (
    <div className="min-h-screen">
      <div className="px-4 max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-lg" />
              <Skeleton className="w-20 h-20 rounded-lg" />
              <Skeleton className="w-20 h-20 rounded-lg" />
              <Skeleton className="w-20 h-20 rounded-lg" />
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <Skeleton className="h-4 w-48" />

            {/* Title */}
            <Skeleton className="h-8 w-3/4" />

            {/* Price */}
            <Skeleton className="h-6 w-32" />

            {/* Rating */}
            <Skeleton className="h-5 w-40" />

            {/* Variant selector */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16 rounded-lg" />
                <Skeleton className="h-10 w-16 rounded-lg" />
                <Skeleton className="h-10 w-16 rounded-lg" />
              </div>
            </div>

            {/* Add to cart button */}
            <Skeleton className="h-12 w-full rounded-lg" />

            {/* Description */}
            <div className="pt-6 border-t border-border-subtle">
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
