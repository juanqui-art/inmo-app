"use client";

import { env } from "@repo/env";
import { Home } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { MapSpinner } from "./map-spinner";

interface ModalMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export function ModalMap({ latitude, longitude, title }: ModalMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Check for Mapbox token
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl border border-border">
        <p className="text-muted-foreground text-sm">Mapa no disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-border/50 shadow-sm">
      {!isMapLoaded && <MapSpinner />}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude,
          longitude,
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        onLoad={() => setIsMapLoaded(true)}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        
        <Marker 
            latitude={latitude} 
            longitude={longitude} 
            anchor="bottom"
        >
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-xl transform transition-transform hover:scale-110 border-2 border-background/20">
                        <Home className="h-5 w-5 fill-current" />
                    </div>
                     <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45 transform origin-center" />
                    
                     {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {title}
                    </div>
                </div>
            </div>
        </Marker>
      </Map>
    </div>
  );
}
