# Technical Debt: Map Filters URL Preservation

**Status:** Documented for future refactoring
**Priority:** Medium
**Impact:** User experience, map context preservation
**Created:** 2025-11-06

---

## Problem Statement

When users update filters in the map view, the URL is replaced with ONLY the filter parameters. This causes loss of other important URL parameters:

- **Viewport bounds**: `ne_lat`, `ne_lng`, `sw_lat`, `sw_lng` (map region)
- **AI Search context**: `ai_search` parameter from natural language search
- **Any custom params**: Future parameters added to the map

### Current Behavior (Problematic)

```typescript
// In use-map-filters.ts, line 59
router.replace(`/mapa${filterString ? `?${filterString}` : ""}`);
```

**Example**:
- **Before filter change**: `/mapa?ai_search=casa&ne_lat=10&ne_lng=20&sw_lat=5&sw_lng=15&minPrice=50000`
- **After filter change**: `/mapa?minPrice=100000` ← Lost bounds and search context!

**User Impact**:
1. Map resets viewport when filters change
2. AI search context is lost
3. No way to maintain map position + filters simultaneously

---

## Root Cause

The `updateFilters()` hook in `use-map-filters.ts` uses `buildFilterUrl()` which only generates filter query params, not a merged URL with existing params:

```typescript
const filterString = buildFilterUrl(updated);  // Only filters
router.replace(`/mapa${filterString ? `?${filterString}` : ""}`);  // Wipes URL
```

### Type Mismatch Contributing Issue

`MapFiltersState` (local) vs `DynamicFilterParams` (from url-helpers):

**MapFiltersState** (current):
```typescript
interface MapFiltersState {
  transactionType?: TransactionType[];
  category?: PropertyCategory[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}
```

**DynamicFilterParams** (in url-helpers):
```typescript
interface DynamicFilterParams {
  transactionType?: TransactionType | TransactionType[];
  category?: PropertyCategory | PropertyCategory[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  search?: string;
  // ... others
}
```

**Issues**:
- `transactionType` can be single value OR array (inconsistent)
- `category` same issue
- Missing `minArea`, `maxArea`, `city`, `search` from MapFiltersState
- This inconsistency makes it hard to properly merge parameters

---

## Misleading Comments

Lines 43-45 in `use-map-filters.ts`:
```typescript
// IMPORTANT: Do NOT preserve bounds when filters change
// Bounds should only be set by the map viewport, not by filter changes
// This prevents filters from being limited to old viewport bounds
```

**Reality**: The code never receives or processes bounds - these are handled separately in the map component. The comments are misleading and don't reflect the actual issue (URL param loss).

---

## Proposed Solution

### Option A: Preserve All URL Params (Recommended)

```typescript
const updateFilters = useCallback(
  (newFilters: Partial<MapFiltersState>) => {
    const updated: DynamicFilterParams = {
      ...filters,
      ...newFilters,
    };

    // Preserve existing URL params
    const currentUrlParams = new URLSearchParams(searchParams);

    // Build filter query and merge
    const filterString = buildFilterUrl(updated);
    const newFilterParams = new URLSearchParams(filterString);

    for (const [key, value] of newFilterParams) {
      currentUrlParams.set(key, value);
    }

    // Clean up undefined filters
    if (!updated.minPrice) currentUrlParams.delete('minPrice');
    if (!updated.maxPrice) currentUrlParams.delete('maxPrice');
    // ... etc

    router.replace(`/mapa?${currentUrlParams.toString()}`);
  },
  [filters, searchParams, router]
);
```

**Pros**:
- Preserves viewport bounds
- Preserves AI search context
- User stays in same map region while filtering

**Cons**:
- Slightly more complex
- Need to handle cleanup of deleted filters

### Option B: Explicit Bounds Handling

If bounds should NOT be preserved when filters change, then:

1. **Document the intent clearly**: Add comments explaining why bounds reset
2. **Make it explicit**: Have a separate `handleFilterWithBoundsReset()` method
3. **Inform user**: Show visual feedback when bounds reset

---

## Testing Scenarios

When this is implemented, test:

1. **Viewport preservation**: Set map to a region, apply filters, verify viewport doesn't change
2. **AI Search + Filters**: Use AI search, then change filters, verify bounds stay
3. **Deep linking**: Share URL with filters + bounds, verify it works
4. **URL cleanup**: Change filters, remove one, verify URL params update correctly
5. **Edge cases**:
   - Multiple filter changes in quick succession
   - Clear filters while bounds are set
   - Navigate away and back with filters active

---

## Related Files

- `apps/web/components/map/filters/use-map-filters.ts` - Main hook (lines 43-62)
- `apps/web/lib/utils/url-helpers.ts` - Filter/bounds URL builders
- `apps/web/components/map/use-map-viewport.ts` - Manages bounds separately
- `apps/web/components/map/filter-bar.tsx` - Uses hook for filter UI
- `apps/web/components/map/map-filter-panel.tsx` - Sidebar filter UI

---

## Implementation Notes

- **Dependency on searchParams**: Will need to add `searchParams` to useCallback deps
- **Type alignment**: Consider consolidating MapFiltersState and DynamicFilterParams
- **Performance**: URLSearchParams operations are cheap, not a concern
- **Browser compatibility**: URLSearchParams is widely supported

---

## Decision Log

**Session 1 (2025-11-06)**:
- Identified bug during code review
- Fixed critical runtime error (undefined `currentParams`)
- Documented this issue for future sessions
- Decision: Preserve current behavior for now, fix in next iteration

---

## References

- [Next.js Router API](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [URLSearchParams MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- Original Analysis: Session 3, use-map-filters component review
