# Type System Architecture - Visual Guide

## Current State (Problematic)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRISMA SCHEMA                                  │
│  price: Decimal(12,2), bathrooms: Decimal(3,1)?, area: Decimal(10,2)?  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PRISMA CLIENT (Runtime - NOT JSON serializable)            │
│  PropertyWithRelations {                                                │
│    price: Decimal object                                               │
│    bathrooms: Decimal | null                                           │
│    area: Decimal | null                                                │
│    latitude: Decimal | null                                            │
│    longitude: Decimal | null                                           │
│  }                                                                       │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ❌ MANUAL CONVERSION (error-prone)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SERVER COMPONENT - toNumber() function (lines 705-713)                 │
│  Problem: Different logic for each field, no type safety                │
│  ❌ Decimal not validated → could be invalid                            │
│  ❌ No type assertion that output is JSON-safe                          │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           SERIALIZED PROPERTY (Definition 1: @repo/database)            │
│  bathrooms?: number | null  ← Optional + nullable                      │
│  area?: number | null                                                   │
│  bedrooms?: number | null                                               │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                   ✓ JSON.stringify() works
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│        SERVER → CLIENT (JSON serialization across boundary)             │
│  {"id":"123","price":250000,"bathrooms":2,...}                         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│       CLIENT RECEIVES (Definition 2: apps/web/lib/utils/)               │
│  bathrooms: number | null  ← Required, not optional ← CONFLICTING!     │
│  area: number | null                                                    │
│  bedrooms: number | null                                                │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ❌ TYPE MISMATCH - TypeScript error
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              COMPONENT USES 'as any' TO BYPASS ERROR                    │
│  const property = data as any  ← UNSAFE!                               │
│  const form = <PropertyForm property={property as any} />              │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ❌ Runtime type errors possible
                                   ▼
                              Component Code
```

---

## Target State (Type-Safe)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRISMA SCHEMA                                  │
│  Source of Truth: price, bathrooms, area (Decimal)                     │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│            PRISMA TYPES (Automatically Generated)                       │
│  PropertyWithRelations {                                                │
│    price: Decimal (branded with validation)                            │
│    bathrooms: Decimal | null                                           │
│    area: Decimal | null                                                │
│  }                                                                       │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ✓ TYPE GUARDS (Runtime checks)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         MAPPER (Single, Type-Safe Conversion Point)                     │
│  mapPropertyToSerialized(PropertyWithRelations)                         │
│  ✓ Validates Decimal conversion                                        │
│  ✓ Ensures fields are either number or null (not undefined)           │
│  ✓ Asserts output is JSON-serializable                                │
│  ✓ Returns SerializedProperty (branded, validated)                    │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ✓ TYPE SAFE: Compiler validates
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              SERIALIZED PROPERTY (Single Definition)                    │
│  ✓ Exported from @repo/database only                                   │
│  ✓ Consistent nullable: number | null (not undefined)                 │
│  ✓ All fields JSON-serializable (no Decimal objects)                   │
│  ✓ Type-branded for additional validation                              │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ✓ JSON.stringify() works
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│        SERVER → CLIENT (JSON serialization across boundary)             │
│  {"id":"123","price":250000,"bathrooms":2,...}                         │
│  ✓ Type is SerializedProperty (branded)                                │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ✓ CLIENT RECEIVES (Validated)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              COMPONENT (Type-Safe, no 'as any')                          │
│  const property: SerializedProperty = data                              │
│  ✓ Compiler ensures type safety                                        │
│  ✓ No type casting needed                                              │
│  ✓ All fields properly typed                                           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ✓ Safe to use property.bedrooms (number | null)
                                   ▼
                          ✓ 100% Type-Safe
```

---

## Mapper Detail (The Conversion Point)

```
INPUT (PropertyWithRelations)
│
├─ id: string                    ✓ Already correct type
├─ title: string                 ✓ Already correct type
├─ price: Decimal {              ← CONVERT
│    _precision: 12
│    _scale: 2
│    value: "250000.00"
│  }
├─ bathrooms: Decimal | null {   ← CONVERT (or null)
│    _precision: 3
│    _scale: 1
│    value: "2.0"
│  }
├─ area: Decimal | null {        ← CONVERT (or null)
│    ...
│  }
├─ latitude: Decimal | null {    ← CONVERT (or null)
│    ...
│  }
├─ city: string | null           ← CONVERT (null → undefined)
├─ state: string | null          ← CONVERT (null → undefined)
├─ createdAt: Date               ✓ Already JSON-serializable
├─ updatedAt: Date               ✓ Already JSON-serializable
└─ images: PropertyImage[]       ✓ Already correct

    ▼ [MAPPER: mapPropertyToSerialized()]

OUTPUT (SerializedProperty)
│
├─ id: string                    ✓ Same
├─ title: string                 ✓ Same
├─ price: number                 ✓ Converted: 250000
│                                  Validated: number > 0
│                                  Branded: Price type
├─ bathrooms: number | null      ✓ Converted: 2 (or null)
├─ area: number | null           ✓ Converted: 150.5 (or null)
├─ latitude: number | null       ✓ Converted: -0.12345678 (or null)
├─ city: string | undefined      ✓ Converted: "Quito" (or undefined)
├─ state: string | undefined     ✓ Converted: "Pichincha" (or undefined)
├─ createdAt: Date               ✓ Same (JSON serializable)
├─ updatedAt: Date               ✓ Same (JSON serializable)
└─ images: PropertyImage[]       ✓ Same

    ▼ [JSON.stringify() - Always succeeds]

JSON OUTPUT
│
└─ {"id":"123","price":250000,"bathrooms":2,"area":150.5,"city":"Quito",...}
```

