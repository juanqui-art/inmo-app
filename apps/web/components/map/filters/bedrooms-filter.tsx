"use client";

/**
 * Bedrooms Filter
 *
 * Select number of bedrooms (1-5+)
 * - Quick pill buttons
 * - Integrated into filter bar
 */

import { useCallback } from "react";
import { Bed } from "lucide-react";
import { FilterDropdown, FilterOption } from "./filter-dropdown";

interface BedroomsFilterProps {
  selected?: number;
  onSelect: (bedrooms: number) => void;
  onClear?: () => void;
}

const BEDROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
];

export function BedroomsFilter({
  selected,
  onSelect,
  onClear,
}: BedroomsFilterProps) {
  const displayValue = selected !== undefined ? `${selected}+` : "Bedrooms";

  const handleSelect = useCallback(
    (bedrooms?: number) => {
      if (bedrooms === undefined) {
        onClear?.();
      } else {
        onSelect(bedrooms);
      }
    },
    [onSelect, onClear]
  );

  return (
    <FilterDropdown label="Bedrooms" value={displayValue} icon={<Bed />}>
      <div className="space-y-1 w-40">
        {BEDROOM_OPTIONS.map((option) => (
          <FilterOption
            key={option.value ?? "any"}
            label={option.label}
            isSelected={selected === option.value}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </FilterDropdown>
  );
}
