"use client";

import { useEffect } from "react";
import { usePropertyGridStore } from "./property-grid-store";
import type { SerializedProperty, PropertyFilters } from "@repo/database";

interface PropertyGridStoreInitializerProps {
  properties: SerializedProperty[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filters: PropertyFilters;
}

/**
 * PropertyGridStoreInitializer
 *
 * Hydrates the PropertyGridStore with data fetched from a Server Component.
 * This component should be rendered once in the property grid page.
 *
 * PATTERN:
 * - Server Component fetches data asynchronously
 * - Server Component passes data to this initializer component
 * - Initializer runs client-side and hydrates the store
 * - All child components can then read from the store directly (no props drilling)
 *
 * Re-initializes when props change (e.g., when router.push updates URL and Server Component re-fetches).
 * This enables synchronization between filter changes and the store.
 */
function PropertyGridStoreInitializer({
  properties,
  total,
  currentPage,
  totalPages,
  pageSize,
  filters,
}: PropertyGridStoreInitializerProps) {
  // Re-initialize store whenever props change from Server Component re-fetches
  // This allows filters to update the store in real-time when URL changes via router.push()
  useEffect(() => {
    usePropertyGridStore.getState().initialize({
      properties,
      total,
      currentPage,
      totalPages,
      pageSize,
      filters,
    });
  }, [properties, total, currentPage, totalPages, pageSize, filters]);

  // This component renders nothing - it's purely for side effects
  return null;
}

export default PropertyGridStoreInitializer;
