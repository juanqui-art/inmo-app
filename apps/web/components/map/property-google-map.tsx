"use client";

import { env } from "@repo/env";
import { APIProvider, AdvancedMarker, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MapControls } from "./map-controls";
import { MapFilterChips } from "./map-filter-chips";
import { MapMarker } from "./map-marker";
import { MapSpinner } from "./map-spinner";
import { PlaceMarker, type PlaceCategory } from "./place-marker";

interface PropertyGoogleMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

interface PlaceResult {
  id: string; // generated unique id
  name: string;
  lat: number;
  lng: number;
  type: PlaceCategory;
  rating?: number;
}

const DARK_MAP_ID = "9d7d97491368ac447579fd7f";
const LIGHT_MAP_ID = "DEMO_MAP_ID";

export function PropertyGoogleMap({ latitude, longitude, title }: PropertyGoogleMapProps) {
  const googleMapsKey = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const { resolvedTheme } = useTheme(); // Use resolvedTheme to handle 'system' preference correctly
  const [mounted, setMounted] = useState(false);
  
  // State for places
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | null>(null);
  const [placesCache, setPlacesCache] = useState<Record<string, PlaceResult[]>>({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!googleMapsKey) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl border border-border">
        <p className="text-muted-foreground text-sm">Google Maps API Key no configurada</p>
      </div>
    );
  }

  // Correctly detect dark mode even when theme is 'system'
  const isDark = mounted && (resolvedTheme === 'dark');
  const mapId = isDark ? DARK_MAP_ID : LIGHT_MAP_ID;

  return (
    <div className="space-y-4">
      <div className="w-full h-[500px] relative rounded-xl overflow-hidden border border-border/50 shadow-sm bg-gray-100 dark:bg-gray-800">
        {!isMapLoaded && <MapSpinner />}
        
        <APIProvider 
          apiKey={googleMapsKey}
          libraries={['places']}
          onLoad={() => setIsMapLoaded(true)}
        >
          <Map
            key={mapId} // Force remount when mapId changes to ensure style application
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
            mapId={mapId} 
            disableDefaultUI={true}
            gestureHandling={'cooperative'}
            className="w-full h-full"
            renderingType={'VECTOR'}
            colorScheme={isDark ? 'DARK' : 'LIGHT'}
          >
             {/* Main Property Marker */}
            <AdvancedMarker position={{ lat: latitude, lng: longitude }} title={title} zIndex={100}>
               <MapMarker />
            </AdvancedMarker>

            {/* Places Logic & Markers */}
            <PlacesManager 
                latitude={latitude} 
                longitude={longitude} 
                activeCategory={activeCategory}
                placesCache={placesCache}
                setPlacesCache={setPlacesCache}
            />

            {/* Custom Controls inside Map Context */}
            <MapControls />

          </Map>
          
          {/* Filter Chips (Outside Map Context but positioned absolutely) */}
          <MapFilterChips 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
        </APIProvider>
      </div>
    </div>
  );
}

// Internal component to handle Places API logic inside the Map context
function PlacesManager({ 
    latitude, 
    longitude, 
    activeCategory, 
    placesCache, 
    setPlacesCache 
}: { 
    latitude: number; 
    longitude: number; 
    activeCategory: PlaceCategory | null;
    placesCache: Record<string, PlaceResult[]>;
    setPlacesCache: React.Dispatch<React.SetStateAction<Record<string, PlaceResult[]>>>;
}) {
    const map = useMap();
    const placesLib = useMapsLibrary("places");
    
    useEffect(() => {
        if (!placesLib || !map || !activeCategory) return;
        
        // If already cached, don't fetch
        if (placesCache[activeCategory]) return;

        const service = new placesLib.PlacesService(map);
        const center = new google.maps.LatLng(latitude, longitude);
        
        const request = {
            location: center,
            radius: 1200, // Slightly larger radius for map view
            type: activeCategory
        };

        service.nearbySearch(request, (results, status) => {
            if (status === placesLib.PlacesServiceStatus.OK && results) {
                const mappedResults: PlaceResult[] = results.map((p, i) => ({
                    id: `${activeCategory}-${i}`,
                    name: p.name || "",
                    lat: p.geometry?.location?.lat() || 0,
                    lng: p.geometry?.location?.lng() || 0,
                    type: activeCategory,
                    rating: p.rating
                })).slice(0, 10); // Limit to top 10 to avoid clutter

                setPlacesCache((prev: Record<string, PlaceResult[]>) => {
                  const newState: Record<string, PlaceResult[]> = { ...prev, [activeCategory]: mappedResults };
                  return newState;
                });
            }
        });

    }, [placesLib, map, activeCategory, latitude, longitude, placesCache, setPlacesCache]);

    // Render Markers for active category
    if (!activeCategory || !placesCache[activeCategory]) return null;

    return (
        <>
            {placesCache[activeCategory].map(place => (
                <AdvancedMarker 
                    key={place.id}
                    position={{ lat: place.lat, lng: place.lng }}
                    title={place.name}
                    zIndex={50}
                >
                    <PlaceMarker type={place.type} />
                </AdvancedMarker>
            ))}
        </>
    );
}
