/**
 * PropertyPopup Component
 *
 * Displays a MapBox GL popup with property details
 * Shown when a property marker is clicked on the map
 *
 * FEATURES:
 * - Uses enhanced PropertyCardHorizontal for full details
 * - Shows property image with dark overlay
 * - Displays transaction type, category, price
 * - Social actions (like, share)
 * - Property features (beds, baths, area)
 * - "View Details" CTA button
 * - Close button (X) to dismiss popup
 * - Persistent favorites via useFavorites hook
 *
 * VARIANTS:
 * - "full" (default): Complete horizontal card with all features
 * - "compact": Minimal compact version for mobile
 *
 * USAGE:
 * <PropertyPopup
 *   property={selectedProperty}
 *   onClose={handleClose}
 *   onViewDetails={handleViewDetails}
 *   variant="full"
 * />
 */

"use client";

import { Popup } from "react-map-gl/mapbox";
import { X } from "lucide-react";
import type { MapProperty } from "./map-view";
import { PropertyCardHorizontal } from "./property-card-horizontal";
import { PropertyPopupCompact } from "./property-popup-compact";

type PopupVariant = "full" | "compact";

interface PropertyPopupProps {
  /** Property data to display */
  property: MapProperty;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Callback when "View Details" button is clicked */
  onViewDetails: () => void;
  /** Popup variant: "full" for horizontal card, "compact" for minimal */
  variant?: PopupVariant;
  /** Whether user is authenticated (for auth modals) */
  isAuthenticated?: boolean;
  /** Callback when unauthenticated user tries to favorite */
  onUnauthenticatedFavoriteClick?: (propertyId: string) => void;
}

export function PropertyPopup({
  property,
  onClose,
  onViewDetails,
  variant = "full",
  isAuthenticated = false,
  onUnauthenticatedFavoriteClick,
}: PropertyPopupProps) {
  // Guard against missing coordinates
  if (!property.latitude || !property.longitude) {
    return null;
  }

  // Render compact version for mobile/small screens
  if (variant === "compact") {
    return (
      <Popup
        longitude={property.longitude}
        latitude={property.latitude}
        closeButton={false}
        className="property-popup-compact"
        offset={[0, -10]}
        maxWidth="none"
      >
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white dark:bg-oslo-gray-800 rounded-full p-1 shadow-md hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-700 transition-colors z-10"
            aria-label="Close popup"
          >
            <X className="w-4 h-4 text-oslo-gray-900 dark:text-oslo-gray-50" />
          </button>
          <PropertyPopupCompact
            property={property}
            onViewDetails={onViewDetails}
          />
        </div>
      </Popup>
    );
  }

  // Render full horizontal card version
  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      closeButton={false}
      className="property-popup-full"
      offset={[0, -20]}
      closeOnClick={false}
      maxWidth="none"
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 bg-white/20 dark:bg-oslo-gray-800/40 rounded-full p-2 shadow-md hover:bg-white/30 dark:hover:bg-oslo-gray-800/60 transition-colors z-10 backdrop-blur-sm border border-white/30"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* PropertyCardHorizontal */}
        <PropertyCardHorizontal
          property={property}
          onViewDetails={onViewDetails}
          isAuthenticated={isAuthenticated}
          onFavoriteClick={onUnauthenticatedFavoriteClick}
        />
      </div>
    </Popup>
  );
}
