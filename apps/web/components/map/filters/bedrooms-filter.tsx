"use client";

/**
 * Bedrooms Filter (Refactored - Draft/Commit Pattern)
 *
 * Select number of bedrooms (1-5+)
 * - Confirmation with "Listo" button
 * - Draft state during interaction
 * - Loading spinner on submit
 * - Integrated into filter bar
 *
 * REFACTORING NOTES:
 * - ✅ Removed all props (selected, onSelect)
 * - ✅ Gets all state directly from Zustand
 * - ✅ Added draft/commit pattern (like Price and Type filters)
 * - ✅ Added loading spinner and auto-close
 * - ✅ Clear filter button support
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Bed } from "lucide-react";

import { Spinner } from "@/components/common";
import { FilterDropdown, FilterOption } from "./filter-dropdown";
import { useMapStore } from "@/stores/map-store";

const BEDROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
];

/**
 * BedroomsFilter - No props needed!
 * Accesses bedroom filter state and actions directly from Zustand
 */
export function BedroomsFilter() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================
  const committedBedrooms = useMapStore((state) => state.filters.bedrooms);
  const draftBedrooms = useMapStore((state) => state.draftFilters.bedrooms);
  const isLoading = useMapStore((state) => state.isLoading);
  const setIsLoading = useMapStore((state) => state.setIsLoading);
  const setDraftFilter = useMapStore((state) => state.setDraftFilter);
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters);
  const clearDraftFilters = useMapStore((state) => state.clearDraftFilters);
  const updateFilter = useMapStore((state) => state.updateFilter);

  // =========================================================================
  // LOCAL STATE (only for dropdown UI)
  // =========================================================================
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Current display value (draft if available, otherwise committed)
  const selected = draftBedrooms ?? committedBedrooms;

  const displayValue = useMemo(
    () => (selected !== undefined ? `${selected}+` : "Bedrooms"),
    [selected],
  );

  // Check if filter is active
  const isFilterActive = useMemo(
    () => committedBedrooms !== undefined,
    [committedBedrooms],
  );

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Handle bedroom selection (updates draft state)
  const handleSelect = useCallback(
    (bedrooms?: number) => {
      setDraftFilter("bedrooms", bedrooms);
    },
    [setDraftFilter],
  );

  // Handle dropdown open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Prevent closing while loading (spinner is showing)
      if (isLoading && !open) return;

      setIsOpen(open);

      if (open) {
        // When opening dropdown, ALWAYS clear draft to empty
        // This ensures displayValue shows committed values
        // and draft is ready for fresh user interactions
        clearDraftFilters();
      }
    },
    [isLoading, clearDraftFilters],
  );

  // Commit changes to store
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

  // Handle clear filter button - only clears bedrooms
  const handleClear = useCallback(() => {
    // Clear only bedrooms, leaving other filters intact
    updateFilter("bedrooms", undefined);
    setIsOpen(false);
  }, [updateFilter]);

  return (
    <FilterDropdown
      label="Habitaciones"
      value={displayValue}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isActive={isFilterActive}
      onClear={handleClear}
    >
      <div className="w-72 m-0 p-0 space-y-3 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-oslo-gray-900/70 flex items-center justify-center z-10 rounded-lg">
            <Spinner
              size="8"
              color="text-white"
              ariaLabel="Cargando habitaciones..."
            />
          </div>
        )}

        {/* Header with Done Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
          <h3 className="text-sm font-semibold text-oslo-gray-50">
            Habitaciones
          </h3>
          <button
            type="button"
            onClick={handleDone}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Listo
          </button>
        </div>

        {/* Options Grid */}
        <div className="space-y-1 px-4 pt-2">
          {BEDROOM_OPTIONS.map((option) => (
            <FilterOption
              key={option.value ?? "any"}
              label={option.label}
              isSelected={selected === option.value}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>
      </div>
    </FilterDropdown>
  );
}
