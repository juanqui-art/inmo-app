'use client'

/**
 * Bedrooms Filter (Refactored - No Props)
 *
 * Select number of bedrooms (1-5+)
 * - Quick pill buttons
 * - Integrated into filter bar
 *
 * REFACTORING NOTES:
 * - ✅ Removed all props (selected, onSelect)
 * - ✅ Gets all state directly from Zustand
 * - ✅ Immediate updates (no "Done" button needed)
 * - ✅ Clear filter button support
 */

import { useCallback, useMemo } from 'react'

import { Bed } from 'lucide-react'

import { FilterDropdown, FilterOption } from './filter-dropdown'
import { useMapStore } from '@/stores/map-store'

const BEDROOM_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '5+', value: 5 },
]

/**
 * BedroomsFilter - No props needed!
 * Accesses bedroom filter state and actions directly from Zustand
 */
export function BedroomsFilter() {
  // =========================================================================
  // STORE SELECTORS (Granular to prevent unnecessary re-renders)
  // =========================================================================
  const committedBedrooms = useMapStore((state) => state.filters.bedrooms)
  const updateFilter = useMapStore((state) => state.updateFilter)
  const clearAllFilters = useMapStore((state) => state.clearAllFilters)

  // Current display value
  const selected = committedBedrooms?.[0]

  const displayValue = useMemo(
    () => (selected !== undefined ? `${selected}+` : 'Bedrooms'),
    [selected]
  )

  // Check if filter is active
  const isFilterActive = useMemo(() => selected !== undefined, [selected])

  // Handle bedroom selection (updates committed state directly, no draft)
  // BedroomsFilter uses immediate updates, not confirmation pattern
  const handleSelect = useCallback(
    (bedrooms?: number) => {
      updateFilter('bedrooms', bedrooms !== undefined ? [bedrooms] : undefined)
    },
    [updateFilter]
  )

  // Handle clear filter button
  const handleClear = useCallback(() => {
    clearAllFilters()
  }, [clearAllFilters])

  return (
    <FilterDropdown
      label="Bedrooms"
      value={displayValue}
      icon={<Bed />}
      isActive={isFilterActive}
      onClear={handleClear}
    >
      <div className="space-y-1 w-40">
        {BEDROOM_OPTIONS.map((option) => (
          <FilterOption
            key={option.value ?? 'any'}
            label={option.label}
            isSelected={selected === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </FilterDropdown>
  )
}
