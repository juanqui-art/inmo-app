"use client";

import { useRef } from "react";
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
 * WHY useRef?
 * - Ensures hydration runs only once, even with React Strict Mode double-rendering
 * - Prevents multiple hydration attempts that could cause race conditions
 */
function PropertyGridStoreInitializer({
  properties,
  total,
  currentPage,
  totalPages,
  pageSize,
  filters,
}: PropertyGridStoreInitializerProps) {
  const initialized = useRef(false);

  // Run only once: hydrate the store with fetched data
  if (!initialized.current) {
    usePropertyGridStore.getState().initialize({
      properties,
      total,
      currentPage,
      totalPages,
      pageSize,
      filters,
    });
    initialized.current = true;
  }

  // This component renders nothing - it's purely for side effects
  return null;
}

export default PropertyGridStoreInitializer;
