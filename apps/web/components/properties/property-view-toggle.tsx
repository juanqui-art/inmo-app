"use client";

/**
 * PropertyViewToggle - Switch between list and map views
 *
 * UPDATED: Radix UI Toggle Group (Nov 2025)
 * - Uses @radix-ui/react-toggle-group for better UX and accessibility
 * - Unified design with glassmorphism styling (matches FilterBar)
 * - Single route with ?view parameter (/propiedades?view=list|map)
 * - Preserves all filter parameters when switching views
 *
 * Benefits:
 * - Better keyboard navigation (Tab, Arrow keys)
 * - Proper ARIA attributes and semantics
 * - Unified visual appearance
 * - Smoother transitions
 */

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "@repo/ui";
import { Grid3x3, Map } from "lucide-react";
import Link from "next/link";

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
    <ToggleGroup.Root
      type="single"
      value={currentView}
      className="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-oslo-gray-900/50 border border-oslo-gray-800 backdrop-blur-md"
      aria-label="Vista de propiedades"
    >
      {/* List View Toggle */}
      <ToggleGroup.Item
        value="list"
        asChild
        className={cn(
          "flex h-10 items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap cursor-pointer",
          "data-[state=on]:bg-oslo-gray-600/40 data-[state=on]:text-oslo-gray-50 data-[state=on]:shadow-lg data-[state=on]:shadow-oslo-gray-900/50",
          "data-[state=off]:text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800/30",
        )}
      >
        <Link
          href={listUrl}
          className="flex h-full items-center gap-2"
          title="Ver como lista"
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="hidden sm:inline">Lista</span>
        </Link>
      </ToggleGroup.Item>

      {/* Map View Toggle */}
      <ToggleGroup.Item
        value="map"
        asChild
        className={cn(
          "flex h-10 items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap cursor-pointer",
          "data-[state=on]:bg-oslo-gray-600/40 data-[state=on]:text-oslo-gray-50 data-[state=on]:shadow-lg data-[state=on]:shadow-oslo-gray-900/50",
          "data-[state=off]:text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800/30",
        )}
      >
        <Link
          href={mapUrl}
          className="flex h-full items-center gap-2"
          title="Ver como mapa"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Mapa</span>
        </Link>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
