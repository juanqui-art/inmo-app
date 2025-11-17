"use client";

/**
 * PropertyGridPage - Main layout for properties listing
 *
 * Combines:
 * - Filter sidebar (desktop) / filter sheet (mobile)
 * - Property grid with cards
 * - Pagination controls
 * - View toggle (list ↔ map)
 * - JSON-LD schema for SEO
 *
 * STATE MANAGEMENT:
 * - Reads properties, pagination data from PropertyGridStore (Zustand)
 * - No props drilling: store is hydrated by PropertyGridStoreInitializer
 * - Child components also read from store directly
 */

import { PropertyCard } from "./property-card";
import { PropertyCardSkeleton } from "./property-card-skeleton";
import { PropertyGridPagination } from "./property-grid-pagination";
import { PropertyListTitle } from "./property-list-title";
import { PropertyListSchema } from "./property-list-schema";
import { FilterBar } from "@/components/map/filters/filter-bar";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuthStore } from "@/stores/auth-store";
import { usePropertyGridStore } from "@/stores/property-grid-store";
import { useFavorites } from "@/hooks/use-favorites";
import { useFilterUrlSync } from "@/components/map/filters/use-filter-url-sync";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function PropertyGridPage() {
  // Sync filters between URL and store
  useFilterUrlSync();

  // Read store data
  const { properties, total, currentPage, totalPages, isLoading } = usePropertyGridStore();

  // UI state (local, not stored globally)
  const [showAuthModal, setShowAuthModal] = useState(false);

  // External dependencies
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const { isFavorite, toggleFavorite } = useFavorites();
  const searchParams = useSearchParams();

  // Detect current view from URL (default: list)
  const currentView = searchParams.get("view") === "map" ? "map" : "list";

  // Build current filter query string for view toggle
  const filterString = searchParams.toString();

  // Handle favorite toggle
  const handleFavoriteToggle = (propertyId: string) => {
    if (!isAuth) {
      // Show auth modal if not authenticated
      setShowAuthModal(true);
      return;
    }

    // If authenticated, toggle favorite (shows toast)
    toggleFavorite(propertyId);
  };

  // Empty state
  if (total === 0) {
    return (
      <div className="h-screen flex flex-col bg-oslo-gray-1000">
        {/* Filter Bar (with toggle integrated) */}
        <div className="flex-shrink-0">
          <FilterBar
            showViewToggle={true}
            currentView={currentView}
            filterString={filterString}
          />
        </div>

        {/* Title */}
        <div className="flex-shrink-0">
          <PropertyListTitle total={total} />
        </div>

        {/* Empty State */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-oslo-gray-50 mb-2">
              No hay propiedades disponibles
            </h2>
            <p className="text-oslo-gray-400 mb-6">
              Intenta cambiar tus filtros o realiza una nueva búsqueda
            </p>
            <a
              href="/propiedades"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ver todas las propiedades
            </a>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-oslo-gray-1000">
      {/* SEO Schema */}
      <PropertyListSchema
        properties={properties}
        city={Array.isArray(searchParams.get("city")) ? undefined : searchParams.get("city") || undefined}
      />

      {/* Filter Bar (with toggle integrated) */}
      <div className="flex-shrink-0">
        <FilterBar
          showViewToggle={true}
          currentView={currentView}
          filterString={filterString}
        />
      </div>

      {/* Title */}
      <div className="flex-shrink-0">
        <PropertyListTitle total={total} />
      </div>

      {/* Content Area - Scrollable container */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Inner container with padding and max-width */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Grid Layout */}
          {isLoading ? (
            // Loading state: Show skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <PropertyCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : (
            // Loaded state: Show properties
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={isFavorite(property.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  priority={currentPage === 1} // First page properties are prioritized for image loading
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination - Sticky at bottom */}
        {totalPages > 1 && !isLoading && (
          <div className="flex-shrink-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
            <PropertyGridPagination />
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
