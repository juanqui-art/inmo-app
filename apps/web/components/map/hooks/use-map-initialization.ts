/**
 * useMapInitialization Hook
 *
 * Handles map initialization logic:
 * - Hydration state (client-side mount detection)
 * - MapBox token validation
 * - Error state for missing token
 *
 * USAGE:
 * const { mounted, mapboxToken, isError } = useMapInitialization();
 *
 * RESPONSIBILITY:
 * - Single source of truth for initialization state
 * - Prevents hydration mismatches
 * - Validates environment configuration
 */

"use client";

import { useState, useEffect } from "react";
import { env } from "@/lib/env";

interface UseMapInitializationReturn {
  /** Whether component has mounted (client-side only) */
  mounted: boolean;
  /** MapBox GL access token (validated) */
  mapboxToken: string | undefined;
  /** Whether there's a configuration error (missing token) */
  isError: boolean;
}

export function useMapInitialization(): UseMapInitializationReturn {
  const [mounted, setMounted] = useState(false);

  /**
   * Get MapBox access token
   * Type-safe and validated from env.ts
   */
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

  /**
   * Check for configuration errors
   */
  const isError = !mapboxToken;

  /**
   * Handle hydration
   * Set mounted to true after initial client render
   * Prevents theme flash and hydration mismatches
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    mounted,
    mapboxToken,
    isError,
  };
}
