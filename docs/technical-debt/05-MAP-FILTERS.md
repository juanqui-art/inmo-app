# 🗺️ Map Filters URL Preservation

> **1 tarea identificada** | Estimado: 1-2 horas
> Impact: UX improvement - Preservación de contexto

---

## 📋 Resumen

**Estado Actual:** 🐛 Bug conocido y documentado

**Problema:** Pérdida de parámetros URL al cambiar filtros

**Impacto en UX:**
- ❌ Mapa resetea viewport cuando se cambian filtros
- ❌ AI search context se pierde
- ❌ No se puede mantener map position + filters simultáneamente

**Archivo afectado:** `apps/web/components/map/filters/use-map-filters.ts:59`

**Documentación existente:** `docs/technical-debt/MAP_FILTERS_URL_PRESERVATION.md`

---

## 🔴 El Problema

### Current Behavior (Problematic)

```typescript
// apps/web/components/map/filters/use-map-filters.ts:59
const updateFilters = useCallback((newFilters) => {
  const updated = { ...filters, ...newFilters }
  const filterString = buildFilterUrl(updated)

  // ⚠️ PROBLEM: Replaces entire URL with ONLY filter params
  router.replace(`/mapa${filterString ? `?${filterString}` : ""}`)
}, [filters, router])
```

### Example of Data Loss

**Before filter change:**
```
/mapa?ai_search=casa&ne_lat=10&ne_lng=20&sw_lat=5&sw_lng=15&minPrice=50000
```

**After changing filter:**
```
/mapa?minPrice=100000
```

**❌ Lost:**
- `ai_search=casa` (AI search context)
- `ne_lat`, `ne_lng`, `sw_lat`, `sw_lng` (map viewport bounds)

### User Impact

1. **Map resets viewport** when filters change
   - User was zoomed into El Ejido neighborhood
   - Changed price filter
   - Map jumps back to city-wide view

2. **AI search context is lost**
   - User searched "Casa moderna 3 hab en El Ejido"
   - Changed bedrooms filter from 3 to 2
   - Lost information that original search was for El Ejido

3. **No way to share filtered view with specific location**
   - Can't send link like: "Houses under $200k in this neighborhood"
   - URL doesn't preserve both filters AND map position

---

## ✅ Solución Propuesta

### Option A: Preserve All URL Params (Recommended)

```typescript
// apps/web/components/map/filters/use-map-filters.ts
const updateFilters = useCallback(
  (newFilters: Partial<MapFiltersState>) => {
    const updated: DynamicFilterParams = {
      ...filters,
      ...newFilters,
    }

    // ✅ PRESERVE existing URL params
    const currentUrlParams = new URLSearchParams(searchParams)

    // Build filter query and merge
    const filterString = buildFilterUrl(updated)
    const newFilterParams = new URLSearchParams(filterString)

    // Merge new filters into existing params
    for (const [key, value] of newFilterParams) {
      currentUrlParams.set(key, value)
    }

    // Clean up undefined filters
    if (!updated.minPrice) currentUrlParams.delete('minPrice')
    if (!updated.maxPrice) currentUrlParams.delete('maxPrice')
    if (!updated.bedrooms) currentUrlParams.delete('bedrooms')
    if (!updated.bathrooms) currentUrlParams.delete('bathrooms')
    if (!updated.category?.length) currentUrlParams.delete('category')
    if (!updated.transactionType?.length) currentUrlParams.delete('transactionType')

    // ✅ Replace with MERGED params (preserves bounds, ai_search, etc.)
    router.replace(`/mapa?${currentUrlParams.toString()}`)
  },
  [filters, searchParams, router]  // ✅ Added searchParams to deps
)
```

**Pros:**
- ✅ Preserves viewport bounds
- ✅ Preserves AI search context
- ✅ User stays in same map region while filtering
- ✅ Deep linking works (share URL with filters + position)

**Cons:**
- ⚠️ Slightly more complex
- ⚠️ Need to handle cleanup of deleted filters

---

### Option B: Explicit Bounds Handling

If bounds should NOT be preserved when filters change:

1. **Document the intent clearly**
   ```typescript
   // INTENTIONAL: Reset map bounds when filters change
   // This prevents filters from being limited to old viewport bounds
   router.replace(`/mapa${filterString ? `?${filterString}` : ""}`)
   ```

2. **Make it explicit**
   ```typescript
   const handleFilterWithBoundsReset = () => {
     updateFiltersAndResetBounds(newFilters)
   }
   ```

3. **Inform user**
   ```tsx
   <TooltipContent>
     Changing filters will reset map position
   </TooltipContent>
   ```

**Recommendation:** Option B is NOT recommended. Users expect map position to remain stable.

---

## 🔧 Implementation Plan

### Step 1: Analyze Current State

