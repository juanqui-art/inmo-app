/**
 * Filter Skeleton Loaders
 *
 * Loading placeholders for filter components while data is fetching
 * - Reusable skeleton components
 * - Matches filter button dimensions
 * - Animated pulse effect
 * - Dark theme compatible
 */

/**
 * Generic skeleton placeholder
 * Reusable for any filter button
 */
interface FilterSkeletonProps {
  width?: string;
}

export function FilterSkeleton({
  width = "w-32",
}: FilterSkeletonProps) {
  return (
    <div className={`${width} h-10 bg-oslo-gray-800/50 animate-pulse rounded-lg`} />
  );
}

/**
 * Price filter skeleton
 * Wider than other filters (~150px for "Precio: $100k - $500k")
 */
export function PriceFilterSkeleton() {
  return (
    <div className="hidden sm:block">
      <FilterSkeleton width="w-40" />
    </div>
  );
}

/**
 * Property type filter skeleton
 * Medium width (~160px for "Casa, Departamento, Suite...")
 */
export function PropertyTypeFilterSkeleton() {
  return (
    <div className="hidden md:block">
      <FilterSkeleton width="w-44" />
    </div>
  );
}

/**
 * Bedrooms filter skeleton
 * Narrow width (~120px for "3+ Habitaciones")
 */
export function BedroomsFilterSkeleton() {
  return (
    <div className="hidden lg:block">
      <FilterSkeleton width="w-32" />
    </div>
  );
}

/**
 * Complete filter bar skeleton
 * Shows all filter skeletons in a row
 */
export function FilterBarSkeleton() {
  return (
    <div className="flex gap-2 px-4 py-2.5 border-b border-oslo-gray-700/30 bg-oslo-gray-900/50">
      {/* AI Search skeleton - always visible */}
      <div className="w-64 h-10 bg-oslo-gray-800/50 animate-pulse rounded-full" />

      {/* Price filter skeleton - visible on sm+ */}
      <PriceFilterSkeleton />

      {/* Property type skeleton - visible on md+ */}
      <PropertyTypeFilterSkeleton />

      {/* Bedrooms skeleton - visible on lg+ */}
      <BedroomsFilterSkeleton />
    </div>
  );
}
