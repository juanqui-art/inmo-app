"use client";

/**
 * PropertyViewToggle - Switch between list and map views
 *
 * UPDATED: Uses unified route with ?view parameter (Nov 2025)
 * - /propiedades?view=list → List view (grid)
 * - /propiedades?view=map → Map view
 *
 * Preserves all filter parameters when switching views
 *
 * OLD PATTERN: Separate routes (/propiedades vs /mapa)
 * NEW PATTERN: Single route with view parameter (industry standard)
 */

import Link from "next/link";
import { Grid3x3, Map } from "lucide-react";
import { cn } from "@repo/ui";

interface PropertyViewToggleProps {
  currentView: "list" | "map";
  filters: string; // Query string (e.g., "city=Cuenca&transactionType=SALE")
}

export function PropertyViewToggle({
  currentView,
  filters,
}: PropertyViewToggleProps) {
  // Build URLs with view parameter
  // Remove any existing "view" parameter from filters, then add our own
  const cleanFilters = filters
    .split("&")
    .filter((param) => !param.startsWith("view="))
    .join("&");

  const baseQuery = cleanFilters ? `${cleanFilters}&` : "";
  const listUrl = `/propiedades?${baseQuery}view=list`;
  const mapUrl = `/propiedades?${baseQuery}view=map`;

  return (
    <div className="flex gap-1 bg-oslo-gray-800/50 rounded-lg p-1">
      {/* List View Button */}
      <Link
        href={listUrl}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
          currentView === "list"
            ? "bg-oslo-gray-900 text-indigo-400 shadow-sm"
            : "text-oslo-gray-400 hover:text-oslo-gray-200",
        )}
        title="Ver como lista"
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Lista</span>
      </Link>

      {/* Map View Button */}
      <Link
        href={mapUrl}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
          currentView === "map"
            ? "bg-oslo-gray-900 text-indigo-400 shadow-sm"
            : "text-oslo-gray-400 hover:text-oslo-gray-200",
        )}
        title="Ver como mapa"
      >
        <Map className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Mapa</span>
      </Link>
    </div>
  );
}
