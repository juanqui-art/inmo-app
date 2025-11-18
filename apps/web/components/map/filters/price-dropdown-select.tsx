"use client";

/**
 * Price Dropdown Select
 *
 * Dropdown select for choosing exact price values
 * - Predefined price options
 * - Formatted with currency
 * - Dark mode styled
 */

import { ChevronDown } from "lucide-react";

interface PriceDropdownSelectProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  isMin?: boolean;
}

const PRICE_OPTIONS = [
  { label: "No mín.", value: undefined },
  { label: "$10.000", value: 10000 },
  { label: "$25.000", value: 25000 },
  { label: "$50.000", value: 50000 },
  { label: "$75.000", value: 75000 },
  { label: "$100.000", value: 100000 },
  { label: "$150.000", value: 150000 },
  { label: "$200.000", value: 200000 },
  { label: "$300.000", value: 300000 },
  { label: "$500.000", value: 500000 },
  { label: "$750.000", value: 750000 },
  { label: "$1.000.000", value: 1000000 },
  { label: "$1.500.000", value: 1500000 },
  { label: "$2.000.000+", value: 2000000 },
];

const MAX_PRICE_OPTIONS = PRICE_OPTIONS.filter(
  (opt) => opt.value !== undefined,
);

export function PriceDropdownSelect({
  value,
  onChange,
  isMin = true,
}: PriceDropdownSelectProps) {
  const options = isMin ? PRICE_OPTIONS : MAX_PRICE_OPTIONS;

  return (
    <div className="relative flex-1">
      <select
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? undefined : parseInt(val, 10));
        }}
        className="w-full px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 text-base font-medium appearance-none cursor-pointer hover:bg-oslo-gray-700 focus:outline-none focus:ring-2 focus:ring-oslo-gray-600 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value ?? "none"} value={option.value ?? ""}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-oslo-gray-500 pointer-events-none" />
    </div>
  );
}
