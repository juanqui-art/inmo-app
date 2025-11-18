/**
 * TESTS FOR BRANDED TYPES
 *
 * Verify that branded type constructors validate properly
 * and that brands provide compile-time type safety
 */

import { describe, it, expect } from 'vitest'
import {
  createPropertyId,
  createPrice,
  createLatitude,
  createLongitude,
  createAuthUserId,
  type PropertyId,
  type Price,
} from '../branded'

describe('Branded Types', () => {
  describe('PropertyId', () => {
    it('should create valid PropertyId', () => {
      const id = createPropertyId('prop_123abc')
      expect(id).toBe('prop_123abc')
    })

    it('should reject empty string', () => {
      expect(() => createPropertyId('')).toThrow(TypeError)
      expect(() => createPropertyId('   ')).toThrow(TypeError)
    })

    it('should validate non-empty IDs', () => {
      const id = createPropertyId('valid-id-123')
      expect(id).toBe('valid-id-123')
    })
  })

  describe('Price', () => {
    it('should create valid Price', () => {
      const price = createPrice(250000.50)
      expect(price).toBe(250000.50)
    })

    it('should create Price with zero value', () => {
      const price = createPrice(0)
      expect(price).toBe(0)
    })

    it('should create Price with decimal precision', () => {
      const price = createPrice(1234.56)
      expect(price).toBe(1234.56)
    })

    it('should reject negative prices', () => {
      expect(() => createPrice(-100)).toThrow(RangeError)
      expect(() => createPrice(-0.01)).toThrow(RangeError)
    })

    it('should reject non-finite numbers', () => {
      expect(() => createPrice(NaN)).toThrow(TypeError)
      expect(() => createPrice(Infinity)).toThrow(TypeError)
      expect(() => createPrice(-Infinity)).toThrow(TypeError)
    })

    it('should reject non-numbers', () => {
      expect(() => createPrice('100' as any)).toThrow(TypeError)
      expect(() => createPrice(null as any)).toThrow(TypeError)
      expect(() => createPrice(undefined as any)).toThrow(TypeError)
    })
  })

  describe('Latitude', () => {
    it('should create valid latitude', () => {
      const lat = createLatitude(40.7128)
      expect(lat).toBe(40.7128)
    })

    it('should accept boundary values', () => {
      expect(createLatitude(-90)).toBe(-90)
      expect(createLatitude(90)).toBe(90)
      expect(createLatitude(0)).toBe(0)
    })

    it('should reject out-of-range values', () => {
      expect(() => createLatitude(-91)).toThrow(RangeError)
      expect(() => createLatitude(91)).toThrow(RangeError)
      expect(() => createLatitude(180)).toThrow(RangeError)
      expect(() => createLatitude(-180)).toThrow(RangeError)
    })

    it('should reject non-finite numbers', () => {
      expect(() => createLatitude(NaN)).toThrow(TypeError)
      expect(() => createLatitude(Infinity)).toThrow(TypeError)
    })
  })

  describe('Longitude', () => {
    it('should create valid longitude', () => {
      const lon = createLongitude(-74.006)
      expect(lon).toBe(-74.006)
    })

    it('should accept boundary values', () => {
      expect(createLongitude(-180)).toBe(-180)
      expect(createLongitude(180)).toBe(180)
      expect(createLongitude(0)).toBe(0)
    })

    it('should reject out-of-range values', () => {
      expect(() => createLongitude(-181)).toThrow(RangeError)
      expect(() => createLongitude(181)).toThrow(RangeError)
      expect(() => createLongitude(360)).toThrow(RangeError)
    })

    it('should reject non-finite numbers', () => {
      expect(() => createLongitude(NaN)).toThrow(TypeError)
      expect(() => createLongitude(Infinity)).toThrow(TypeError)
    })
  })

  describe('AuthUserId', () => {
    it('should create valid AuthUserId', () => {
      const userId = createAuthUserId('user_123abc')
      expect(userId).toBe('user_123abc')
    })

    it('should reject empty string', () => {
      expect(() => createAuthUserId('')).toThrow(TypeError)
      expect(() => createAuthUserId('   ')).toThrow(TypeError)
    })

    it('should accept various ID formats', () => {
      expect(createAuthUserId('user-123')).toBe('user-123')
      expect(createAuthUserId('123')).toBe('123')
      expect(createAuthUserId('uuid-v4-string')).toBe('uuid-v4-string')
    })
  })

  describe('Type Safety (compile-time)', () => {
    it('should maintain type safety through branded types', () => {
      const id: PropertyId = createPropertyId('prop_123')
      const price: Price = createPrice(250000)

      // These would be compile-time errors in real code:
      // const mixed: PropertyId = price // ❌ Type error
      // const concatenated = id + price // ❌ Type error (can't mix PropertyId + Price)

      // But at runtime, brands are erased:
      expect(typeof id).toBe('string')
      expect(typeof price).toBe('number')
      expect(id).toBe('prop_123')
      expect(price).toBe(250000)
    })

    it('should allow using branded types as underlying types', () => {
      const id = createPropertyId('prop_123')
      const price = createPrice(1000)

      // Branded types can be used where underlying types are expected:
      const urlQuery = new URLSearchParams({ id, price: String(price) })
      expect(urlQuery.get('id')).toBe('prop_123')
      expect(urlQuery.get('price')).toBe('1000')
    })
  })

  describe('Brand Erasure at Runtime', () => {
    it('should show that brands are erased at runtime', () => {
      const id = createPropertyId('test-id')
      const directString = 'test-id'

      // At runtime, both are equal (brand is erased)
      expect(id === directString).toBe(true)
      expect(id).toBe(directString)
    })

    it('should show that branded types are primitive values', () => {
      const price = createPrice(100)
      const directNumber = 100

      // Brands don't affect equality or operations
      expect(price === directNumber).toBe(true)
      expect(price + 50).toBe(150)
      expect(String(price)).toBe('100')
    })
  })

  describe('Validation Error Messages', () => {
    it('should provide clear error messages', () => {
      expect(() => createPrice(-100)).toThrow('Price cannot be negative')
      expect(() => createPropertyId('')).toThrow('PropertyId cannot be empty')
      expect(() => createLatitude(100)).toThrow('Latitude must be between -90 and 90')
      expect(() => createLongitude(200)).toThrow('Longitude must be between -180 and 180')
    })
  })
})
