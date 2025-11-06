"use client";

/**
 * Map Filter Bar
 *
 * Horizontal filter bar below navbar, Realtor.com style
 * - AI Search as primary search input
 * - Price, Property Type, Bedrooms dropdowns
 * - Glassmorphism design with dark mode
 * - Responsive (hides filters on smaller screens)
 */

import { AISearchInline } from "@/components/ai-search/ai-search-inline";
import { BedroomsFilter } from "./bedrooms-filter";
import { PriceFilterDropdown } from "./price-filter-dropdown";
import { PropertyTypeDropdown } from "./property-type-dropdown";
import { useMapFilters } from "./use-map-filters";

export function FilterBar() {
  const { filters, setPriceRange, setCategories, updateFilters } =
    useMapFilters();

  return (
    <div className="flex justify-center  bg-oslo-gray-1000 ">
      <div className="flex  items-center gap-2 px-4 py-2.5  bg-oslo-gray-950/90    flex-wrap justify-start  w-full">
        {/* AI Search Bar */}
        <div className="min-w-fit">
          <AISearchInline />
        </div>

        {/* Price Filter */}
        <div className="hidden sm:block">
          <PriceFilterDropdown
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onPriceChange={setPriceRange}
          />
        </div>

        {/* Property Type Filter */}
        <div className="hidden md:block">
          <PropertyTypeDropdown
            selected={filters.category}
            onSelect={setCategories}
          />
        </div>

        {/* Bedrooms Filter */}
        <div className="hidden lg:block">
          <BedroomsFilter
            selected={filters.bedrooms}
            onSelect={(bedrooms) => updateFilters({ bedrooms })}
          />
        </div>
      </div>
    </div>
  );
}
