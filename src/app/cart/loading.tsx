import { Skeleton } from '@/components/ui/Skeleton'

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-bg-card rounded-xl border border-border-subtle">
      <Skeleton className="w-24 h-24 flex-shrink-0 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
}

export default function CartLoading() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-6 border-b border-border-subtle">
        <div className="px-4 max-w-4xl mx-auto">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      {/* Cart items */}
      <div className="py-6">
        <div className="px-4 max-w-4xl mx-auto space-y-4">
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
      </div>

      {/* Summary */}
      <div className="py-6 border-t border-border-subtle">
        <div className="px-4 max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
