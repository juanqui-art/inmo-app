"use client";

/**
 * Property Type Filter Dropdown (Refactored)
 *
 * Multi-select property categories with grid layout
 * - 3-column grid layout (Ecuador market)
 * - Checkboxes for multi-selection
 * - "Todos" option to clear all
 * - "Listo" button to confirm selection
 * - Spanish labels optimized for Ecuador
 *
 * REFACTORING NOTES:
 * - ✅ Removed props (selected, onSelect)
 * - ✅ Uses Zustand directly (draftFilters + commitDraftFilters pattern)
 * - ✅ Follows same pattern as PriceFilterDropdown
 */

import type { PropertyCategory } from "@repo/database";
import {
  Building,
  Building2,
  Castle,
  Check,
  Factory,
  Home,
  Landmark,
  MapPin,
  TreePine,
  Warehouse,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Spinner } from "@/components/common";
import { useMapStore } from "@/stores/map-store";
import { FilterDropdown } from "./filter-dropdown";

const CATEGORIES = [
  // Residential
  { value: "HOUSE" as PropertyCategory, label: "Casa", icon: Home },
  {
    value: "APARTMENT" as PropertyCategory,
    label: "Departamento",
    icon: Building2,
  },
  { value: "SUITE" as PropertyCategory, label: "Suite", icon: Zap },
  { value: "VILLA" as PropertyCategory, label: "Villa", icon: Castle },
  {
    value: "PENTHOUSE" as PropertyCategory,
    label: "Penthouse",
    icon: Building,
  },
  { value: "DUPLEX" as PropertyCategory, label: "Dúplex", icon: Building2 },
  { value: "LOFT" as PropertyCategory, label: "Loft", icon: Warehouse },

  // Land & Commercial
  { value: "LAND" as PropertyCategory, label: "Terreno", icon: MapPin },
  {
    value: "COMMERCIAL" as PropertyCategory,
    label: "Local",
    icon: Warehouse,
  },
  { value: "OFFICE" as PropertyCategory, label: "Oficina", icon: Landmark },
  { value: "WAREHOUSE" as PropertyCategory, label: "Bodega", icon: Factory },
  { value: "FARM" as PropertyCategory, label: "Finca", icon: TreePine },
];

/**
 * PropertyTypeDropdown - No props needed!
 * Accesses category filter state and actions directly from Zustand
 */
export function PropertyTypeDropdown() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================
  const committedCategory = useMapStore((state) => state.filters.category);
  const draftCategory = useMapStore((state) => state.draftFilters.category);
  const isLoading = useMapStore((state) => state.isLoading);
  const setIsLoading = useMapStore((state) => state.setIsLoading);
  const setDraftFilter = useMapStore((state) => state.setDraftFilter);
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters);
  const clearDraftFilters = useMapStore((state) => state.clearDraftFilters);
  const updateFilter = useMapStore((state) => state.updateFilter);

  // =========================================================================
  // LOCAL STATE
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

  // Current display values (draft if available, otherwise committed)
  const selected = draftCategory ?? committedCategory ?? [];

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

  // Handle category toggle (updates draft)
  const handleCategoryToggle = useCallback(
    (category: PropertyCategory) => {
      const updated = selected.includes(category)
        ? selected.filter((c) => c !== category)
        : [...selected, category];

      // Always set to array (empty or with values) to ensure draft wins over committed
      // Empty array means "no category filter applied"
      setDraftFilter("category", updated);
    },
    [selected, setDraftFilter],
  );

  // Clear all selected categories (reset to empty/all)
  const handleSelectAll = useCallback(() => {
    // Setting category to empty array [] deselects all visible categories
    // This ensures draft wins over committed in the UI
    // When committed, empty array means "no category filter"
    setDraftFilter("category", []);
  }, [setDraftFilter]);

  // Clear category filter (X button) - only clears category
  const handleClear = useCallback(() => {
    // Clear only category, leaving other filters intact
    updateFilter("category", undefined);
    handleOpenChange(false);
  }, [updateFilter, handleOpenChange]);

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

  // Display value logic - Show category names with ellipsis for 3+
  const displayValue = useMemo(() => {
    if (selected.length === 0) return "Categoría";

    if (selected.length === 1) {
      return (
        CATEGORIES.find((c) => c.value === selected[0])?.label || "Categoría"
      );
    }

    if (selected.length === 2) {
      const labels = selected
        .map((v) => CATEGORIES.find((c) => c.value === v)?.label)
        .filter(Boolean);
      return labels.join(", ");
    }

    // 3 or more: Show first two + ellipsis
    const first = CATEGORIES.find((c) => c.value === selected[0])?.label;
    const second = CATEGORIES.find((c) => c.value === selected[1])?.label;
    return `${first}, ${second}, ...`;
  }, [selected]);

  return (
    <FilterDropdown
      label="Categoría"
      value={displayValue}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isActive={selected.length > 0}
      onClear={handleClear}
    >
      <div className="w-80 m-0 p-0 space-y-3 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-oslo-gray-900/70 flex items-center justify-center z-40 rounded-lg">
            <Spinner
              size="8"
              color="text-white"
              ariaLabel="Cargando tipos de propiedad..."
            />
          </div>
        )}

        {/* Header with Done Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
          <h3 className="text-sm font-semibold text-oslo-gray-50">
            Tipo de Propiedad
          </h3>
          <button
            type="button"
            onClick={handleDone}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Listo
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-3 px-4 pt-4">
          {/* "Todos" Button - Clears all selections */}
          <button
            onClick={handleSelectAll}
            title="Mostrar todas las propiedades sin filtrar por tipo"
            className={`w-full px-3 py-2 rounded-lg text-base font-medium text-center transition-colors ${
              selected.length === 0
                ? "bg-indigo-600 text-white"
                : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800"
            }`}
          >
            Todos
          </button>

          {/* Categories Grid */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = selected.includes(category.value);

              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`relative flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-center transition-all ${
                    isSelected
                      ? "bg-oslo-gray-700 text-oslo-gray-50 shadow-lg shadow-oslo-gray-700/30"
                      : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800"
                  }`}
                >
                  {/* Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <Icon className="h-5 w-5 flex-shrink-0" />

                  {/* Label */}
                  <span className="text-xs font-medium leading-tight">
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </FilterDropdown>
  );
}
