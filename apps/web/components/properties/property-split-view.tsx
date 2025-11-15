"use client";

/**
 * PropertySplitView - Desktop Split View (50/50 Lista + Mapa)
 *
 * PATTERN: Industry standard from Booking.com, Hotels.com
 * RESEARCH: 95% user engagement with maps in split view (Baymard Institute)
 *
 * LAYOUT:
 * - Desktop (≥1024px): Lista izquierda 50%, Mapa derecha 50%
 * - Lista scrollable, Mapa sticky (fixed while scrolling)
 * - Unified header with view toggle and property count
 *
 * FEATURES:
 * - Both views visible simultaneously
 * - Hover synchronization (list ↔ map highlighting)
 * - Filter/sort parity across both sides
 * - Shared state via Zustand stores
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

import { PropertyViewToggle } from "./property-view-toggle";
import { FilterBar } from "@/components/map/filters/filter-bar";
import { PropertyCard } from "./property-card";
import { MapView } from "@/components/map/map-view";
import { AuthModal } from "@/components/auth/auth-modal";
import { usePropertyGridStore } from "@/stores/property-grid-store";
import { useMapStore } from "@/stores/map-store";
import { useAuthStore } from "@/stores/auth-store";
import { useFavorites } from "@/hooks/use-favorites";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function PropertySplitView() {
  // =========================================================================
  // STORE DATA (hydrated by server components)
  // =========================================================================

  // List data from PropertyGridStore
  const { properties: listProperties, total } = usePropertyGridStore();

  // Map data from MapStore
  const mapProperties = useMapStore((state) => state.properties);
  const priceRangeMin = useMapStore((state) => state.priceRangeMin);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);

  // =========================================================================
  // UI STATE
  // =========================================================================

  const [showAuthModal, setShowAuthModal] = useState(false);

  // =========================================================================
  // EXTERNAL DEPENDENCIES
  // =========================================================================

  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const { isFavorite, toggleFavorite } = useFavorites();
  const searchParams = useSearchParams();

  // Build filter query string for view toggle
  const filterString = searchParams.toString();
  const currentView = "map"; // Split view is only shown when view=map

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const setHoveredProperty = useMapStore((state) => state.setHoveredProperty);

  const handleFavoriteToggle = (propertyId: string) => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
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
          HEADER - Unified for both list and map
          =================================================================== */}
      <div className="flex-shrink-0 sticky top-0 z-30 bg-oslo-gray-950/90 backdrop-blur-md border-b border-oslo-gray-800">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-oslo-gray-50">
              Propiedades
            </h1>
            <p className="text-sm text-oslo-gray-300">
              {total} propiedad{total !== 1 ? "es" : ""} encontrada
              {total !== 1 ? "s" : ""}
            </p>
          </div>
          <PropertyViewToggle currentView={currentView} filters={filterString} />
        </div>
      </div>

      {/* ===================================================================
          FILTER BAR - Shared for both sides
          =================================================================== */}
      <FilterBar />

      {/* ===================================================================
          SPLIT LAYOUT - 50/50 List + Map
          =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE: Property List (50%) */}
        <div className="w-1/2 overflow-y-auto border-r border-oslo-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {listProperties.length === 0 ? (
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

      {/* ===================================================================
          AUTH MODAL
          =================================================================== */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
