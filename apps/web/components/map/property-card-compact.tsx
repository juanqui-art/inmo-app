/**
 * PropertyCardCompact - Compact Property Card for Map List
 *
 * Horizontal card layout optimized for carousel view
 * Displays essential property info without images
 *
 * FEATURES:
 * - Compact horizontal layout
 * - Transaction type badge (SALE/RENT)
 * - Essential specs (bed, bath, area)
 * - Hover effects
 * - Click to view details
 *
 * USAGE:
 * <PropertyCardCompact
 *   property={property}
 *   onHover={() => highlightMarker(property.id)}
 *   onClick={() => viewDetails(property.id)}
 * />
 */

"use client";

import { Bed, Bath, Maximize2, MapPin } from "lucide-react";
import { Badge } from "@repo/ui";
import type { MapProperty } from "./map-view";
import {
  formatPropertyPrice,
  getTransactionBadgeStyle,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/utils/property-formatters";

interface PropertyCardCompactProps {
  property: MapProperty;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

export function PropertyCardCompact({
  property,
  onHover,
  onLeave,
  onClick,
}: PropertyCardCompactProps) {
  // Format price using centralized utility
  const formattedPrice = formatPropertyPrice(property.price);

  // Get transaction badge style using centralized utility
  const transactionBadgeStyle = getTransactionBadgeStyle(
    property.transactionType,
  );

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="flex-shrink-0 w-[280px] h-full bg-white dark:bg-oslo-gray-900 border border-oslo-gray-300 dark:border-oslo-gray-700 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-black/20 hover:border-oslo-gray-400 dark:hover:border-oslo-gray-600 hover:-translate-y-0.5"
    >
      {/* Header: Price + Badge */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-lg font-bold text-oslo-gray-900 dark:text-oslo-gray-50">
            {formattedPrice}
          </p>
          <Badge className={transactionBadgeStyle}>
            {TRANSACTION_TYPE_LABELS[property.transactionType]}
          </Badge>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-oslo-gray-800 dark:text-oslo-gray-50 mb-2 line-clamp-2">
        {property.title}
      </h3>

      {/* Location */}
      {(property.city || property.state) && (
        <div className="flex items-center gap-1 text-xs text-oslo-gray-600 dark:text-oslo-gray-300 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="truncate">
            {[property.city, property.state].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Specs */}
      <div className="flex items-center gap-4 text-xs text-oslo-gray-600 dark:text-oslo-gray-300">
        {Number(property.bedrooms) > 0 && (
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
        )}
        {Number(property.bathrooms) > 0 && (
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{Number(property.bathrooms)}</span>
          </div>
        )}
        {Number(property.area) > 0 && (
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4" />
            <span>{Number(property.area)}m²</span>
          </div>
        )}
      </div>
    </div>
  );
}
