/**
 * MapView - Interactive MapBox GL Component
 *
 * PATTERN: Client Component with Dark Mode Support
 *
 * WHY Client Component?
 * - MapBox GL requires browser APIs (window, canvas, WebGL)
 * - Interactive state (viewport, selected markers)
 * - Event handlers (click, hover, drag)
 * - Theme detection (light/dark mode)
 *
 * FEATURES:
 * - Dark/light mode automatic switching
 * - Responsive viewport
 * - Smooth animations
 * - Accessibility support
 *
 * RESOURCES:
 * - https://visgl.github.io/react-map-gl/
 * - https://docs.mapbox.com/mapbox-gl-js/
 */

"use client";

import { useState, useEffect } from "react";
import Map, { NavigationControl, ScaleControl, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import { useTheme } from "next-themes";
import { DEFAULT_MAP_CONFIG, MAPBOX_STYLES } from "@/lib/types/map";
import { env } from "@/lib/env";
import { PropertyMarker } from "./property-marker";
import { MapSearchBar } from "./map-search-bar";
import { MapFilters } from "./map-filters";
import type { TransactionType } from "@repo/database";

// Import MapBox GL CSS
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Minimal property data needed for map rendering
 * Flexible type that works with partial selects from Prisma
 */
export interface MapProperty {
  id: string;
  title: string;
  price: number;
  transactionType: TransactionType;
  latitude: number | null;
  longitude: number | null;
  images?: Array<{
    url: string;
    alt: string | null;
  }>;
}

interface MapViewProps {
  properties: MapProperty[];
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function MapView({
  properties,
  initialCenter,
  initialZoom = DEFAULT_MAP_CONFIG.DEFAULT_ZOOM,
}: MapViewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /**
   * Viewport state
   * Controls camera position and zoom level
   */
  const [viewState, setViewState] = useState({
    longitude:
      initialCenter?.[0] ?? DEFAULT_MAP_CONFIG.AZUAY_CENTER.longitude,
    latitude: initialCenter?.[1] ?? DEFAULT_MAP_CONFIG.AZUAY_CENTER.latitude,
    zoom: initialZoom,
    pitch: DEFAULT_MAP_CONFIG.DEFAULT_PITCH,
    bearing: DEFAULT_MAP_CONFIG.DEFAULT_BEARING,
    transitionDuration: 0, // No animation on initial load
  });

  /**
   * Fly to a specific location with smooth animation
   *
   * @param longitude - Target longitude
   * @param latitude - Target latitude
   * @param zoom - Target zoom level (default: 13)
   */
  const flyToLocation = (longitude: number, latitude: number, zoom: number = 13) => {
    setViewState({
      ...viewState,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1500, // 1.5 seconds smooth transition
    });
  };

  /**
   * Get MapBox access token
   * Type-safe and validated from env.ts
   */
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

  /**
   * Determine map style based on theme
   * Light mode → light style
   * Dark mode → dark style
   */
  const mapStyle =
    resolvedTheme === "dark" ? MAPBOX_STYLES.DARK : MAPBOX_STYLES.LIGHT;

  /**
   * Handle hydration mismatch
   * Theme can only be detected on client-side
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Error state: Missing MapBox token
   */
  if (!mapboxToken) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-oslo-gray-900 dark:text-oslo-gray-50 mb-2">
            MapBox Token Missing
          </h2>
          <p className="text-oslo-gray-600 dark:text-oslo-gray-400 mb-4">
            Para ver el mapa, necesitas agregar tu token de MapBox a las variables de entorno.
          </p>
          <div className="bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg p-4 text-left mb-4">
            <p className="text-sm font-mono text-oslo-gray-900 dark:text-oslo-gray-50 mb-2">
              .env.local
            </p>
            <code className="text-xs text-oslo-gray-700 dark:text-oslo-gray-300">
              NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-token-here"
            </code>
          </div>
          <p className="text-sm text-oslo-gray-500 dark:text-oslo-gray-500">
            Obtén tu token gratis en:{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              account.mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  /**
   * Loading state during hydration
   * Prevents theme flash
   */
  if (!mounted) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
        <div className="text-oslo-gray-600 dark:text-oslo-gray-400">
          Cargando mapa...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Search Bar - Floating Top Left */}
      <MapSearchBar onLocationSelect={flyToLocation} />

      {/* Filters - Floating Top Right */}
      <MapFilters />

      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        minZoom={DEFAULT_MAP_CONFIG.MIN_ZOOM}
        maxZoom={DEFAULT_MAP_CONFIG.MAX_ZOOM}
        attributionControl={false}
        reuseMaps
      >
        {/* Navigation Controls (Zoom +/-) */}
        <NavigationControl
          position="bottom-right"
          showCompass={true}
          showZoom={true}
          visualizePitch={true}
        />

        {/* Scale Control (Distance) */}
        <ScaleControl position="bottom-left" unit="metric" />

        {/* Property Markers */}
        {properties.map((property) => {
          // Skip properties without coordinates
          if (!property.latitude || !property.longitude) return null;

          return (
            <PropertyMarker
              key={property.id}
              latitude={property.latitude}
              longitude={property.longitude}
              price={property.price}
              transactionType={property.transactionType}
              onClick={() => {
                console.log("Clicked property:", property.title);
                // TODO: Open popup in Phase 3
              }}
            />
          );
        })}
      </Map>

      {/* Properties Count Badge */}
      <div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
        <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">
          {properties.length} propiedades disponibles
        </p>
      </div>

      {/* Attribution (moved to bottom-right) */}
      <div className="absolute bottom-0 right-0 z-10 bg-white/90 dark:bg-oslo-gray-900/90 px-2 py-1 text-[10px] text-oslo-gray-600 dark:text-oslo-gray-400">
        © MapBox © OpenStreetMap
      </div>
    </div>
  );
}

/**
 * NEXT STEPS:
 *
 * Phase 2:
 * - Add PropertyMarker component
 * - Render markers for each property
 * - Add click handlers
 * - Add PropertyPopup component
 *
 * Phase 3:
 * - Add MapSearchBar
 * - Add MapControls (geolocation, reset view)
 * - Add filtering logic
 *
 * Phase 4:
 * - Add clustering for many markers
 * - Optimize viewport filtering
 * - Add animations
 */
