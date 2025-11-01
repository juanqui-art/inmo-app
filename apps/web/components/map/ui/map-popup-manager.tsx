/**
 * MapPopupManager - Isolated Popup + Auth State
 *
 * RESPONSIBILITY:
 * - Manage selectedPropertyId state
 * - Manage showAuthModal state
 * - Manage pendingPropertyId state
 * - Render PropertyPopup (conditional)
 * - Render AuthModal (conditional)
 * - Handle callbacks
 *
 * ISOLATION:
 * - State is LOCAL to this component
 * - Parent MapContainer does NOT re-render when state changes
 * - Only this component re-renders when popup state changes
 * - Prevents re-rendering Map/Layers when user clicks markers
 *
 * PROPS:
 * - properties: MapProperty[] - For looking up selected property
 * - isAuthenticated: boolean - For auth checks
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PropertyPopup } from "../property-popup";
import { AuthModal } from "@/components/auth/auth-modal";
import type { MapProperty } from "../map-view";

interface MapPopupManagerProps {
  properties: MapProperty[];
  isAuthenticated?: boolean;
  selectedPropertyId: string | null;
  onSelectedPropertyIdChange: (propertyId: string | null) => void;
}

/**
 * NOT MEMOIZED: This component manages its own state
 * Only re-renders when selectedPropertyId/showAuthModal changes
 * Parent MapContainer re-renders do NOT affect this
 */
export function MapPopupManager({
  properties,
  isAuthenticated = false,
  selectedPropertyId,
  onSelectedPropertyIdChange,
}: MapPopupManagerProps) {
  const router = useRouter();

  // ✅ LOCAL STATE: Only auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(null);

  /**
   * Get selected property for popup
   * O(n) lookup but acceptable (happens only when selectedPropertyId changes)
   */
  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId)
    : null;

  /**
   * Handle closing popup
   */
  const handleClosePopup = useCallback(() => {
    onSelectedPropertyIdChange(null);
  }, [onSelectedPropertyIdChange]);

  /**
   * Handle "View Details" button click
   */
  const handleViewDetails = useCallback(() => {
    if (selectedProperty) {
      onSelectedPropertyIdChange(null);
      router.push(`/propiedades/${selectedProperty.id}`);
    }
  }, [selectedProperty, router, onSelectedPropertyIdChange]);

  /**
   * Handle unauthenticated user trying to favorite
   */
  const handleUnauthenticatedFavoriteClick = useCallback((propertyId: string) => {
    setPendingPropertyId(propertyId);
    setShowAuthModal(true);
  }, []);

  /**
   * Handle closing auth modal
   */
  const handleAuthModalOpenChange = useCallback((open: boolean) => {
    setShowAuthModal(open);
  }, []);

  return (
    <>
      {/* PropertyPopup - Only mounts when selectedProperty exists */}
      {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
        <PropertyPopup
          property={selectedProperty}
          onClose={handleClosePopup}
          onViewDetails={handleViewDetails}
          isAuthenticated={isAuthenticated}
          onUnauthenticatedFavoriteClick={
            !isAuthenticated ? handleUnauthenticatedFavoriteClick : undefined
          }
        />
      )}

      {/* AuthModal - Outside popup, manages own open/close state */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={handleAuthModalOpenChange}
        propertyId={pendingPropertyId || undefined}
      />
    </>
  );
}
