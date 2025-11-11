"use client";

/**
 * Grid Transaction Type Filter
 *
 * Simple dropdown to filter by transaction type (Venta/Arriendo)
 * Updates URL parameter directly
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, Home, ChevronDown } from "lucide-react";

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 hover:text-oslo-gray-50 transition-colors text-sm"
      >
        <span>{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-56 bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-4 py-3 border-b border-oslo-gray-800">
            <h3 className="text-sm font-semibold text-oslo-gray-50">
              Tipo de Transacción
            </h3>
          </div>

          {/* Options */}
          <div className="py-2 px-2 space-y-1">
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

          {/* Footer */}
          {selectedType && (
            <div className="px-4 py-3 border-t border-oslo-gray-800">
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-4 py-2 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 font-semibold text-sm hover:bg-oslo-gray-800 transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
