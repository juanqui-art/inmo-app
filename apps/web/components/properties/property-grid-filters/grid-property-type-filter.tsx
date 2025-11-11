"use client";

/**
 * Grid Property Type Filter
 *
 * Simple dropdown to filter by property type (Casa/Apartamento/etc.)
 * Updates URL parameter directly
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Building2 } from "lucide-react";

const PROPERTY_TYPES = [
  { label: "Casa", value: "HOUSE" },
  { label: "Apartamento", value: "APARTMENT" },
  { label: "Suite", value: "SUITE" },
  { label: "Terreno", value: "LAND" },
  { label: "Finca", value: "FARM" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Local Comercial", value: "COMMERCIAL" },
  { label: "Departamento", value: "APARTMENT" }, // Synonym
] as const;

// Deduplicate and sort
const UNIQUE_TYPES = Array.from(
  new Map(PROPERTY_TYPES.map((t) => [t.value, t])).values()
).sort((a, b) => a.label.localeCompare(b.label));

export function GridPropertyTypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const selectedType = searchParams.get("category");
  const displayLabel =
    UNIQUE_TYPES.find((t) => t.value === selectedType)?.label || "Tipo";

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", value);
      params.delete("page");
      router.push(`/propiedades?${params.toString()}`);
      setIsOpen(false);
    },
    [searchParams, router]
  );

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
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
        <Building2 className="w-4 h-4" />
        <span>{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-4 py-3 border-b border-oslo-gray-800">
            <h3 className="text-sm font-semibold text-oslo-gray-50">
              Tipo de Propiedad
            </h3>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto py-2 px-2 space-y-1">
            {UNIQUE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleSelect(type.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                  selectedType === type.value
                    ? "bg-indigo-600 text-white"
                    : "text-oslo-gray-200 hover:bg-oslo-gray-800"
                }`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
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
