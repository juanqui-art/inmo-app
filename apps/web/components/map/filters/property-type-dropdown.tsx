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

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion, AnimatePresence } from 'motion/react'
import {
  Building,
  Building2,
  Castle,
  Check,
  ChevronDown,
  Factory,
  Home,
  Landmark,
  MapPin,
  TreePine,
  Warehouse,
  Zap,
} from 'lucide-react'
import type { PropertyCategory } from '@repo/database'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleOpenChange(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, handleOpenChange])

  // Handle keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleOpenChange(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleOpenChange])

  const handleToggle = () => {
    handleOpenChange(!isOpen)
  }

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

  // Display value logic
  const displayValue =
    selected.length === 0
      ? 'Tipo'
      : selected.length === 1
        ? CATEGORIES.find((c) => c.value === selected[0])?.label || 'Tipo'
        : `${selected.length} seleccionados`

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex h-12 items-center gap-2 px-4 py-2 rounded-full font-medium text-base transition-all duration-200 whitespace-nowrap ${
          isOpen
            ? "bg-oslo-gray-700 text-oslo-gray-50 shadow-lg shadow-oslo-gray-900/50"
            : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 w-[420px] bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-xl shadow-black/60 overflow-hidden"
          >
            <div className="flex flex-col max-h-[500px]">
              {/* Header with Done Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
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

              {/* Content Area - Scrollable */}
              <div className="overflow-y-auto flex-1 px-4 py-4">
                {/* "Todos" Button */}
                <button
                  onClick={handleSelectAll}
                  className={`w-full mb-4 px-3 py-2 rounded-lg text-base font-medium text-center transition-colors ${
                    tempSelected.length === 0
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
                    const isSelected = tempSelected.includes(category.value);

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
