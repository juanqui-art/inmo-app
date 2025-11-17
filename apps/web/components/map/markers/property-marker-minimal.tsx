/**
 * PropertyMarkerMinimal - Compact Badge-Only Marker
 *
 * PATTERN: Clean minimal badge with pointer
 *
 * DESIGN PHILOSOPHY:
 * - Keeps visual clutter minimal on the map
 * - Badge-focused design for price clarity
 * - Subtle color indicator
 * - Great for dense property clusters
 * - Light and fast rendering
 *
 * FEATURES:
 * - Simple rounded badge with price
 * - Color-coded border by transaction type
 * - Minimal visual footprint
 * - Optimal for zoomed-out views
 *
 * COLOR SCHEME:
 * - SALE: blue border and effects
 * - RENT: emerald border and effects
 */

"use client";

import type { TransactionType } from "@repo/database";
import { Marker } from "react-map-gl/mapbox";

interface PropertyMarkerMinimalProps {
  latitude: number;
  longitude: number;
  price: string;
  transactionType: TransactionType;
  onClick?: () => void;
  isHighlighted?: boolean;
}

/**
 * Get color scheme based on transaction type
 */
function getColorScheme(transactionType: TransactionType) {
  return transactionType === "SALE"
    ? {
        borderColor: "#3b82f6",
        hoverBorderColor: "#2563eb",
        shadowColor: "shadow-indigo-500/20",
        hoverShadowColor: "group-hover:shadow-indigo-500/40",
      }
    : {
        borderColor: "#10b981",
        hoverBorderColor: "#059669",
        shadowColor: "shadow-emerald-500/20",
        hoverShadowColor: "group-hover:shadow-emerald-500/40",
      };
}

export function PropertyMarkerMinimal({
  latitude,
  longitude,
  price,
  transactionType,
  onClick,
  isHighlighted = false,
}: PropertyMarkerMinimalProps) {
  const colors = getColorScheme(transactionType);

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <div
        className="relative flex flex-col items-center"
        role="button"
        tabIndex={0}
        aria-label={`Property for ${transactionType === "SALE" ? "sale" : "rent"} - ${price}`}
      >
        {/* Pin main container */}
        <div
          className={`group relative cursor-pointer transition-all duration-300 ${
            isHighlighted ? "scale-110" : "hover:scale-110"
          }`}
        >
          {/* Price Badge - Minimal */}
          <div
            className={`px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full border-2 transition-all duration-200 shadow-md ${colors.shadowColor} ${colors.hoverShadowColor} ${
              isHighlighted
                ? "scale-125 shadow-xl ring-2 ring-offset-1 ring-offset-white/70 dark:ring-offset-slate-800/70"
                : "group-hover:shadow-lg"
            }`}
            style={{
              borderColor: colors.borderColor,
              ...(isHighlighted && {
                outlineColor: colors.borderColor,
              }),
            }}
          >
            <span className="text-xs font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">
              {price}
            </span>
          </div>

          {/* Pointer Triangle */}
          <div
            className="w-0 h-0 mx-auto mt-[-1px] transition-all duration-300 group-hover:brightness-90"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `8px solid ${colors.borderColor}`,
            }}
          />
        </div>

        {/* Ground Shadow */}
        <div
          className={`mt-3 h-2 w-8 rounded-full bg-black/25 blur-md transition-all duration-300 ${
            isHighlighted
              ? "w-10 bg-black/35"
              : "group-hover:w-10 group-hover:bg-black/35"
          }`}
        />
      </div>
    </Marker>
  );
}
