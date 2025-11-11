"use client";

/**
 * PropertyGridFilterBar - Filter controls for grid view
 *
 * Horizontal filter bar for /propiedades listing page
 * - City, Transaction Type, Property Type, Price dropdowns
 * - Updates URL parameters when filters change
 * - Server-side pagination fetches filtered results
 *
 * DESIGN:
 * - Responsive: all filters on desktop, hides some on mobile
 * - Dark theme with glassmorphism
 * - Simple dropdowns that update URL directly (no Zustand)
 * - Filter count badge + clear all button
 */

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { GridCityFilter } from "./property-grid-filters/grid-city-filter";
import { GridTransactionTypeFilter } from "./property-grid-filters/grid-transaction-type-filter";
import { GridPropertyTypeFilter } from "./property-grid-filters/grid-property-type-filter";
import { GridPriceFilter } from "./property-grid-filters/grid-price-filter";

export function PropertyGridFilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Count active filters
  const activeFilterCount = [
    searchParams.get("city"),
    searchParams.get("transactionType"),
    searchParams.get("category"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
  ].filter(Boolean).length;

  const handleClearAllFilters = useCallback(() => {
    router.push("/propiedades");
  }, [router]);

  return (
    <div className="bg-oslo-gray-1000">
      <div className="max-w-7xl mx-auto">
        {/* Filter Bar Container */}
        <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 bg-oslo-gray-950/50 border-b border-oslo-gray-800 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* City Filter - Always visible */}
            <GridCityFilter />

            {/* Transaction Type Filter - Hide on mobile */}
            <div className="hidden sm:block">
              <GridTransactionTypeFilter />
            </div>

            {/* Property Type Filter - Hide on tablet */}
            <div className="hidden md:block">
              <GridPropertyTypeFilter />
            </div>

            {/* Price Filter - Hide on tablet */}
            <div className="hidden md:block">
              <GridPriceFilter />
            </div>
          </div>

          {/* Active Filters Badge + Clear Button */}
          {activeFilterCount > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-400 text-xs font-medium">
                {activeFilterCount} filtros
              </div>
              <button
                onClick={handleClearAllFilters}
                title="Limpiar todos los filtros"
                className="p-1.5 rounded-md hover:bg-oslo-gray-800 transition-colors text-oslo-gray-400 hover:text-oslo-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
