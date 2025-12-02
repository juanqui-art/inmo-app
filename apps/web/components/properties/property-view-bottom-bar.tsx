"use client";

/**
 * PropertyViewBottomBar - Floating bottom bar for view toggle (mobile)
 *
 * PATTERN: Airbnb mobile bottom bar
 * - Fixed position at bottom center
 * - Only shows on mobile (<md breakpoint)
 * - Floating pill design with shadow
 * - Contains Lista/Mapa toggle
 * - Always visible for easy access
 *
 * FEATURES:
 * - Sticky bottom position
 * - Glassmorphism design
 * - Animated entrance
 * - Thumb-friendly tap targets
 * - Result count display
 */

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "@repo/ui";
import { Grid3x3, Map } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PropertyViewBottomBarProps {
  currentView: "list" | "map";
  filters: string; // Query string
  totalResults?: number;
}

export function PropertyViewBottomBar({
  currentView,
  filters,
  totalResults = 0,
}: PropertyViewBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate entrance on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Build URLs with view parameter
  const cleanFilters = filters
    .split("&")
    .filter((param) => !param.startsWith("view="))
    .join("&");

  const baseQuery = cleanFilters ? `${cleanFilters}&` : "";
  const listUrl = `/propiedades?${baseQuery}view=list`;
  const mapUrl = `/propiedades?${baseQuery}view=map`;

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-oslo-gray-950/95 backdrop-blur-xl border border-oslo-gray-800 shadow-2xl shadow-black/40">
        {/* Result Count */}
        {totalResults > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-oslo-gray-800/50">
            <span className="text-xs font-semibold text-oslo-gray-300">
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* View Toggle */}
        <ToggleGroup.Root
          type="single"
          value={currentView}
          className="flex items-center gap-1"
          aria-label="Vista de propiedades"
        >
          {/* List View */}
          <ToggleGroup.Item
            value="list"
            asChild
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer",
              "data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-indigo-900/50",
              "data-[state=off]:text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800/50",
            )}
          >
            <Link
              href={listUrl}
              className="flex items-center gap-2"
              title="Ver como lista"
            >
              <Grid3x3 className="w-4 h-4" />
              <span>Lista</span>
            </Link>
          </ToggleGroup.Item>

          {/* Map View */}
          <ToggleGroup.Item
            value="map"
            asChild
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer",
              "data-[state=on]:bg-indigo-600 data-[state=on]:text-white data-[state=on]:shadow-lg data-[state=on]:shadow-indigo-900/50",
              "data-[state=off]:text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800/50",
            )}
          >
            <Link
              href={mapUrl}
              className="flex items-center gap-2"
              title="Ver como mapa"
            >
              <Map className="w-4 h-4" />
              <span>Mapa</span>
            </Link>
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    </div>
  );
}
