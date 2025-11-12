"use client";

/**
 * Grid Transaction Type Filter
 *
 * Simple dropdown to filter by transaction type (Venta/Arriendo)
 * Updates URL parameter directly
 * Uses FilterDropdown base component for consistent styling
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, Home } from "lucide-react";
import { FilterDropdown } from "@/components/map/filters/filter-dropdown";

const TRANSACTION_OPTIONS = [
  { label: "Venta", value: "SALE", icon: DollarSign },
  { label: "Arriendo", value: "RENT", icon: Home },
] as const;

export function GridTransactionTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const selectedType = searchParams.get("transactionType");
  const displayLabel = TRANSACTION_OPTIONS.find(
    (opt) => opt.value === selectedType
  )?.label || "Tipo";

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("transactionType", value);
      params.delete("page");
      router.push(`/propiedades?${params.toString()}`);
      setIsOpen(false);
    },
    [searchParams, router]
  );

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("transactionType");
    params.delete("page");
    router.push(`/propiedades?${params.toString()}`);
    setIsOpen(false);
  }, [searchParams, router]);

  return (
    <FilterDropdown
      label="Transacción"
      value={displayLabel !== "Tipo" ? displayLabel : undefined}
      icon={<DollarSign className="h-4 w-4" />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isActive={!!selectedType}
      onClear={handleClear}
    >
      {/* Header with "Listo" button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
        <h3 className="text-sm font-semibold text-oslo-gray-50">
          Tipo de Transacción
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Listo
        </button>
      </div>

      {/* Options */}
      <div className="space-y-1">
        {TRANSACTION_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                isSelected
                  ? "bg-indigo-600 text-white"
                  : "text-oslo-gray-200 hover:bg-oslo-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </FilterDropdown>
  );
}
