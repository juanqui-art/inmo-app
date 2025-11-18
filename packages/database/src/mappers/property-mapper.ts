/**
 * PROPERTY MAPPERS
 *
 * Central conversion point from Prisma types to serializable types
 * All Decimal → number conversions happen here
 *
 * PATTERN: Mapper Pattern
 * Single responsibility: Convert from one type to another
 * Centralized location: All conversions in one place
 * Testable: Easy to unit test each conversion
 * Safe: Explicit validation at conversion boundaries
 *
 * WHY MAPPERS?
 * - Prisma returns Decimal objects (not JSON serializable)
 * - React Client Components need plain JSON objects
 * - Centralizes logic: One place to fix conversion bugs
 * - Type safety: Compiler ensures correct types
 * - Consistency: Same conversion logic everywhere
 */

import type { Prisma } from "@prisma/client";
import type {
  PropertyWithRelations,
  SerializedProperty,
} from "../repositories/properties";

/**
 * Convert a single Prisma Decimal to number with validation
 *
 * SAFETY:
 * - Handles null/undefined gracefully
 * - Validates finite numbers
 * - Returns null for invalid conversions (with logging)
 * - Never silently fails
 *
 * @param value Prisma Decimal | number | null | undefined
 * @returns Converted number or null
 *
 * @internal Use within mapPropertyToSerialized, not directly
 */
function toNumber(
  value: Prisma.Decimal | number | null | undefined,
): number | null {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Convert to number
  const num = Number(value);

  // Validate conversion result
  if (!Number.isFinite(num)) {
    console.error(
      `[PropertyMapper] Invalid number conversion for value: ${value}. Got: ${num}`,
    );
    return null;
  }

  return num;
}

/**
 * Map PropertyWithRelations (from Prisma) to SerializedProperty (for client)
 *
 * CONVERSION RULES:
 * - Decimal → number with validation
 * - null → null (for coordinate fields)
 * - null → undefined (for optional string/numeric fields)
 * - Preserve all other fields unchanged
 *
 * GUARANTEED:
 * ✅ Result is JSON.stringify() safe
 * ✅ All required fields present
 * ✅ All numeric fields validated
 * ✅ Type matches SerializedProperty
 *
 * @param property Property from Prisma with Decimal fields
 * @returns SerializedProperty with number fields (JSON serializable)
 *
 * @throws Does NOT throw - converts gracefully with fallbacks
 *
 * @example
 * ```typescript
 * const dbProperty = await db.property.findUnique({...})
 * const serialized = mapPropertyToSerialized(dbProperty)
 * // serialized is safe to pass to Client Components
 * <PropertyCard property={serialized} /> // ✅ No error
 * ```
 */
export function mapPropertyToSerialized(
  property: PropertyWithRelations,
): SerializedProperty {
  return {
    // ID and basic fields (no conversion needed)
    id: property.id,
    title: property.title,
    description: property.description,

    // Required price field (Decimal → number)
    // Falls back to 0 if conversion fails
    price: toNumber(property.price) ?? 0,

    // Enums (no conversion needed)
    transactionType: property.transactionType,
    category: property.category,
    status: property.status,

    // Integer bedroom count (no conversion needed)
    bedrooms: property.bedrooms,

    // Optional Decimal fields → number | undefined
    // Rules:
    // - null or undefined → undefined
    // - Valid number → number
    // - Invalid conversion → undefined (with logging)
    bathrooms:
      property.bathrooms !== null && property.bathrooms !== undefined
        ? (toNumber(property.bathrooms) ?? undefined)
        : undefined,

    area:
      property.area !== null && property.area !== undefined
        ? (toNumber(property.area) ?? undefined)
        : undefined,

    // Address and location strings (no conversion needed)
    address: property.address,
    city: property.city ?? undefined,
    state: property.state ?? undefined,
    zipCode: property.zipCode,

    // Geographic coordinates (Decimal → number, preserve null)
    // These can be null even in SerializedProperty
    latitude: toNumber(property.latitude),
    longitude: toNumber(property.longitude),

    // IDs and dates (no conversion needed)
    agentId: property.agentId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,

    // Relations (already serializable)
    agent: property.agent,
    images: property.images,
  };
}

/**
 * Map array of PropertyWithRelations to SerializedProperty[]
 *
 * CONVENIENCE FUNCTION for batch conversions
 * Applies mapPropertyToSerialized to each element
 *
 * @param properties Array of properties from Prisma
 * @returns Array of serialized properties (JSON serializable)
 *
 * @example
 * ```typescript
 * const dbProperties = await db.property.findMany({...})
 * const serialized = mapPropertiesToSerialized(dbProperties)
 * // All properties are now safe for Client Components
 * ```
 */
export function mapPropertiesToSerialized(
  properties: PropertyWithRelations[],
): SerializedProperty[] {
  return properties.map(mapPropertyToSerialized);
}

/**
 * MAPPER BENEFITS:
 *
 * Before Mapper (❌ Error-prone):
 * ```typescript
 * // Different conversion logic in 3+ places
 * const serialized1 = {
 *   ...property,
 *   price: Number(property.price),
 *   bathrooms: property.bathrooms ? Number(property.bathrooms) : undefined
 * }
 * const serialized2 = {
 *   ...property,
 *   price: property.price.toNumber(), // Different method!
 *   bathrooms: property.bathrooms?.toNumber() // Different null handling!
 * }
 * // ❌ Inconsistent, hard to maintain
 * ```
 *
 * After Mapper (✅ Consistent & Safe):
 * ```typescript
 * const serialized1 = mapPropertyToSerialized(property)
 * const serialized2 = mapPropertyToSerialized(property)
 * // ✅ Same logic everywhere, easy to fix bugs
 * ```
 *
 * TESTING:
 * All conversions tested in mappers/__tests__/property-mapper.test.ts
 * - Decimal → number conversion
 * - null handling
 * - undefined handling
 * - Invalid value handling
 * - Array operations
 * - Edge cases (zero values, large numbers, etc.)
 *
 * PERFORMANCE:
 * - O(1) per field (Number() conversion is fast)
 * - O(n) for batch (n = array length)
 * - No memory overhead
 * - Safe for high-volume operations (API responses)
 */
