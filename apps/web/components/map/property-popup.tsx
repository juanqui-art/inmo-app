/**
 * PropertyPopup Component
 *
 * Displays a MapBox GL popup with property details
 * Shown when a property marker is clicked on the map
 *
 * FEATURES:
 * - Shows property image (first image if available)
 * - Displays property title and price
 * - Shows bedrooms and bathrooms count
 * - "View Details" button for navigation
 * - Close button (X) to dismiss popup
 *
 * USAGE:
 * <PropertyPopup
 *   property={selectedProperty}
 *   onClose={handleClose}
 *   onViewDetails={handleViewDetails}
 * />
 */

"use client";

import { Popup } from "react-map-gl/mapbox";
import { X, Bed, Bath } from "lucide-react";
import type { MapProperty } from "./map-view";

interface PropertyPopupProps {
  /** Property data to display */
  property: MapProperty;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Callback when "View Details" button is clicked */
  onViewDetails: () => void;
}

export function PropertyPopup({
  property,
  onClose,
  onViewDetails,
}: PropertyPopupProps) {
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

  // Guard against missing coordinates
  if (!property.latitude || !property.longitude) {
    return null;
  }

  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      closeButton={false}
      className="property-popup"
      offset={[0, -10]}
    >
      <div className="w-64 bg-white dark:bg-oslo-gray-900 rounded-lg overflow-hidden shadow-lg">
        {/* Image */}
        <div className="relative h-32 bg-oslo-gray-200 dark:bg-oslo-gray-800">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white dark:bg-oslo-gray-800 rounded-full p-1 shadow-md hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-700 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-4 h-4 text-oslo-gray-900 dark:text-oslo-gray-50" />
          </button>

          {/* Transaction Type Badge */}
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
            {property.transactionType === "SALE" ? "Venta" : "Arriendo"}
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            {formattedPrice}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-sm text-oslo-gray-900 dark:text-oslo-gray-50 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          {(property.city || property.state) && (
            <p className="text-xs text-oslo-gray-600 dark:text-oslo-gray-400">
              {property.city && property.state
                ? `${property.city}, ${property.state}`
                : property.city || property.state}
            </p>
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
              <div className="text-xs text-oslo-gray-700 dark:text-oslo-gray-300 font-medium">
                {Math.round(property.area)} m²
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={onViewDetails}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-sm transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </Popup>
  );
}
