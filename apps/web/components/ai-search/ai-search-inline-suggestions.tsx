"use client";

/**
 * AI SEARCH INLINE SUGGESTIONS
 *
 * Dropdown suggestions that appear below the search bar when focused
 * Shows:
 * - Recent searches
 * - Example queries
 * - Detected filters
 *
 * Uses Motion for fade-in animations
 */

import { motion } from "motion/react";
import { Zap, Clock, Lightbulb } from "lucide-react";

// Example searches contextualized for Ecuador/Cuenca
const EXAMPLE_SEARCHES = [
  "Casa moderna en Cuenca con 3 habitaciones",
  "Apartamento cerca de la universidad bajo $120k",
  "Propiedad con jardín y garaje en el norte",
  "Suite amueblada para arriendo en el centro",
  "Casa colonial con patio en Gualaceo",
  "Penthouse con vista panorámica a la ciudad",
];

const RECENT_SEARCHES = [
  "Casa 3 habitaciones Quito Norte",
  "Departamento moderno Cuenca",
  "Villa con piscina bajo $200k",
];

interface AISearchInlineSuggestionsProps {
  isOpen: boolean;
  onSuggestionClick: (query: string) => void;
}

export function AISearchInlineSuggestions({
  isOpen,
  onSuggestionClick,
}: AISearchInlineSuggestionsProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-xl shadow-lg overflow-hidden border bg-oslo-gray-900 border-oslo-gray-700"
    >
      <div className="max-h-[500px] overflow-y-auto">
        {/* Recent Searches Section */}
        {RECENT_SEARCHES.length > 0 && (
          <div className="border-b border-oslo-gray-800">
            <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-oslo-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Búsquedas recientes
            </div>
            <div className="space-y-0">
              {RECENT_SEARCHES.map((search, idx) => (
                <motion.button
                  key={`recent-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSuggestionClick(search)}
                  className="w-full text-left px-4 py-2.5 transition-colors text-sm text-oslo-gray-300 hover:bg-oslo-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-oslo-gray-500" />
                    <span>{search}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Examples Section */}
        <div className="border-b border-oslo-gray-800">
          <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-oslo-gray-500">
            <Lightbulb className="w-3.5 h-3.5" />
            Ejemplos
          </div>
          <div className="space-y-0">
            {EXAMPLE_SEARCHES.map((search, idx) => (
              <motion.button
                key={`example-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (RECENT_SEARCHES.length + idx) * 0.05 }}
                onClick={() => onSuggestionClick(search)}
                className="w-full text-left px-4 py-2.5 transition-colors text-sm text-oslo-gray-300 hover:bg-oslo-gray-800"
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-500" />
                  <span>{search}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="px-4 py-3 border-t bg-oslo-gray-800 border-oslo-gray-700">
          <p className="text-xs font-semibold mb-2 text-oslo-gray-200">
            💡 Tips para mejores resultados
          </p>
          <ul className="space-y-1 text-xs text-oslo-gray-400">
            <li>• Menciona ubicación (Ej: "en El Ejido")</li>
            <li>• Incluye características (garaje, jardín)</li>
            <li>• Especifica presupuesto si lo tienes</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
