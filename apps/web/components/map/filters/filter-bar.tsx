"use client";

/**
 * Map Filter Bar (Refactored)
 *
 * Horizontal filter bar below navbar, Realtor.com style
 * - AI Search as primary search input
 * - Price, Property Type, Bedrooms dropdowns
 * - Glassmorphism design with dark mode
 * - Responsive (hides filters on smaller screens)
 * - Filter count badge + Clear all button
 *
 * REFACTORING NOTES:
 * - ✅ Removed `useMapFilters` hook (no longer needed)
 * - ✅ Removed props drilling (child components access Zustand directly)
 * - ✅ Simplified to layout component only
 * - ✅ URL sync handled by middleware/hook at page level
 * - ✅ Added filter count badge + clear all button (from PropertyGridFilterBar)
 *
 * BENEFITS:
 * - Clean separation of concerns
 * - No prop passing complexity
 * - Easier to maintain and extend
 */

import { AISearchInline } from "@/components/ai-search/ai-search-inline";
import { BathroomsFilter } from "./bathrooms-filter";
import { BedroomsFilter } from "./bedrooms-filter";
import { CityFilterDropdown } from "./city-filter-dropdown";
import { PriceFilterDropdown } from "./price-filter-dropdown";
import { PropertyTypeDropdown } from "./property-type-dropdown";
import { TransactionTypeDropdown } from "./transaction-type-dropdown";
import { useMapStore } from "@/stores/map-store";
import { X } from "lucide-react";

/**
 * FilterBar - Layout component with filter count badge + clear all button
 * Child components handle their own state via Zustand
 */
export function FilterBar() {
  // Get filters from store to count active filters
  const filters = useMapStore((state) => state.filters);
  const clearAllFilters = useMapStore((state) => state.clearAllFilters);

  // Count active filters (any non-undefined/non-empty value)
  const activeFilterCount = [
    filters.city,
    filters.transactionType?.length ? filters.transactionType : undefined,
    filters.category?.length ? filters.category : undefined,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
  ].filter(Boolean).length;

  return (
    <div className="flex justify-center bg-oslo-gray-1000">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-oslo-gray-950/90 flex-wrap justify-start w-full">
        {/* AI Search Bar */}
        <div className="min-w-fit">
          <AISearchInline />
        </div>

        {/* City Filter - No props needed */}
        <div className="hidden sm:block">
          <CityFilterDropdown />
        </div>

        {/* Transaction Type Filter - No props needed */}
        <div className="hidden sm:block">
          <TransactionTypeDropdown />
        </div>

        {/* Property Type Filter - No props needed */}
        <div className="hidden md:block">
          <PropertyTypeDropdown />
        </div>

        {/* Price Filter - No props needed */}
        <div className="hidden md:block">
          <PriceFilterDropdown />
        </div>

        {/* Bedrooms Filter - No props needed */}
        <div className="hidden lg:block">
          <BedroomsFilter />
        </div>

        {/* Bathrooms Filter - No props needed */}
        <div className="hidden lg:block">
          <BathroomsFilter />
        </div>

        {/* Active Filters Badge + Clear Button */}
        {activeFilterCount > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-400 text-xs font-medium">
              {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}
            </div>
            <button
              onClick={clearAllFilters}
              title="Limpiar todos los filtros"
              className="p-1.5 rounded-md hover:bg-oslo-gray-800 transition-colors text-oslo-gray-400 hover:text-oslo-gray-200"
              aria-label="Limpiar todos los filtros"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
