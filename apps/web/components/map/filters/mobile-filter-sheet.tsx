"use client";

/**
 * MobileFilterSheet - Bottom Sheet for Mobile Filters
 *
 * PATTERN: Airbnb/Booking.com style bottom sheet
 * - Slides up from bottom on mobile
 * - Contains all filter options
 * - Shows "Aplicar" button with result count
 * - "Limpiar todo" option
 *
 * FEATURES:
 * - Responsive (only shows on mobile/tablet)
 * - Smooth animations with Framer Motion
 * - Backdrop overlay
 * - Drag to close (optional)
 * - Scrollable content area
 */

import { useMapStore } from "@/stores/map-store";
import * as Dialog from "@radix-ui/react-dialog";
import type { PropertyCategory, TransactionType } from "@repo/database";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { BathroomsFilterContent } from "./bathrooms-filter-content";
import { BedroomsFilterContent } from "./bedrooms-filter-content";
import { CategoryFilterContent } from "./category-filter-content";
import { CityFilterContent } from "./city-filter-content";
import { PriceRangeFilterContent } from "./price-range-filter-content";
import { TransactionTypeFilterContent } from "./transaction-type-filter-content";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalResults?: number;
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  totalResults = 0,
}: MobileFilterSheetProps) {
  // =========================================================================
  // STORE STATE
  // =========================================================================
  const filters = useMapStore((state) => state.filters);
  const draftFilters = useMapStore((state) => state.draftFilters);
  const setDraftFilter = useMapStore((state) => state.setDraftFilter);
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters);
  const clearDraftFilters = useMapStore((state) => state.clearDraftFilters);
  const clearAllFilters = useMapStore((state) => state.clearAllFilters);
  const setIsLoading = useMapStore((state) => state.setIsLoading);

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [isApplying, setIsApplying] = useState(false);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Initialize draft filters when opening
  useEffect(() => {
    if (open) {
      clearDraftFilters();
    }
  }, [open, clearDraftFilters]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Use draft values if available, otherwise use committed
  const currentCity = draftFilters.city ?? filters.city;
  const currentTransactionType =
    draftFilters.transactionType ?? filters.transactionType;
  const currentCategory = draftFilters.category ?? filters.category;
  const currentMinPrice = draftFilters.minPrice ?? filters.minPrice;
  const currentMaxPrice = draftFilters.maxPrice ?? filters.maxPrice;
  const currentBedrooms = draftFilters.bedrooms ?? filters.bedrooms;
  const currentBathrooms = draftFilters.bathrooms ?? filters.bathrooms;

  // Count active filters
  const activeFilterCount = [
    currentCity,
    currentTransactionType?.length ? currentTransactionType : undefined,
    currentCategory?.length ? currentCategory : undefined,
    currentMinPrice,
    currentMaxPrice,
    currentBedrooms,
    currentBathrooms,
  ].filter(Boolean).length;

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleCityChange = useCallback(
    (city?: string) => {
      setDraftFilter("city", city);
    },
    [setDraftFilter],
  );

  const handleTransactionTypeToggle = useCallback(
    (type: TransactionType) => {
      const current = currentTransactionType || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      setDraftFilter("transactionType", updated.length > 0 ? updated : undefined);
    },
    [currentTransactionType, setDraftFilter],
  );

  const handleCategoryToggle = useCallback(
    (category: PropertyCategory) => {
      const current = currentCategory || [];
      const updated = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      setDraftFilter("category", updated.length > 0 ? updated : undefined);
    },
    [currentCategory, setDraftFilter],
  );

  const handlePriceChange = useCallback(
    (minPrice?: number, maxPrice?: number) => {
      setDraftFilter("minPrice", minPrice);
      setDraftFilter("maxPrice", maxPrice);
    },
    [setDraftFilter],
  );

  const handleBedroomsChange = useCallback(
    (bedrooms?: number) => {
      setDraftFilter("bedrooms", bedrooms);
    },
    [setDraftFilter],
  );

  const handleBathroomsChange = useCallback(
    (bathrooms?: number) => {
      setDraftFilter("bathrooms", bathrooms);
    },
    [setDraftFilter],
  );

  const handleClearAll = useCallback(() => {
    clearAllFilters();
    onOpenChange(false);
  }, [clearAllFilters, onOpenChange]);

  const handleApply = useCallback(() => {
    setIsApplying(true);
    commitDraftFilters();
    setIsLoading(true);

    // Close sheet after a brief delay
    setTimeout(() => {
      setIsApplying(false);
      onOpenChange(false);
    }, 300);
  }, [commitDraftFilters, setIsLoading, onOpenChange]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop Overlay */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />
              </Dialog.Overlay>

              {/* Bottom Sheet Content */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-oslo-gray-950 rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
                >
                  {/* Handle Bar */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 bg-oslo-gray-700 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
                    <div>
                      <Dialog.Title className="text-lg font-bold text-oslo-gray-50">
                        Filtros
                      </Dialog.Title>
                      {activeFilterCount > 0 && (
                        <p className="text-xs text-oslo-gray-400 mt-0.5">
                          {activeFilterCount} filtro{activeFilterCount !== 1 ? "s" : ""}{" "}
                          activo{activeFilterCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-oslo-gray-800 transition-colors"
                        aria-label="Cerrar filtros"
                      >
                        <X className="w-5 h-5 text-oslo-gray-400" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Scrollable Filter Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {/* City Filter */}
                    <CityFilterContent
                      selected={currentCity}
                      onChange={handleCityChange}
                    />

                    {/* Transaction Type */}
                    <TransactionTypeFilterContent
                      selected={currentTransactionType as TransactionType[] | undefined}
                      onToggle={handleTransactionTypeToggle}
                    />

                    {/* Category */}
                    <CategoryFilterContent
                      selected={currentCategory as PropertyCategory[] | undefined}
                      onToggle={handleCategoryToggle}
                    />

                    {/* Price Range */}
                    <PriceRangeFilterContent
                      minPrice={currentMinPrice}
                      maxPrice={currentMaxPrice}
                      onPriceChange={handlePriceChange}
                    />

                    {/* Bedrooms */}
                    <BedroomsFilterContent
                      selected={currentBedrooms}
                      onChange={handleBedroomsChange}
                    />

                    {/* Bathrooms */}
                    <BathroomsFilterContent
                      selected={currentBathrooms}
                      onChange={handleBathroomsChange}
                    />
                  </div>

                  {/* Footer - Sticky Actions */}
                  <div className="border-t border-oslo-gray-800 px-4 py-4 bg-oslo-gray-950">
                    <div className="flex gap-3">
                      {/* Clear All Button */}
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="flex-1 px-4 py-3 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 font-semibold text-sm hover:bg-oslo-gray-800 transition-colors"
                        >
                          Limpiar todo
                        </button>
                      )}

                      {/* Apply Button */}
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={isApplying}
                        className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors disabled:bg-oslo-gray-700 disabled:cursor-not-allowed"
                      >
                        {isApplying
                          ? "Aplicando..."
                          : `Aplicar${totalResults > 0 ? ` (${totalResults})` : ""}`}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
