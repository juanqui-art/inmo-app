/**
 * PropertyPopupCompact - Compact Popup Version
 *
 * Minimal property card for mobile/small screens
 * Complements the full PropertyCardHorizontal for responsive design
 *
 * FEATURES:
 * - Small width (260px)
 * - Essential information only
 * - Image thumbnail
 * - Price and transaction type
 * - Quick action buttons
 * - "View Details" CTA
 */

"use client";

import { Bed, Bath, Maximize2, MapPin, Heart } from "lucide-react";
import type { MapProperty } from "./map-view";

interface PropertyPopupCompactProps {
  property: MapProperty;
  onViewDetails: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
}

export function PropertyPopupCompact({
  property,
  onViewDetails,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyPopupCompactProps) {
  // Get first image or use placeholder
  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]?.url ?? "/images/property-placeholder.jpg"
      : "/images/property-placeholder.jpg";

  // Format price
  const formattedPrice = property.price.toLocaleString("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const badgeColor =
    property.transactionType === "SALE"
      ? "bg-blue-500 text-white"
      : "bg-emerald-500 text-white";

  const badgeLabel =
    property.transactionType === "SALE" ? "En Venta" : "En Alquiler";

  return (
    <div className="w-64 bg-white dark:bg-oslo-gray-900 rounded-lg overflow-hidden shadow-lg">
      {/* Image */}
      <div className="relative h-32 bg-oslo-gray-200 dark:bg-oslo-gray-800">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Transaction Type Badge */}
        <div className={`absolute bottom-2 left-2 ${badgeColor} px-2 py-1 rounded text-xs font-semibold`}>
          {badgeLabel}
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-oslo-gray-800/90 text-oslo-gray-900 dark:text-oslo-gray-50 px-2 py-1 rounded text-xs font-bold">
          {formattedPrice}
        </div>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            onClick={() => onFavoriteToggle(property.id)}
            className="absolute top-2 right-2 bg-white/20 dark:bg-oslo-gray-800/40 rounded-full p-1.5 hover:bg-white/30 dark:hover:bg-oslo-gray-800/60 transition-colors backdrop-blur-sm"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm text-oslo-gray-900 dark:text-oslo-gray-50 line-clamp-2">
          {property.title}
        </h3>

        {/* Location */}
        {(property.city || property.state) && (
          <div className="flex items-center gap-1 text-xs text-oslo-gray-600 dark:text-oslo-gray-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>
              {property.city && property.state
                ? `${property.city}, ${property.state}`
                : property.city || property.state}
            </span>
          </div>
        )}

        {/* Features Grid */}
        <div className="flex gap-3 py-2 border-y border-oslo-gray-200 dark:border-oslo-gray-700">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-oslo-gray-500 dark:text-oslo-gray-400" />
              <span className="text-xs font-medium text-oslo-gray-700 dark:text-oslo-gray-300">
                {property.bedrooms}
              </span>
            </div>
          )}

          {property.bathrooms !== null &&
            property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-oslo-gray-500 dark:text-oslo-gray-400" />
                <span className="text-xs font-medium text-oslo-gray-700 dark:text-oslo-gray-300">
                  {Math.floor(property.bathrooms)}
                </span>
              </div>
            )}

          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4 text-oslo-gray-500 dark:text-oslo-gray-400" />
              <span className="text-xs font-medium text-oslo-gray-700 dark:text-oslo-gray-300">
                {Math.round(property.area)} m²
              </span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded font-semibold text-sm transition-colors"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
