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
 * REFACTORING NOTES (Nov 2025):
 * - ✅ Removed `useMapFilters` hook (no longer needed)
 * - ✅ Removed props drilling (child components access Zustand directly)
 * - ✅ Simplified to layout component only
 * - ✅ URL sync handled by middleware/hook at page level
 * - ✅ Unified filter badge + clear button (merged from legacy PropertyGridFilterBar)
 * - ✅ Single shared FilterBar for all views (list, map, split)
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
 * - PropertyViewToggle integrated (shows in all views)
 * - Toggle positioned on right side of filter bar
 * - Consistent across list, map, and split views
 */
interface FilterBarProps {
  /**
   * Show PropertyViewToggle (Lista/Mapa) on the right side
   * @default true
   */
  showViewToggle?: boolean;

  /**
   * Current active view (list or map)
   * Required if showViewToggle is true
   * @default "list"
   */
  currentView?: "list" | "map";

  /**
   * Current filter query string (for building toggle URLs)
   * Required if showViewToggle is true
   */
  filterString?: string;
}

export function FilterBar({
  showViewToggle = true,
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

        {/* Right Side: Active Filters Badge + View Toggle */}
        <div className="ml-auto flex items-center gap-2">
          {/* Active Filters Chip (Unified - with X inside) */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              title="Limpiar todos los filtros"
              className="flex h-10 items-center gap-2 px-3 py-2 rounded-full bg-amber-600/30 text-amber-50 font-medium text-sm border border-amber-700/50 hover:bg-amber-600/40 hover:border-amber-600 transition-all duration-200 cursor-pointer"
              aria-label="Limpiar todos los filtros"
            >
              <span>{activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}</span>
              <X className="w-4 h-4" />
            </button>
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
