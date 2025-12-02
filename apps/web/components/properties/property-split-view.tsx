"use client";

/**
 * PropertySplitView - Desktop Split View (50/50 Lista + Mapa)
 *
 * PATTERN: Industry standard from Booking.com, Hotels.com
 * RESEARCH: 95% user engagement with maps in split view (Baymard Institute)
 *
 * LAYOUT (UPDATED Nov 2025):
 * - FilterBar with integrated View Toggle (sticky top, z-30)
 * - Desktop (≥1024px): Lista izquierda 50%, Mapa derecha 50%
 * - Lista scrollable with local header (sticky, z-20)
 * - Mapa sticky (fixed while scrolling)
 *
 * FEATURES:
 * - Both views visible simultaneously
 * - Hover synchronization (list ↔ map highlighting)
 * - Filter/sort parity across both sides
 * - Shared state via Zustand stores
 * - View toggle integrated in FilterBar (Nov 2025)
 * - Local header sticky within list column (Nov 2025)
 *
 * USAGE:
 * ```tsx
 * <PropertySplitView />
 * ```
 *
 * REQUIREMENTS:
 * - PropertyGridStore must be initialized with properties
 * - MapStore must be initialized with properties + map data
 * - Both stores hydrated by server components
 */

import { useSearchParams } from "next/navigation";
import { PublicFooter } from "@/components/layout/public-footer";
import { FilterBar } from "@/components/map/filters/filter-bar";
import { useFilterUrlSync } from "@/components/map/filters/use-filter-url-sync";
import { MapView } from "@/components/map/map-view";
import { useFavorites } from "@/hooks/use-favorites";
import { useMapStore } from "@/stores/map-store";
import { usePropertyGridStore } from "@/stores/property-grid-store";
import { PropertyCard } from "./property-card";
import { PropertyCardSkeleton } from "./property-card-skeleton";
import { PropertyListTitle } from "./property-list-title";

export function PropertySplitView() {
  // =========================================================================
  // FILTER SYNCHRONIZATION
  // =========================================================================
  // Sync URL ↔ MapStore filters bidirectionally
  // Without this, filter changes don't trigger Server Component re-fetches
  useFilterUrlSync();

  // =========================================================================
  // STORE DATA (hydrated by server components)
  // =========================================================================

  // List data from PropertyGridStore
  const {
    properties: listProperties,
    total,
    isLoading,
  } = usePropertyGridStore();

  // Map data from MapStore
  const mapProperties = useMapStore((state) => state.properties);
  const priceRangeMin = useMapStore((state) => state.priceRangeMin);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);

  // =========================================================================
  // EXTERNAL DEPENDENCIES
  // =========================================================================

  const { isFavorite, toggleFavorite } = useFavorites();
  const searchParams = useSearchParams();

  // Build filter query string for view toggle
  const filterString = searchParams.toString();
  const currentView = "map"; // Split view is only shown when view=map

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const setHoveredProperty = useMapStore((state) => state.setHoveredProperty);

  // Simplified: toggleFavorite now handles auth check internally
  const handleFavoriteToggle = (propertyId: string) => {
    toggleFavorite(propertyId);
  };

  const handlePropertyHover = (propertyId: string | null) => {
    setHoveredProperty(propertyId);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="h-screen flex flex-col bg-oslo-gray-1000">
      {/* ===================================================================
          FILTER BAR - Shared for both sides + View Toggle integrated
          =================================================================== */}
      <FilterBar
        showViewToggle={true}
        currentView={currentView}
        filterString={filterString}
      />

      {/* ===================================================================
          SPLIT LAYOUT - 50/50 List + Map
          =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE: Property List (50%) */}
        <div className="w-1/2 overflow-y-auto border-r border-oslo-gray-800 flex flex-col">
          {/* Dynamic Title - Shows current filters and count */}
          <PropertyListTitle total={total} />

          {/* Property Grid Container */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              // Loading State: Show skeletons
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <PropertyCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : listProperties.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="mb-4 text-5xl">🔍</div>
                <h2 className="text-3xl font-bold text-oslo-gray-50 mb-2">
                  No hay propiedades disponibles
                </h2>
                <p className="text-oslo-gray-400 mb-6">
                  Intenta cambiar tus filtros o realiza una nueva búsqueda
                </p>
              </div>
            ) : (
              // Property Grid
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 isolate">
                {listProperties.map((property) => (
                  <div
                    key={property.id}
                    onMouseEnter={() => handlePropertyHover(property.id)}
                    onMouseLeave={() => handlePropertyHover(null)}
                  >
                    <PropertyCard
                      property={property}
                      isFavorite={isFavorite(property.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                      priority={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Rendered at end of scrollable list column */}
          <PublicFooter />
        </div>

        {/* RIGHT SIDE: Map (50%) */}
        <div className="w-1/2 sticky top-0 h-full">
          <MapView
            properties={mapProperties}
            priceRangeMin={priceRangeMin}
            priceRangeMax={priceRangeMax}
          />
        </div>
      </div>

    </div>
  );
}
