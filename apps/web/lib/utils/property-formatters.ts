/**
 * PROPERTY FORMATTER UTILITIES
 *
 * Centralized formatting and label utilities for property cards
 * Eliminates code duplication across PropertyCard, PropertyCardHorizontal, etc.
 */

import type { TransactionType } from "@repo/database";
import { TRANSACTION_BADGE_STYLES } from "@/lib/styles/property-card-styles";

/**
 * Localized labels for transaction types
 *
 * @example
 * TRANSACTION_TYPE_LABELS.SALE // "En Venta"
 * TRANSACTION_TYPE_LABELS.RENT // "En Alquiler"
 */
export const TRANSACTION_TYPE_LABELS = {
  SALE: "En Venta",
  RENT: "En Alquiler",
} as const;

/**
 * Localized labels for property categories
 *
 * @example
 * CATEGORY_LABELS.HOUSE // "Casa"
 * CATEGORY_LABELS.APARTMENT // "Departamento"
 */
export const CATEGORY_LABELS = {
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
} as const;

/**
 * Formats a price as USD currency (Ecuador locale)
 *
 * @param price - Price amount to format (number or Decimal from Prisma)
 * @returns Formatted price string (e.g., "$200,000")
 *
 * @example
 * formatPropertyPrice(200000)  // "$200,000"
 * formatPropertyPrice(75500)   // "$75,500"
 */
export function formatPropertyPrice(
  price: number | { toNumber(): number },
): string {
  const numPrice = typeof price === "number" ? price : price.toNumber();
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Gets the badge style for a transaction type
 *
 * @param type - Transaction type (SALE or RENT)
 * @returns Badge style object with variant and label
 *
 * @example
 * getTransactionBadgeStyle("SALE")
 * // { variant: "default", label: "En Venta" }
 */
export function getTransactionBadgeStyle(type: TransactionType) {
  return type === "SALE"
    ? TRANSACTION_BADGE_STYLES.SALE
    : TRANSACTION_BADGE_STYLES.RENT;
}

/**
 * Gets the localized label for a transaction type
 *
 * @param type - Transaction type (SALE or RENT)
 * @returns Localized label (e.g., "En Venta")
 *
 * @example
 * getTransactionLabel("SALE")  // "En Venta"
 * getTransactionLabel("RENT")  // "En Alquiler"
 */
export function getTransactionLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type];
}

/**
 * Gets the localized label for a property category
 *
 * @param category - Property category (HOUSE, APARTMENT, etc.)
 * @returns Localized label (e.g., "Casa")
 *
 * @example
 * getCategoryLabel("HOUSE")      // "Casa"
 * getCategoryLabel("APARTMENT")  // "Departamento"
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
}

/**
 * Gets the first image URL from a property, with fallback
 *
 * @param images - Array of property images
 * @returns URL of the first image or null if none available
 *
 * @example
 * getPropertyImageUrl(property.images)  // "https://..."
 * getPropertyImageUrl([])               // null
 */
export function getPropertyImageUrl(
  images: Array<{ url: string }> | null | undefined,
): string | null {
  return images && images.length > 0 ? images[0]?.url || null : null;
}
