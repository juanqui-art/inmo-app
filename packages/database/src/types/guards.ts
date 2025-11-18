/**
 * TYPE GUARDS
 *
 * Runtime validation functions for type safety at system boundaries
 * These functions validate data coming from untrusted sources:
 * - API responses
 * - URL parameters
 * - User input
 * - localStorage/sessionStorage
 *
 * PATTERN: Type Guards & Assertions
 * - Type guards: Narrow type in if/switch (returns boolean)
 * - Assertions: Throw if condition fails (asserts type)
 *
 * WHY BOTH PATTERNS?
 * - Guards: When you need to handle the failure case
 * - Assertions: When failure indicates programmer error
 */

import { PropertyCategory, PropertyStatus, TransactionType } from '@prisma/client'
import { z } from 'zod'
import type { SerializedProperty, PropertyFilters } from '../repositories/properties'

// Re-export SerializedProperty type for consumers of this module
export type { SerializedProperty }

/**
 * Guard: Check if object is a SerializedProperty
 *
 * USAGE:
 * ```typescript
 * const data = JSON.parse(untrustedInput)
 * if (isSerializedProperty(data)) {
 *   // Safe to use data as SerializedProperty
 * } else {
 *   // Handle invalid data
 * }
 * ```
 */
export function isSerializedProperty(value: unknown): value is SerializedProperty {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  // Check required fields
  if (typeof obj.id !== 'string') return false
  if (typeof obj.title !== 'string') return false
  if (typeof obj.price !== 'number') return false
  if (!Number.isFinite(obj.price)) return false
  if (obj.price < 0) return false

  // Check transaction type
  if (!isTransactionType(obj.transactionType)) return false

  // Check category
  if (!isPropertyCategory(obj.category)) return false

  // Check status
  if (!isPropertyStatus(obj.status)) return false

  // Check optional numeric fields (must be non-negative)
  if (obj.bathrooms !== null && obj.bathrooms !== undefined) {
    if (typeof obj.bathrooms !== 'number' || !Number.isFinite(obj.bathrooms) || obj.bathrooms < 0) {
      return false
    }
  }

  if (obj.area !== null && obj.area !== undefined) {
    if (typeof obj.area !== 'number' || !Number.isFinite(obj.area) || obj.area < 0) {
      return false
    }
  }

  if (obj.bedrooms !== null && obj.bedrooms !== undefined) {
    if (
      typeof obj.bedrooms !== 'number' ||
      !Number.isInteger(obj.bedrooms) ||
      obj.bedrooms < 0
    ) {
      return false
    }
  }

  // Check geographic coordinates
  if (obj.latitude !== null && obj.latitude !== undefined) {
    if (typeof obj.latitude !== 'number' || !Number.isFinite(obj.latitude)) {
      return false
    }
  }

  if (obj.longitude !== null && obj.longitude !== undefined) {
    if (typeof obj.longitude !== 'number' || !Number.isFinite(obj.longitude)) {
      return false
    }
  }

  // Check dates
  if (!(obj.createdAt instanceof Date)) return false
  if (!(obj.updatedAt instanceof Date)) return false

  return true
}

/**
 * Assertion: Assert that value is SerializedProperty
 *
 * USAGE:
 * ```typescript
 * const data = JSON.parse(untrustedInput)
 * assertIsSerializedProperty(data)
 * // Compiler knows data is SerializedProperty from here on
 * console.log(data.price) // ✅ No error
 * ```
 */
export function assertIsSerializedProperty(
  value: unknown,
): asserts value is SerializedProperty {
  if (!isSerializedProperty(value)) {
    throw new TypeError(`Value is not a valid SerializedProperty: ${JSON.stringify(value)}`)
  }
}

/**
 * Guard: Check if value is valid PropertyCategory
 *
 * USAGE:
 * ```typescript
 * const category = urlParams.get('category')
 * if (isPropertyCategory(category)) {
 *   // Safe to use category as PropertyCategory
 * }
 * ```
 */
export function isPropertyCategory(value: unknown): value is PropertyCategory {
  return (
    value === 'HOUSE' ||
    value === 'APARTMENT' ||
    value === 'LAND' ||
    value === 'COMMERCIAL'
  )
}

/**
 * Guard: Check if value is valid PropertyStatus
 */
