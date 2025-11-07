# Price Filter - Implementation Fixes

**Status:** Ready to implement
**Estimated Time:** 1-2 hours (Phase 1 + 2)
**Risk Level:** Low (isolated component)

---

## Quick Summary

Three fixes needed for `price-filter-dropdown.tsx`:

1. **Fix Issue #3 + #1:** Change line 104 from `rangeMinBound = priceRangeMin ?? 0` to `rangeMinBound = 0`
2. **Fix Issue #3:** Change lines 178, 194 to set input to 0 when cleared (not database min)
3. **Fix Issue #2:** Separate raw input value from formatted display to restore fluidity

---

## PHASE 1: Quick Fixes (Issues #1 and #3)

### File: `apps/web/components/map/filters/price-filter-dropdown.tsx`

#### Fix 1.1: Line 104 - Set UI Minimum to 0

**BEFORE:**
```typescript
// Determinar los límites del rango basado en BD o defaults (ahora del store)
const rangeMinBound = priceRangeMin ?? 0
const rangeMaxBound = priceRangeMax ?? 2000000
```

**AFTER:**
```typescript
// Determinar los límites del rango basado en BD o defaults (ahora del store)
// ✅ UI minimum is ALWAYS 0 (separated from database minimum)
const rangeMinBound = 0
const rangeMaxBound = priceRangeMax ?? 2000000
```

**Why:** Separates database minimum (informational) from UI minimum (user control bound).

---

#### Fix 1.2: Lines 176-184 - Clear Input Sets to 0 (Not 380)

**BEFORE:**
```typescript
// Handler para cambios en input mínimo
const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMin(rangeMinBound)  // ❌ Sets to 380 (database min)
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

**AFTER:**
```typescript
// Handler para cambios en input mínimo
const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMin(0)  // ✅ Sets to 0 (true minimum)
    } else {
      const numValue = Number(value)
      if (numValue <= localMax) {
        setLocalMin(numValue)
      }
    }
  },
  [localMax]  // ✅ Remove rangeMinBound from deps (not used)
)
```

**Why:** When user clears input, should reset to 0 (absolute minimum), not 380 (database minimum).

---

#### Fix 1.3: Lines 190-203 - Consistency for Max Input

**BEFORE:**
```typescript
// Handler para cambios en input máximo
const handleInputMaxChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMax(rangeMaxBound)  // ✅ This is OK (2000000)
    } else {
      const numValue = Number(value)
      if (numValue >= localMin) {
        setLocalMax(numValue)
      }
    }
  },
  [localMin, rangeMaxBound]
)
```

**AFTER:**
```typescript
// Handler para cambios en input máximo
const handleInputMaxChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMax(rangeMaxBound)  // ✅ Keep as-is (defaults to 2000000)
    } else {
      const numValue = Number(value)
      if (numValue >= localMin) {
        setLocalMax(numValue)
      }
    }
  },
  [localMin, rangeMaxBound]
)
```

**Why:** No change needed for max (works correctly). Max bound is reasonable at 2M.

---

### Test Phase 1 Fixes

After implementing fixes 1.1-1.3:

```bash
# 1. Restart dev server (no rebuild needed)
bun run dev:web

# 2. Open browser to http://localhost:3000/mapa
# 3. Click price filter dropdown
# 4. Test:
#    ✓ Clear minPrice input → should show 0 (not 380)
#    ✓ Clear maxPrice input → should show 2000000
#    ✓ Slider minimum should now drag to 0
#    ✓ Slider maximum should drag to max
```

---

## PHASE 2: Fix Input Fluidity (Issue #2)

### Recommended: Option A (Simpler)

This approach keeps raw values while typing, formats only on blur.

#### File: `apps/web/components/map/filters/price-filter-dropdown.tsx`

##### Change 2A.1: Update Component State (Line ~110)

**BEFORE:**
```typescript
// ✅ ESTADO LOCAL (no sincronizado con URL hasta "Done")
const [localMin, setLocalMin] = useState<number>(minPrice ?? 0)
const [localMax, setLocalMax] = useState<number>(maxPrice ?? rangeMaxBound)
```

**AFTER:**
```typescript
// ✅ ESTADO LOCAL (no sincronizado con URL hasta "Done")
const [localMin, setLocalMin] = useState<number>(minPrice ?? 0)
const [localMax, setLocalMax] = useState<number>(maxPrice ?? rangeMaxBound)

