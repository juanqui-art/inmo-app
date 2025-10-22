/**
 * MapFilters - Floating Filter Controls for Map
 *
 * PATTERN: Non-functional UI Component (Prototype)
 *
 * PURPOSE:
 * - Visual prototype for map filters
 * - Shows placement and design
 * - Will be made functional in future sessions
 */

"use client";

import { Building2, Filter } from "lucide-react";

export function MapFilters() {
  return (
    <div className="absolute top-18 right-4 z-20 flex items-center gap-2">
      {/* Transaction Type Filters */}
      <div className="flex items-center gap-2 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
        <button
          type="button"
          className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-semibold transition-colors hover:bg-blue-700"
          disabled
        >
          Venta
        </button>
        <button
          type="button"
          className="px-4 py-1.5 rounded-full bg-transparent text-oslo-gray-700 dark:text-oslo-gray-300 text-sm font-semibold transition-colors hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800"
          disabled
        >
          Arriendo
        </button>
      </div>

      {/* Category Filter */}
      <button
        type="button"
        className="flex items-center gap-2 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800 text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50 transition-colors hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-800"
        disabled
      >
        <Building2 className="h-4 w-4" />
        <span>Tipo</span>
      </button>

      {/* More Filters */}
      <button
        type="button"
        className="flex items-center gap-2 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800 text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50 transition-colors hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-800"
        disabled
      >
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
      </button>
    </div>
  );
}
