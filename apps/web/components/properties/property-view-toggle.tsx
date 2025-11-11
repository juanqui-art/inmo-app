"use client";

/**
 * PropertyViewToggle - Switch between list and map views
 *
 * Allows users to toggle between:
 * - /propiedades → List view (grid)
 * - /mapa → Map view
 *
 * Preserves all filter parameters when switching views
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
  const listUrl = `/propiedades${filters ? `?${filters}` : ""}`;
  const mapUrl = `/mapa${filters ? `?${filters}` : ""}`;

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
