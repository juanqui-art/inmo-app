"use client";

import { useEffect } from "react";
import { useMapStore, type PriceDistribution, type FilterState } from "@/stores/map-store";
import type { MapProperty } from "./map-view";

interface MapStoreInitializerProps {
  properties: MapProperty[];
  priceDistribution: PriceDistribution;
  priceRangeMin?: number;
  priceRangeMax?: number;
  filters?: FilterState; // Optional: Initial filters from server
}

/**
 * This component is a bridge between Server Components and the client-side Zustand store.
 * It takes server-fetched data as props and uses it to initialize the store.
 * It ensures the initialization happens only ONCE.
 * It renders nothing.
 */
function MapStoreInitializer({
  properties,
  priceDistribution,
  priceRangeMin,
  priceRangeMax,
  filters,
}: MapStoreInitializerProps) {
  useEffect(() => {
    useMapStore.getState().initialize({
      properties,
      priceDistribution,
      priceRangeMin,
      priceRangeMax,
    });

    // Initialize filters if provided (from URL)
    if (filters) {
      useMapStore.getState().setFilters(filters);
    }
  }, [properties, priceDistribution, priceRangeMin, priceRangeMax, filters]);

  return null; // This component doesn't render any UI
}

export default MapStoreInitializer;
