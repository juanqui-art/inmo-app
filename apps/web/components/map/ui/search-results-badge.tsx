/**
 * SearchResultsBadge - Isolated AI Search Results Display
 *
 * RESPONSIBILITY:
 * - Display badge showing number of AI search results
 * - Only renders when searchResults exist and have length > 0
 *
 * OPTIMIZATION:
 * - Memoized with React.memo()
 * - Only re-renders when searchResults[] changes
 * - Does NOT trigger parent MapContainer re-renders
 * - Pure presentational component (no state)
 *
 * PROPS:
 * - searchResults: Array - AI search results from API
 */

"use client";

import { memo } from "react";

interface SearchResultsBadgeProps {
  searchResults?: Array<{
    id: string;
    city?: string | null;
    address?: string | null;
    price: number;
  }>;
}

/**
 * MEMOIZED: Only re-renders when searchResults prop changes
 * Not re-renders when parent viewState/theme/other props change
 */
export const SearchResultsBadge = memo(function SearchResultsBadge({
  searchResults,
}: SearchResultsBadgeProps) {
  // Only render if searchResults exists and has items
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-green-200 dark:border-green-900">
      <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">
        🔍 {searchResults.length}{" "}
        {searchResults.length === 1 ? "propiedad" : "propiedades"} encontradas
      </p>
    </div>
  );
});

SearchResultsBadge.displayName = "SearchResultsBadge";
