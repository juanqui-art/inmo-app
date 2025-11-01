/**
 * PropertiesCountBadge - Isolated Properties Count Display
 *
 * RESPONSIBILITY:
 * - Display badge showing total number of properties
 * - Only renders when searchResults is NOT available
 * - Shows properties count when user is browsing (not searching)
 *
 * OPTIMIZATION:
 * - Memoized with React.memo()
 * - Only re-renders when count or visibility changes
 * - Does NOT trigger parent MapContainer re-renders
 * - Pure presentational component (no state)
 *
 * PROPS:
 * - count: number - Total properties count
 * - visible: boolean - Whether to show the badge
 */

"use client";

import { memo } from "react";

interface PropertiesCountBadgeProps {
  count: number;
  visible: boolean;
}

/**
 * MEMOIZED: Only re-renders when count or visible prop changes
 * Not re-renders when parent viewState/theme/other props change
 */
export const PropertiesCountBadge = memo(function PropertiesCountBadge({
  count,
  visible,
}: PropertiesCountBadgeProps) {
  // Only render if visible flag is true
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
      <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">
        {count} {count === 1 ? "propiedad" : "propiedades"} disponibles
      </p>
    </div>
  );
});

PropertiesCountBadge.displayName = "PropertiesCountBadge";
