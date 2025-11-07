'use client'

/**
 * Map Page Client Component (Refactored)
 *
 * Combines FilterBar + MapView into a single responsive layout
 * - FilterBar at top (filters manage themselves via Zustand)
 * - MapView fills remaining space (shows filtered properties)
 * - URL ↔ Store sync handled by useFilterUrlSync hook
 * - All client-side interactivity
 *
 * REFACTORING NOTES:
 * - ✅ Added useFilterUrlSync() to handle URL ↔ Store synchronization
 * - ✅ Removed manual prop drilling
 * - ✅ Cleaner architecture: components + hook handle their concerns
 */

import { FilterBar } from './filters/filter-bar'
import { useFilterUrlSync } from './filters/use-filter-url-sync'
import { MapView } from './map-view'
import type { MapBounds } from '@/lib/utils/url-helpers'
import { useMapStore } from '@/stores/map-store'

interface MapPageClientProps {
  initialBounds?: MapBounds
}

export function MapPageClient({ initialBounds }: MapPageClientProps) {
  // =========================================================================
  // Initialize URL ↔ Store sync
  // =========================================================================
  useFilterUrlSync()

  // =========================================================================
  // Store selectors
  // =========================================================================
  const properties = useMapStore((state) => state.properties)
  const priceRangeMin = useMapStore((state) => state.priceRangeMin)
  const priceRangeMax = useMapStore((state) => state.priceRangeMax)

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Filter Bar - sticky at top */}
      <div className="flex-shrink-0">
        <FilterBar />
      </div>

      {/* Map - fills remaining space */}
      <div className="flex-1 w-full overflow-hidden">
        <MapView
          properties={properties}
          initialBounds={initialBounds}
          priceRangeMin={priceRangeMin}
          priceRangeMax={priceRangeMax}
        />
      </div>
    </div>
  );
}
