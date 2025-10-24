/**
 * PropertyCardHorizontal - Map Marker Popup Card
 *
 * PATTERN: Full-featured property card for map click interactions
 *
 * FEATURES:
 * - Background image with gradient overlay
 * - Status badges (For Sale/Rent, Type, Featured)
 * - Social actions (Like, Share, Bookmark)
 * - View counter
 * - Property details (location, beds, baths, sqft)
 * - Price display with CTA button
 * - Dark mode support
 * - Responsive design
 *
 * DESIGN:
 * - Oslo Gray palette
 * - Glassmorphism effects
 * - Smooth transitions
 * - Dark overlay gradient
 */

"use client";

import {
  Heart,
  Share2,
  Bookmark,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";
import type { PropertyWithRelations } from "@repo/database";
import type { SerializedProperty } from "@/lib/utils/serialize-property";

interface PropertyCardHorizontalProps {
  property: PropertyWithRelations | SerializedProperty;
  onViewDetails?: () => void;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
  viewCount?: number;
}

/**
 * PropertyCardHorizontal Component
 *
 * Displays comprehensive property information in a horizontal card layout.
 * Perfect for map popups and quick property previews.
 */
export function PropertyCardHorizontal({
  property,
  onViewDetails,
  onFavoriteToggle,
  isFavorite = false,
  viewCount = 0,
}: PropertyCardHorizontalProps) {
  const [liked, setLiked] = useState(isFavorite);
  const [saved, setSaved] = useState(false);

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

  // Get color based on transaction type
  const transactionColor =
    property.transactionType === "SALE"
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-emerald-500 hover:bg-emerald-600";

  // Get first image
  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0]!.url
      : null;

  // Handle favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onFavoriteToggle?.(property.id);
  };

  return (
    <div className="relative w-full min-w-[320px] max-w-[390px] h-[280px] rounded-2xl overflow-hidden shadow-2xl group bg-oslo-gray-900 dark:bg-oslo-gray-1000">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-oslo-gray-800 to-oslo-gray-900" />
      )}

      {/* Content Grid */}
      <div className="relative h-full p-3 flex flex-col justify-between">
        {/* Top Row - Badges and Social Actions */}
        <div className="flex items-start justify-between">
          {/* Left: Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {/* Transaction Type Badge */}
            <Badge
              className={`${transactionColor} text-white border-0 font-semibold px-3 py-1 rounded-full backdrop-blur-sm`}
            >
              {transactionTypeLabels[property.transactionType]}
            </Badge>

            {/* Category Badge */}
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-md border border-white/30 font-semibold px-3 py-1 rounded-full"
            >
              {categoryLabels[property.category] || property.category}
            </Badge>
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

            {/* Like Button */}
            <button
              onClick={handleFavoriteClick}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  liked ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </button>

            {/* Share Button */}
            <button
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Share property"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => setSaved(!saved)}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={saved ? "Remove bookmark" : "Bookmark property"}
            >
              <Bookmark
                className={`w-4 h-4 transition-colors ${
                  saved ? "fill-white text-white" : "text-white"
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
              <p className="text-white text-2xl font-bold drop-shadow-lg">
                {formattedPrice}
              </p>
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Bedrooms */}
              {property.bedrooms && (
                <div className="flex items-center gap-1 text-white text-xs">
                  <Bed className="w-3.5 h-3.5 drop-shadow-lg" />
                  <span className="font-semibold drop-shadow-lg">
                    {property.bedrooms}
                  </span>
                </div>
              )}

              {/* Bathrooms */}
              {property.bathrooms && (
                <div className="flex items-center gap-1 text-white text-xs">
                  <Bath className="w-3.5 h-3.5 drop-shadow-lg" />
                  <span className="font-semibold drop-shadow-lg">
                    {Number(property.bathrooms)}
                  </span>
                </div>
              )}

              {/* Area */}
              {property.area && (
                <div className="flex items-center gap-1 text-white text-xs">
                  <Maximize className="w-3.5 h-3.5 drop-shadow-lg" />
                  <span className="font-semibold drop-shadow-lg">
                    {Number(property.area)}m²
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - CTA Button */}
          <Button
            onClick={onViewDetails}
            size="sm"
            className="bg-white text-oslo-gray-900 hover:bg-white/90 dark:text-oslo-gray-900 font-semibold rounded-lg px-4 py-2 shadow-lg transition-all hover:shadow-xl active:scale-95 flex-shrink-0"
          >
            Ver Detalles
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
