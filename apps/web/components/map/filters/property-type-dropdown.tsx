'use client'

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

import { useCallback, useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import type { PropertyCategory } from '@repo/database'

import { FilterDropdown } from './filter-dropdown'
import { useMapStore } from '@/stores/map-store'

const CATEGORIES = [
  // Residential
  { value: 'HOUSE' as PropertyCategory, label: 'Casa', icon: Home },
  {
    value: 'APARTMENT' as PropertyCategory,
    label: 'Departamento',
    icon: Building2,
  },
  { value: 'SUITE' as PropertyCategory, label: 'Suite', icon: Zap },
  { value: 'VILLA' as PropertyCategory, label: 'Villa', icon: Castle },
  {
    value: 'PENTHOUSE' as PropertyCategory,
    label: 'Penthouse',
    icon: Building,
  },
  { value: 'DUPLEX' as PropertyCategory, label: 'Dúplex', icon: Building2 },
  { value: 'LOFT' as PropertyCategory, label: 'Loft', icon: Warehouse },

  // Land & Commercial
  { value: 'LAND' as PropertyCategory, label: 'Terreno', icon: MapPin },
  {
    value: 'COMMERCIAL' as PropertyCategory,
    label: 'Local',
    icon: Warehouse,
  },
  { value: 'OFFICE' as PropertyCategory, label: 'Oficina', icon: Landmark },
  { value: 'WAREHOUSE' as PropertyCategory, label: 'Bodega', icon: Factory },
  { value: 'FARM' as PropertyCategory, label: 'Finca', icon: TreePine },
]

/**
 * PropertyTypeDropdown - No props needed!
 * Accesses category filter state and actions directly from Zustand
 */
export function PropertyTypeDropdown() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================
  const committedCategory = useMapStore((state) => state.filters.category)
  const draftCategory = useMapStore((state) => state.draftFilters.category)
  const setDraftFilter = useMapStore((state) => state.setDraftFilter)
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters)
  const resetDraftFilters = useMapStore((state) => state.resetDraftFilters)
  const clearAllFilters = useMapStore((state) => state.clearAllFilters)

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [isOpen, setIsOpen] = useState(false)

  // Current display values (draft if available, otherwise committed)
  const selected = draftCategory ?? committedCategory ?? []

  // Handle dropdown open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        // Reset draft to committed state when closing without confirming
        resetDraftFilters()
      }
    },
    [resetDraftFilters]
  )

  // Handle category toggle (updates draft)
  const handleCategoryToggle = useCallback(
    (category: PropertyCategory) => {
      const updated = selected.includes(category)
        ? selected.filter((c) => c !== category)
        : [...selected, category]

      setDraftFilter('category', updated.length > 0 ? updated : undefined)
    },
    [selected, setDraftFilter]
  )

  // Clear all (updates draft)
  const handleSelectAll = useCallback(() => {
    setDraftFilter('category', undefined)
  }, [setDraftFilter])

  // Clear category filter (X button)
  const handleClear = useCallback(() => {
    clearAllFilters()
    handleOpenChange(false)
  }, [clearAllFilters, handleOpenChange])

  // Commit changes to store
  const handleDone = useCallback(() => {
    commitDraftFilters()
    handleOpenChange(false)
  }, [commitDraftFilters, handleOpenChange])

  // Display value logic - Show category names with ellipsis for 3+
  const displayValue = useMemo(() => {
    if (selected.length === 0) return 'Tipo'

    if (selected.length === 1) {
      return CATEGORIES.find((c) => c.value === selected[0])?.label || 'Tipo'
    }

    if (selected.length === 2) {
      const labels = selected
        .map(v => CATEGORIES.find(c => c.value === v)?.label)
        .filter(Boolean)
      return labels.join(', ')
    }

    // 3 or more: Show first two + ellipsis
    const first = CATEGORIES.find((c) => c.value === selected[0])?.label
    const second = CATEGORIES.find((c) => c.value === selected[1])?.label
    return `${first}, ${second}, ...`
  }, [selected])

  return (
    <FilterDropdown
      label="Tipo"
      value={displayValue}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isActive={selected.length > 0}
      onClear={handleClear}
    >
      {/* Header with Done Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800 mb-3">
        <h3 className="text-sm font-semibold text-oslo-gray-50">
          Tipo de Propiedad
        </h3>
        <button
          onClick={handleDone}
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Listo
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        {/* "Todos" Button */}
        <button
          onClick={handleSelectAll}
          className={`w-full px-3 py-2 rounded-lg text-base font-medium text-center transition-colors ${
            selected.length === 0
              ? "bg-oslo-gray-700 text-oslo-gray-50"
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
                  <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
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
    </FilterDropdown>
  );
}
