"use client";

/**
 * Transaction Type Filter (Draft/Commit Pattern)
 *
 * Select transaction type (Venta/Arriendo)
 * - Single select radio buttons
 * - Confirmation with "Listo" button
 * - Draft state during interaction
 * - Loading spinner on submit
 * - Integrated into filter bar
 *
 * DESIGN NOTES:
 * - Single-select: More intuitive than multi-select for binary choice
 * - Icons: DollarSign (Venta), Home (Arriendo)
 * - Pattern: Same as BedroomsFilter (Zustand draft/commit)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DollarSign, Home } from "lucide-react";

import { Spinner } from "@/components/common";
import { FilterDropdown } from "./filter-dropdown";
import { useMapStore } from "@/stores/map-store";

const TRANSACTION_OPTIONS = [
  { label: "Venta", value: "SALE" as const, icon: DollarSign },
  { label: "Arriendo", value: "RENT" as const, icon: Home },
];

/**
 * TransactionTypeDropdown - No props needed!
 * Accesses transaction type filter state and actions directly from Zustand
 */
export function TransactionTypeDropdown() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================
  const committedTransactionType = useMapStore(
    (state) => state.filters.transactionType,
  );
  const draftTransactionType = useMapStore(
    (state) => state.draftFilters.transactionType,
  );
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
  const selected = draftTransactionType?.[0] ?? committedTransactionType?.[0];

  const displayValue = useMemo(() => {
    if (!selected) return "Operación";

    const option = TRANSACTION_OPTIONS.find((opt) => opt.value === selected);
    return option?.label ?? "Operación";
  }, [selected]);

  // Check if filter is active (has committed value)
  const isFilterActive = useMemo(
    () =>
      committedTransactionType !== undefined &&
      committedTransactionType.length > 0,
    [committedTransactionType],
  );

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Handle transaction type selection (updates draft state)
  const handleSelect = useCallback(
    (type: string) => {
      setDraftFilter("transactionType", [type]);
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

  // Handle clear filter button - only clears transaction type
  const handleClear = useCallback(() => {
    // Clear only transactionType, leaving other filters intact
    updateFilter("transactionType", undefined);
    setIsOpen(false);
  }, [updateFilter]);

  return (
    <FilterDropdown
      label="Operación"
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
              ariaLabel="Cargando propiedades por tipo de transacción..."
            />
          </div>
        )}

        {/* Header with Done Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
          <h3 className="text-sm font-semibold text-oslo-gray-50">
            Tipo de Transacción
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

        {/* Options */}
        <div className="space-y-1 px-4 pt-2 pb-4">
          {TRANSACTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-sm ${
                selected === option.value
                  ? "bg-blue-600 text-white"
                  : "text-oslo-gray-200 hover:bg-oslo-gray-800 disabled:opacity-50"
              }`}
            >
              <option.icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </FilterDropdown>
  );
}
