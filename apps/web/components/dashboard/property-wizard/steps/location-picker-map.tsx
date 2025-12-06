"use client";

import { env } from "@repo/env";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Map, { GeolocateControl, MapRef, Marker, NavigationControl } from "react-map-gl/mapbox";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationPickerMap({ latitude, longitude, onLocationSelect }: LocationPickerMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    latitude: latitude || -2.9,
    longitude: longitude || -79.0,
    zoom: 13,
  });

  // Update view state if props change significantly (e.g. initial load or external update)
  useEffect(() => {
    if (latitude && longitude) {
      setViewState(prev => ({
        ...prev,
        latitude,
        longitude
      }));
    }
  }, [latitude, longitude]);

  const handleMapClick = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  const handleMarkerDragEnd = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center rounded-md border border-red-200">
        <p className="text-red-600 dark:text-red-400">
          Error: Mapbox token no configurado
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-md overflow-hidden border border-input relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        <Marker
          latitude={latitude || viewState.latitude}
          longitude={longitude || viewState.longitude}
          draggable
          onDragEnd={handleMarkerDragEnd}
          anchor="bottom"
        >
          <div className="text-primary drop-shadow-lg cursor-pointer hover:scale-110 transition-transform">
             <MapPin className="w-10 h-10 fill-primary text-primary-foreground" />
          </div>
        </Marker>
      </Map>
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur px-3 py-1.5 rounded-md text-xs shadow-sm border">
        Haz clic o arrastra el marcador para ajustar la ubicación
      </div>
    </div>
  );
}