---

## Type Guards Strategy

```
UNTRUSTED INPUT
(URL params, API responses, localStorage)
│
├─ SafeParsePropertyFilters(data)
│  │
│  ├─ Success ──→ PropertyFiltersInput ✓
│  │
│  └─ Failure ──→ ZodError (logged, safe default)
│
├─ assertIsSerializedProperty(obj)
│  │
│  ├─ Pass ──→ asserts obj is SerializedProperty ✓
│  │
│  └─ Fail ──→ TypeError thrown (caught at boundary)
│
└─ isPropertyCategory(value)
   │
   ├─ True ──→ value is PropertyCategory ✓
   │
   └─ False ──→ false (caller handles)

    All paths: Type-safe in calling code
```

---

## Files Involved in Refactor

### Create (New Files)

```
packages/database/src/
├─ types/
│  ├─ branded.ts              ← PropertyId, Price, PropertyCategory brands
│  ├─ guards.ts               ← Type guards and assertion functions
│  └─ __tests__/
│     └─ guards.test.ts
├─ validators/
│  └─ filters.ts              ← Zod schemas for PropertyFilters
├─ mappers/
│  ├─ property-mapper.ts      ← Decimal → number conversions
│  └─ __tests__/
│     └─ property-mapper.test.ts

apps/web/lib/email/
└─ types.ts                   ← Resend response types
```

### Delete (Remove Files)

```
apps/web/lib/utils/
└─ serialize-property.ts      ← DELETE (consolidate in @repo/database)
```

### Update (Modify Existing)

```
packages/database/src/repositories/
└─ properties.ts              ← Use mapper, remove old serialization logic

apps/web/lib/utils/
├─ url-helpers.ts             ← Use Zod validators
└─ (30+ files with 'as any')  ← Remove casts, use type guards

apps/web/components/
├─ map/filters/
│  ├─ use-map-filters.ts      ← Replace 'as any' with type guards
│  └─ use-filter-url-sync.ts  ← Use validators
├─ email/
│  └─ appointment-emails.ts   ← Use Resend types
└─ (many others)              ← Import from consolidated types
```

---

## Benefits of Refactor

### Before: Cost of Type System
- ❌ 30+ `as any` casts (bugs waiting to happen)
- ❌ Duplicate type definitions (confusion, sync issues)
- ❌ Manual conversions (prone to errors)
- ❌ No validation at boundaries (silent failures possible)
- ❌ Build fails on type checks (CI blocks)
- ⏱️ Time spent on type debugging (frustrating)

### After: Type-Safe System
- ✅ 0 `as any` casts (except in well-documented mappers)
- ✅ Single source of truth for types (DRY)
- ✅ Validated conversions (explicit, tested)
- ✅ Type guards at boundaries (fail fast)
- ✅ Build passes (CI green ✓)
- ⏱️ Less debugging, more feature work
- 💪 Confidence in refactoring (types guide changes)

---

## Success Metrics

```
BEFORE (Current)          AFTER (Target)
───────────────          ──────────────
30+ 'as any'       →     0 'as any'
2 type definitions →     1 type definition
Manual conversions →     Validated mappers
Type errors at build →   0 errors at build
Duplicate logic    →     Mappers in one place
No boundary guards →     Type guards everywhere
Unknown at runtime →     All validated
```

---

## Phase Breakdown

```
Phase 1: Consolidate Types (4-5 hours)
├─ Merge SerializedProperty definitions
├─ Create branded types
└─ Create type guards

Phase 2: Mappers & Validation (3-4 hours)
├─ Create property mapper
├─ Add Zod validators
└─ Add Resend types

Phase 3: Remove 'as any' (2-3 hours)
├─ Replace in 15+ files
├─ Use type guards instead
└─ Verify type safety

Phase 4: Testing (2-3 hours)
├─ Write guard tests
├─ Write mapper tests
└─ Verify build passes

Total: 11-15 hours of focused work
```

---

## Next Steps

1. **Week 1:** Implement Phase 1 & 2
2. **Week 2:** Execute Phase 3 & 4
3. **Week 3:** Verification, documentation, cleanup

✅ **Then:** Build passes with 0 type errors
✅ **Then:** Clean, maintainable type system
✅ **Then:** Developers can confidently refactor
