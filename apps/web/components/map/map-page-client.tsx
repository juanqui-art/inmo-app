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
import { MapView, type MapProperty } from "./map-view";
import type { MapBounds } from "@/lib/utils/url-helpers";

interface MapPageClientProps {
  properties: MapProperty[];
  isAuthenticated: boolean;
  initialBounds?: MapBounds;
  priceRangeMin?: number;
  priceRangeMax?: number;
}

export function MapPageClient({
  properties,
  isAuthenticated,
  initialBounds,
  priceRangeMin,
  priceRangeMax,
}: MapPageClientProps) {
  return (
    <div className="flex flex-col w-full h-screen">
      {/* Filter Bar - sticky at top */}
      <div className="flex-shrink-0">
        <FilterBar
          priceRangeMin={priceRangeMin}
          priceRangeMax={priceRangeMax}
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
