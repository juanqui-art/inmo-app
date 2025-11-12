"use client";

/**
 * Grid Property Type Filter
 *
 * Simple dropdown to filter by property type (Casa/Apartamento/etc.)
 * Updates URL parameter directly
 * Uses FilterDropdown base component for consistent styling
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { FilterDropdown } from "@/components/map/filters/filter-dropdown";

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
    <FilterDropdown
      label="Tipo"
      value={displayLabel !== "Tipo" ? displayLabel : undefined}
      icon={<Building2 className="h-4 w-4" />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isActive={!!selectedType}
      onClear={handleClear}
    >
      {/* Header with "Listo" button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
        <h3 className="text-sm font-semibold text-oslo-gray-50">
          Tipo de Propiedad
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
    </FilterDropdown>
  );
}
