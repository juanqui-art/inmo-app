/**
 * BRANDED TYPES
 *
 * Nominal typing using TypeScript's type system
 * Prevents accidentally mixing similar values without runtime cost
 *
 * PATTERN: Branded Type (or NewType pattern)
 * Brands primitive types with a unique symbol, making them incompatible
 * with other branded types even if their underlying type is the same
 *
 * BENEFITS:
 * - Compile-time safety: Can't accidentally pass PropertyId where Price expected
 * - Zero runtime cost: Brands are erased at compilation
 * - Self-documenting: PropertyId is clearer than just "string"
 * - Type guards: Can validate and assert these types
 *
 * USAGE:
 * ```typescript
 * const id = '123' as PropertyId // ✅ Mark as PropertyId
 * const price = 1000 as Price    // ✅ Mark as Price
 * const combined = id + price     // ❌ TypeError: can't concatenate PropertyId + Price
 * ```
 *
 * REFERENCE: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html#nominal-typing
 */

/**
 * Property ID - Unique identifier for properties
 *
 * Branded string type to prevent mixing IDs with other strings
 * Example: 'prop_123abc456def'
 */
export type PropertyId = string & { readonly __brand: 'PropertyId' }

/**
 * Create a branded PropertyId from a string
 * Use this function to create PropertyIds with confidence
 */
export function createPropertyId(id: string): PropertyId {
  // Validation: Simple non-empty check
  if (!id || id.trim().length === 0) {
    throw new TypeError('PropertyId cannot be empty')
  }
  return id as PropertyId
}

/**
 * Price - Numeric price branded with validation
 *
 * Branded number type to prevent mixing prices with other numbers
 * Ensures: price >= 0
 * Example: 250000.50
 */
export type Price = number & { readonly __brand: 'Price' }

/**
 * Create a branded Price from a number
 * Validates that price is non-negative
 */
export function createPrice(value: number): Price {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Price must be a finite number, got: ${value}`)
  }
  if (value < 0) {
    throw new RangeError(`Price cannot be negative, got: ${value}`)
  }
  return value as Price
}

/**
 * Coordinate - Geographic coordinate (latitude or longitude)
 *
 * Branded number type with validation
 * Used for map integrations to prevent invalid coordinates
 */
export type Coordinate = number & { readonly __brand: 'Coordinate' }

/**
 * Create a branded Coordinate
 * Validates range based on coordinate type
 */
export function createLatitude(value: number): Coordinate {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Latitude must be a finite number, got: ${value}`)
  }
  if (value < -90 || value > 90) {
    throw new RangeError(`Latitude must be between -90 and 90, got: ${value}`)
  }
  return value as Coordinate
}

export function createLongitude(value: number): Coordinate {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Longitude must be a finite number, got: ${value}`)
  }
  if (value < -180 || value > 180) {
    throw new RangeError(`Longitude must be between -180 and 180, got: ${value}`)
  }
  return value as Coordinate
}

/**
 * Authenticated User ID - ID of logged-in user
 *
 * Branded string type to distinguish user IDs from other string IDs
 * Often comes from auth token claims
 */
export type AuthUserId = string & { readonly __brand: 'AuthUserId' }

export function createAuthUserId(id: string): AuthUserId {
  if (!id || id.trim().length === 0) {
    throw new TypeError('AuthUserId cannot be empty')
  }
  return id as AuthUserId
}

/**
 * USAGE EXAMPLES:
 *
 * Safe with brands (compile-time error prevented):
 * ```typescript
 * const id: PropertyId = createPropertyId('123')
 * const price: Price = createPrice(250000)
 * const agentId: AuthUserId = createAuthUserId('user_456')
 *
 * // ✅ Good: Explicit type
 * const formatted = `Property ${id}: $${price}`
 *
 * // ❌ Bad: Type mismatch (compile error)
 * const formatted = `Property ${price}: $${id}`
 *
 * // ❌ Bad: Price validation (runtime error)
 * const negativPrice = createPrice(-100) // Throws RangeError
 * ```
 *
 * TYPE ERASURE (at runtime, brands are just primitive values):
 * ```typescript
 * const id = createPropertyId('123')
 * console.log(typeof id) // 'string' (brand is erased at runtime)
 * console.log(id === '123') // true (same value)
 * ```
 */
