"use client";

/**
 * CategoryFilterContent - Property category selector for mobile
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

import type { PropertyCategory } from "@repo/database";
import { Building2, Home, MapPin, Warehouse, Zap } from "lucide-react";

interface CategoryFilterContentProps {
  selected?: PropertyCategory[];
  onToggle: (category: PropertyCategory) => void;
}

const CATEGORIES: {
  value: PropertyCategory;
  label: string;
  icon: typeof Home;
}[] = [
  { value: "HOUSE", label: "Casa", icon: Home },
  { value: "APARTMENT", label: "Apartamento", icon: Building2 },
  { value: "SUITE", label: "Suite", icon: Zap },
  { value: "LAND", label: "Terreno", icon: MapPin },
  { value: "COMMERCIAL", label: "Local", icon: Warehouse },
];

export function CategoryFilterContent({
  selected = [],
  onToggle,
}: CategoryFilterContentProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        🏠 Tipo de Propiedad
      </label>

      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isSelected = selected.includes(category.value);

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onToggle(category.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-oslo-gray-900/50 text-oslo-gray-300 border border-oslo-gray-800 hover:bg-oslo-gray-800/70"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
