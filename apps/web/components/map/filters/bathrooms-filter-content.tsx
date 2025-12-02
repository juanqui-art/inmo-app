"use client";

/**
 * BathroomsFilterContent - Bathrooms selector for mobile
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

interface BathroomsFilterContentProps {
  selected?: number;
  onChange: (bathrooms?: number) => void;
}

const BATHROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "1.5+", value: 1.5 },
  { label: "2+", value: 2 },
  { label: "2.5+", value: 2.5 },
  { label: "3+", value: 3 },
  { label: "3.5+", value: 3.5 },
  { label: "4+", value: 4 },
];

export function BathroomsFilterContent({
  selected,
  onChange,
}: BathroomsFilterContentProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        🚿 Baños
      </label>

      <div className="grid grid-cols-4 gap-2">
        {BATHROOM_OPTIONS.map((option) => (
          <button
            key={option.value ?? "any"}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              selected === option.value
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800/70"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
