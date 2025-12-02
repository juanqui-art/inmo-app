"use client";

/**
 * ActiveFilterChips - Horizontal scrollable chips showing active filters
 *
 * PATTERN: Google Maps / Instagram Explore style
 * - Shows active filters as removable chips
 * - Horizontal scroll on overflow
 * - Each chip has X button to remove
 * - Only shows when filters are active
 *
 * USAGE:
 * - Appears below FilterBar on mobile
 * - Provides quick visual feedback of active filters
 * - Allows individual filter removal
 */

import { useMapStore } from "@/stores/map-store";
import { X } from "lucide-react";

export function ActiveFilterChips() {
  // =========================================================================
  // STORE STATE
  // =========================================================================
  const filters = useMapStore((state) => state.filters);
  const updateFilter = useMapStore((state) => state.updateFilter);

  // =========================================================================
  // BUILD CHIP DATA
  // =========================================================================

  interface FilterChip {
    key: string;
    label: string;
    onRemove: () => void;
  }

  const chips: FilterChip[] = [];

  // City
  if (filters.city) {
    chips.push({
      key: "city",
      label: filters.city,
      onRemove: () => updateFilter("city", undefined),
    });
  }

  // Transaction Type
  if (filters.transactionType && filters.transactionType.length > 0) {
    filters.transactionType.forEach((type) => {
      chips.push({
        key: `transaction-${type}`,
        label: type === "SALE" ? "Venta" : "Arriendo",
        onRemove: () => {
          const updated = filters.transactionType?.filter((t) => t !== type);
          updateFilter("transactionType", updated?.length ? updated : undefined);
        },
      });
    });
  }

  // Category
  if (filters.category && filters.category.length > 0) {
    filters.category.forEach((cat) => {
      const categoryLabels: Record<string, string> = {
        HOUSE: "Casa",
        APARTMENT: "Apartamento",
        SUITE: "Suite",
        LAND: "Terreno",
        COMMERCIAL: "Local",
      };
      chips.push({
        key: `category-${cat}`,
        label: categoryLabels[cat] || cat,
        onRemove: () => {
          const updated = filters.category?.filter((c) => c !== cat);
          updateFilter("category", updated?.length ? updated : undefined);
        },
      });
    });
  }

  // Price Range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minLabel = filters.minPrice
      ? `$${(filters.minPrice / 1000).toFixed(0)}k`
      : "$0";
    const maxLabel = filters.maxPrice
      ? `$${(filters.maxPrice / 1000).toFixed(0)}k`
      : "∞";
    chips.push({
      key: "price",
      label: `${minLabel} - ${maxLabel}`,
      onRemove: () => {
        updateFilter("minPrice", undefined);
        updateFilter("maxPrice", undefined);
      },
    });
  }

  // Bedrooms
  if (filters.bedrooms !== undefined) {
    chips.push({
      key: "bedrooms",
      label: `${filters.bedrooms}+ Hab`,
      onRemove: () => updateFilter("bedrooms", undefined),
    });
  }

  // Bathrooms
  if (filters.bathrooms !== undefined) {
    chips.push({
      key: "bathrooms",
      label: `${filters.bathrooms}+ Baños`,
      onRemove: () => updateFilter("bathrooms", undefined),
    });
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  // Don't render if no active filters
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="bg-oslo-gray-1000 border-b border-oslo-gray-800 px-4 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600/20 border border-amber-700/50 text-amber-50 text-sm font-medium whitespace-nowrap hover:bg-amber-600/30 transition-colors"
          >
            <span>{chip.label}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
