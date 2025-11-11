"use client";

/**
 * Grid Price Filter
 *
 * Simple price range input to filter by min/max price
 * Updates URL parameters directly
 */

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, ChevronDown } from "lucide-react";

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 hover:text-oslo-gray-50 transition-colors text-sm"
      >
        <DollarSign className="w-4 h-4" />
        <span>{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full right-0 mt-2 w-72 bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-4 py-3 border-b border-oslo-gray-800">
            <h3 className="text-sm font-semibold text-oslo-gray-50">
              Rango de Precio
            </h3>
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

          {/* Footer */}
          <div className="px-4 py-3 border-t border-oslo-gray-800 space-y-2">
            <button
              type="button"
              onClick={handleApplyPrice}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors"
            >
              Aplicar
            </button>
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-4 py-2 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 font-semibold text-sm hover:bg-oslo-gray-800 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
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
