"use client";

/**
 * PriceRangeFilterContent - Price range selector for mobile
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

import { DollarSign } from "lucide-react";
import { useCallback, useState } from "react";

interface PriceRangeFilterContentProps {
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

export function PriceRangeFilterContent({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceRangeFilterContentProps) {
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
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        💰 Rango de Precio
      </label>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {PRICE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(preset.min, preset.max)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isPresetActive(preset.min, preset.max)
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800/70"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Range Inputs */}
      <div className="flex gap-2 pt-1">
        <div className="flex-1 relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-oslo-gray-400" />
          <input
            type="number"
            placeholder="Mín"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={handleApply}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-oslo-gray-800 bg-oslo-gray-900/50 text-base font-medium text-oslo-gray-50 placeholder-oslo-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-oslo-gray-400" />
          <input
            type="number"
            placeholder="Máx"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={handleApply}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-oslo-gray-800 bg-oslo-gray-900/50 text-base font-medium text-oslo-gray-50 placeholder-oslo-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