// ✅ INPUT DISPLAY STATE (raw values for fluid typing)
const [inputMin, setInputMin] = useState<string>(String(minPrice ?? 0))
const [inputMax, setInputMax] = useState<string>(String(maxPrice ?? rangeMaxBound))
```

---

##### Change 2A.2: Update Sync Effect (Line ~132)

**BEFORE:**
```typescript
// Sincronizar estado local cuando props cambian (ej: opening dropdown)
useEffect(() => {
  setLocalMin(minPrice ?? 0)
  setLocalMax(maxPrice ?? rangeMaxBound)
}, [minPrice, maxPrice, rangeMaxBound])
```

**AFTER:**
```typescript
// Sincronizar estado local cuando props cambian (ej: opening dropdown)
useEffect(() => {
  setLocalMin(minPrice ?? 0)
  setLocalMax(maxPrice ?? rangeMaxBound)
  setInputMin(String(minPrice ?? 0))
  setInputMax(String(maxPrice ?? rangeMaxBound))
}, [minPrice, maxPrice, rangeMaxBound])
```

---

##### Change 2A.3: Update handleInputMinChange (Line ~174)

**BEFORE:**
```typescript
// Handler para cambios en input mínimo
const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMin(0)
    } else {
      const numValue = Number(value)
      if (numValue <= localMax) {
        setLocalMin(numValue)
      }
    }
  },
  [localMax]
)
```

**AFTER:**
```typescript
// Handler para cambios en input mínimo
const handleInputMinChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')

    // ✅ Update display state with RAW value (no formatting = fluid input)
    setInputMin(raw)

    // Update number state
    if (raw === '') {
      setLocalMin(0)
    } else {
      const numValue = Number(raw)
      if (numValue <= localMax) {
        setLocalMin(numValue)
      }
    }
  },
  [localMax]
)

// ✅ NEW: Handle blur - format when user leaves field
const handleInputMinBlur = useCallback(() => {
  setInputMin(String(localMin))
}, [localMin])
```

---

##### Change 2A.4: Update handleInputMaxChange (Line ~190)

**BEFORE:**
```typescript
// Handler para cambios en input máximo
const handleInputMaxChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setLocalMax(rangeMaxBound)
    } else {
      const numValue = Number(value)
      if (numValue >= localMin) {
        setLocalMax(numValue)
      }
    }
  },
  [localMin, rangeMaxBound]
)
```

**AFTER:**
```typescript
// Handler para cambios en input máximo
const handleInputMaxChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')

    // ✅ Update display state with RAW value (no formatting = fluid input)
    setInputMax(raw)

    // Update number state
    if (raw === '') {
      setLocalMax(rangeMaxBound)
    } else {
      const numValue = Number(raw)
      if (numValue >= localMin) {
        setLocalMax(numValue)
      }
    }
  },
  [localMin, rangeMaxBound]
)

// ✅ NEW: Handle blur - format when user leaves field
const handleInputMaxBlur = useCallback(() => {
  setInputMax(String(localMax))
}, [localMax])
```

---

##### Change 2A.5: Update PriceInput Component (Line ~40)

**BEFORE:**
```typescript
interface PriceInputProps {
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ariaLabel: string
}

function PriceInput({ value, onChange, ariaLabel }: PriceInputProps) {
  return (
    <div className="flex-1 min-w-0 flex items-center rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 focus-within:ring-2 focus-within:ring-oslo-gray-600">
      <span className="px-2 py-2 text-oslo-gray-400 font-medium text-base flex-shrink-0">$</span>
      <input
        type="text"
        value={formatNumberEcuador(value)}  // ❌ Formatted display breaks input
        onChange={onChange}
        className="flex-1 min-w-0 px-0 py-2 pr-2 bg-oslo-gray-800 text-oslo-gray-100 text-base font-medium placeholder-oslo-gray-500 focus:outline-none"
        placeholder="0"
        aria-label={ariaLabel}
      />
    </div>
  )
}
```

**AFTER:**
```typescript
interface PriceInputProps {
  value: string  // ✅ Changed to string for raw input
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void  // ✅ New prop for formatting on blur
  ariaLabel: string
}

function PriceInput({ value, onChange, onBlur, ariaLabel }: PriceInputProps) {
  // ✅ Show formatted version if input appears to be numeric (for display)
  const displayValue = value === '' ? '' :
    /^\d+$/.test(value) ? formatNumberEcuador(Number(value)) : value

  return (
    <div className="flex-1 min-w-0 flex items-center rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 focus-within:ring-2 focus-within:ring-oslo-gray-600">
      <span className="px-2 py-2 text-oslo-gray-400 font-medium text-base flex-shrink-0">$</span>
      <input
        type="text"
        value={displayValue}  // ✅ Show formatted version for UI polish
        onChange={onChange}
        onBlur={onBlur}  // ✅ Format when leaving field
        className="flex-1 min-w-0 px-0 py-2 pr-2 bg-oslo-gray-800 text-oslo-gray-100 text-base font-medium placeholder-oslo-gray-500 focus:outline-none"
        placeholder="0"
        aria-label={ariaLabel}
      />
    </div>
  )
}
```

---

##### Change 2A.6: Update PriceInput Usage (Lines ~265-267)

**BEFORE:**
```typescript
{/* Inputs Numéricos con Formato de Moneda */}
<div className="flex items-center gap-2 min-w-0 px-4">
  <PriceInput value={localMin} onChange={handleInputMinChange} ariaLabel="Precio mínimo" />
  <span className="text-oslo-gray-400 flex-shrink-0">-</span>
  <PriceInput value={localMax} onChange={handleInputMaxChange} ariaLabel="Precio máximo" />
