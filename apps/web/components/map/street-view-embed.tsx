"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapSpinner } from "./map-spinner";

interface StreetViewEmbedProps {
  latitude: number;
  longitude: number;
  onClose?: () => void;
  apiKey?: string;
}

function StreetViewContent({ latitude, longitude, onClose }: StreetViewEmbedProps) {
  const streetViewLib = useMapsLibrary("streetView");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streetViewLib || !streetViewRef.current) return;

    const sv = new streetViewLib.StreetViewService();
    
    // Check availability
    sv.getPanorama({ location: { lat: latitude, lng: longitude }, radius: 50 })
      .then(({ data }) => {
        const location = data.location;
        if (location) {
          setIsAvailable(true);
          // Initialize Panorama
          new streetViewLib.StreetViewPanorama(streetViewRef.current!, {
             position: { lat: latitude, lng: longitude },
             visible: true,
             disableDefaultUI: true,
             enableCloseButton: false,
             addressControl: false,
             zoomControl: true,
             panControl: true,
             showRoadLabels: false,
          });
        } else {
          setIsAvailable(false);
        }
      })
      .catch((err) => {
        console.warn("[StreetView] Availability check failed:", err);
        setIsAvailable(false)
      });
  }, [streetViewLib, latitude, longitude]);

  if (isAvailable === false) {
    return (
      <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">Street View no disponible en esta ubicación</p>
        {onClose && (
            <button onClick={onClose} className="mt-4 text-primary text-sm hover:underline">
                Volver al mapa
            </button>
        )}
      </div>
    );
  }

  // While checking availability or loading library, we show interaction UI but empty container
  // The MapSpinner is handled by parent or could be added here if isAvailable is null
  if (isAvailable === null) return <MapSpinner />;

  return (
    <div className="relative w-full h-full">
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
        )}
      <div ref={streetViewRef} className="w-full h-full" />
    </div>
  );
}

export function StreetViewEmbed(props: StreetViewEmbedProps) {
  const googleMapsApiKey = props.apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  if (!googleMapsApiKey) {
     return (
        <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4 text-center">
            <p className="text-muted-foreground mb-2">Google Maps API Key no configurada</p>
            <p className="text-xs text-muted-foreground/60">Agrega NEXT_PUBLIC_GOOGLE_MAPS_KEY a tu archivo .env</p>
        </div>
     )
  }

  return (
    <APIProvider apiKey={googleMapsApiKey}>
      <StreetViewContent {...props} />
    </APIProvider>
  );
}
