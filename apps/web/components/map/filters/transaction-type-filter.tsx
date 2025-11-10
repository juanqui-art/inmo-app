"use client";

/**
 * Transaction Type Filter
 *
 * Toggle between Venta (Sale) and Arriendo (Rental)
 * - Allows multiple selection
 * - Syncs with URL
 * - Glassmorphism styling
 */

import type { TransactionType } from "@repo/database";

interface TransactionTypeFilterProps {
  selected?: TransactionType[];
  onToggle: (type: TransactionType) => void;
}

export function TransactionTypeFilter({
  selected = [],
  onToggle,
}: TransactionTypeFilterProps) {
  const types: { value: TransactionType; label: string }[] = [
    { value: "SALE", label: "Venta" },
    { value: "RENT", label: "Arriendo" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-oslo-gray-700 dark:text-oslo-gray-300 uppercase tracking-wide">
        Tipo Transacción
      </label>

      <div className="flex gap-2">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onToggle(type.value)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-base transition-all duration-200 ${
              selected.includes(type.value)
                ? "bg-indigo-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-white/50 dark:bg-oslo-gray-900/50 text-oslo-gray-700 dark:text-oslo-gray-300 border border-oslo-gray-200 dark:border-oslo-gray-800 hover:bg-white/70 dark:hover:bg-oslo-gray-900/70"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}
