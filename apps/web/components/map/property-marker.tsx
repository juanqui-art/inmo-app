/**
 * PropertyMarker - Map Marker for Properties
 *
 * PATTERN: Custom Marker with Glassmorphism
 *
 * FEATURES:
 * - Shows property price
 * - Color coded by transaction type (SALE: blue, RENT: green)
 * - Hover effect
 * - Click handler for future popup
 */

"use client";

import { Marker } from "react-map-gl/mapbox";
import type { TransactionType } from "@repo/database";

interface PropertyMarkerProps {
  latitude: number;
  longitude: number;
  price: number;
  transactionType: TransactionType;
  onClick?: () => void;
}

export function PropertyMarker({
  latitude,
  longitude,
  price,
  transactionType,
  onClick,
}: PropertyMarkerProps) {
  /**
   * Format price for display
   */
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(price);

  /**
   * Color based on transaction type
   */
  const markerColor = transactionType === "SALE" ? "#3b82f6" : "#10b981"; // blue-500 : green-500

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      onClick={(e) => {
        // Prevent map from also handling click
        e.originalEvent.stopPropagation();
        onClick?.();
      }}
    >
      <div
        className="property-marker group cursor-pointer"
        style={{
          // @ts-ignore - CSS custom property
          "--marker-color": markerColor,
        }}
      >
        {/* Price Badge */}
        <div className="px-3 py-1.5 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-full border-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
          style={{
            borderColor: markerColor,
          }}
        >
          <span className="text-sm font-bold text-oslo-gray-900 dark:text-oslo-gray-50">
            {formattedPrice}
          </span>
        </div>

        {/* Pointer Triangle */}
        <div
          className="w-0 h-0 mx-auto mt-[-1px]"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `8px solid ${markerColor}`,
          }}
        />
      </div>
    </Marker>
  );
}
