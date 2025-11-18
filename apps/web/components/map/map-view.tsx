"use client";

import type { FeatureCollection } from "geojson";
import type { GeoJSONSource } from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import Map, { Layer, Popup, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TransactionType } from "@repo/database";
import { env } from "@repo/env";
import { CLUSTER_CONFIG } from "@/lib/types/map";
import { formatPriceCompact } from "@/lib/utils/price-helpers";
import { MapSpinner } from "./map-spinner";
import { PropertyCardHorizontal } from "./property-card-horizontal";

// Property interface
export interface MapProperty {
  id: string;
  title: string;
  price: number;
  transactionType: TransactionType;
  category?: string;
  latitude: number | null;
  longitude: number | null;
  city?: string;
  state?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  images?: Array<{
    url: string;
    alt: string | null;
  }>;
}

interface MapViewProps {
  properties: MapProperty[];
  initialBounds?: {
    ne_lat: number;
    ne_lng: number;
    sw_lat: number;
    sw_lng: number;
  };
  priceRangeMin?: number;
  priceRangeMax?: number;
}

// SVG for the badge background. It's a simple rounded rectangle.
const badgeSvg = `
<svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="24" rx="12" fill="#3b82f6"/>
</svg>
`;

export function MapView({ properties, initialBounds }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(
    null,
  );

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    const map = mapRef.current?.getMap();
    if (!map) return;

    const image = new Image(48, 24);
    image.src = "data:image/svg+xml;base64," + btoa(badgeSvg);
    image.onload = () => {
      if (!map.hasImage("badge-background")) {
        map.addImage("badge-background", image, { sdf: true });
      }
    };
  }, []);

  // Handle marker click (clusters and individual properties)
  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;

      // Check if it's a cluster
      if (feature.properties?.cluster) {
        const clusterId = feature.properties.cluster_id;
        const mapboxSource = mapRef.current?.getMap().getSource("properties");

        if (mapboxSource && "getClusterExpansionZoom" in mapboxSource) {
          // Type assertion needed: Mapbox's Callback type signature is overly strict
          // Runtime behavior accepts (err: Error | null, zoom?: number)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapboxSource as GeoJSONSource).getClusterExpansionZoom(clusterId, ((
            err: Error | null,
            zoom?: number,
          ) => {
            if (err || zoom === undefined) return;

            const geometry = feature.geometry as { coordinates: number[] };
            mapRef.current?.flyTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom + CLUSTER_CONFIG.ZOOM_INCREMENT,
              duration: 600,
            });
          }) as any);
        }
      }
      // Handle individual property click
      else if (feature.properties?.id) {
        const property = properties.find(
          (p) => p.id === (feature.properties!.id as string),
        );
        if (property) {
          setSelectedProperty(property);
        }
      }
    },
    [properties],
  );

  // Fit bounds when map is loaded and initialBounds change
  useEffect(() => {
    if (!isMapLoaded || !initialBounds || !mapRef.current) return;

    const map = mapRef.current.getMap();
    map.fitBounds(
      [
        [initialBounds.sw_lng, initialBounds.sw_lat],
        [initialBounds.ne_lng, initialBounds.ne_lat],
      ],
      { padding: 50, duration: 600 },
    );
  }, [isMapLoaded, initialBounds]);

  // Check for Mapbox token
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">
          Error: Mapbox token no configurado
        </p>
      </div>
    );
  }

  // Convert properties to GeoJSON format, including a compact formatted price
  const geojsonData = {
    type: "FeatureCollection",
    features: properties
      // .filter((p) => p.latitude && p.longitude)
      .map((property) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [property.longitude!, property.latitude!],
        },
        properties: {
          id: property.id,
          title: property.title,
          price: property.price,
          formattedPrice: formatPriceCompact(property.price),
          transactionType: property.transactionType,
          category: property.category,
          city: property.city,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
        },
      })),
  };

  return (
    <div className="w-full h-full relative">
      {!isMapLoaded && <MapSpinner />}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: -2.9,
          longitude: -79.0,
          zoom: 6,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={["properties-badge-layer", "clusters"]}
        onClick={handleClick}
        onLoad={handleMapLoad}
      >
        <Source
          id="properties"
          type="geojson"
          data={geojsonData as FeatureCollection}
          cluster={true}
          clusterMaxZoom={CLUSTER_CONFIG.MAX_ZOOM}
          clusterRadius={CLUSTER_CONFIG.RADIUS}
          clusterProperties={{
            // Calculate max price in cluster for color coding
            maxPrice: ["max", ["get", "price"]],
          }}
        >
          {/* Cluster circles - size based on count, color blue */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-radius": [
                "step",
                ["get", "point_count"],
                16, // < 10 properties
                10,
                20, // 10-25 properties
                25,
                24, // 25-50 properties
                50,
                30, // 50+ properties
              ],
              "circle-color": "#3b82f6", // Blue
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.8,
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-size": 14,
              "text-allow-overlap": true,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          {/* Individual property badges - only for unclustered points */}
          <Layer
            id="properties-badge-layer"
            type="symbol"
            filter={["!", ["has", "point_count"]]}
            layout={{
              // Text properties
              "text-field": ["concat", "$", ["get", "formattedPrice"]],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-size": 15,
              "text-allow-overlap": true,

              // Icon properties (the badge background)
              "icon-image": "badge-background",
              "icon-allow-overlap": true,

              // Fit the icon to the text
              "icon-text-fit": "both",
              "icon-text-fit-padding": [4, 8, 4, 8],
            }}
            paint={{
              "text-color": "#ffffff",
              // Blue color for all badges
              "icon-color": "#3b82f6",
            }}
          />
        </Source>

        {/* Popup for selected property */}
        {selectedProperty?.latitude && selectedProperty.longitude && (
          <Popup
            latitude={selectedProperty.latitude}
            longitude={selectedProperty.longitude}
            onClose={() => setSelectedProperty(null)}
            closeButton={true}
            closeOnClick={false}
            className="mapbox-popup-content"
            style={{
              padding: "0",
            }}
            maxWidth="410px"
          >
            <div className="relative">
              {/* Close button overlay */}
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 right-2 z-50 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Cerrar popup"
              >
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <PropertyCardHorizontal property={selectedProperty} />
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
