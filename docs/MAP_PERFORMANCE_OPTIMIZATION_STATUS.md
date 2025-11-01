# Map Performance Optimization - Current Status & Next Steps

**Last Updated:** November 1, 2025
**Status:** ⚠️ IN PROGRESS - Problem persists despite 3 optimization rounds

---

## Current Problem

**MapView component continues re-rendering** despite implementing all optimizations from the "Hybrid Approach":
- MapView and clusters still render on every pan/zoom
- React Scan shows continuous updates to the map
- Expected reduction in "other time" (MapBox GL redraws) not yet achieved

**Investigation History:**
- Session 1-2: Fixed bounds validation, memoized useMapTheme, implemented useMemoizedFilterParams
- Session 3: Fixed handleClusterClick infinite loop by removing viewState from dependencies
- Session 4: Memoized viewState object based on individual value changes
- Session 5: Implemented complete Hybrid Approach (3 steps)

---

## Changes Made This Session (Nov 1, 2025)

### 1. ✅ Cluster-to-Marker Mapping Memoization
**File:** `apps/web/components/map/ui/map-container.tsx`
- Added `useMemo` wrapper around `clusters.map()` (lines 208-251)
- Dependencies: `[clusters, viewState.zoom, handleClusterClick, handleMarkerClick]`
- Prevents marker JSX recreation on every render

### 2. ✅ Viewport Debouncing (200ms)
**New File:** `apps/web/components/map/hooks/use-debounce-viewport.ts`
- Created `useDebounceViewport` hook to delay viewport updates
- Updates clusters only every 200ms during panning
- Map component still receives live viewport for smooth interaction

**File:** `apps/web/components/map/ui/map-container.tsx`
- Added lines 121-130: Using debounced viewport for clustering
- `const debouncedViewState = useDebounceViewport(viewState, 200);`

### 3. ✅ Marker Component Memoization
**File:** `apps/web/components/map/property-marker.tsx`
- Memoized wrapper component (line 61): `export const PropertyMarker = memo(...)`
- Prevents re-renders when parent re-renders with same props

**File:** `apps/web/components/map/markers/property-marker.tsx`
- Memoized variant selector (line 70): `export const PropertyMarker = memo(...)`

**File:** `apps/web/components/map/cluster-marker.tsx`
- Memoized cluster marker (line 88): `export const ClusterMarker = memo(...)`

---

## Previous Session Optimizations (Already Committed)

### From Earlier Sessions:
1. **Ecuador Bounds Clamping** (`apps/web/lib/utils/url-helpers.ts`)
   - Added `clampBoundsToEcuador()` function
   - Prevents invalid coordinates from triggering MapPage re-execution

2. **useMapTheme Memoization** (`apps/web/components/map/hooks/use-map-theme.ts`)
   - Returns memoized object based on `resolvedTheme`
   - Prevents new object creation each render

3. **useMemoizedFilterParams Hook** (`apps/web/lib/hooks/use-memoized-filter-params.ts`)
   - Memoizes parsed filter parameters
   - Prevents displayedProperties recalculation

4. **MapContainer React.memo()** (`apps/web/components/map/ui/map-container.tsx`)
   - Line 97: `export const MapContainer = memo(function MapContainer({...}))`
   - Prevents re-renders from parent prop reference changes

5. **viewState Memoization** (`apps/web/components/map/map-view.tsx`)
   - Lines 133-143: Memoizes viewState based on individual value changes
   - Compares longitude, latitude, zoom, pitch, bearing, transitionDuration

6. **handleClusterClick Optimization** (`apps/web/components/map/ui/map-container.tsx`)
   - Lines 169-189: Removed `viewState` from dependencies
   - Prevents infinite recreation loop

---

## Potential Root Causes (To Investigate)

### High Priority - Likely Issues:

1. **useMapClustering Hook Recalculation**
   - Currently depends on `[supercluster, viewState]`
   - Even with debounced viewState, might still be causing recalculations
   - **Action:** Consider if clusters need additional debouncing or if memoization isn't working

2. **MapView Component Re-execution**
   - MapView might still be executing on every router/searchParams change
   - Server component might be re-executing when URL changes
   - **Action:** Check if MapPage (parent) is causing MapView re-mounts

3. **Marker Array Comparison**
   - `renderedClusters` dependency: `[clusters, viewState.zoom, handleClusterClick, handleMarkerClick]`
   - If `clusters` reference changes even with same content, array is recreated
   - **Action:** Consider using cluster content (JSON.stringify) for memoization

4. **debounceViewport Hook Issue**
   - Using `setTimeout` might not be optimal for React batching
   - Consider using `useTransition()` or `useDeferredValue()` instead
   - **Action:** Test if React's built-in deferred value updates work better

### Medium Priority - Worth Investigating:

