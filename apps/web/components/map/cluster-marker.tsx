/**
 * ClusterMarker - Cluster Display Component
 *
 * PATTERN: Custom marker showing grouped properties
 *
 * DESIGN: Glassmorphism Elegante
 * - Fondo translúcido con blur effect
 * - Gradientes sutiles (cyan → pink según tamaño)
 * - Borde delgado white/40
 * - Sombras coloreadas multicapa
 * - Hover: backdrop-brightness mejorado
 *
 * FEATURES:
 * - Shows property count in cluster
 * - Color gradient based on cluster size
 * - Size scales with count
 * - Click to expand cluster (zoom in)
 * - Smooth hover effect
 *
 * SIZE SCALING:
 * - Small (2-5): 32px, cyan→blue gradient translúcido
 * - Medium (6-10): 40px, blue→indigo gradient translúcido
 * - Large (11-25): 48px, purple→fuchsia gradient translúcido
 * - XLarge (25+): 56px, pink→rose gradient translúcido
 */

"use client";

import { Marker } from "react-map-gl/mapbox";
import { CLUSTER_SIZE_THRESHOLDS } from "@/lib/types/map";

interface ClusterMarkerProps {
  latitude: number;
  longitude: number;
  pointCount: number;
  onClick?: () => void;
}

/**
 * Get cluster size configuration based on point count
 */
function getClusterStyle(pointCount: number) {
  const thresholds = [
    CLUSTER_SIZE_THRESHOLDS.SMALL,
    CLUSTER_SIZE_THRESHOLDS.MEDIUM,
    CLUSTER_SIZE_THRESHOLDS.LARGE,
    CLUSTER_SIZE_THRESHOLDS.XLARGE,
  ];

  for (const threshold of thresholds) {
    if (pointCount <= threshold.maxPoints) {
      return {
        size: threshold.size,
        color: threshold.colorClass,
        textSize: threshold.textSize,
        ringColor: threshold.ringClass,
        glass: threshold.glassClass,
        shadow: threshold.shadowClass,
      };
    }
  }

  // Fallback (should never reach here due to XLARGE having POSITIVE_INFINITY)
  const xlarge = CLUSTER_SIZE_THRESHOLDS.XLARGE;
  return {
    size: xlarge.size,
    color: xlarge.colorClass,
    textSize: xlarge.textSize,
    ringColor: xlarge.ringClass,
    glass: xlarge.glassClass,
    shadow: xlarge.shadowClass,
  };
}

export function ClusterMarker({
  latitude,
  longitude,
  pointCount,
  onClick,
}: ClusterMarkerProps) {
  const style = getClusterStyle(pointCount);

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      onClick={(e) => {
        // Prevent map from also handling click
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <div
        className="cluster-marker group cursor-pointer"
        style={{ width: style.size, height: style.size }}
      >
        {/* Glassmorphism Cluster Circle */}
        <div
          className={`
            w-full h-full
            ${style.color}
            ${style.glass}
            ${style.shadow}
            rounded-full
            flex items-center justify-center
            transition-all duration-300
            hover:backdrop-brightness-110 hover:shadow-2xl
            ring-1 ${style.ringColor}
          `}
        >
          {/* Text with shadow for legibility */}
          <span
            className={`
              ${style.textSize}
              font-bold
              text-white
              select-none
              drop-shadow-lg
            `}
          >
            {pointCount}
          </span>
        </div>

        {/* Subtle glow on hover */}
        <div
          className={`
            absolute inset-0
            rounded-full
            opacity-0 group-hover:opacity-20
            transition-opacity duration-300
            pointer-events-none
            bg-gradient-to-br ${style.color}
            blur-xl
          `}
        />
      </div>
    </Marker>
  );
}
