/**
 * LOADING - Skeleton for properties page
 * Shows while the properties are being fetched
 */

// Simple skeleton component using Tailwind
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded-md ${className || ""}`}
    />
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[16/10] w-full" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-4">
        {/* Title and Price */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/2" />
        </div>
        
        {/* Location */}
        <Skeleton className="h-4 w-2/3" />
        
        {/* Specs */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Stats Card */}
        <Skeleton className="h-20 w-full rounded-lg" />
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-10" />
        </div>
      </div>
    </div>
  );
}

export default function PropiedadesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Properties Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </div>
  );
}
