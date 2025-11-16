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
import { PropertyViewToggle } from "@/components/properties/property-view-toggle";
import { useMapStore } from "@/stores/map-store";
import { X } from "lucide-react";

/**
 * FilterBar - Layout component with filter count badge + clear all button
 * Child components handle their own state via Zustand
 *
 * UPDATED: Nov 2025
 * - Added optional PropertyViewToggle for split view integration
 * - showViewToggle prop: only display toggle in PropertySplitView
 */
interface FilterBarProps {
  /**
   * Show PropertyViewToggle (Lista/Mapa)
   * Only enabled in split view to avoid duplicate toggles
   * @default false
   */
  showViewToggle?: boolean;

  /**
   * Current active view (list or map)
   * Required if showViewToggle is true
   * @default "list"
   */
  currentView?: "list" | "map";

  /**
   * Current filter query string
   * Required if showViewToggle is true
   */
  filterString?: string;
}

export function FilterBar({
  showViewToggle = false,
  currentView = "list",
  filterString = "",
}: FilterBarProps = {}) {
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
    <div className="flex justify-center bg-oslo-gray-1000 border-b border-oslo-gray-200 dark:border-oslo-gray-800">
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

        {/* Right Side: Active Filters Badge + Clear + View Toggle */}
        <div className="ml-auto flex items-center gap-2">
          {/* Active Filters Badge + Clear Button */}
          {activeFilterCount > 0 && (
            <>
              <div className="flex h-12 items-center gap-2 px-4 py-2 rounded-full bg-oslo-gray-900/50 text-oslo-gray-50 font-medium text-base border border-oslo-gray-800">
                {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}
              </div>
              <button
                onClick={clearAllFilters}
                title="Limpiar todos los filtros"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800 transition-all duration-200"
                aria-label="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {/* View Toggle (Solo en split view) */}
          {showViewToggle && (
            <PropertyViewToggle
              currentView={currentView}
              filters={filterString}
            />
          )}
        </div>
      </div>
    </div>
  );
}