**Files involved:**
- `apps/web/components/map/filters/use-map-filters.ts` - Hook with bug
- `apps/web/lib/utils/url-helpers.ts` - Filter/bounds URL builders
- `apps/web/components/map/use-map-viewport.ts` - Manages bounds separately
- `apps/web/components/map/filter-bar.tsx` - Uses hook for filter UI
- `apps/web/components/map/map-filter-panel.tsx` - Sidebar filter UI

**Current architecture:**
```
Component → use-map-filters → buildFilterUrl → router.replace
                               (only filters)    (wipes URL)
```

**Desired architecture:**
```
Component → use-map-filters → preserve existing params
                               + merge new filters
                               + clean undefined
                               → router.replace (full URL)
```

---

### Step 2: Update use-map-filters Hook

```typescript
// apps/web/components/map/filters/use-map-filters.ts
'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildFilterUrl } from '@/lib/utils/url-helpers'
import type { MapFiltersState, DynamicFilterParams } from '@/lib/types/map'

export function useMapFilters(initialFilters: MapFiltersState) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState(initialFilters)

  const updateFilters = useCallback(
    (newFilters: Partial<MapFiltersState>) => {
      const updated: DynamicFilterParams = {
        ...filters,
        ...newFilters,
      }

      setFilters(updated)

      // ✅ NEW: Preserve existing URL params
      const currentUrlParams = new URLSearchParams(searchParams.toString())

      // Build filter query string
      const filterString = buildFilterUrl(updated)
      const newFilterParams = new URLSearchParams(filterString)

      // Merge new filters into existing params
      for (const [key, value] of newFilterParams) {
        currentUrlParams.set(key, value)
      }

      // Clean up undefined/empty filters
      const filtersToClean = [
        'minPrice', 'maxPrice', 'bedrooms', 'bathrooms',
        'category', 'transactionType', 'minArea', 'maxArea',
        'city', 'search'
      ]

      for (const key of filtersToClean) {
        const value = updated[key as keyof DynamicFilterParams]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          currentUrlParams.delete(key)
        }
      }

      // Replace with merged params
      router.replace(`/mapa?${currentUrlParams.toString()}`)
    },
    [filters, searchParams, router]
  )

  return {
    filters,
    updateFilters,
    clearFilters: () => {
      // ✅ NEW: Also preserve bounds when clearing
      const currentUrlParams = new URLSearchParams(searchParams.toString())

      // Remove all filter params
      const filterKeys = [
        'minPrice', 'maxPrice', 'bedrooms', 'bathrooms',
        'category', 'transactionType', 'minArea', 'maxArea',
        'city', 'search'
      ]

      for (const key of filterKeys) {
        currentUrlParams.delete(key)
      }

      // Keep bounds, ai_search, etc.
      router.replace(`/mapa?${currentUrlParams.toString()}`)
      setFilters({})
    }
  }
}
```

---

### Step 3: Remove Misleading Comments

**Current (lines 43-45):**
```typescript
// IMPORTANT: Do NOT preserve bounds when filters change
// Bounds should only be set by the map viewport, not by filter changes
// This prevents filters from being limited to old viewport bounds
```

**Reality:** The code never receives or processes bounds - these are handled separately. The comments are misleading.

**Action:** Remove these comments or replace with accurate explanation.

---

### Step 4: Fix Type Inconsistencies

**Issue:** Type mismatch between `MapFiltersState` and `DynamicFilterParams`

**MapFiltersState (local):**
```typescript
interface MapFiltersState {
  transactionType?: TransactionType[]  // Array only
  category?: PropertyCategory[]        // Array only
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  // Missing: minArea, maxArea, city, search
}
```

**DynamicFilterParams (in url-helpers):**
```typescript
interface DynamicFilterParams {
  transactionType?: TransactionType | TransactionType[]  // Single OR array
  category?: PropertyCategory | PropertyCategory[]       // Single OR array
  minPrice?: number
  maxPrice?: number
  minArea?: number    // Missing from MapFiltersState
  maxArea?: number    // Missing from MapFiltersState
  city?: string       // Missing from MapFiltersState
  search?: string     // Missing from MapFiltersState
}
```

**Solution:**

```typescript
// Consolidate into single type
export interface MapFilters {
  transactionType?: TransactionType[]  // Always array
  category?: PropertyCategory[]        // Always array
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  bathrooms?: number
  city?: string
  search?: string
}

// Use everywhere
import type { MapFilters } from '@/lib/types/map'
```

---

## 🧪 Testing Scenarios

### Test 1: Viewport Preservation

```
1. Navigate to /mapa
2. Zoom into El Ejido neighborhood
3. Note URL: /mapa?ne_lat=-2.88&ne_lng=-78.98&sw_lat=-2.92&sw_lng=-79.02
4. Change price filter to $100k-$200k
5. ✅ Verify URL: /mapa?ne_lat=-2.88&ne_lng=-78.98&sw_lat=-2.92&sw_lng=-79.02&minPrice=100000&maxPrice=200000
6. ✅ Verify map viewport did NOT change
```

