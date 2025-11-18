"use client";

/**
 * Price Range Filter
 *
 * Dual input for min/max price filtering
 * - Shows USD values
 * - Pre-defined price presets
 * - Syncs with URL
 */

import { DollarSign } from "lucide-react";
import { useCallback, useState } from "react";

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
}

const PRICE_PRESETS = [
  { label: "<$100k", min: undefined, max: 100000 },
  { label: "$100k-$200k", min: 100000, max: 200000 },
  { label: "$200k-$500k", min: 200000, max: 500000 },
  { label: ">$500k", min: 500000, max: undefined },
];

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceRangeFilterProps) {
  const [minInput, setMinInput] = useState(minPrice?.toString() || "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() || "");

  const handleApply = useCallback(() => {
    const min = minInput ? parseInt(minInput, 10) : undefined;
    const max = maxInput ? parseInt(maxInput, 10) : undefined;

    // Validate
    if (min && max && min > max) {
      return;
    }

    onPriceChange(min, max);
  }, [minInput, maxInput, onPriceChange]);

  const applyPreset = useCallback(
    (min?: number, max?: number) => {
      setMinInput(min?.toString() || "");
      setMaxInput(max?.toString() || "");
      onPriceChange(min, max);
    },
    [onPriceChange],
  );

  const isPresetActive = (min?: number, max?: number) => {
    return minPrice === min && maxPrice === max;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-oslo-gray-700 dark:text-oslo-gray-300 uppercase tracking-wide">
        Rango Precio
      </label>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-1.5">
        {PRICE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(preset.min, preset.max)}
            className={`px-2 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
              isPresetActive(preset.min, preset.max)
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/50 dark:bg-oslo-gray-900/50 text-oslo-gray-700 dark:text-oslo-gray-300 border border-oslo-gray-200 dark:border-oslo-gray-800 hover:bg-white/70 dark:hover:bg-oslo-gray-900/70"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Range Inputs */}
      <div className="flex gap-2 pt-1">
        <div className="flex-1 relative">
          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-oslo-gray-400" />
          <input
            type="number"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={handleApply}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800 bg-white/50 dark:bg-oslo-gray-900/50 text-base font-medium text-oslo-gray-900 dark:text-oslo-gray-50 placeholder-oslo-gray-400 dark:placeholder-oslo-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 relative">
          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-oslo-gray-400" />
          <input
            type="number"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={handleApply}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800 bg-white/50 dark:bg-oslo-gray-900/50 text-base font-medium text-oslo-gray-900 dark:text-oslo-gray-50 placeholder-oslo-gray-400 dark:placeholder-oslo-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
