# Type System Refactor - Strategic Plan

**Status:** 🔴 IN PROGRESS
**Last Updated:** Nov 17, 2025
**Severity:** HIGH - Affects build validation and developer experience
**Estimated Effort:** 8-12 hours
**Priority:** MEDIUM - No runtime impact, but blocks build verification

---

## Executive Summary

The monorepo has **critical inconsistencies in the type system**:

1. **Duplicate Type Definitions** (2 versions of `SerializedProperty`)
2. **Inconsistent Nullability** (undefined vs null for optional fields)
3. **30+ `as any` Casts** (bypassing type safety at boundaries)
4. **No Type Guards** (URL params, Resend responses, Mapbox data)
5. **Manual Conversions** (Decimal → number without validation)

**Goal:** Create a type-safe architecture with proper validators, mappers, and guards at system boundaries.

---

## Architecture Overview

### Current State (Problematic)

```
Prisma Schema (Decimal, Date, null)
    ↓
PropertyWithRelations (Contains Decimal)
    ↓
[MANUAL: serializeProperty() - Decimal → number]
    ↓
SerializedProperty (Definition 1 in @repo/database)
    ↓
Server Component JSON serialization
    ↓
Client receives data + [Definition 2 in apps/web - CONFLICTING]
    ↓
Components use 'as any' to bypass type errors
```

### Target State (Type-Safe)

```
Prisma Schema (Source of truth)
    ↓
Generated Types via Prisma Client
    ↓
Branded Types (NewType pattern for validation)
    ↓
Mappers (Prisma → Serialized, validated)
    ↓
Type Guards (Runtime validation at boundaries)
    ↓
Server → Client (Type-safe JSON serialization)
    ↓
Client Components (Receive validated types)
    ↓
100% 'as const', 0% 'as any'
```

---

## Phase 1: Type Definitions (CRITICAL)

### 1.1 Consolidate SerializedProperty

**Current State:**
- Definition 1: `packages/database/src/repositories/properties.ts:686-698`
- Definition 2: `apps/web/lib/utils/serialize-property.ts:57-66`
- **INCOMPATIBLE** on nullable fields

**Action:**
1. Keep Definition 1 as the source of truth
2. Remove Definition 2 from apps/web
3. Update all imports in apps/web to use @repo/database export

**File Changes:**

**A) Update `packages/database/src/repositories/properties.ts`**

```typescript
// BEFORE (lines 686-698)
export type SerializedProperty = Omit<
  PropertyWithRelations,
  'price' | 'bathrooms' | 'area' | 'latitude' | 'longitude' | 'city' | 'state' | 'bedrooms'
> & {
  price: number
  bathrooms?: number | null        // Optional AND nullable
  area?: number | null
  latitude: number | null
  longitude: number | null
  city?: string
  state?: string
  bedrooms?: number | null
}

// AFTER (Clarified)
/**
 * Serialized property with all Decimal fields converted to numbers
 *
 * Nullable fields:
 * - bedrooms, bathrooms, area: Can be null if not specified, undefined if not populated
 * - latitude, longitude: Can be null if property has no location data
 * - city, state: Can be undefined if not populated
 *
 * All fields are guaranteed to be JSON-serializable (no Decimal objects)
 */
export type SerializedProperty = Omit<
  PropertyWithRelations,
  'price' | 'bathrooms' | 'area' | 'latitude' | 'longitude' | 'city' | 'state' | 'bedrooms'
> & {
  price: number                     // REQUIRED: Always present, never null
  bedrooms: number | null           // Can be null, but field exists
  bathrooms: number | null          // Can be null, but field exists
  area: number | null               // Can be null, but field exists
  latitude: number | null           // Can be null (no location data)
  longitude: number | null          // Can be null (no location data)
  city: string | undefined          // Can be undefined if not provided
  state: string | undefined         // Can be undefined if not provided
}
```

**B) Delete `apps/web/lib/utils/serialize-property.ts`**

Remove the entire file and update all imports.

