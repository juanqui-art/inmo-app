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
 */

import { PropertyCard } from "./property-card";
import { PropertyGridPagination } from "./property-grid-pagination";
import { PropertyViewToggle } from "./property-view-toggle";
import { PropertyListSchema } from "./property-list-schema";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuthStore } from "@/stores/auth-store";
import { useFavorites } from "@/hooks/use-favorites";
import type { SerializedProperty } from "@/lib/utils/serialize-property";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface PropertyGridPageProps {
  properties: SerializedProperty[];
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isAuthenticated: boolean;
}

export function PropertyGridPage({
  properties,
  currentPage,
  totalPages,
  total,
  pageSize,
  hasNextPage,
  hasPrevPage,
  isAuthenticated,
}: PropertyGridPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAuth = useAuthStore((state) => state.isAuthenticated);
  const { isFavorite, toggleFavorite } = useFavorites();
  const searchParams = useSearchParams();

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
      <div className="min-h-screen bg-oslo-gray-1000">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-oslo-gray-950/90 backdrop-blur-md border-b border-oslo-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-oslo-gray-50">
              Propiedades
            </h1>
            <PropertyViewToggle currentView="list" filters={filterString} />
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
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
    <div className="min-h-screen bg-oslo-gray-1000">
      {/* SEO Schema */}
      <PropertyListSchema
        properties={properties}
        city={Array.isArray(searchParams.get("city")) ? undefined : searchParams.get("city") || undefined}
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-oslo-gray-950/90 backdrop-blur-md border-b border-oslo-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-oslo-gray-50">
              Propiedades
            </h1>
            <p className="text-sm text-oslo-gray-300">
              {total} propiedad{total !== 1 ? "es" : ""} encontrada
              {total !== 1 ? "s" : ""}
            </p>
          </div>
          <PropertyViewToggle currentView="list" filters={filterString} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid Layout */}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <PropertyGridPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            filters={filterString}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
