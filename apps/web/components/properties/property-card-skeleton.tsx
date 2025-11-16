"use client";

/**
 * PropertyCardSkeleton - Loading placeholder for PropertyCard
 *
 * Displays while properties are loading after filter/pagination changes.
 *
 * DESIGN:
 * - Matches PropertyCard dimensions (aspect-[4/5])
 * - Replicates card structure: image, badges, buttons, info section
 * - Uses oslo-gray palette for dark theme consistency
 * - Pulsing animation via Tailwind's animate-pulse
 *
 * USAGE:
 * ```tsx
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 *   {Array.from({ length: 12 }).map((_, i) => (
 *     <PropertyCardSkeleton key={`skeleton-${i}`} />
 *   ))}
 * </div>
 * ```
 */

export function PropertyCardSkeleton() {
  return (
    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-oslo-gray-900 shadow-lg border border-oslo-gray-800 animate-pulse">
      {/* Image placeholder - fills entire card background */}
      <div className="absolute inset-0 bg-oslo-gray-800" />

      {/* Top section: badges and action buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        {/* Left: Transaction and Category badges */}
        <div className="flex flex-col gap-2">
          {/* Transaction badge skeleton (SALE/RENT) */}
          <div className="h-7 w-20 bg-oslo-gray-700 rounded-full" />

          {/* Category badge skeleton */}
          <div className="h-7 w-24 bg-oslo-gray-700 rounded-full" />
        </div>

        {/* Right: Action buttons (favorite, share) */}
        <div className="flex flex-col gap-2">
          {/* Favorite button */}
          <div className="w-9 h-9 rounded-full bg-oslo-gray-700" />

          {/* Share button */}
          <div className="w-9 h-9 rounded-full bg-oslo-gray-700" />
        </div>
      </div>

      {/* Bottom section: property information */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-2 bg-gradient-to-t from-black/80 to-black/0">
        {/* Price skeleton */}
        <div className="h-9 w-32 bg-oslo-gray-700 rounded" />

        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-oslo-gray-700 rounded" />

        {/* Location skeleton */}
        <div className="h-4 w-1/2 bg-oslo-gray-700 rounded" />

        {/* Stats skeleton (bedrooms, bathrooms, area) */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-oslo-gray-700">
          {/* Bedrooms stat */}
          <div className="h-4 w-12 bg-oslo-gray-700 rounded" />

          {/* Bathrooms stat */}
          <div className="h-4 w-12 bg-oslo-gray-700 rounded" />

          {/* Area stat */}
          <div className="h-4 w-16 bg-oslo-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