**C) Update imports across apps/web**

```bash
# Find all imports
grep -r "from.*serialize-property" apps/web/

# Replace with:
// OLD: import { SerializedProperty } from "@/lib/utils/serialize-property"
// NEW: import { SerializedProperty } from "@repo/database"
```

**Files to update imports:**
- `apps/web/stores/property-grid-store.ts`
- `apps/web/components/properties/property-card.tsx`
- `apps/web/components/properties/property-form.tsx`
- `apps/web/components/properties/property-list-schema.tsx`
- `apps/web/app/actions/properties.ts`
- Any test files in `apps/web/__tests__/`

---

### 1.2 Create Branded Types for Validation

**Create:** `packages/database/src/types/branded.ts`

```typescript
/**
 * Branded types using TypeScript's type branding pattern
 *
 * This ensures type safety at runtime by creating distinct types
 * that can only be created through validated constructors.
 *
 * Example:
 *   const id = PropertyId.create("123") // Type: PropertyId
 *   const fake = "123" as PropertyId    // ❌ Type error! Cannot create without create()
 */

// Property ID - Validates UUID format
export type PropertyId = string & { readonly __brand: 'PropertyId' }

export const PropertyId = {
  create: (id: string): PropertyId | null => {
    // Validate UUID format (simple check)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return null
    }
    return id as PropertyId
  },

  parse: (id: unknown): PropertyId => {
    if (typeof id !== 'string') throw new Error('Invalid PropertyId')
    const result = PropertyId.create(id)
    if (!result) throw new Error(`Invalid PropertyId format: ${id}`)
    return result
  }
}

// Category - Validated against enum values
export type PropertyCategoryBranded = string & { readonly __brand: 'PropertyCategory' }

export const PropertyCategoryBranded = {
  create: (cat: string): PropertyCategoryBranded | null => {
    const valid = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'OTHER'] as const
    return valid.includes(cat as any) ? (cat as PropertyCategoryBranded) : null
  },

  parse: (cat: unknown): PropertyCategoryBranded => {
    if (typeof cat !== 'string') throw new Error('Invalid PropertyCategory')
    const result = PropertyCategoryBranded.create(cat)
    if (!result) throw new Error(`Invalid PropertyCategory: ${cat}`)
    return result
  }
}

// Price - Validated to be positive number
export type Price = number & { readonly __brand: 'Price' }

export const Price = {
  create: (price: number): Price | null => {
    if (price < 0 || !Number.isFinite(price)) return null
    return (Math.round(price * 100) / 100) as Price // Round to 2 decimals
  },

  parse: (price: unknown): Price => {
    if (typeof price !== 'number') throw new Error('Invalid Price')
    const result = Price.create(price)
    if (!result) throw new Error(`Invalid Price: ${price}`)
    return result
  }
}
```

---

### 1.3 Create Type Guards

**Create:** `packages/database/src/types/guards.ts`

```typescript
import type { PropertyWithRelations, SerializedProperty } from '../repositories/properties'
import type { PropertyCategory, TransactionType } from '@prisma/client'

/**
 * Type guards for runtime validation at system boundaries
 */

export function isPropertyWithRelations(obj: unknown): obj is PropertyWithRelations {
  if (typeof obj !== 'object' || obj === null) return false

  const p = obj as Record<string, unknown>

  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.price === 'object' && // Decimal type
    typeof p.createdAt === 'object' && // Date type
    typeof p.updatedAt === 'object' && // Date type
    p.images !== undefined &&
    Array.isArray(p.images)
  )
}

export function isSerializedProperty(obj: unknown): obj is SerializedProperty {
  if (typeof obj !== 'object' || obj === null) return false

  const p = obj as Record<string, unknown>

  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.price === 'number' && // Converted to number
    typeof p.createdAt === 'object' && // Date
    typeof p.updatedAt === 'object' && // Date
    (p.bedrooms === null || typeof p.bedrooms === 'number') &&
    (p.bathrooms === null || typeof p.bathrooms === 'number') &&
    (p.area === null || typeof p.area === 'number')
  )
}

export function isPropertyCategory(value: unknown): value is PropertyCategory {
  const valid = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL']
  return typeof value === 'string' && valid.includes(value)
}

export function isTransactionType(value: unknown): value is TransactionType {
  const valid = ['SALE', 'RENT']
  return typeof value === 'string' && valid.includes(value)
}

// Assertion functions for throwing errors in strict type contexts
export function assertIsSerializedProperty(
  obj: unknown,
  ctx?: string
): asserts obj is SerializedProperty {
  if (!isSerializedProperty(obj)) {
    throw new TypeError(
      `Expected SerializedProperty${ctx ? ` in ${ctx}` : ''}, got ${typeof obj}`
    )
  }
}
```

