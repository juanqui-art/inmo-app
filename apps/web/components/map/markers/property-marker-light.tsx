/**
 * PropertyMarkerLight - Subtle Light Theme Marker
 *
 * PATTERN: Clean design with colored borders
 *
 * DESIGN PHILOSOPHY:
 * - Professional, subtle appearance
 * - Colored border indicates transaction type
 * - Minimal icon with glassmorphism background
 * - Works well on both light and dark maps
 * - Elegant, refined aesthetic
 *
 * FEATURES:
 * - Color-coded border by transaction type
 * - Soft shadow effects
 * - Smooth hover transitions
 * - Light mode optimized but works on dark maps
 * - Clean typography
 *
 * COLOR SCHEME:
 * - SALE: blue border (blue-500)
 * - RENT: emerald border (emerald-500)
 */

"use client";

import type { TransactionType } from "@repo/database";
import { Home } from "lucide-react";
import { Marker } from "react-map-gl/mapbox";

interface PropertyMarkerLightProps {
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
        borderColor: "border-indigo-500",
        borderHoverColor: "group-hover:border-indigo-600",
        iconBg: "bg-indigo-50 dark:bg-indigo-950/50",
        iconHoverBg: "group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900",
        iconColor: "text-indigo-600",
        shadowColor: "shadow-indigo-500/10",
        shadowHoverColor: "group-hover:shadow-indigo-500/20",
      }
    : {
        borderColor: "border-emerald-500",
        borderHoverColor: "group-hover:border-emerald-600",
        iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
        iconHoverBg:
          "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900",
        iconColor: "text-emerald-600",
        shadowColor: "shadow-emerald-500/10",
        shadowHoverColor: "group-hover:shadow-emerald-500/20",
      };
}

export function PropertyMarkerLight({
  latitude,
  longitude,
  price,
  transactionType,
  onClick,
  isHighlighted = false,
}: PropertyMarkerLightProps) {
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
            className={`mb-2 rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-sm transition-all duration-300 border-2 ${colors.borderColor} ${colors.borderHoverColor} shadow-md ${colors.shadowColor} ${colors.shadowHoverColor} ${
              isHighlighted ? "scale-125 shadow-lg" : "group-hover:shadow-lg"
            }`}
          >
            <span className="text-slate-900 dark:text-slate-50">{price}</span>
          </div>

          {/* Pin with Icon */}
          <div
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 ${colors.borderColor} ${colors.borderHoverColor} ${colors.iconBg} ${colors.iconHoverBg} shadow-md ${colors.shadowColor} ${colors.shadowHoverColor} transition-all duration-300 ${
              isHighlighted ? "scale-125 shadow-lg" : ""
            }`}
          >
            <Home className={`h-5 w-5 ${colors.iconColor}`} />
          </div>

          {/* Pointer Triangle (Pin Tip) */}
          <div
            className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent transition-all duration-300 ${colors.borderColor} ${colors.borderHoverColor}`}
            style={{
              borderTopColor:
                transactionType === "SALE" ? "#3b82f6" : "#10b981",
            }}
          />
        </div>

        {/* Ground Shadow */}
        <div
          className={`mt-2.5 h-1.5 w-8 rounded-full bg-black/20 blur-sm transition-all duration-300 ${
            isHighlighted
              ? "w-10 bg-black/30"
              : "group-hover:w-10 group-hover:bg-black/30"
          }`}
        />
      </div>
    </Marker>
  );
}
