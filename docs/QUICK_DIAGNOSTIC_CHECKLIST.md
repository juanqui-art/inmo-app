# Quick Diagnostic Checklist - Map Performance Issue

**Start here** when resuming work on map performance optimization.

---

## 🔴 Current Issue
MapView component continues re-rendering despite implementing Hybrid Approach (3 optimizations):
- Memoized cluster-to-marker mapping ✅
- Debounced viewport (200ms) ✅
- Memoized marker components ✅

**But:** Still seeing continuous re-renders in React Scan

---

## 🔍 5-Minute Diagnosis

### Step 1: Verify Debounce is Working
```javascript
// Add to use-debounce-viewport.ts or MapContainer temporarily:
useEffect(() => {
  console.log('🟡 Debounced viewport updated:', debouncedViewState);
}, [debouncedViewState]);

useEffect(() => {
  console.log('🔴 Live viewport changed:', viewState);
}, [viewState]);
```

**Expected:** Console shows:
- 🔴 "Live viewport changed" appears 60x/sec during panning
- 🟡 "Debounced viewport updated" appears ~1x per 200ms

**If showing:** 🟡 appears 60x/sec = debounce hook is broken

---

### Step 2: Check Cluster Recalculation Frequency
```javascript
// Add to use-map-clustering.ts:
const clusters = useMemo(() => {
  console.log('📊 CLUSTERS RECALCULATED', {
    count: supercluster.getClusters(bounds, Math.floor(viewState.zoom)).length,
    timestamp: new Date().toLocaleTimeString()
  });
  return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
}, [supercluster, viewState]);
```

**Expected:** During 30-second pan:
- Cluster recalculation logs appear ~6 times (every 200ms)
- Not 180 times (60x/sec)

**If showing:** 180 times = clusters memoization or debounce not working

---

### Step 3: React DevTools Profiler
1. Open React DevTools Profiler tab
2. Start recording
3. Pan map for 5 seconds
4. Stop recording
5. Look at flame graph:
   - Is MapView re-rendering?
   - Is MapContainer re-rendering?
   - Which component is the culprit?

**Key insight:** Profiler shows which component actually changed, not just suspected

---

## 🎯 Likely Culprits (Priority Order)

### #1: MapView Server Component Re-execution
**Where:** `apps/web/components/map/map-view.tsx`

**Problem:** MapView might be re-executing when:
- Router/searchParams change
- Parent MapPage re-executes
- URL history updates

**Check:**
```javascript
// Add at top of MapView function:
console.log('⚡ MapView EXECUTING', {
  timestamp: Date.now(),
  searchResults: searchResults?.length
});
```

**Expected:** Log appears 1-2 times on load, not every 200ms

---

### #2: useMapClustering Dependency Issue
**Where:** `apps/web/components/map/hooks/use-map-clustering.ts:130`

**Current:**
```javascript
}, [supercluster, viewState]);
```

**Problem:** Even with debounced viewState, if viewState reference changes, clusters recalculate

**Solution:**
```javascript
}, [supercluster, viewState.zoom, viewState.latitude, viewState.longitude]);
```

This only recalculates if actual values change, not reference

---

### #3: Debounce Hook Using setTimeout (Not Optimal)
**Where:** `apps/web/components/map/hooks/use-debounce-viewport.ts`

**Current Problem:** setTimeout doesn't integrate with React's batching

**Better Solution:**
```javascript
import { useDeferredValue } from 'react';

// Replace entire hook with:
export function useDebounceViewport(viewState: ViewState): ViewState {
  return useDeferredValue(viewState);
}
```

This lets React batch updates internally, much more efficient

---

### #4: Marker Memoization Dependencies
**Where:** `apps/web/components/map/ui/map-container.tsx:251`

**Current:**
```javascript
}, [clusters, viewState.zoom, handleClusterClick, handleMarkerClick]);
```

**Problem:** If `clusters` reference changes (same content), re-renders

