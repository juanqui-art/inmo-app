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
import { Heart, Share2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { PropertyWithRelations } from "@repo/database";
import type { SerializedProperty } from "@/lib/utils/serialize-property";
import type { MapProperty } from "./map-view";
import { PropertyImageFallback } from "./property-image-fallback";
import { useFavorites } from "@/hooks/use-favorites";
import {
  TRANSACTION_BADGE_STYLES,
  CATEGORY_BADGE_STYLE,
  CTA_BUTTON_STYLES,
} from "@/lib/styles/property-card-styles";

interface PropertyCardHorizontalProps {
  property: PropertyWithRelations | SerializedProperty | MapProperty;
  onViewDetails?: () => void;
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
  onViewDetails,
}: PropertyCardHorizontalProps) {
  const { isFavorite, toggleFavorite, isPending } = useFavorites();

  // Current state
  const liked = isFavorite(property.id);
  const isLoading = isPending(property.id);

  // Track previous state for animation logic
  const prevLikedRef = React.useRef(liked);

  React.useEffect(() => {
    prevLikedRef.current = liked;
  }, [liked]);

  // Format price
  const formattedPrice = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  // Transaction type labels
  const transactionTypeLabels: Record<string, string> = {
    SALE: "En Venta",
    RENT: "En Alquiler",
  };

  // Category labels
  const categoryLabels: Record<string, string> = {
    HOUSE: "Casa",
    APARTMENT: "Departamento",
    SUITE: "Suite",
    VILLA: "Villa",
    PENTHOUSE: "Penthouse",
    DUPLEX: "Dúplex",
    LOFT: "Loft",
    LAND: "Terreno",
    COMMERCIAL: "Local Comercial",
    OFFICE: "Oficina",
    WAREHOUSE: "Bodega",
    FARM: "Finca",
  };

  // Get badge style based on transaction type
  const transactionBadgeStyle =
    property.transactionType === "SALE"
      ? TRANSACTION_BADGE_STYLES.SALE
      : TRANSACTION_BADGE_STYLES.RENT;

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
              {transactionTypeLabels[property.transactionType]}
            </Badge>

            {/* Category Badge */}
            {property.category && (
              <Badge variant="secondary" className={CATEGORY_BADGE_STYLE}>
                {categoryLabels[property.category] || property.category}
              </Badge>
            )}
          </div>

          {/* Right: Social Actions */}
          <div className="flex items-center gap-2">
            {/* View Counter */}
            {/*<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">*/}
            {/*  <Eye className="w-4 h-4 text-white" />*/}
            {/*  <span className="text-white text-sm font-semibold">*/}
            {/*    {viewCount.toLocaleString()}*/}
            {/*  </span>*/}
            {/*</div>*/}

            {/* Like Button - Favorites */}
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

            {/* Share Button */}
            <button
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Share property"
            >
              <Share2 className="w-5 h-5 text-white" />
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
          <Button
            onClick={onViewDetails}
            size="sm"
            className={CTA_BUTTON_STYLES.full}
          >
            Ver Detalles
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