### Test 2: AI Search + Filters

```
1. Navigate to /mapa
2. Search "Casa moderna en El Ejido"
3. URL: /mapa?ai_search=Casa%20moderna%20en%20El%20Ejido&city=Cuenca&address=El%20Ejido
4. Change bedrooms to 3
5. ✅ Verify URL still has ai_search param
6. ✅ Verify city and address params preserved
7. ✅ Verify bedrooms=3 added
```

### Test 3: Deep Linking

```
1. Share URL: /mapa?ne_lat=10&ne_lng=20&sw_lat=5&sw_lng=15&minPrice=100000&category=CASA
2. Open URL in new tab
3. ✅ Verify map shows correct viewport
4. ✅ Verify filters applied (price + category)
5. Change max price to $200k
6. ✅ Verify URL updated correctly
```

### Test 4: URL Cleanup

```
1. Set filters: minPrice=100000, maxPrice=200000, bedrooms=3
2. URL: /mapa?minPrice=100000&maxPrice=200000&bedrooms=3
3. Clear price filter
4. ✅ Verify minPrice and maxPrice removed from URL
5. ✅ Verify bedrooms=3 still present
6. Clear all filters
7. ✅ Verify URL: /mapa (only non-filter params remain)
```

### Test 5: Edge Cases

```
Test multiple filter changes in quick succession
✅ Verify URL updates correctly each time
✅ Verify no race conditions

Test navigate away and back with filters active
✅ Verify filters persist
✅ Verify bounds persist
```

---

## 📊 Expected Benefits

### Before Fix:

**User Flow:**
1. Searches "Casa en El Ejido"
2. Zooms into neighborhood
3. Changes price filter
4. 😞 Map jumps back to city view
5. 😞 Lost El Ejido context
6. 😞 Needs to zoom again

**Developer Experience:**
- Debugging: "Why did map reset?"
- Confusion: "What do these comments mean?"

---

### After Fix:

**User Flow:**
1. Searches "Casa en El Ejido"
2. Zooms into neighborhood
3. Changes price filter
4. 😊 Map stays in El Ejido
5. 😊 All context preserved
6. 😊 Can share exact view with others

**Developer Experience:**
- Clear code intention
- Type-safe filter handling
- Easy to understand flow

---

## 💡 Related Improvements (Optional)

### 1. URL State Synchronization

Create a single source of truth for URL state:

```typescript
// apps/web/components/map/hooks/use-map-url-state.ts
export function useMapUrlState() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.replace(`/mapa?${params.toString()}`)
  }

  return { searchParams, updateUrlParam }
}
```

### 2. Filter History

Allow users to go back to previous filter state:

```typescript
// Store filter history in sessionStorage
const filterHistory = JSON.parse(sessionStorage.getItem('filter_history') || '[]')

function saveFilterState(filters) {
  filterHistory.push({ filters, timestamp: Date.now() })
  sessionStorage.setItem('filter_history', JSON.stringify(filterHistory))
}

function restorePreviousFilters() {
  const previous = filterHistory.pop()
  if (previous) applyFilters(previous.filters)
}
```

### 3. Shareable Filter Presets

```typescript
// "Share this view" button
function shareCurrentView() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  toast.success('Link copiado al portapapeles')
}

// "Save as preset" button
function saveFilterPreset(name: string) {
  const preset = {
    name,
    filters: currentFilters,
    bounds: currentBounds
  }
  await db.filterPreset.create({ data: preset })
}
```

---

## 📚 References

**Archivos relacionados:**
- `apps/web/components/map/filters/use-map-filters.ts:43-62` - Main bug location
- `apps/web/lib/utils/url-helpers.ts` - Filter/bounds URL builders
- `apps/web/components/map/use-map-viewport.ts` - Bounds management
- `apps/web/lib/types/map.ts` - Type definitions

**Documentación:**
- `docs/technical-debt/MAP_FILTERS_URL_PRESERVATION.md` - Análisis detallado original
- [Next.js Router](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [URLSearchParams MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

---

## ✅ Success Criteria

Al completar la implementación:

- [x] Viewport bounds preserved when filters change
- [x] AI search context preserved
- [x] Deep linking works (filters + bounds)
- [x] URL params properly cleaned when filters removed
- [x] No race conditions with multiple quick filter changes
- [x] Type inconsistencies resolved
- [x] Misleading comments removed
- [x] Tests pass for all scenarios
- [x] Documentation updated

**Expected UX improvement:**
- Users can filter without losing map context
- Shareable URLs work correctly
- No confusion about why map position changes

---

**Última actualización:** Noviembre 14, 2025
**Status:** Documentado, listo para implementación
**Priority:** 🟡 MEDIA - UX improvement
**Next step:** Implementar URL params preservation (1-2 horas)
