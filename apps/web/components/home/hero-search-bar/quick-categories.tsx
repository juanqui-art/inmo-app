/**
 * QuickCategories - Quick search buttons for common filters
 *
 * RESPONSIBILITY: Render quick search category buttons
 */

import { Zap } from "lucide-react";

interface QuickCategory {
  label: string;
  query: string;
}

interface QuickCategoriesProps {
  categories: QuickCategory[];
  onSelect: (categoryQuery: string) => void;
}

export function QuickCategories({
  categories,
  onSelect,
}: QuickCategoriesProps) {
  return (
    <>
      <div className="sticky top-0 px-4 sm:px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm z-10">
        <p className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4" /> Búsquedas rápidas
        </p>
      </div>
      <div className="p-3 sm:p-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => onSelect(category.query)}
            className="px-3 sm:px-4 py-2 rounded-lg bg-oslo-gray-900/45 hover:bg-indigo-500/30 border border-white/15 hover:border-indigo-400 text-white/90 hover:text-indigo-100 text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 whitespace-nowrap"
          >
            {category.label}
          </button>
        ))}
      </div>
    </>
  );
}
