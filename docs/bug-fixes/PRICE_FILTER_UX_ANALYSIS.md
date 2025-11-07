# Price Filter Component - Deep UX Analysis

**Status:** 🔴 Three Critical UX Issues Identified
**Date:** 2025-11-06
**Component:** `apps/web/components/map/filters/price-filter-dropdown.tsx`

---

## Executive Summary

Three interconnected UX issues in the price filter component stem from a **fundamental design mismatch** between the database minimum price and the desired user experience (allowing arbitrary 0 minimum).

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| **Range slider doesn't reach 0** | Database minimum (e.g., 380) hardcoded as UI minimum | Users cannot select 0-based minimums |
| **Inputs not fluid when typing** | Regex stripping non-digits during input events | Laggy/broken typing experience |
| **Delete minPrice shows 380** | Clear handler uses database minimum instead of actual 0 | Unintuitive behavior when clearing input |

---

## Issue #1: Range Slider Doesn't Reach 0

### Symptoms
- User cannot drag the minimum slider below the database minimum price (e.g., $380)
- `rangeMinBound` appears to be hardcoded to database minimum
- Expected behavior: slider should reach 0 to allow arbitrary minimum selection

### Root Cause Analysis

**Data Flow:**
```
Database (getPriceRange)
    ↓
priceRangeMin = 380 (actual minimum from DB)
    ↓
Map Store (initialize)
    ↓
price-filter-dropdown.tsx line 98-99
    const priceRangeMin = useMapStore((state) => state.priceRangeMin);
    ↓
Line 104: const rangeMinBound = priceRangeMin ?? 0
    ↓
Result: rangeMinBound = 380 (NOT 0!)
```

**The Problem:**
```typescript
// File: packages/database/src/repositories/properties.ts, line 455
const minPrice = priceAggregation._min.price ? Number(priceAggregation._min.price) : 0

// This returns the ACTUAL MINIMUM from database (e.g., 380)
// Not a "desired minimum" for UI purposes
```

The database query returns the **actual lowest price** of any property. This is then used as the "UI minimum bound", preventing users from setting a lower minimum.

**Secondary Problem - Slider Component:**

```typescript
// File: apps/web/components/map/filters/price-histogram-slider.tsx, line 36
const visibleDistribution = distribution!.length > 1
  ? distribution!.slice(1)  // ❌ REMOVES FIRST BUCKET!
  : distribution!

// The comment says: "excluir primer bucket $0 que es outlier"
// But this means the slider can NEVER reach 0 because the 0 bucket is removed from visibleDistribution
```

