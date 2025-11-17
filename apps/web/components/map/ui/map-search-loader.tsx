/**
 * MapSearchLoader - Overlay Loading Component for AI Search
 *
 * Displays over the map while AI search processes and markers load.
 * Shows progress stages: searching, moving map, loading markers.
 *
 * FEATURES:
 * - Semi-transparent overlay (doesn't block map view completely)
 * - Animated spinner with map icon
 * - Stage-based messaging (Searching → Moving → Loading markers)
 * - Smooth fade in/out with Motion
 * - Positioned over map (doesn't cover navbar)
 *
 * USAGE:
 * <MapSearchLoader isLoading={isSearching} stage="searching" />
 */

"use client";

import { Loader, Map, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type SearchStage = "searching" | "moving" | "loading-markers" | "complete";

interface MapSearchLoaderProps {
  isLoading: boolean;
  stage?: SearchStage;
  resultCount?: number;
}

const STAGE_MESSAGES: Record<SearchStage, string> = {
  searching: "Buscando propiedades...",
  moving: "Moviendo mapa a ubicación...",
  "loading-markers": "Cargando propiedades en el mapa...",
  complete: "¡Listo!",
};

const STAGE_ICONS: Record<SearchStage, React.ReactNode> = {
  searching: <Loader className="w-5 h-5 animate-spin" />,
  moving: <Map className="w-5 h-5 animate-pulse" />,
  "loading-markers": <MapPin className="w-5 h-5 animate-bounce" />,
  complete: <MapPin className="w-5 h-5" />,
};

export function MapSearchLoader({
  isLoading,
  stage = "searching",
  resultCount,
}: MapSearchLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none"
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-oslo-gray-900/60 backdrop-blur-sm" />

          {/* Loader Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-oslo-gray-800/90 backdrop-blur-md border border-oslo-gray-700 rounded-2xl shadow-2xl px-8 py-6 min-w-[280px]"
          >
            {/* Icon Container */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-14 h-14">
                {/* Pulsing background ring */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                  {STAGE_ICONS[stage]}
                </div>
              </div>
            </div>

            {/* Message */}
            <motion.p
              key={stage} // Re-animate on stage change
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white font-medium text-base mb-1"
            >
              {STAGE_MESSAGES[stage]}
            </motion.p>

            {/* Result Count (optional) */}
            {resultCount !== undefined && resultCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center text-oslo-gray-400 text-sm"
              >
                {resultCount}{" "}
                {resultCount === 1
                  ? "propiedad encontrada"
                  : "propiedades encontradas"}
              </motion.p>
            )}

            {/* Loading bar */}
            <div className="mt-4 w-full h-1 bg-oslo-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
