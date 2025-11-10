"use client";

/**
 * Map Filter Bar (Refactored)
 *
 * Horizontal filter bar below navbar, Realtor.com style
 * - AI Search as primary search input
 * - Price, Property Type, Bedrooms dropdowns
 * - Glassmorphism design with dark mode
 * - Responsive (hides filters on smaller screens)
 *
 * REFACTORING NOTES:
 * - ✅ Removed `useMapFilters` hook (no longer needed)
 * - ✅ Removed props drilling (child components access Zustand directly)
 * - ✅ Simplified to layout component only
 * - ✅ URL sync handled by middleware/hook at page level
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

/**
 * FilterBar - Pure layout component
 * Child components handle their own state via Zustand
 */
export function FilterBar() {
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
      </div>
    </div>
  );
}
