/**
 * PropertyMarker - Intelligent Marker Wrapper
 *
 * PATTERN: Strategy pattern for marker variants
 *
 * FEATURES:
 * - Automatically selects marker variant based on configuration
 * - Can be configured per-instance or globally
 * - Maintains backward compatibility with original implementation
 * - Type-safe variant selection
 *
 * VARIANTS:
 * 1. "dark" - Modern glassmorphism with pin and icon (default)
 * 2. "light" - Subtle light theme with colored borders
 * 3. "minimal" - Compact badge-only marker
 *
 * USAGE:
 * ```tsx
 * // Default (dark variant)
 * <PropertyMarker
 *   latitude={-2.9}
 *   longitude={-79.0}
 *   price="$250K"
 *   transactionType="SALE"
 * />
 *
 * // Specific variant
 * <PropertyMarker
 *   latitude={-2.9}
 *   longitude={-79.0}
 *   price="$250K"
 *   transactionType="SALE"
 *   variant="light"
 * />
 * ```
 */

"use client";

import { memo } from "react";
import { PropertyMarkerDark } from "./property-marker-dark";
import { PropertyMarkerLight } from "./property-marker-light";
import { PropertyMarkerMinimal } from "./property-marker-minimal";
import type { TransactionType } from "@repo/database";

export type PropertyMarkerVariant = "dark" | "light" | "minimal";

export interface PropertyMarkerProps {
  latitude: number;
  longitude: number;
  price: string;
  transactionType: TransactionType;
  onClick?: () => void;
  isHighlighted?: boolean;
  /** Marker variant/style (default: "dark") */
  variant?: PropertyMarkerVariant;
}

/**
 * PropertyMarker - Main wrapper component
 *
 * Renders the appropriate variant based on configuration.
 * Default variant is "dark" for modern aesthetic.
 *
 * PERFORMANCE FIX: Memoized component
 * - Prevents re-renders when parent re-renders with same props
 * - Markers only re-render if latitude, longitude, price, or transactionType change
 * - Reduces unnecessary DOM updates during map panning
 */
export const PropertyMarker = memo(function PropertyMarker({
  variant = "dark",
  ...props
}: PropertyMarkerProps) {
  switch (variant) {
    case "light":
      return <PropertyMarkerLight {...props} />;
    case "minimal":
      return <PropertyMarkerMinimal {...props} />;
    case "dark":
    default:
      return <PropertyMarkerDark {...props} />;
  }
});
