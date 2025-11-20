/**
 * MapSearchEmptyState - UI for edge cases in AI search
 *
 * Handles:
 * 1. No results found (0 properties)
 * 2. Low confidence searches (ambiguous queries)
 * 3. Invalid location (city not in inventory)
 * 4. Medium confidence warnings
 *
 * USAGE:
 * <MapSearchEmptyState
 *   type="no-results"
 *   query="Casa 10 habitaciones bajo $10k"
 *   confidence={85}
 *   suggestions={["Aumenta tu presupuesto", "Reduce habitaciones"]}
 * />
 */

"use client";

import { AlertTriangle, Lightbulb, MapPin, SearchX, X } from "lucide-react";
import { motion } from "motion/react";

type EmptyStateType =
  | "no-results" // 0 propiedades encontradas
  | "low-confidence" // Confidence < 30%
  | "invalid-location" // Ubicación no existe
  | "medium-confidence-warning"; // Confidence 30-50%

interface MapSearchEmptyStateProps {
  type: EmptyStateType;
  query: string;
  confidence?: number;
  suggestions?: string[];
  availableCities?: string[]; // Para invalid-location
  filterSummary?: Record<string, any>; // Filtros aplicados
  onDismiss?: () => void;
}

const EMPTY_STATE_CONFIG = {
  "no-results": {
    icon: SearchX,
    iconColor: "text-indigo-400",
    title: "No encontramos propiedades",
    subtitle: "Intenta ajustar tu búsqueda",
  },
  "low-confidence": {
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
    title: "Búsqueda muy ambigua",
    subtitle: "Por favor, sé más específico",
  },
  "invalid-location": {
    icon: MapPin,
    iconColor: "text-red-400",
    title: "Ubicación no disponible",
    subtitle: "Esta ciudad no está en nuestro inventario",
  },
  "medium-confidence-warning": {
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    title: "Resultados parciales",
    subtitle: "Tu búsqueda tiene poca claridad",
  },
};

export function MapSearchEmptyState({
  type,
  query,
  confidence,
  suggestions,
  availableCities,
  filterSummary,
  onDismiss,
}: MapSearchEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
      onClick={(e) => {
        // Close when clicking on backdrop
        if (e.target === e.currentTarget && onDismiss) {
          onDismiss();
        }
      }}
    >
      {/* Card */}
      <div
        className="bg-oslo-gray-800/95 backdrop-blur-lg border border-oslo-gray-700 rounded-2xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
      >
        {/* Close Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-oslo-gray-700 text-oslo-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`p-3 rounded-full bg-oslo-gray-700/50 ${config.iconColor}`}
          >
            <Icon className="w-8 h-8" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-semibold text-center text-white mb-2">
          {config.title}
        </h3>
        <p className="text-center text-oslo-gray-400 text-sm mb-4">
          {config.subtitle}
        </p>

        {/* Query */}
        <div className="bg-oslo-gray-900/60 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-oslo-gray-500 mb-1">
            Tu búsqueda:
          </p>
          <p className="text-sm text-white italic">"{query}"</p>
          {confidence !== undefined && (
            <p className="text-xs text-oslo-gray-500 mt-1">
              Confianza: {confidence}%
            </p>
          )}
        </div>

        {/* Filter Summary (for no-results) */}
        {type === "no-results" &&
          filterSummary &&
          Object.keys(filterSummary).length > 0 && (
            <div className="bg-oslo-gray-900/40 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-oslo-gray-500 mb-2">
                Filtros aplicados:
              </p>
              <div className="space-y-1">
                {Object.entries(filterSummary).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="text-oslo-gray-400">{key}:</span>
                    <span className="text-white font-medium">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Available Cities (for invalid-location) */}
        {type === "invalid-location" &&
          availableCities &&
          availableCities.length > 0 && (
            <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Ciudades disponibles:
              </p>
              <div className="flex flex-wrap gap-2">
                {availableCities.map((city) => (
                  <span
                    key={city}
                    className="px-2 py-1 bg-indigo-800/40 text-indigo-200 text-xs rounded-full"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" />
              Sugerencias:
            </p>
            <ul className="space-y-1">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="text-xs text-cyan-200 flex items-start gap-2"
                >
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full py-2.5 bg-oslo-gray-700 hover:bg-oslo-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {type === "medium-confidence-warning"
              ? "Continuar con estos resultados"
              : type === "low-confidence"
                ? "Cerrar y explorar mapa"
                : type === "invalid-location"
                  ? "Cerrar y ver todas las propiedades"
                  : "Cerrar"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