---

## Phase 2: Mappers (Type-Safe Conversions)

### 2.1 Create Mapper Utilities

**Create:** `packages/database/src/mappers/property-mapper.ts`

```typescript
/**
 * Type-safe mappers for converting between Prisma and Serialized types
 *
 * Mappers are the ONLY place where 'as any' is allowed (and documented)
 * because they explicitly handle type conversions.
 */

import type { PropertyWithRelations, SerializedProperty } from '../repositories/properties'
import { Price, PropertyCategoryBranded } from '../types/branded'

/**
 * Convert Prisma Decimal to number with validation
 * Returns null if conversion is invalid
 */
function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  try {
    const num = Number(value)
    if (!Number.isFinite(num)) {
      console.error(`[PropertyMapper] Invalid decimal conversion: ${value}`)
      return null
    }
    return num
  } catch (error) {
    console.error(`[PropertyMapper] Decimal conversion error:`, error)
    return null
  }
}

/**
 * Map PropertyWithRelations (Prisma) → SerializedProperty (JSON-safe)
 *
 * This is the ONLY place where Decimal → number conversion happens.
 * All other code receives the converted type.
 */
export function mapPropertyToSerialized(
  property: PropertyWithRelations
): SerializedProperty {
  const price = decimalToNumber(property.price)

  if (price === null) {
    throw new Error(
      `[PropertyMapper] Cannot serialize property ${property.id}: invalid price`
    )
  }

  return {
    ...property,
    // Explicitly convert Decimal fields
    price: Price.create(price) ?? price, // Branded type or fallback
    bedrooms: decimalToNumber(property.bedrooms),
    bathrooms: decimalToNumber(property.bathrooms),
    area: decimalToNumber(property.area),
    latitude: decimalToNumber(property.latitude),
    longitude: decimalToNumber(property.longitude),
    // Ensure city/state are undefined, not null
    city: property.city ?? undefined,
    state: property.state ?? undefined,
  } as SerializedProperty
}

/**
 * Map array of properties
 */
export function mapPropertiesToSerialized(
  properties: PropertyWithRelations[]
): SerializedProperty[] {
  return properties.map(mapPropertyToSerialized)
}

/**
 * Validate SerializedProperty is JSON-serializable
 * Use after mapping to catch conversion errors early
 */
export function validateSerializableProperty(prop: SerializedProperty): void {
  try {
    JSON.stringify(prop)
  } catch (error) {
    throw new Error(
      `[PropertyMapper] Property ${prop.id} is not JSON-serializable: ${error}`
    )
  }
}
```

**Update:** `packages/database/src/repositories/properties.ts`

Replace manual `serializeProperty()` function with mapper:

```typescript
// BEFORE (lines 720-746)
export function serializeProperty(property: PropertyWithRelations): SerializedProperty {
  return {
    ...property,
    price: toNumber(property.price) ?? 0,
    bathrooms: property.bathrooms !== null && property.bathrooms !== undefined
      ? toNumber(property.bathrooms)
      : undefined,
    // ... manual logic for each field
  }
}

// AFTER
export { mapPropertyToSerialized as serializeProperty } from './mappers/property-mapper'
export { mapPropertiesToSerialized as serializeProperties } from './mappers/property-mapper'
```

