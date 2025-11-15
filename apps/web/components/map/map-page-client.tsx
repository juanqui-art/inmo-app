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

import { FilterBar } from "./filters/filter-bar";
import { useFilterUrlSync } from "./filters/use-filter-url-sync";
import { MapView } from "./map-view";
import { PropertyViewToggle } from "@/components/properties/property-view-toggle";
import type { MapBounds } from "@/lib/utils/url-helpers";
import { useMapStore } from "@/stores/map-store";
import { useSearchParams } from "next/navigation";

interface MapPageClientProps {
  initialBounds?: MapBounds;
}

export function MapPageClient({ initialBounds }: MapPageClientProps) {
  // =========================================================================
  // Initialize URL ↔ Store sync
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
      {/* Header with View Toggle */}
      <div className="flex-shrink-0 sticky top-0 z-30 bg-oslo-gray-950/90 backdrop-blur-md border-b border-oslo-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-oslo-gray-50">
              Mapa de Propiedades
            </h1>
            <p className="text-sm text-oslo-gray-300">
              {properties.length} propiedad{properties.length !== 1 ? "es" : ""} en el mapa
            </p>
          </div>
          <PropertyViewToggle currentView={currentView} filters={filterString} />
        </div>
      </div>

      {/* Filter Bar */}
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