**Check:** Does `JSON.stringify(clusters)` change when you pan?
```javascript
useEffect(() => {
  console.log('Clusters content changed:', JSON.stringify(clusters).slice(0, 100));
}, [clusters]);
```

---

## 🚀 Quick Fixes to Try (In Order)

### Fix 1: Update useMapClustering dependencies
```javascript
// File: apps/web/components/map/hooks/use-map-clustering.ts:161
// Change from:
}, [supercluster, viewState]);

// To:
}, [supercluster, viewState.zoom, viewState.latitude, viewState.longitude]);
```

**Expected Impact:** Reduce cluster recalculations slightly

**Time to test:** 2 minutes

---

### Fix 2: Replace setTimeout debounce with useDeferredValue
```javascript
// File: apps/web/components/map/hooks/use-debounce-viewport.ts
// Replace entire hook with 3 lines:

import { useDeferredValue } from 'react';

export function useDebounceViewport(
  viewState: ViewState,
  _delayMs?: number // Ignored, React handles timing
): ViewState {
  return useDeferredValue(viewState);
}
```

**Expected Impact:** Proper React batching, more efficient updates

**Time to test:** 5 minutes

---

### Fix 3: Add React.memo to MapView Itself
```javascript
// File: apps/web/components/map/map-view.tsx
// Change from:
export function MapView({ ... }: MapViewProps) {

// To:
export const MapView = memo(function MapView({ ... }: MapViewProps) {
  // ... rest of component
});
```

**Expected Impact:** If MapPage parent re-executes, MapView won't re-render

**Time to test:** 3 minutes

---

## 📊 Before/After Metrics

**Track these metrics as you apply fixes:**

| Metric | Before | Target | Current |
|--------|--------|--------|---------|
| "Other time" (React Scan) | 230-572ms | <100ms | ⚠️ Unknown |
| Cluster recalcs/30sec | ~180 | ~6 | ⚠️ Unknown |
| MapView executions/30sec | ~180 | 1-2 | ⚠️ Unknown |
| React renders/30sec | ~180 | varies | ⚠️ Unknown |

**Use console logging to measure current state**

---

## 📝 Session Checklist

- [ ] Start dev server: `bun run dev`
- [ ] Open map: http://localhost:3000/mapa
- [ ] Add console.log statements from Step 1-3 above
- [ ] Pan map for 30 seconds
- [ ] Collect metrics from console logs
- [ ] Run React DevTools Profiler
- [ ] Identify root cause
- [ ] Apply Fix #1, #2, or #3 (whichever is the culprit)
- [ ] Re-test and verify improvement
- [ ] Remove console.logs
- [ ] Commit changes

---

## 🔗 File Locations

**Core optimization files:**
- `apps/web/components/map/ui/map-container.tsx` - Main optimization location
- `apps/web/components/map/hooks/use-debounce-viewport.ts` - Debounce hook
- `apps/web/components/map/hooks/use-map-clustering.ts` - Cluster calculation
- `apps/web/components/map/map-view.tsx` - View orchestrator
- `apps/web/components/map/property-marker.tsx` - Memoized marker wrapper
- `apps/web/components/map/cluster-marker.tsx` - Memoized cluster marker

---

## 💡 Key Insight

The problem is likely **not** that optimizations are wrong, but that **we're measuring the wrong thing**:

- ✅ Optimizations are implemented correctly (all type-checks pass)
- ✅ Code is clean and follows React best practices
- ❓ But React Scan might be showing false positives OR
- ❓ Different component is actually causing the issue

**Solution:** Use React DevTools Profiler for ground truth, not React Scan

---

## 🎓 Learning Points

When implementing performance optimizations:

1. **Measure accurately** - React Scan has known false positives with components
2. **Debouncing is delicate** - setTimeout doesn't integrate well with React; use useDeferredValue()
3. **Reference vs values** - Object/function references matter more than their content
4. **Batching is key** - React's built-in batching tools (useDeferredValue, useTransition) beat manual debouncing
5. **Server components are sneaky** - Easy to forget parent server component causes re-execution

---

**Good luck! You've got this! 🚀**
