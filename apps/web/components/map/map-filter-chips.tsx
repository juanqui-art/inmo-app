"use client";

import { cn } from "@repo/ui";
import { GraduationCap, Hospital, ShoppingBag, TreePine, Utensils, X } from "lucide-react";
import type { PlaceCategory } from "./place-marker";

interface MapFilterChipsProps {
  activeCategory: string | null;
  onCategoryChange: (category: PlaceCategory | null) => void;
}

export function MapFilterChips({ activeCategory, onCategoryChange }: MapFilterChipsProps) {
  const categories: { id: PlaceCategory; label: string; icon: any }[] = [
    { id: 'school', label: 'Escuelas', icon: GraduationCap },
    { id: 'hospital', label: 'Salud', icon: Hospital },
    { id: 'park', label: 'Parques', icon: TreePine },
    { id: 'shopping_mall', label: 'Compras', icon: ShoppingBag },
    { id: 'restaurant', label: 'Restaurantes', icon: Utensils },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 pointer-events-none">
      <div className="flex flex-wrap gap-2 pointer-events-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(isActive ? null : cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-md border transition-all duration-200 backdrop-blur-xl",
                isActive 
                  ? "bg-oslo-gray-900 border-oslo-gray-900 text-white dark:bg-white dark:text-black dark:border-white" 
                  : "bg-white/90 text-oslo-gray-700 border-oslo-gray-200 hover:bg-white dark:bg-black/60 dark:text-gray-200 dark:border-white/10 dark:hover:bg-black/80 dark:hover:border-white/20"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}

        {activeCategory && (
             <button
                onClick={() => onCategoryChange(null)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-oslo-gray-500 border border-oslo-gray-200 shadow-sm hover:bg-white dark:bg-oslo-gray-950/80 dark:border-oslo-gray-800"
             >
                 <X className="w-3.5 h-3.5" />
             </button>
        )}
      </div>
    </div>
  );
}
