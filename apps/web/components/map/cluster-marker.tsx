/**
 * ClusterMarker - Cluster Display Component
 *
 * PATTERN: Custom marker showing grouped properties
 *
 * FEATURES:
 * - Shows property count in cluster
 * - Color gradient based on cluster size
 * - Size scales with count
 * - Click to expand cluster (zoom in)
 * - Hover effect
 *
 * SIZE SCALING:
 * - Small (2-5): 32px, blue-400
 * - Medium (6-10): 40px, blue-500
 * - Large (11-25): 48px, blue-600
 * - XLarge (25+): 56px, blue-700
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
      };
    }
  }

  // Fallback (should never reach here due to XLARGE having POSITIVE_INFINITY)
  return {
    size: CLUSTER_SIZE_THRESHOLDS.XLARGE.size,
    color: CLUSTER_SIZE_THRESHOLDS.XLARGE.colorClass,
    textSize: CLUSTER_SIZE_THRESHOLDS.XLARGE.textSize,
    ringColor: CLUSTER_SIZE_THRESHOLDS.XLARGE.ringClass,
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
        {/* Cluster Circle */}
        <div
          className={`
            w-full h-full
            ${style.color}
            rounded-full
            flex items-center justify-center
            shadow-lg
            transition-all duration-200
            hover:scale-110 hover:shadow-xl
            ring-4 ${style.ringColor}
            border-2 border-white dark:border-oslo-gray-800
          `}
        >
          <span
            className={`
              ${style.textSize}
              font-bold
              text-white
              select-none
            `}
          >
            {pointCount}
          </span>
        </div>

        {/* Pulse Animation on Hover */}
        <div
          className={`
            absolute inset-0
            ${style.color}
            rounded-full
            opacity-0 group-hover:opacity-30
            animate-ping
            pointer-events-none
          `}
        />
      </div>
    </Marker>
  );
}
