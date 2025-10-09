/**
 * Property Serialization Utilities
 *
 * PATTERN: Data Serialization Layer
 *
 * WHY serialize?
 * - Prisma returns Decimal objects for numeric fields
 * - React Client Components can ONLY receive plain objects (JSON-serializable)
 * - Decimal is NOT serializable by React
 * - Solution: Convert Decimal → number before passing to Client Components
 *
 * WHEN to serialize?
 * - In Server Component (root)
 * - BEFORE passing data to Client Components
 * - Once per request (not on every render)
 *
 * FIELDS TO SERIALIZE (from Property model):
 * - price: Decimal(12,2) → number
 * - bathrooms: Decimal?(3,1) → number | null
 * - area: Decimal?(10,2) → number | null
 * - latitude: Decimal?(10,8) → number | null
 * - longitude: Decimal?(11,8) → number | null
 *
 * ALTERNATIVE SOLUTION:
 * Make all components Server Components
 * ❌ Not possible: FeaturedPropertiesCarousel uses hooks (useEmblaCarousel)
 * ❌ Client interactivity required (carousel navigation)
 * ✅ Our solution: Serialize data layer
 *
 * PERFORMANCE:
 * - .toNumber() is O(1) (very fast)
 * - Serialization happens once on server
 * - No performance impact on client
 *
 * TYPE SAFETY:
 * - SerializedProperty ensures correct types
 * - TypeScript catches mismatches
 * - Runtime safe (Decimal → number conversion)
 *
 * RESOURCES:
 * - https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#passing-props-from-server-to-client-components-serialization
 * - https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values
 */

import type { PropertyWithRelations } from "@repo/database";

/**
 * Serialized Property Type
 *
 * Same as PropertyWithRelations but with Decimal converted to number
 *
 * WHY separate type?
 * - Documents the transformation
 * - Type safety (compiler checks)
 * - Clear contract between Server/Client
 */
export type SerializedProperty = Omit<
  PropertyWithRelations,
  "price" | "bathrooms" | "area" | "latitude" | "longitude"
> & {
  price: number;
  bathrooms: number | null;
  area: number | null;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Serialize a single property
 *
 * Converts Prisma Decimal objects to plain numbers
 *
 * @param property - Property with Decimal fields from Prisma
 * @returns Property with number fields (serializable)
 *
 * @example
 * const dbProperty = await propertyRepo.findById('123')
 * const serialized = serializeProperty(dbProperty)
 * <ClientComponent property={serialized} /> // ✅ Works
 */
export function serializeProperty(
  property: PropertyWithRelations,
): SerializedProperty {
  return {
    ...property,
    // Convert Decimal to number using .toNumber()
    // SAFE: Prisma Decimal has built-in precision handling
    price: property.price.toNumber(),
    bathrooms: property.bathrooms?.toNumber() ?? null,
    area: property.area?.toNumber() ?? null,
    latitude: property.latitude?.toNumber() ?? null,
    longitude: property.longitude?.toNumber() ?? null,
  };
}

/**
 * Serialize array of properties
 *
 * Convenience function for batch serialization
 *
 * @param properties - Array of properties from Prisma
 * @returns Array of serialized properties
 *
 * @example
 * const dbProperties = await propertyRepo.list()
 * const serialized = serializeProperties(dbProperties.properties)
 * <ClientComponent properties={serialized} /> // ✅ Works
 */
export function serializeProperties(
  properties: PropertyWithRelations[],
): SerializedProperty[] {
  return properties.map(serializeProperty);
}

/**
 * USAGE EXAMPLE:
 *
 * // apps/web/app/(public)/page.tsx (Server Component)
 * export default async function HomePage() {
 *   const { properties } = await propertyRepo.list({ take: 12 })
 *
 *   // ❌ BAD: Pass Decimal directly
 *   // <FeaturedCarousel properties={properties} />
 *   // Error: Decimal is not serializable
 *
 *   // ✅ GOOD: Serialize first
 *   const serialized = serializeProperties(properties)
 *   <FeaturedCarousel properties={serialized} />
 * }
 *
 * // components/featured-carousel.tsx (Client Component)
 * 'use client'
 * interface Props {
 *   properties: SerializedProperty[] // ← Use SerializedProperty type
 * }
 * export function FeaturedCarousel({ properties }: Props) {
 *   // Works! properties have plain numbers, not Decimal
 * }
 */

/**
 * PRECISION NOTES:
 *
 * Decimal → number conversion:
 * - Prisma Decimal uses arbitrary precision
 * - JavaScript number is IEEE 754 (53-bit precision)
 * - For most use cases (prices, coordinates): Safe
 * - For financial calculations: Use Decimal on server, serialize for display
 *
 * Example precision:
 * - Price: $1,234.56 → 1234.56 (✅ Safe, 2 decimals)
 * - Latitude: 40.712776 → 40.712776 (✅ Safe, 6 decimals typical)
 * - Area: 150.25 m² → 150.25 (✅ Safe)
 *
 * If you need arbitrary precision on client:
 * - Convert to string: property.price.toString()
 * - Pass as string to client
 * - Use library like decimal.js on client
 * - But: Overkill for display purposes
 */

/**
 * FUTURE ENHANCEMENTS:
 *
 * 1. Validation:
 *    if (property.price.isNaN()) throw new Error('Invalid price')
 *
 * 2. Formatting:
 *    price: formatCurrency(property.price.toNumber())
 *
 * 3. Rounding:
 *    price: Math.round(property.price.toNumber() * 100) / 100
 *
 * 4. Caching:
 *    const cache = new Map<string, SerializedProperty>()
 *
 * But keep it simple for now: Straight conversion works perfectly.
 */
