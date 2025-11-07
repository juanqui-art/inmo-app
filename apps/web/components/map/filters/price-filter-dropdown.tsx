"use client";

/**
 * Price Filter Dropdown (Realtor.com Style - Refactored)
 *
 * Improved price range selector with:
 * - Interactive histogram slider (SVG custom)
 * - Draft state pattern (changes until "Done")
 * - Explicit confirmation pattern
 * - Snap to buckets (discrete, round values)
 * - Real-time property counter
 * - Realtor.com inspired design
 *
 * STATE MANAGEMENT:
 * - Uses Zustand directly (no props drilling)
 * - draftFilters: Ephemeral state during interaction
 * - filters: Committed state (synced with URL)
 * - Dropdown doesn't control URL sync (parent/middleware does)
 *
 * BENEFITS:
 * - No props needed: independent component
 * - Single source of truth: Zustand store
 * - Cleaner separation: component vs URL sync
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Spinner } from "@/components/common";
import { FilterDropdown } from "./filter-dropdown";
import { PriceHistogramSlider } from "./price-histogram-slider";
import { formatPrice, formatPriceCompact } from "@/lib/utils/price-helpers";
import { useMapStore } from "@/stores/map-store";

/**
 * PriceFilterDropdown - No props needed!
 * Accesses all state and actions directly from Zustand
 */
export function PriceFilterDropdown() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================

  // Price bounds and distribution from database
  const priceDistribution = useMapStore((state) => state.priceDistribution);
  const priceRangeMax = useMapStore((state) => state.priceRangeMax);
  const isLoading = useMapStore((state) => state.isLoading);
  const setIsLoading = useMapStore((state) => state.setIsLoading);

  // Committed filters (from URL)
  const committedMinPrice = useMapStore((state) => state.filters.minPrice);
  const committedMaxPrice = useMapStore((state) => state.filters.maxPrice);

  // Draft filters (ephemeral, during interaction)
  const draftMinPrice = useMapStore((state) => state.draftFilters.minPrice);
  const draftMaxPrice = useMapStore((state) => state.draftFilters.maxPrice);

  // Store actions
  const setDraftFilters = useMapStore((state) => state.setDraftFilters);
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters);
  const clearDraftFilters = useMapStore((state) => state.clearDraftFilters);
  const clearAllFilters = useMapStore((state) => state.clearAllFilters);

  // Determine range bounds (UI minimum is ALWAYS 0)
  const rangeMaxBound = priceRangeMax ?? 2_000_000;

  // =========================================================================
  // LOCAL STATE (only for dropdown UI)
  // =========================================================================
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Ref to track previous loading state (for auto-closing dropdown)
  const wasLoadingRef = useRef(false);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Close dropdown automatically when loading finishes
  // This happens when server finishes fetching filtered properties
  useEffect(() => {
    // If we were loading and now we're done
    if (wasLoadingRef.current && !isLoading) {
      setIsDropdownOpen(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Current display values: use draft if available, otherwise committed
  const displayMin = draftMinPrice ?? committedMinPrice ?? 0;
  const displayMax = draftMaxPrice ?? committedMaxPrice ?? rangeMaxBound;

  // Detect if filter is active (for showing X button)
  const isFilterActive = useMemo(
    () =>
      (committedMinPrice !== undefined && committedMinPrice > 0) ||
      (committedMaxPrice !== undefined && committedMaxPrice < rangeMaxBound),
    [committedMinPrice, committedMaxPrice, rangeMaxBound],
  );

  // Display value for button (compact format: $1.2M, $500K)
  const displayValue = useMemo(() => {
    const hasMin = committedMinPrice !== undefined && committedMinPrice > 0;
    const hasMax =
      committedMaxPrice !== undefined && committedMaxPrice < rangeMaxBound;

    if (hasMin && hasMax) {
      return `$${formatPriceCompact(committedMinPrice)} - $${formatPriceCompact(
        committedMaxPrice,
      )}`;
    } else if (hasMin) {
      return `MIN $${formatPriceCompact(committedMinPrice)}`;
    } else if (hasMax) {
      return `MAX $${formatPriceCompact(committedMaxPrice)}`;
    } else {
      return "Precio";
    }
  }, [committedMinPrice, committedMaxPrice, rangeMaxBound]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Handle slider changes (updates draft state)
  // IMPORTANT: Use setDraftFilters (batch update) instead of two separate calls
  // to prevent slider glitching due to intermediate state updates
  const handleHistogramChange = useCallback(
    (newMin: number, newMax: number) => {
      setDraftFilters({
        minPrice: newMin >= 0 ? newMin : undefined,  // Allow $0 as minimum
        maxPrice: newMax <= rangeMaxBound ? newMax : undefined,  // Allow full range
      });
    },
    [setDraftFilters, rangeMaxBound],
  );

  // Handle "Done" button (commits draft to store)
  const handleDone = useCallback(() => {
    // Commit draft filters to store
    commitDraftFilters();

    // Show loading spinner while server fetches filtered data
    setIsLoading(true);

    // IMPORTANT:
    // 1. commitDraftFilters() updates store.filters
    // 2. useFilterUrlSync() detects change and updates URL
    // 3. Server fetches new properties and updates store
    // 4. setIsLoading(false) is called when done
    // 5. useEffect closes dropdown automatically
  }, [commitDraftFilters, setIsLoading]);

  // Handle clear filter button
  const handleClear = useCallback(() => {
    clearAllFilters();
    setIsDropdownOpen(false);
  }, [clearAllFilters]);

  // Handle dropdown open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Prevent closing while loading (spinner is showing)
      if (isLoading && !open) return;

      setIsDropdownOpen(open);

      if (open) {
        // When opening dropdown, ALWAYS clear draft to empty
        // This ensures displayMin/displayMax show committed values
        // and draft is ready for fresh user interactions
        // WITHOUT this, previously committed values persist in draft,
        // making the slider "stuck" to the previous range
        clearDraftFilters();
      }
    },
    [isLoading, clearDraftFilters],
  );

  return (
    <FilterDropdown
      label="Precio"
      value={displayValue}
      onOpenChange={handleOpenChange}
      isOpen={isDropdownOpen}
      isActive={isFilterActive}
      onClear={handleClear}
    >
      <div className="w-80 m-0 p-0 space-y-3 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-oslo-gray-900/70 flex items-center justify-center z-10 rounded-lg">
            <Spinner
              size="8"
              color="text-white"
              ariaLabel="Cargando precios..."
            />
          </div>
        )}

        {/* Header with current range */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-oslo-gray-100">Precio</h3>
            <div className="text-right">
              <p className="text-xs text-oslo-gray-400">Rango</p>
              <p className="text-sm font-semibold text-indigo-400">
                {formatPrice(displayMin)} - {formatPrice(displayMax)}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Histogram Slider */}
        <div className="px-3">
          <PriceHistogramSlider
            distribution={priceDistribution}
            localMin={displayMin}
            localMax={displayMax}
            onRangeChange={handleHistogramChange}
          />
        </div>

        {/* "Done" Button */}
        <div className="px-4">
          <button
            type="button"
            onClick={handleDone}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg bg-oslo-gray-700 text-oslo-gray-100 font-medium text-base hover:bg-oslo-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-oslo-gray-600 disabled:bg-oslo-gray-800 disabled:cursor-not-allowed"
          >
            Listo
          </button>
        </div>

        {/* Active Filter Indicator */}
        {(displayMin > 0 || displayMax < rangeMaxBound) && (
          <div className="px-4 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-oslo-gray-400">Filtro activo</span>
          </div>
        )}
      </div>
    </FilterDropdown>
  );
}
