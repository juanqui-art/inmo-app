"use client";

/**
 * TransactionTypeFilterContent - Transaction type selector for mobile
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

import type { TransactionType } from "@repo/database";

interface TransactionTypeFilterContentProps {
  selected?: TransactionType[];
  onToggle: (type: TransactionType) => void;
}

export function TransactionTypeFilterContent({
  selected = [],
  onToggle,
}: TransactionTypeFilterContentProps) {
  const types: { value: TransactionType; label: string }[] = [
    { value: "SALE", label: "Venta" },
    { value: "RENT", label: "Arriendo" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        🏷️ Tipo de Transacción
      </label>

      <div className="flex gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onToggle(type.value)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
              selected.includes(type.value)
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800/70"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