---

## Phase 3: Input Validation (URL Params, API Responses)

### 3.1 URL Filter Validation with Zod

**Create:** `packages/database/src/validators/filters.ts`

```typescript
/**
 * Zod validators for PropertyFilters extracted from URL params
 *
 * Ensures type safety when converting string URL params to typed filters
 */

import { z } from 'zod'
import type { PropertyCategory, TransactionType } from '@prisma/client'

export const PropertyCategorySchema = z.enum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'])
export const TransactionTypeSchema = z.enum(['SALE', 'RENT'])

export const PropertyFiltersSchema = z.object({
  city: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().nonnegative().optional(),
  category: z.union([PropertyCategorySchema, PropertyCategorySchema.array()]).optional(),
  transactionType: z.union([TransactionTypeSchema, TransactionTypeSchema.array()]).optional(),
  address: z.string().optional(),
}).strict()

export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>

/**
 * Parse and validate filters from URL params
 * Returns validated filters or throws ZodError
 */
export function parsePropertyFilters(
  input: unknown
): PropertyFiltersInput {
  const validated = PropertyFiltersSchema.parse(input)
  return validated
}

/**
 * Safe parse - returns { success: true/false, data, error }
 */
export function safeParsePropertyFilters(input: unknown) {
  return PropertyFiltersSchema.safeParse(input)
}
```

**Use in:** `apps/web/lib/utils/url-helpers.ts`

```typescript
// BEFORE
export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): PropertyFilters {
  return {
    category: searchParams.category as any,  // ← 'as any' here
    transactionType: searchParams.transactionType as any,
    // ...
  }
}

// AFTER
import { safeParsePropertyFilters } from '@repo/database'

export function parseFilterParams(
  searchParams: Record<string, string | string[] | undefined>
): PropertyFilters {
  const result = safeParsePropertyFilters(searchParams)

  if (!result.success) {
    console.error('[parseFilterParams] Validation error:', result.error)
    // Return safe defaults
    return {}
  }

  return result.data
}
```

---

### 3.2 Resend Response Typing

**Create:** `apps/web/lib/email/types.ts`

```typescript
/**
 * Type definitions for Resend API responses
 * Eliminates 'as any' casts in email functions
 */

export interface ResendEmailResponse {
  id: string
  from?: string
  to?: string
  created_at?: string
  subject?: string
}

export interface ResendSendResult {
  data?: ResendEmailResponse
  error?: {
    message: string
    [key: string]: unknown
  }
}
```

**Update:** `apps/web/lib/email/appointment-emails.ts`

```typescript
// BEFORE (line 118)
emailId: clientSuccess ? (clientResult.data as any)?.id : null,

// AFTER
import type { ResendSendResult } from './types'

const clientResult = await resend.emails.send(...) as ResendSendResult
emailId: clientSuccess && clientResult.data?.id ? clientResult.data.id : null,
```

---

## Phase 4: Removing `as any` Systematically

### 4.1 Audit and Replace All `as any`

**Location 1: `apps/web/lib/email/appointment-emails.ts` (8 instances)**

→ Use Resend Response typing (Phase 3.2)

**Location 2: `apps/web/components/map/filters/use-map-filters.ts` (7 instances)**

```typescript
// BEFORE
const updated = current.includes(type as any)
  ? current.filter((t) => t !== type)
  : [...current, type as any]

// AFTER
import { isPropertyCategory, isTransactionType } from '@repo/database'

function toggleCategory(current: PropertyCategory[], cat: unknown): PropertyCategory[] {
  if (!isPropertyCategory(cat)) {
    console.error('[useMapFilters] Invalid category:', cat)
    return current
  }

  return current.includes(cat)
    ? current.filter((c) => c !== cat)
    : [...current, cat]
}
```

**Location 3: `apps/web/components/map/filters/use-filter-url-sync.ts` (4 instances)**

