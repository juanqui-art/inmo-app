"use client";

/**
 * PropertyListTitle - Dynamic title that reflects current search context
 *
 * Shows:
 * - Property count
 * - Current filters in human-readable format
 * - Updates reactively when filters change
 *
 * Examples:
 * - "Casas en Venta en Cuenca (20 propiedades)"
 * - "Departamentos en Renta (15 propiedades)"
 * - "Propiedades en Cuenca (50 propiedades)"
 */

import { useMapStore } from "@/stores/map-store";
import { transactionTypeLabels, categoryLabels } from "@/lib/constants";

interface PropertyListTitleProps {
  total: number;
}

export function PropertyListTitle({ total }: PropertyListTitleProps) {
  const filters = useMapStore((state) => state.filters);

  // Build descriptive title from active filters
  const buildTitle = () => {
    const parts: string[] = [];

    // Property type/category
    if (filters.category && filters.category.length > 0) {
      if (filters.category.length === 1) {
        const categoryLabel =
          categoryLabels[filters.category[0] as keyof typeof categoryLabels] ||
          filters.category[0];
        parts.push(categoryLabel);
      } else {
        parts.push("Propiedades");
      }
    } else {
      parts.push("Propiedades");
    }

    // Transaction type
    if (filters.transactionType && filters.transactionType.length > 0) {
      if (filters.transactionType.length === 1) {
        const typeLabel =
          transactionTypeLabels[
            filters.transactionType[0] as keyof typeof transactionTypeLabels
          ] || filters.transactionType[0];
        parts.push(`en ${typeLabel}`);
      } else {
        parts.push("en Venta y Renta");
      }
    }

    // Location/City
    if (filters.city) {
      parts.push(`en ${filters.city}`);
    }

    return parts.join(" ");
  };

  const title = buildTitle();
  const countText = `${total} propiedad${total !== 1 ? "es" : ""}`;
  const hasActiveFilters =
    filters.category?.length ||
    filters.transactionType?.length ||
    filters.city ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.bedrooms ||
    filters.bathrooms;

  return (
    <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3 border-b border-oslo-gray-800">
      <div>
        <h2 className="text-lg font-semibold text-oslo-gray-50">
          {title} <span className="font-normal text-oslo-gray-400">({countText})</span>
        </h2>
        {hasActiveFilters && (
          <p className="text-xs text-oslo-gray-400 mt-1">
            Filtrando resultados según tu búsqueda
          </p>
        )}
      </div>
    </div>
  );
}
