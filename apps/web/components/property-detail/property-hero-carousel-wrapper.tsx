"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { useCallback } from "react";
import { PropertyHeroCarousel } from "./property-hero-carousel";

interface PropertyHeroCarouselWrapperProps {
  images?: Array<{
    id: string;
    url: string;
    alt?: string | null;
  }>;
  propertyTitle: string;
  propertyId: string;
  initialIsFavorite: boolean;
  isAuthenticated: boolean;
}

/**
 * Client Component wrapper for PropertyHeroCarousel
 * Handles favorite toggle functionality with Server Action integration
 * Manages client-side state for favorite status with optimistic updates
 */
export function PropertyHeroCarouselWrapper({
  images,
  propertyTitle,
  propertyId,
  // initialIsFavorite - Removed as we now use global store state
  isAuthenticated,
}: PropertyHeroCarouselWrapperProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteToggle = useCallback(async () => {
    // Require authentication
    if (!isAuthenticated) {
      // In a real app, redirect to login page or show auth modal
      // For now, let the store handle it (it emits an event) or just return
      // Since the store handles auth requirement via event, we might want to simply call it
      // regardless, BUT the current store implementation of toggleFavorite calls toggleFavoriteAction
      // which returns "Authentication required" error if not auth.
      
      // However, current wrapper had this check. Let's redirect to login manually or rely on store.
      // The store emits 'favorites:auth-required'.
      // If we just call toggleFavorite, the store attempts the action.
      // Let's call toggleFavorite and let the store handle the logic/toasts/redirects.
      await toggleFavorite(propertyId);
    } else {
      await toggleFavorite(propertyId);
    }
  }, [propertyId, isAuthenticated, toggleFavorite]);

  return (
    <PropertyHeroCarousel
      images={images}
      propertyTitle={propertyTitle}
      propertyId={propertyId}
      isFavorite={isFavorite(propertyId)}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
}