The histogram deliberately **excludes the $0 bucket** (thinking it's an outlier), so the slider can't represent it.

### Code Trace

**1. Price Range Initialization** (page.tsx:35):
```typescript
const { minPrice: priceRangeMin, maxPrice: priceRangeMax } =
  await propertyRepository.getPriceRange(repositoryFilters)

// Returns: { minPrice: 380, maxPrice: 45000000 }
// This is the ACTUAL database minimum, not UI minimum
```

**2. Store Hydration** (map-store-initializer.tsx:27-32):
```typescript
useMapStore.getState().initialize({
  priceDistribution,
  priceRangeMin,  // ← 380 from database
  priceRangeMax,
})
```

**3. UI Calculation** (price-filter-dropdown.tsx:104):
```typescript
const priceRangeMin = useMapStore((state) => state.priceRangeMin);  // 380
const rangeMinBound = priceRangeMin ?? 0  // Result: 380, NOT 0!
```

**4. Slider Constraint** (price-histogram-slider.tsx:36):
```typescript
// Even if we wanted 0, the slider can't show it because:
const visibleDistribution = distribution!.slice(1)  // Removes [{ bucket: 0, count: X }]

// Slider min value is always 0 (line 135) but it maps to visibleDistribution[0]
// which starts at bucket 100 (or whatever is second in the original distribution)
```

### Why This Happens

The **conflation of two different concepts**:

1. **Database Minimum** (what we got): The lowest price any property currently has
2. **UI Minimum** (what we need): The lowest price a user should be able to set (0 for flexibility)

The code confuses these by using the database minimum as the UI minimum.

---

## Issue #2: Inputs Not Fluid When Typing

### Symptoms
- When typing directly in price input fields, the input feels sluggish
- Characters may be stripped unexpectedly
- Typing experience is broken/jerky

### Root Cause Analysis

**The Problematic Regex:**

```typescript
// File: apps/web/components/map/filters/price-filter-dropdown.tsx
// Lines 174-187: handleInputMinChange

const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')  // ❌ PROBLEM HERE

    if (value === '') {
      setLocalMin(rangeMinBound)
    } else {
      const numValue = Number(value)
      if (numValue <= localMax) {
        setLocalMin(numValue)
      }
    }
  },
  [localMax, rangeMinBound]
)
```

**What's Happening:**

1. User types: "1" → `handleInputMinChange` fires
2. `e.target.value` = "1"
3. `/[^0-9]/g` strips non-digits (no-op, "1" remains)
4. `setLocalMin(1)` → state updates
5. Component re-renders
6. PriceInput displays: `formatNumberEcuador(1)` which returns formatted string

The regex itself isn't the direct issue, but **the way it's used in conjunction with the formatted display** creates a breaking experience:

```typescript
// PriceInput component, line 46
<input
  type="text"
  value={formatNumberEcuador(value)}  // Shows formatted: "1,00" or similar
  onChange={handleInputMinChange}
  // ...
/>
```

**The Actual Problem:**

When user types in the input, the flow is:
1. Input receives "1"
2. `handleInputMinChange` fires with event containing raw typed text
3. Regex strips to "1"
4. `setLocalMin(1)`
5. Component re-renders
6. Input value is now `formatNumberEcuador(1)` which is **formatted** (e.g., "1,00" or "$1,00")
7. Cursor position is lost because the formatted string is different length than raw input

**This is a common React input issue:** When you transform the display value (add commas, currency, etc) without tracking cursor position, the input becomes "jumpy".

### Example of the Jerky Behavior

```
User types:     1        2        3        0        0        0        0
Raw value:      1       12       123      1230     12300    123000   1230000
Formatted:      $1      $12      $123     $1,230   $12,300  $123,000 $1,230,000
Cursor jumps because string length changes with each digit!
```

---

## Issue #3: Deleting MinPrice Shows 380

### Symptoms
- User clears the minPrice input field (deletes all characters)
- Expected: Input should show 0 or be empty
- Actual: Input shows 380 (the database minimum)

### Root Cause Analysis

**The Code:**

```typescript
// File: apps/web/components/map/filters/price-filter-dropdown.tsx, lines 174-187

const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')

    if (value === '') {
      setLocalMin(rangeMinBound)  // ❌ PROBLEM: rangeMinBound = 380!
    } else {
      const numValue = Number(value)
      if (numValue <= localMax) {
        setLocalMin(numValue)
      }
    }
  },
  [localMax, rangeMinBound]
)
```

**The Issue:**

When input is cleared, the code does:
```typescript
setLocalMin(rangeMinBound)
```

And `rangeMinBound` is:
```typescript
const rangeMinBound = priceRangeMin ?? 0
// If priceRangeMin = 380 (from database), then rangeMinBound = 380
```

So clearing the input sets it to **380, not 0**.

**The Design Intent:**

The original code probably meant:
- "When user clears the input, snap back to the minimum bound"
- But "minimum bound" was interpreted as "database minimum" not "absolute minimum (0)"

### Comparison with handleInputMaxChange

Same pattern exists for max (lines 190-203):
```typescript
if (value === '') {
  setLocalMax(rangeMaxBound)  // Sets to database maximum!
}
```

---

## Design Pattern Analysis

All three issues stem from **conflating two concepts**:

### Current (Broken) Design:
```
priceRangeMin (from database) → rangeMinBound → UI minimum limit
priceRangeMax (from database) → rangeMaxBound → UI maximum limit

These are NOT the same as "what the user should be able to select"
```

### Correct Design:
```
priceRangeMin (from database) → Used ONLY for:
  ✓ Display: "Showing properties from $380"
  ✓ Analytics: "Database min is $380"

(but NOT for UI minimum bound)

UI Minimum Bound → Always 0 (allow user to set arbitrary low value)
UI Maximum Bound → Always something reasonable (2M or higher)
```

---

## Solutions

### Solution 1: Always Use 0 as UI Minimum

**File:** `price-filter-dropdown.tsx`

**Change Line 104:**
```typescript
// BEFORE:
const rangeMinBound = priceRangeMin ?? 0

// AFTER:
const rangeMinBound = 0  // Always allow 0 as minimum
const rangeMaxBound = priceRangeMax ?? 2000000  // Keep database max as reference
```

**Benefits:**
- Fixes Issue #1: Slider can now reach 0
- Fixes Issue #3: Clearing input sets to 0, not 380
- Users can filter for properties starting at $0 if they want (unlikely but flexible)

**Trade-offs:**
- Slider starts from database minimum visually, but can be dragged to 0
- Might be confusing to show slider range that doesn't match database

---

### Solution 2: Fix Input Fluidity (Cursor Position)

The regex `/[^0-9]/g` is correct for validation, but the formatted display breaks input fluidity.

**Option 2A: Use Uncontrolled Input + Formatting on Blur**

```typescript
// BEFORE: Controlled input with formatted display
<input
  type="text"
  value={formatNumberEcuador(value)}  // ❌ Formatted value breaks cursor
  onChange={handleInputMinChange}
/>

// AFTER: Uncontrolled input, format on display only
const [inputMin, setInputMin] = useState<string>(String(localMin))

const handleInputMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  setInputMin(raw)  // Keep raw value, no formatting during typing

  if (raw === '') {
    setLocalMin(0)  // ✅ Fix Issue #3
  } else {
    const numValue = Number(raw)
    if (numValue <= localMax) {
      setLocalMin(numValue)
    }
  }
}

const handleInputBlur = () => {
  // Format only when user leaves the field
  setInputMin(String(localMin))
}

// Render:
<input
  type="text"
  value={inputMin}  // ✅ Raw value, no formatting = fluid input
  onChange={handleInputMinChange}
  onBlur={handleInputBlur}
/>
```

**Benefits:**
- Input is fluid while typing (no cursor jumping)
- Formatted display appears after user leaves field
- Native input behavior feels normal

**Trade-offs:**
- Input shows unformatted numbers while typing (e.g., "1234567" instead of "$1,234,567")
- Requires additional `inputMin`/`inputMax` state

---

### Option 2B: Keep Formatted Display, Use Selection Range Preservation

```typescript
const handleInputMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  const prevLength = formatNumberEcuador(localMin).length
  const newLength = formatNumberEcuador(raw === '' ? 0 : Number(raw)).length
  const cursorDelta = newLength - prevLength

  if (raw === '') {
    setLocalMin(0)
  } else {
    const numValue = Number(raw)
    if (numValue <= localMax) {
      setLocalMin(numValue)
    }
  }

  // Restore cursor position (requires ref to input)
  setTimeout(() => {
    if (inputMinRef.current) {
      const currentPos = e.currentTarget.selectionStart || 0
      const newPos = Math.max(0, currentPos + cursorDelta)
      inputMinRef.current.setSelectionRange(newPos, newPos)
    }
  }, 0)
}
```

**Benefits:**
- Keeps formatted display
- Cursor doesn't jump as much
- More polished UX

**Trade-offs:**
- More complex code
- Still jerky because formatting logic is hard to predict

---

### Solution 3: Fix Delete Behavior

**File:** `price-filter-dropdown.tsx`, lines 176-184

**BEFORE:**
```typescript
if (value === '') {
  setLocalMin(rangeMinBound)  // ❌ Sets to 380
}
```

**AFTER:**
```typescript
if (value === '') {
  setLocalMin(0)  // ✅ Sets to 0
}
```

Also for maxPrice (line 194):
```typescript
if (value === '') {
  setLocalMax(rangeMaxBound)  // ❌ Problematic if using Option 1
}
```

If using Solution 1 (rangeMinBound = 0), this becomes:
```typescript
if (value === '') {
  setLocalMin(0)  // ✅ Correct
}
```

---

## Recommended Implementation Path

### Phase 1: Quick Fixes (30 mins)

1. **Fix Issue #3** (delete shows 380):
   - Change line 104: `const rangeMinBound = 0`
   - Change lines 178, 194: Set to 0 instead of rangeMinBound

2. **Test:**
   - Open price filter
   - Clear minPrice input → should show 0, not 380
   - Slider should now reach 0

### Phase 2: Fix Input Fluidity (1 hour)

Choose either Option 2A (recommended) or 2B:

**Option 2A (Simpler):**
- Add `inputMin`/`inputMax` state for raw values
- Remove formatting from controlled value
- Format only on blur/display

**Option 2B (Polish):**
- Keep formatted display
- Add cursor position preservation logic

### Phase 3: Refactor for Better Design (2-3 hours)

- Rename `priceRangeMin`/`priceRangeMax` to `databaseMinPrice`/`databaseMaxPrice` for clarity
- Add new state: `userMinBound`/`userMaxBound` (always 0 and 2M)
- Update all references
- Document the distinction

---

## Testing Checklist

After implementing fixes, verify:

```
[ ] Open price filter dropdown
[ ] Clear minPrice input → shows 0 (not 380)
[ ] Clear maxPrice input → shows 2000000 (not database max)
[ ] Type "50000" in minPrice → input is fluid, no jumping
[ ] Type "100000" in maxPrice → input is fluid, no jumping
[ ] Drag slider minimum to 0 → works smoothly
[ ] Drag slider maximum to right → works smoothly
[ ] Click "Listo" → filter applies correctly
[ ] URL reflects minimum: ?minPrice=50000&maxPrice=100000
```

---

## Files to Modify

```
apps/web/components/map/filters/price-filter-dropdown.tsx
├── Line 104: Change rangeMinBound calculation
├── Lines 174-187: Fix handleInputMinChange
├── Lines 190-203: Fix handleInputMaxChange
└── [Optional] Add inputMin/inputMax state for Option 2A

apps/web/components/map/filters/price-histogram-slider.tsx
├── [Optional] Line 36: Investigate if slice(1) is necessary
└── [Optional] Allow rendering $0 bucket
```

---

## Summary

| Issue | Root Cause | Quick Fix | Proper Fix |
|-------|-----------|-----------|-----------|
| **Slider can't reach 0** | Database min used as UI min | Set rangeMinBound = 0 | Separate concepts: DB min vs UI min |
| **Inputs not fluid** | Formatted display breaks cursor | Use unformatted input while typing | Cursor position preservation + formatting on blur |
| **Delete shows 380** | Clear handler uses rangeMinBound | Set clear handler to 0 | Same as slider fix |

The **root cause of all three issues** is treating the database minimum price as the UI minimum price. These are fundamentally different concepts that should be separated.

