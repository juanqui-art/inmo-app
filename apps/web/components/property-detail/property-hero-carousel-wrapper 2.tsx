"use client";

import { useState, useCallback } from "react";
import { PropertyHeroCarousel } from "./property-hero-carousel";
import { toggleFavoriteAction } from "@/app/actions/favorites";

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
  initialIsFavorite,
  isAuthenticated,
}: PropertyHeroCarouselWrapperProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleFavoriteToggle = useCallback(async () => {
    // Require authentication
    if (!isAuthenticated) {
      // In a real app, redirect to login page
      // For now, just return silently
      console.warn("User must be authenticated to favorite properties");
      return;
    }

    try {
      // Optimistic update
      setIsFavorite((prev) => !prev);

      // Call Server Action
      const result = await toggleFavoriteAction(propertyId);

      if (!result.success) {
        // Revert on failure
        setIsFavorite((prev) => !prev);
        console.error("Failed to toggle favorite:", result.error);
      } else {
        // Confirm the result from server
        setIsFavorite(result.isFavorite || false);
      }
    } catch (error) {
      // Revert on error
      setIsFavorite((prev) => !prev);
      console.error("Error toggling favorite:", error);
    }
  }, [propertyId, isAuthenticated]);

  return (
    <PropertyHeroCarousel
      images={images}
      propertyTitle={propertyTitle}
      propertyId={propertyId}
      isFavorite={isFavorite}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
}
