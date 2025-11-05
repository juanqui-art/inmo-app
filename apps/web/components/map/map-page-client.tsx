"use client";

/**
 * Map Page Client Component
 *
 * Combines FilterBar + MapView into a single responsive layout
 * - FilterBar at top (syncs filters to URL)
 * - MapView fills remaining space
 * - All client-side interactivity
 */

import { FilterBar } from "./filters/filter-bar";
import { MapView } from "./map-view";
import type { MapBounds } from "@/lib/utils/url-helpers";
import { useMapStore } from "@/stores/map-store";

interface MapPageClientProps {
  isAuthenticated: boolean;
  initialBounds?: MapBounds;
}

export function MapPageClient({
  isAuthenticated,
  initialBounds,
}: MapPageClientProps) {
  // Obtener datos del store de Zustand de forma granular
  const properties = useMapStore((state) => state.properties);
  const priceRangeMin = useMapStore((state) => state.priceRangeMin);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Filter Bar - sticky at top */}
      <div className="flex-shrink-0">
        <FilterBar
          isLoading={false}
        />
      </div>

      {/* Map - fills remaining space */}
      <div className="flex-1 w-full overflow-hidden">
        <MapView
          properties={properties}
          isAuthenticated={isAuthenticated}
          initialBounds={initialBounds}
          priceRangeMin={priceRangeMin}
          priceRangeMax={priceRangeMax}
        />
      </div>
    </div>
  );
}
