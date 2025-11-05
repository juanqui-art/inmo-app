/**
 * PropertyMarker - Map Marker for Properties (Wrapper)
 *
 * PATTERN: Intelligent wrapper using variant strategy
 *
 * FEATURES:
 * - Backward compatible with original implementation
 * - Supports multiple marker variants
 * - Automatically formats price
 * - Color coded by transaction type (SALE: blue, RENT: green)
 * - Hover effects and animations
 * - Click handler for popups
 *
 * VARIANTS:
 * - "dark" (default): Modern glassmorphism with pin and icon
 * - "light": Subtle light theme with colored borders
 * - "minimal": Compact badge-only marker
 *
 * MIGRATION GUIDE:
 * Old usage still works:
 * ```tsx
 * <PropertyMarker price={250000} ... />
 * ```
 *
 * New usage with variants:
 * ```tsx
 * <PropertyMarker price="$250K" variant="light" ... />
 * ```
 */

"use client";

import { PropertyMarker as PropertyMarkerComponent } from "./markers";
import type { TransactionType } from "@repo/database";

export type PropertyMarkerVariant = "dark" | "light" | "minimal";

interface PropertyMarkerProps {
  latitude: number;
  longitude: number;
  price: number | string;
  transactionType: TransactionType;
  onClick?: () => void;
  isHighlighted?: boolean;
  /** Marker variant/style (default: "dark") */
  variant?: PropertyMarkerVariant;
}

/**
 * PropertyMarker - Main component with automatic price formatting
 *
 * Handles both numeric and string prices for backward compatibility.
 * Forwards all props to the variant-specific component.
 */
export function PropertyMarker({
  price,
  variant = "dark",
  ...props
}: PropertyMarkerProps) {
  /**
   * Format price for display
   * Supports both number and string inputs for backward compatibility
   */
  const formattedPrice =
    typeof price === "string"
      ? price
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 0,
        }).format(price);

  return (
    <PropertyMarkerComponent
      price={formattedPrice}
      variant={variant}
      {...props}
    />
  );
}
