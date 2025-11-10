"use client";

/**
 * Map Filter Panel
 *
 * Main filter panel for map page
 * - Desktop: Fixed left sidebar (visible)
 * - Mobile: Drawer from left (toggle with button)
 * - Contains: AI Search + Transaction Type + Category + Price
 * - Glassmorphism design
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft } from "lucide-react";
import { AISearchInline } from "@/components/ai-search/ai-search-inline";
import { TransactionTypeFilter } from "./transaction-type-filter";
import { CategoryFilter } from "./category-filter";
import { PriceRangeFilter } from "./price-range-filter";
import { useMapFilters } from "./use-map-filters";

/**
 * Desktop: Always visible left panel
 * Mobile: Hidden by default, toggle with button
 */
export function MapFilterPanel() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const {
    filters,
    toggleTransactionType,
    setCategory,
    setPriceRange,
    clearFilters,
    hasActiveFilters,
  } = useMapFilters();

  // Desktop panel content
  const panelContent = (
    <div className="flex flex-col h-full gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-oslo-gray-900 dark:text-oslo-gray-50">
          Filtros
        </h2>

        {/* Close button (mobile only) */}
        <button
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden p-2 hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-800 rounded-lg transition-colors"
          aria-label="Cerrar filtros"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* AI Search Bar */}
      <div className="border-b border-oslo-gray-200 dark:border-oslo-gray-800 pb-4">
        <AISearchInline />
      </div>

      {/* Filters Section */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2">
        {/* Transaction Type */}
        <TransactionTypeFilter
          selected={filters.transactionType}
          onToggle={toggleTransactionType}
        />

        {/* Category */}
        <CategoryFilter selected={filters.category} onSelect={setCategory} />

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onPriceChange={setPriceRange}
        />
      </div>

      {/* Footer: Clear Filters */}
      {hasActiveFilters && (
        <div className="border-t border-oslo-gray-200 dark:border-oslo-gray-800 pt-4">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2.5 rounded-lg bg-oslo-gray-100 dark:bg-oslo-gray-900 text-oslo-gray-700 dark:text-oslo-gray-300 font-medium text-base hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-800 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed bottom-6 left-6 z-30 p-3 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Abrir filtros"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden fixed inset-0 bg-black/30 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 bg-white dark:bg-oslo-gray-950 shadow-xl overflow-y-auto"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Panel */}
      <div className="hidden md:flex fixed left-0 top-14 bottom-0 w-80 z-20 bg-white/80 dark:bg-oslo-gray-950/80 backdrop-blur-sm border-r border-oslo-gray-200 dark:border-oslo-gray-800 overflow-y-auto">
        {panelContent}
      </div>
    </>
  );
}
