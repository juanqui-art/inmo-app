"use client";

/**
 * Grid Price Filter
 *
 * Simple price range input to filter by min/max price
 * Updates URL parameters directly
 * Uses FilterDropdown base component for consistent styling
 */

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign } from "lucide-react";
import { FilterDropdown } from "@/components/map/filters/filter-dropdown";

export function GridPriceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");

  // Sync local state with URL params
  useEffect(() => {
    setLocalMinPrice(minPrice || "");
    setLocalMaxPrice(maxPrice || "");
  }, [minPrice, maxPrice]);

  const displayLabel =
    minPrice || maxPrice
      ? `$${minPrice || "0"} - $${maxPrice || "∞"}`
      : "Precio";

  const handleApplyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (localMinPrice) {
      params.set("minPrice", localMinPrice);
    } else {
      params.delete("minPrice");
    }

    if (localMaxPrice) {
      params.set("maxPrice", localMaxPrice);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(`/propiedades?${params.toString()}`);
    setIsOpen(false);
  }, [searchParams, router, localMinPrice, localMaxPrice]);

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/propiedades?${params.toString()}`);
    setIsOpen(false);
  }, [searchParams, router]);

  return (
    <FilterDropdown
      label="Precio"
      value={minPrice || maxPrice ? `$${minPrice || "0"} - $${maxPrice || "∞"}` : undefined}
      icon={<DollarSign className="h-4 w-4" />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isActive={!!(minPrice || maxPrice)}
      onClear={handleClear}
    >
      {/* Header with "Listo" button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
        <h3 className="text-sm font-semibold text-oslo-gray-50">
          Rango de Precio
        </h3>
        <button
          type="button"
          onClick={handleApplyPrice}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Listo
        </button>
      </div>

      {/* Input Fields */}
      <div className="px-4 py-4 space-y-3">
        {/* Min Price */}
        <div>
          <label className="block text-xs font-medium text-oslo-gray-400 mb-1.5">
            Precio Mínimo
          </label>
          <input
            type="number"
            placeholder="Mínimo"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 placeholder-oslo-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-oslo-gray-400 mb-1.5">
            Precio Máximo
          </label>
          <input
            type="number"
            placeholder="Máximo"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 placeholder-oslo-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </FilterDropdown>
  );
}
