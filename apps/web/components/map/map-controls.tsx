"use client";

import { cn } from "@repo/ui";
import { useMap } from "@vis.gl/react-google-maps";
import { Layers, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function MapControls() {
  const map = useMap();
  const [mapTypeId, setMapTypeId] = useState<string>("roadmap");

  // Sync state with map
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("maptypeid_changed", () => {
      setMapTypeId(map.getMapTypeId() || "roadmap");
    });
    return () => listener.remove();
  }, [map]);

  const handleZoom = useCallback(
    (delta: number) => {
      if (!map) return;
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom + delta);
    },
    [map]
  );

  const toggleMapType = useCallback(() => {
    if (!map) return;
    const newType = mapTypeId === "roadmap" ? "satellite" : "roadmap";
    map.setMapTypeId(newType);
  }, [map, mapTypeId]);

  const buttonClass =
    "flex items-center justify-center w-9 h-9 rounded-full shadow-md border transition-all duration-200 backdrop-blur-xl bg-white/90 text-oslo-gray-700 border-oslo-gray-200 hover:bg-white dark:bg-black/60 dark:text-gray-200 dark:border-white/10 dark:hover:bg-black/80 dark:hover:border-white/20";

  return (
    <>
      {/* Top Right - Map Type Toggle */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleMapType}
          className={cn(buttonClass)}
          title="Cambiar tipo de mapa"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Right - Zoom Controls */}
      <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-2">
        <button
           onClick={() => handleZoom(1)}
           className={cn(buttonClass)}
           title="Acercar"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
           onClick={() => handleZoom(-1)}
           className={cn(buttonClass)}
           title="Alejar"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
