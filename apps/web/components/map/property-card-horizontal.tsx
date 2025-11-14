/**
 * PropertyCardHorizontal - Map Marker Popup Card
 *
 * PATTERN: Full-featured property card for map click interactions
 *
 * FEATURES:
 * - Background image with gradient overlay
 * - Status badges (For Sale/Rent, Type, Featured)
 * - Social actions (Like, Share)
 * - View counter
 * - Property details (location, beds, baths, sqft)
 * - Price display with CTA button
 * - Dark mode support
 * - Responsive design
 * - Persistent favorites via useFavorites hook
 *
 * DESIGN:
 * - Oslo Gray palette
 * - Glassmorphism effects
 * - Smooth transitions
 * - Dark overlay gradient
 */

"use client";

import React from "react";
import { Heart, ChevronRight } from "lucide-react";
import { Button } from "@repo/ui";
import { Badge } from "@repo/ui";
import Image from "next/image";
import Link from "next/link";
import type { PropertyWithRelations } from "@repo/database";
import type { SerializedProperty } from "@repo/database";
import type { MapProperty } from "./map-view";
import { PropertyImageFallback } from "./property-image-fallback";
import { useFavorites } from "@/hooks/use-favorites";
import { generateSlug } from "@/lib/utils/slug-generator";
import { useAuthStore } from "@/stores/auth-store";
import { CATEGORY_BADGE_STYLE } from "@/lib/styles/property-card-styles";
import {
  formatPropertyPrice,
  getTransactionBadgeStyle,
  getCategoryLabel,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/utils/property-formatters";

interface PropertyCardHorizontalProps {
  property: PropertyWithRelations | SerializedProperty | MapProperty;
  onFavoriteClick?: (propertyId: string) => void;
}

/**
 * PropertyCardHorizontal Component
 *
 * Displays comprehensive property information in a horizontal card layout.
 * Perfect for map popups and quick property previews.
 *
 * FAVORITES:
 * - Uses useFavorites hook for persistent favorites
 * - Syncs with server via toggleFavoriteAction
 * - Shows toast notifications on add/remove
 */
export function PropertyCardHorizontal({
  property,
  onFavoriteClick,
}: PropertyCardHorizontalProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isFavorite, toggleFavorite, isPending } = useFavorites();

  // Current state
  const liked = isFavorite(property.id);
  const isLoading = isPending(property.id);

  // Track previous state for animation logic
  const prevLikedRef = React.useRef(liked);

  React.useEffect(() => {
    prevLikedRef.current = liked;
  }, [liked]);

  // Format price using centralized utility
  const formattedPrice = formatPropertyPrice(property.price);

  // Get transaction badge style using centralized utility
  const transactionBadgeStyle = getTransactionBadgeStyle(
    property.transactionType,
  );

  // Get first image
  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]!.url
      : null;

  /**
   * Determine if we should show the pulse animation
   *
   * LOGIC:
   * - Show pulse ONLY when adding to favorites (not removing)
   * - isLoading: true while server request is in flight
   * - !prevLikedRef.current: was NOT liked before
   * - liked: IS liked now (optimistic state)
   *
   * SCENARIOS:
   * - Adding: isLoading=true, prevLiked=false, liked=true → PULSE ✨
   * - Removing: isLoading=true, prevLiked=true, liked=false → NO PULSE ⚡
   * - Idle: isLoading=false → NO PULSE
   */
  const shouldPulse = isLoading && !prevLikedRef.current && liked;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated && onFavoriteClick) {
      // Call parent handler (will show auth modal)
      onFavoriteClick(property.id);
      return;
    }

    // If authenticated or no callback provided, toggle favorite
    toggleFavorite(property.id); // Non-blocking, instant UI update
  };

  return (
    <div className="relative w-full min-w-[333px] max-w-[399px] h-[270px] rounded-2xl overflow-hidden shadow-2xl group bg-oslo-gray-900 dark:bg-oslo-gray-1000">
      {/* Background Image with Overlay */}
      {imageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="w-full h-full object-cover brightness-110 transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlays for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />
        </div>
      ) : (
        <PropertyImageFallback title={property.title} />
      )}

      {/* Content Grid */}
      <div className="relative h-full px-2 py-3 flex flex-col justify-between">
        {/* Top Row - Badges and Social Actions */}
        <div className="flex items-start justify-between">
          {/* Left: Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {/* Transaction Type Badge */}
            <Badge className={transactionBadgeStyle}>
              {TRANSACTION_TYPE_LABELS[property.transactionType]}
            </Badge>

            {/* Category Badge */}
            {property.category && (
              <Badge variant="secondary" className={CATEGORY_BADGE_STYLE}>
                {getCategoryLabel(property.category) || property.category}
              </Badge>
            )}

            <button
              onClick={handleFavoriteClick}
              disabled={false}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 ${
                  shouldPulse
                    ? "animate-heart-pulse fill-red-500 text-red-500"
                    : liked
                      ? "fill-red-500 text-red-500 transition-colors"
                      : "text-white transition-colors"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Row - Flex Layout with Space Between */}
        <div className="flex items-end justify-between gap-3">
          {/* Left Column - Property Info */}
          <div className="space-y-2 flex-1">
            <div>
              <p className="text-white text-4xl font-medium font-stretch-120% drop-shadow-lg ">
                {formattedPrice}
              </p>
            </div>

            {/* Features */}
            {/*  <div className="flex items-center gap-3 flex-wrap">*/}
            {/*    /!* Bedrooms *!/*/}
            {/*    {property.bedrooms && (*/}
            {/*      <div className="flex items-center gap-1 text-white text-xs">*/}
            {/*        <Bed className="w-3.5 h-3.5 drop-shadow-lg" />*/}
            {/*        <span className="font-semibold drop-shadow-lg">*/}
            {/*          {property.bedrooms}*/}
            {/*        </span>*/}
            {/*      </div>*/}
            {/*    )}*/}

            {/*    /!* Bathrooms *!/*/}
            {/*    {property.bathrooms && (*/}
            {/*      <div className="flex items-center gap-1 text-white text-xs">*/}
            {/*        <Bath className="w-3.5 h-3.5 drop-shadow-lg" />*/}
            {/*        <span className="font-semibold drop-shadow-lg">*/}
            {/*          {Number(property.bathrooms)}*/}
            {/*        </span>*/}
            {/*      </div>*/}
            {/*    )}*/}

            {/*    /!* Area *!/*/}
            {/*    {property.area && (*/}
            {/*      <div className="flex items-center gap-1 text-white text-xs">*/}
            {/*        <Maximize className="w-3.5 h-3.5 drop-shadow-lg" />*/}
            {/*        <span className="font-semibold drop-shadow-lg">*/}
            {/*          {Number(property.area)}m²*/}
            {/*        </span>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </div>*/}
          </div>

          {/* Right Column - CTA Button */}
          <Link
            href={`/propiedades/${property.id}-${generateSlug(property.title)}`}
          >
            <Button
              size="sm"
              className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
            >
              View Details
              <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
