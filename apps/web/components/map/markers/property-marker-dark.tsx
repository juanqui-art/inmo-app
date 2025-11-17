/**
 * PropertyMarkerDark - Modern Dark Theme Marker
 *
 * PATTERN: Glassmorphism with Home Icon
 *
 * DESIGN PHILOSOPHY:
 * - Bold, modern appearance with glassmorphism effects
 * - Elevated price badge above the pin
 * - Circular pin with gradient and icon
 * - Realistic shadow on ground
 * - Smooth hover animations
 *
 * FEATURES:
 * - Color-coded by transaction type (SALE: blue, RENT: green)
 * - Icon changes based on property type (optional)
 * - Hover scale and shadow effects
 * - Dark theme optimized
 * - Accessibility support
 *
 * COLOR SCHEME:
 * - SALE: blue gradient (blue-400 → blue-600)
 * - RENT: green gradient (green-400 → green-600)
 */

"use client";

import type { TransactionType } from "@repo/database";
import { Marker } from "react-map-gl/mapbox";

interface PropertyMarkerDarkProps {
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
        pinFrom: "from-indigo-400",
        pinTo: "to-indigo-600",
        pinHoverFrom: "group-hover:from-indigo-300",
        pinHoverTo: "group-hover:to-indigo-500",
        pointerColor: "border-t-blue-600",
        pointerHoverColor: "group-hover:border-t-blue-500",
        shadowColor: "shadow-indigo-500/30",
        shadowHoverColor: "group-hover:shadow-indigo-500/50",
      }
    : {
        pinFrom: "from-emerald-400",
        pinTo: "to-emerald-600",
        pinHoverFrom: "group-hover:from-emerald-300",
        pinHoverTo: "group-hover:to-emerald-500",
        pointerColor: "border-t-emerald-600",
        pointerHoverColor: "group-hover:border-t-emerald-500",
        shadowColor: "shadow-emerald-500/30",
        shadowHoverColor: "group-hover:shadow-emerald-500/50",
      };
}

export function PropertyMarkerDark({
  latitude,
  longitude,
  price,
  transactionType,
  onClick,
  isHighlighted = false,
}: PropertyMarkerDarkProps) {
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
          {/* Price Badge */}
          <div
            className={`mb-1 rounded-xl bg-slate-800 px-3 py-2 shadow-xl ring-1 ring-slate-700/50 transition-all duration-300 ${
              isHighlighted
                ? "scale-125 shadow-2xl ring-2"
                : "group-hover:bg-slate-700 group-hover:shadow-2xl group-hover:ring-slate-600/50"
            }`}
          >
            <span className="text-sm font-bold tracking-tight text-slate-50">
              {price}
            </span>
          </div>

          {/* Pin Circle */}
          {/*<div*/}
          {/*  className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${colors.pinFrom} ${colors.pinTo} shadow-xl ring-4 ring-slate-800 transition-all duration-300 ${colors.pinHoverFrom} ${colors.pinHoverTo} group-hover:shadow-2xl group-hover:ring-slate-700`}*/}
          {/*>*/}
          {/*  <Home className="h-6 w-6 text-white drop-shadow-md" />*/}
          {/*</div>*/}

          {/* Pointer Triangle (Pin Tip) */}
          <div
            className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent ${colors.pointerColor} transition-all duration-300 ${colors.pointerHoverColor}`}
          />
        </div>

        {/* Ground Shadow */}
        <div
          className={`mt-3 h-2 w-10 rounded-full bg-black/30 blur-md transition-all duration-300 ${
            isHighlighted
              ? "w-12 bg-black/40"
              : "group-hover:w-12 group-hover:bg-black/40"
          }`}
        />
      </div>
    </Marker>
  );
}