export function isPropertyStatus(value: unknown): value is PropertyStatus {
  return (
    value === 'AVAILABLE' ||
    value === 'PENDING' ||
    value === 'SOLD' ||
    value === 'RENTED'
  )
}

/**
 * Guard: Check if value is valid TransactionType
 */
export function isTransactionType(value: unknown): value is TransactionType {
  return value === 'SALE' || value === 'RENT'
}

/**
 * Zod Schema for PropertyFilters
 *
 * USAGE:
 * ```typescript
 * const urlParams = new URLSearchParams(location.search)
 * const filters = {
 *   category: urlParams.get('category'),
 *   minPrice: urlParams.get('minPrice'),
 *   // ...
 * }
 *
 * const result = PropertyFiltersSchema.safeParse(filters)
 * if (result.success) {
 *   // result.data is PropertyFilters
 * } else {
 *   // result.error.flatten() shows validation errors
 * }
 * ```
 */
export const PropertyFiltersSchema = z.object({
  transactionType: z
    .union([
      z.literal('SALE'),
      z.literal('RENT'),
      z.array(z.union([z.literal('SALE'), z.literal('RENT')])),
    ])
    .optional(),

  category: z
    .union([
      z.literal('HOUSE'),
      z.literal('APARTMENT'),
      z.literal('LAND'),
      z.literal('COMMERCIAL'),
      z.array(
        z.union([
          z.literal('HOUSE'),
          z.literal('APARTMENT'),
          z.literal('LAND'),
          z.literal('COMMERCIAL'),
        ]),
      ),
    ])
    .optional(),

  status: z
    .union([
      z.literal('AVAILABLE'),
      z.literal('PENDING'),
      z.literal('SOLD'),
      z.literal('RENTED'),
    ])
    .optional(),

  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  bedrooms: z.number().nonnegative().int().optional(),
  bathrooms: z.number().nonnegative().optional(),
  minArea: z.number().positive().optional(),
  maxArea: z.number().positive().optional(),

  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
  search: z.string().optional(),
}).strict()

/**
 * Safe parse PropertyFilters with Zod
 *
 * RETURNS: Success with PropertyFilters or error details
 * USAGE:
 * ```typescript
 * const urlParams = new URLSearchParams(location.search)
 * const result = parsePropertyFilters(Object.fromEntries(urlParams))
 *
 * if (result.success) {
 *   const filters: PropertyFilters = result.data
 *   // Use filters...
 * } else {
 *   console.error(result.error.flatten())
 * }
 * ```
 */
export function parsePropertyFilters(
  data: unknown,
): ReturnType<typeof PropertyFiltersSchema.safeParse> {
  return PropertyFiltersSchema.safeParse(data)
}

/**
 * Assert PropertyFilters (throws on validation error)
 * USE WITH CAUTION - only when you're sure data is valid
 */
export function assertPropertyFilters(data: unknown): PropertyFilters {
  const result = PropertyFiltersSchema.safeParse(data)
  if (!result.success) {
    throw new TypeError(
      `Invalid PropertyFilters: ${JSON.stringify(result.error.flatten())}`,
    )
  }
  return result.data
}

/**
 * TYPE GUARD EXAMPLES:
 *
 * Example 1: Narrowing in conditionals
 * ```typescript
 * const data = await fetch('/api/property').then(r => r.json())
 *
 * if (isSerializedProperty(data)) {
 *   // TypeScript knows data is SerializedProperty here
 *   const price = data.price // ✅ No error
 * } else {
 *   // Handle error
 * }
 * ```
 *
 * Example 2: Exhaustive checking with asserts
 * ```typescript
 * const property = await propertyRepo.findById(id)
 * assertIsSerializedProperty(property)
 * // From here, property is 100% SerializedProperty
 * const price = data.price // ✅ Safe
 * ```
 *
 * Example 3: API response validation
 * ```typescript
 * const response = await fetch('/api/properties')
 * const data = await response.json()
 *
 * if (Array.isArray(data) && data.every(isSerializedProperty)) {
 *   // data is SerializedProperty[]
 * } else {
 *   throw new Error('Invalid API response')
 * }
 * ```
 *
 * Example 4: URL parameter parsing
 * ```typescript
 * const category = searchParams.get('category')
 * if (isPropertyCategory(category)) {
 *   // category is PropertyCategory
 *   filters.category = category
 * }
 * // (if not PropertyCategory, skip this filter)
 * ```
 */
