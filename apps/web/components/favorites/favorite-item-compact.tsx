/**
 * FavoriteItemCompact - Favorites Dropdown Item
 *
 * PATTERN: Compact property card for favorites dropdown
 *
 * FEATURES:
 * - Small thumbnail image
 * - Price and location summary
 * - Quick view button (link to property)
 * - Remove favorite button
 * - Loading state
 *
 * DESIGN:
 * - Minimal, horizontal layout
 * - 100% width for dropdown
 * - Smooth hover effects
 * - Dark mode support
 */

"use client";

import { cn } from "@repo/ui";
import { ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { generateSlug } from "@/lib/utils/slug-generator";
import { PropertyImageFallback } from "../map/property-image-fallback";

interface FavoriteItemCompactProps {
  propertyId: string;
  title: string;
  price: string;
  city: string;
  address?: string;
  imageUrl?: string | null;
  onRemove?: (propertyId: string) => void;
  isRemoving?: boolean;
  className?: string;
}

/**
 * FavoriteItemCompact Component
 *
 * Displays a compact property card in the favorites dropdown.
 * Shows essential info: image, price, location, and action buttons.
 */
export function FavoriteItemCompact({
  propertyId,
  title,
  price,
  city,
  address = "",
  imageUrl,
  onRemove,
  isRemoving = false,
  className,
}: FavoriteItemCompactProps) {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.(propertyId);
  };

  return (
    <Link
      href={`/propiedades/${propertyId}-${generateSlug(title)}`}
      className={cn(
        "group flex gap-3 p-3 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800",
        "hover:border-oslo-gray-300 dark:hover:border-oslo-gray-700 hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-900",
        "transition-all duration-200 cursor-pointer",
        isRemoving && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* Image Container - 80x80px */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-oslo-gray-100 dark:bg-oslo-gray-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <PropertyImageFallback title={title} />
        )}
      </div>

      {/* Info Container - Flex Column */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Title and Price */}
        <div className="space-y-1">
          {/* Price */}
          <p className="text-sm font-semibold text-oslo-gray-900 dark:text-white truncate">
            ${price}
          </p>

          {/* Title */}
          <p className="text-xs text-oslo-gray-600 dark:text-oslo-gray-300 line-clamp-1">
            {title}
          </p>
        </div>

        {/* Location Info */}
        <div className="flex items-center gap-1 text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          <span className="truncate">{address || city}</span>
        </div>
      </div>

      {/* Action Buttons Container - Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Remove Button - X icon */}
        <button
          onClick={handleRemoveClick}
          disabled={isRemoving}
          className={cn(
            "p-1.5 rounded-lg transition-all duration-200",
            "text-oslo-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950",
            "flex items-center justify-center",
            isRemoving && "opacity-50 cursor-not-allowed",
          )}
          aria-label="Remove from favorites"
          title="Remove from favorites"
        >
          <X className="w-4 h-4" />
        </button>

        {/* View Details - Chevron (hidden on hover to show remove button) */}
        <ChevronRight className="w-4 h-4 text-oslo-gray-300 dark:text-oslo-gray-600 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
