"use client";

/**
 * MobileSearchAndFilters - Compact search + filter button for mobile navbar
 *
 * PATTERN: Airbnb / Booking.com mobile navbar
 * - Compact search input (triggers AI search)
 * - Filter button with active count badge
 * - Only shows on property listing pages
 * - Replaces duplicate FilterBar on mobile
 *
 * FEATURES:
 * - Click search → Opens AI search bottom sheet (reuses AISearchInline)
 * - Click filters → Opens filter bottom sheet
 * - Badge shows active filter count
 * - Compact design fits navbar height
 *
 * UPDATED: Now uses existing AISearchInline component in modal
 */

import { AISearchInline } from "@/components/ai-search/ai-search-inline";
import { MobileFilterSheet } from "@/components/map/filters/mobile-filter-sheet";
import { useMapStore } from "@/stores/map-store";
import { usePropertyGridStore } from "@/stores/property-grid-store";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function MobileSearchAndFilters() {
  // =========================================================================
  // STATE
  // =========================================================================
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // =========================================================================
  // STORE
  // =========================================================================
  const filters = useMapStore((state) => state.filters);
  const total = usePropertyGridStore((state) => state.total);

  // =========================================================================
  // COMPUTED
  // =========================================================================
  const activeFilterCount = [
    filters.city,
    filters.transactionType?.length ? filters.transactionType : undefined,
    filters.category?.length ? filters.category : undefined,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
  ].filter(Boolean).length;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <>
      <div className="flex items-center gap-2 w-full h-10">
        {/* Search Button */}
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="flex-1 h-full flex items-center gap-2 px-3 rounded-full bg-white/10 border border-white/20 text-white/70 hover:bg-white/15 transition-colors text-sm"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Buscar con IA...</span>
        </button>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="relative flex-shrink-0 h-full flex items-center justify-center px-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors min-w-[40px]"
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-amber-600 text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* AI Search Modal */}
      <Dialog.Root open={showSearch} onOpenChange={setShowSearch}>
        <Dialog.Portal>
          <AnimatePresence>
            {showSearch && (
              <>
                {/* Backdrop */}
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  />
                </Dialog.Overlay>

                {/* Modal Content */}
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-lg"
                  >
                    <div className="bg-oslo-gray-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-oslo-gray-800 p-5">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-base font-semibold text-oslo-gray-50">
                          Búsqueda con IA
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-oslo-gray-800 transition-colors"
                            aria-label="Cerrar búsqueda"
                          >
                            <X className="w-4 h-4 text-oslo-gray-400" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {/* AI Search Component */}
                      <div className="w-full mb-3">
                        <AISearchInline
                          onSearch={() => {
                            // Close modal after search
                            setTimeout(() => setShowSearch(false), 500);
                          }}
                        />
                      </div>

                      {/* Helper Text */}
                      <p className="text-xs text-oslo-gray-400 text-center leading-relaxed">
                        Ej: "Casa en Cuenca con 3 habitaciones menor a $150k"
                      </p>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Filter Bottom Sheet */}
      <MobileFilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        totalResults={total}
      />
    </>
  );
}
