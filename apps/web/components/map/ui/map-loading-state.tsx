/**
 * MapLoadingState - Simple Loading UI Component
 *
 * Displays clean pulsing spinner during hydration
 * Prevents theme flash and hydration mismatches
 * Pure presentational component with no business logic
 *
 * FEATURES:
 * - Pulsing ring with Oslo Gray palette
 * - Breathing animation (fade in/out effect)
 * - Static map icon in center
 * - Minimal, elegant design
 *
 * USAGE:
 * <MapLoadingState />
 *
 * RESPONSIBILITY:
 * - Display loading UI
 * - Prevent FOUC (Flash of Unstyled Content)
 */

"use client";

import { Map } from "lucide-react";

export function MapLoadingState() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
      {/* Spinner Container */}
      <div className="relative w-16 h-16 mb-4">
        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-oslo-gray-300 dark:border-oslo-gray-700 animate-[pulse_2s_ease-in-out_infinite]" />

        {/* Static Map Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Map className="w-7 h-7 text-oslo-gray-600 dark:text-oslo-gray-400" />
        </div>
      </div>

      {/* Loading Text */}
      <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm animate-pulse">
        Cargando mapa...
      </p>
    </div>
  );
}
