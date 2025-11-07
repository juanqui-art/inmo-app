"use client";

import { useEffect } from "react";
import { useMapStore, type PriceDistribution } from "@/stores/map-store";
import type { MapProperty } from "./map-view";

interface MapStoreInitializerProps {
  properties: MapProperty[];
  priceDistribution: PriceDistribution;
  priceRangeMin?: number;
  priceRangeMax?: number;
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
}: MapStoreInitializerProps) {
  useEffect(() => {
    useMapStore.getState().initialize({
      properties,
      priceDistribution,
      priceRangeMin,
      priceRangeMax,
    });
  }, [properties, priceDistribution, priceRangeMin, priceRangeMax]);

  return null; // This component doesn't render any UI
}

export default MapStoreInitializer;