→ Use `PropertyFiltersSchema` validator (Phase 3.1)

**Location 4: `apps/web/stores/favorites-store.ts` (2 instances)**

```typescript
// BEFORE
favorites: persistedState && (persistedState as any).favorites ? ... : ...

// AFTER
interface PersistedState {
  favorites?: string[]
}

function loadFavorites(saved: unknown): string[] {
  if (typeof saved !== 'object' || saved === null) return []

  const state = saved as Record<string, unknown>
  if (!Array.isArray(state.favorites)) return []

  return state.favorites.filter((f): f is string => typeof f === 'string')
}
```

**Location 5: `apps/web/components/map/map-view.tsx` (2 instances)**

→ Use Mapbox type definitions or create wrapper types

**Location 6: `apps/web/app/(public)/propiedades/page.tsx` (2 instances)**

```typescript
// BEFORE
filters={filters as any}

// AFTER
import { PropertyFiltersSchema } from '@repo/database'

const validatedFilters = PropertyFiltersSchema.parse(filters)
<MapStoreInitializer filters={validatedFilters} />
```

---

## Phase 5: Testing Strategy

### 5.1 Type Guard Tests

**Create:** `packages/database/src/types/__tests__/guards.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  isSerializedProperty,
  isPropertyCategory,
  assertIsSerializedProperty,
} from '../guards'

describe('Type Guards', () => {
  describe('isSerializedProperty', () => {
    it('accepts valid serialized properties', () => {
      const prop = {
        id: '123',
        title: 'House',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
        // ... other fields
      }

      expect(isSerializedProperty(prop)).toBe(true)
    })

    it('rejects Decimal objects', () => {
      const prop = {
        id: '123',
        price: { _precision: 12, _scale: 2 }, // Decimal object
      }

      expect(isSerializedProperty(prop)).toBe(false)
    })
  })
})
```

### 5.2 Mapper Tests

**Create:** `packages/database/src/mappers/__tests__/property-mapper.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { mapPropertyToSerialized } from '../property-mapper'
import { createMockPropertyWithRelations } from '../__fixtures__'

describe('Property Mapper', () => {
  it('converts Decimal to number', () => {
    const prismaProperty = createMockPropertyWithRelations({
      price: new Decimal('250000.00'),
      area: new Decimal('150.50'),
    })

    const serialized = mapPropertyToSerialized(prismaProperty)

    expect(serialized.price).toBe(250000)
    expect(typeof serialized.price).toBe('number')
    expect(serialized.area).toBe(150.5)
  })

  it('throws on invalid price', () => {
    const invalidProperty = createMockPropertyWithRelations({
      price: new Decimal('invalid'),
    })

    expect(() => mapPropertyToSerialized(invalidProperty)).toThrow()
  })
})
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Phase 1.1 - Consolidate SerializedProperty definition
- [ ] Phase 1.2 - Create branded types
- [ ] Phase 1.3 - Create type guards

### Week 2: Mappers & Validation
- [ ] Phase 2.1 - Create mapper utilities
- [ ] Phase 3.1 - Add Zod validators for filters
- [ ] Phase 3.2 - Add Resend type definitions

### Week 3: Cleanup
- [ ] Phase 4.1 - Remove all `as any` casts
- [ ] Phase 5.1-5.2 - Add tests
- [ ] Build verification & type-checking

---

## Success Criteria

✅ **0 instances of `as any`** in non-test code (except mappers where documented)
✅ **100% build passes** with `bun run build`
✅ **Type safety** at all system boundaries (URL params, API responses, Mapbox)
✅ **Test coverage** for all type guards and mappers (>80%)
✅ **Documentation** in code comments explaining type conversions

---

## References

- [TypeScript Branded Types Pattern](https://www.npmjs.com/package/ts-brand)
- [Zod Validation Guide](https://zod.dev)
- [Type Guards in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Resilient Type Conversions](https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/)

---

**Next Step:** Start with Phase 1.1 - Consolidate SerializedProperty definition
