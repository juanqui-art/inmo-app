"use client";

/**
 * Map Page Client Component (Refactored)
 *
 * Combines FilterBar + MapView into a single responsive layout
 * - FilterBar at top (filters manage themselves via Zustand)
 * - MapView fills remaining space (shows filtered properties)
 * - URL ↔ Store sync handled by useFilterUrlSync hook
 * - All client-side interactivity
 *
 * UPDATED: Added PropertyViewToggle for unified route pattern (Nov 2025)
 * - Users can now toggle between list and map views
 * - Consistent with PropertyGridPage toggle
 */

import type { PropertyFilters } from "@repo/database";
import { useSearchParams } from "next/navigation";
import { PropertyListTitle } from "@/components/properties/property-list-title";
import type { MapBounds } from "@/lib/utils/url-helpers";
import { useMapStore } from "@/stores/map-store";
import { FilterBar } from "./filters/filter-bar";
import { useFilterUrlSync } from "./filters/use-filter-url-sync";
import { MapSearchIntegration } from "./map-search-integration";
import { MapView } from "./map-view";

interface MapPageClientProps {
  initialBounds?: MapBounds;
  /**
   * Total number of properties matching current filters
   * Passed from server-side page to show accurate count in title
   */
  totalProperties?: number;
  /**
   * Current filters from server
   * Passed to PropertyListTitle to display correct context immediately
   */
  filters?: PropertyFilters;
}

export function MapPageClient({
  initialBounds,
  totalProperties,
  filters,
}: MapPageClientProps) {
  // =========================================================================
  // Initialize URL ↔ Store sync
  // Note: Filters are already initialized by MapStoreInitializer in parent
  // =========================================================================
  useFilterUrlSync();

  // =========================================================================
  // Store selectors
  // =========================================================================
  const properties = useMapStore((state) => state.properties);
  const priceRangeMin = useMapStore((state) => state.priceRangeMin);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);

  // =========================================================================
  // URL params for view toggle
  // =========================================================================
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") === "map" ? "map" : "list";
  const filterString = searchParams.toString();

  return (
    <div className="flex flex-col w-full h-screen">
      {/* AI Search Integration - detects ai_search URL param and applies cached results */}
      <MapSearchIntegration />

      {/* Filter Bar (with toggle integrated) */}
      <div className="flex-shrink-0">
        <FilterBar
          showViewToggle={true}
          currentView={currentView}
          filterString={filterString}
        />
      </div>

      {/* Title */}
      <PropertyListTitle
        total={totalProperties ?? properties.length}
        filters={filters}
      />

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