</div>
```

**AFTER:**
```typescript
{/* Inputs Numéricos con Formato de Moneda */}
<div className="flex items-center gap-2 min-w-0 px-4">
  <PriceInput
    value={inputMin}  // ✅ Use inputMin (string) not localMin (number)
    onChange={handleInputMinChange}
    onBlur={handleInputMinBlur}  // ✅ Add blur handler
    ariaLabel="Precio mínimo"
  />
  <span className="text-oslo-gray-400 flex-shrink-0">-</span>
  <PriceInput
    value={inputMax}  // ✅ Use inputMax (string) not localMax (number)
    onChange={handleInputMaxChange}
    onBlur={handleInputMaxBlur}  // ✅ Add blur handler
    ariaLabel="Precio máximo"
  />
</div>
```

---

### Test Phase 2 Fixes

After implementing Phase 2:

```bash
# 1. Restart dev server
bun run dev:web

# 2. Open browser to http://localhost:3000/mapa
# 3. Click price filter dropdown
# 4. Test:
#    ✓ Type "50000" in minPrice input → smooth, no cursor jumping
#    ✓ Input shows raw numbers while typing: "5" → "50" → "500" → "5000" → "50000"
#    ✓ When you click outside (blur), input formats: "50000" → "50,000"
#    ✓ Type "100000" in maxPrice → smooth typing
#    ✓ Clear minPrice → shows 0
#    ✓ All original functionality still works
```

---

## PHASE 3: Optional - Better Separation (2-3 hours)

If you want to make the code clearer for future maintenance:

### Rename Variables for Clarity

**Why:** Makes it clear that database min/max are different from UI min/max.

```typescript
// BEFORE: Confusing variable names
const priceRangeMin = useMapStore((state) => state.priceRangeMin);  // Database min
const priceRangeMax = useMapStore((state) => state.priceRangeMax);  // Database max
const rangeMinBound = priceRangeMin ?? 0  // UI min

// AFTER: Crystal clear
const databaseMinPrice = useMapStore((state) => state.priceRangeMin);
const databaseMaxPrice = useMapStore((state) => state.priceRangeMax);
const uiMinBound = 0  // UI always allows 0
const uiMaxBound = databaseMaxPrice ?? 2000000
```

This would require updating all references throughout the component, but makes the intention clear.

---

## Complete Diff Summary

### Phase 1 (Critical):
- Line 104: `rangeMinBound = priceRangeMin ?? 0` → `rangeMinBound = 0`
- Line 178: `setLocalMin(rangeMinBound)` → `setLocalMin(0)`
- Line 186: `[localMax, rangeMinBound]` → `[localMax]`

### Phase 2 (Nice-to-Have):
- Add `inputMin`, `inputMax` state
- Update sync effect to also update inputMin/inputMax
- Update `handleInputMinChange` to use raw value, add blur handler
- Update `handleInputMaxChange` to use raw value, add blur handler
- Update `PriceInput` component to accept string values + onBlur
- Update render to use `inputMin`/`inputMax` and pass `onBlur`

---

## Rollback Plan

If issues arise:

1. **Phase 1 breaks something:**
   ```bash
   # Revert line 104 to: const rangeMinBound = priceRangeMin ?? 0
   # Tests should pass
   ```

2. **Phase 2 breaks something:**
   ```bash
   # Revert input state and use original approach
   # Phase 1 fixes still work independently
   ```

Both phases are isolated and can be reverted independently.

---

## Testing Commands

```bash
# Type-check (should show no errors in price-filter-dropdown.tsx)
bun run type-check

# Run linting
bun run lint:fix

# Start dev server
bun run dev:web

# Manual testing checklist:
# [ ] Clear minPrice → shows 0
# [ ] Type in inputs → smooth, no jumping
# [ ] Click "Listo" → filter applies
# [ ] URL updates correctly
# [ ] Drag slider → works smoothly
```

---

## Summary

| Phase | What | Time | Impact |
|-------|------|------|--------|
| **1** | Fix 3 lines | 5 min | Issues #1 & #3 solved |
| **2** | Add input state handling | 45 min | Issue #2 solved (fluid input) |
| **3** | Rename for clarity | 2 hours | Code readability improvement |

**Recommendation:** Implement Phase 1 + 2 (1 hour total) for a complete UX improvement. Phase 3 is optional refactoring.

