"use client";

/**
 * BedroomsFilterContent - Bedrooms selector for mobile
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

interface BedroomsFilterContentProps {
  selected?: number;
  onChange: (bedrooms?: number) => void;
}

const BEDROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
];

export function BedroomsFilterContent({
  selected,
  onChange,
}: BedroomsFilterContentProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        🛏️ Habitaciones
      </label>

      <div className="grid grid-cols-3 gap-2">
        {BEDROOM_OPTIONS.map((option) => (
          <button
            key={option.value ?? "any"}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2.5 rounded-lg font-medium text-base transition-all duration-200 ${
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