5. **Map Component Props Changes**
   - MapBox Map component receives many props from viewState
   - Each live viewState change passes through despite debouncing for clusters
   - **Action:** Check if other Map props need memoization

6. **PropertyPopup Component**
   - Used when property is selected (lines 282-340 in map-container.tsx)
   - Might be triggering parent re-renders
   - **Action:** Verify popup component is memoized

7. **React Scan Detection Accuracy**
   - Possible false positives if React Scan counts component definitions vs actual renders
   - **Action:** Verify with browser DevTools profiler instead

---

## Files Modified This Session

```
apps/web/components/map/ui/map-container.tsx          # Added debounce + memoized clusters
apps/web/components/map/hooks/use-debounce-viewport.ts # NEW - debounce hook
apps/web/components/map/property-marker.tsx           # Memoized wrapper
apps/web/components/map/markers/property-marker.tsx   # Memoized selector
apps/web/components/map/cluster-marker.tsx            # Memoized component
```

## Commits This Session

```
190bcfe - refactor(map-container): memoize cluster-to-marker mapping for performance
b1983c2 - refactor(map-container): add viewport debouncing for cluster calculations
3abdbfa - refactor(markers): memoize marker components for lazy rendering
```

---

## Next Steps for Next Session

### Phase 1: Diagnosis
1. **Run React Scan again** with same procedure:
   - Navigate to `/mapa`
   - Pan/zoom the map for 30 seconds
   - Record "other time" and component re-render counts
   - Identify which component is still causing re-renders

2. **Use React DevTools Profiler** instead of React Scan:
   - More detailed flame graph
   - Shows exact component causing updates
   - Can identify if it's a re-mount vs re-render

3. **Add Console Logging** to identify:
   - When `debouncedViewState` updates (should be every 200ms, not 60x/sec)
   - When `clusters` actually change vs when re-rendering occurs
   - If MapView is re-executing (server component re-run)

### Phase 2: Implementation (Based on Diagnosis)

**If clusters recalculation is the problem:**
- Switch from `useState` + `setTimeout` to React's `useDeferredValue(viewState)` in debounce hook
- Or use `useTransition()` to mark cluster updates as non-urgent

**If MapView re-execution is the problem:**
- Investigate if MapPage parent component is re-executing
- Check if searchParams/router changes are causing unnecessary re-mounts
- Consider if using `React.memo()` on MapView itself would help

**If it's the clusters array content:**
- Change memoization dependency from `clusters` reference to `JSON.stringify(clusters)`
- This ensures only real content changes trigger re-render

**If React Scan is showing false positives:**
- Switch entirely to React DevTools Profiler for accurate metrics
- Measure actual interaction performance (FPS during pan/zoom)

### Phase 3: Alternative Strategies (If Current Approach Exhausted)

1. **Switch to WebGL-based markers** instead of DOM markers
   - Use MapBox native layers instead of react-map-gl's Marker component
   - Significantly faster for 100+ markers

2. **Virtual scrolling pattern** (viewport-based rendering)
   - Only render markers in visible viewport
   - Not typical for maps but worth exploring

3. **Use Tanstack Query with smart caching**
   - Cache cluster data by viewport bounds
   - Reduce cluster recalculation further

---

## Performance Baseline

**Initial State (Session Start):**
- "Other time": 230-572ms
- Root cause: MapView re-rendering, useMapTheme new object each render, bounds validation issues

**Expected After All Optimizations:**
- "Other time": <100ms
- Cluster updates: Every 200ms (not 60x/sec)

**Current State:**
- Still re-rendering (needs investigation)

---

## Testing Procedure for Next Session

1. Start dev server: `bun run dev`
2. Open http://localhost:3000/mapa in Chrome
3. Enable React Scan (should auto-load from provider)
4. Pan and zoom for 30 seconds
5. Record metrics:
   - "Other time" value
   - Which components have "re-render" indicators
   - Frequency of updates (how often they blink)

---

## Resources & References

- React Scan: https://react-scan.com
- React DevTools Profiler: https://react.dev/reference/react/Profiler
- useDeferredValue: https://react.dev/reference/react/useDeferredValue
- useTransition: https://react.dev/reference/react/useTransition
- react-map-gl docs: https://visgl.github.io/react-map-gl/

---

## Questions for Next Session

1. Is the re-rendering happening in MapView, MapContainer, or both?
2. Does the 200ms debounce delay actually reduce cluster calculations, or are they still happening 60x/sec?
3. Is MapView being re-mounted (full lifecycle) or just re-rendered (same instance)?
4. Would switching to useDeferredValue() solve the debounce issue more elegantly?
5. Is the problem actually "other time" (MapBox GL) or React render time that wasn't being measured accurately?

---

## Notes

- All type-checks pass ✅
- All commits are clean and follow conventional format ✅
- Code is production-ready despite ongoing performance investigation ✅
- Optimizations are non-breaking and can be built upon incrementally ✅
