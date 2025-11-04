# InmoApp Mapbox Implementation Analysis

## Overview
**Library**: react-map-gl v8.1.0 (VisGL's React wrapper for Mapbox GL JS)
**Location**: `/apps/web/components/map/` and `/apps/web/lib/`
**Status**: Fully functional and optimized for production

---

## 1. REACT MAP GL COMPONENTS & HOOKS BEING USED

### Core React Map GL Components

#### `<Map>` (from react-map-gl/mapbox)
**File**: `/apps/web/components/map/ui/map-container.tsx`
**Purpose**: Root map container
**Key Props**:
- `ref={mapRef}` - Access to native Mapbox GL instance
- `mapStyle` - Map styling (light/dark mode support)
- `mapboxAccessToken` - Authentication
- `viewState` - Viewport control (latitude, longitude, zoom, pitch, bearing)
- `onMove` - Handler for map interactions
- `onLoad` - Initialization handler
- `padding={{top: 80, bottom: 0, left: 0, right: 0}}` - Navbar offset
- `minZoom`/`maxZoom` - Zoom constraints
- `attributionControl={false}` - Custom attribution handling

#### `<Source>` (from react-map-gl/mapbox)
**File**: `/apps/web/components/map/ui/map-layers.tsx`
**Purpose**: GeoJSON data source for properties
**Configuration**:
```typescript
<Source
  id="properties"
  type="geojson"
  data={propertiesGeojson}
  cluster={true}
  clusterMaxZoom={15}
  clusterRadius={50}
/>
```
**Features**:
- GeoJSON format with property coordinates
- Built-in clustering (aggregates nearby points)
- Cluster aggregation stops at zoom level 15
- 50px radius for cluster detection

#### `<Layer>` (from react-map-gl/mapbox)
**File**: `/apps/web/components/map/ui/map-layers.tsx`
**Three layers defined**:

1. **Unclustered Points** (circle layer)
   - Layer ID: `unclustered-point`
   - Filter: `["!", ["has", "point_count"]]` (individual properties only)
   - Visual properties:
     - Radius: 8px
     - Color: Dynamic based on transactionType
       - "SALE" = Blue (#3b82f6)
       - "RENT" = Green (#10b981)
       - Default = Gray (#999)
     - Stroke: 2px white border
     - Opacity: 80%

2. **Clustered Points** (circle layer)
   - Layer ID: `clusters`
   - Filter: `["has", "point_count"]`
   - Size steps:
     - 2-9 points: 20px, Cyan (#51bbd6)
     - 10-49 points: 30px, Yellow (#f1f075)
     - 50+ points: 40px, Pink (#f28cb1)
   - Opacity: 90%

3. **Cluster Count Labels** (symbol layer)
   - Layer ID: `cluster-count`
   - Displays abbreviated point count
   - Uses built-in Mapbox font rendering
   - White text color

#### `<Popup>` (from react-map-gl/mapbox)
**File**: `/apps/web/components/map/property-popup.tsx`
**Purpose**: Display property details on marker click
**Configuration**:
- Position: Marker coordinates (latitude, longitude)
- Offset: `[0, -70]` for full version, `[0, -10]` for compact
- Options:
  - `closeButton={false}` - Custom close button
  - `closeOnClick={false}` - Prevent accidental closes
  - `maxWidth="none"` - Custom width handling

---

## 2. MAPBOX GL NATIVE METHODS & APIS BEING CALLED

### Via MapRef (Native Mapbox GL Instance)

**File**: `/apps/web/components/map/ui/map-container.tsx`

```typescript
const map = mapRef.current.getMap(); // Get native Mapbox GL instance
```

#### Methods Used:

1. **`getMap()`**
   - Gets native Mapbox GL instance
   - Allows direct API access

2. **`getLayer(layerId: string)`**
   - Retrieves layer by ID
   - Used to check if "unclustered-point" layer exists

3. **`getCanvas()`**
   - Gets canvas element
   - Used to change cursor style:
     ```typescript
     map.getCanvas().style.cursor = "pointer"; // On hover
     map.getCanvas().style.cursor = ""; // Default
     ```

4. **`on(event, layer, handler)`**
   - Event listeners:
     - `"click"` - Marker click to open popup
     - `"mouseenter"` - Show pointer cursor
     - `"mouseleave"` - Hide pointer cursor
   - Applied to: `"unclustered-point"` layer

5. **`off(event, layer, handler)`**
   - Remove event listeners (cleanup)

6. **`getBounds()`** (in use-map-viewport.ts)
   - Gets current visible map bounds
   - Returns bounding box object with `getNorthEast()` and `getSouthWest()`
   - Used for URL synchronization

7. **Idle Event Listener** (in use-map-viewport.ts)
   - `map.on("idle", updateUrlOnIdle)`
   - Fires when map stops moving/animating
   - Used instead of debounce for URL updates

---

## 3. LAYER TYPES IMPLEMENTED

### Layer Hierarchy

```
Source: "properties" (GeoJSON)
├── Layer: "unclustered-point" (circle)
│   └── Type: Circle
│   └── Count: Individual properties
│   └── Events: click, mouseenter, mouseleave
│
├── Layer: "clusters" (circle)
│   └── Type: Circle
│   └── Count: Groups of 2+ properties
│   └── Dynamic sizing by point count
│   └── No events (parent interaction only)
│
└── Layer: "cluster-count" (symbol)
    └── Type: Text/Symbol
    └── Displays: Abbreviated point count
    └── Font: DIN Offc Pro Medium, Arial Unicode MS Bold
    └── Color: White
```

### Layer Paint/Layout Properties Used

#### Circle Paint Properties:
- `circle-radius` - Dynamic sizing
- `circle-color` - Dynamic color by type or cluster size
- `circle-opacity` - Transparency
- `circle-stroke-width` - Border thickness
- `circle-stroke-color` - Border color

#### Symbol Layout Properties:
- `text-field` - Content (uses `{point_count_abbreviated}` for clusters)
- `text-size` - Font size
- `text-font` - Font family array

#### Symbol Paint Properties:
- `text-color` - Text color

### Filter Expressions Used:
- `["!", ["has", "point_count"]]` - Match unclustered points
- `["has", "point_count"]` - Match clusters
- `["match", ["get", "transactionType"], ...]` - Color by transaction type
- `["step", ["get", "point_count"], ...]` - Size/color by cluster size

---

## 4. MAP EVENTS BEING HANDLED

### MapContainer Events

**File**: `/apps/web/components/map/ui/map-container.tsx`

| Event | Handler | Purpose | Layer |
|-------|---------|---------|-------|
| `onLoad` | `handleMapLoad` | Attach click listeners after map renders | N/A |
| `onMove` | `handleMove` (from parent) | Update viewport state on pan/zoom | N/A |
| `click` | Custom handler | Open popup when marker clicked | `unclustered-point` |
| `mouseenter` | Cursor pointer | Visual feedback on hover | `unclustered-point` |
| `mouseleave` | Cursor default | Reset cursor | `unclustered-point` |

### Map-Level Events

**File**: `/apps/web/components/map/hooks/use-map-viewport.ts`

| Event | Handler | Purpose |
|-------|---------|---------|
| `idle` | `updateUrlOnIdle` | Update URL when map stops moving |

---

## 5. CUSTOM HOOKS FOR MAP MANAGEMENT

### `useMapInitialization()`
**File**: `/apps/web/components/map/hooks/use-map-initialization.ts`

**Purpose**: Handle hydration and token validation
**Returns**:
```typescript
{
  mounted: boolean,           // Client-side mount status
  mapboxToken: string,        // Validated from env
  isError: boolean           // Missing token flag
}
```
**Responsibilities**:
- Prevents hydration mismatches
- Validates Mapbox token configuration
- Controls loading/error states

### `useMapTheme()`
**File**: `/apps/web/components/map/hooks/use-map-theme.ts`

**Purpose**: Dark/light mode support
**Returns**:
```typescript
{
  mapStyle: string  // "mapbox://styles/mapbox/dark-v11" or "light-v11"
}
```
**Features**:
- Integrates with next-themes
- Memoized return object (prevents MapContainer re-renders)
- Responsive to theme changes

### `useMapViewport()`
**File**: `/apps/web/components/map/hooks/use-map-viewport.ts`

**Purpose**: Viewport state management and URL synchronization
**Parameters**:
```typescript
{
  initialViewport?: MapViewport,
  initialCenter?: [number, number],
  initialZoom?: number,
  mounted: boolean,
  mapRef?: React.RefObject<MapRef>
}
```
**Returns**:
```typescript
{
  viewState: ViewState,                    // Current viewport
  handleMove: (evt: ViewStateChangeEvent) => void
}
```
**Features**:
- Initializes from URL parameters
- Syncs URL on map idle (not debounce)
- Preserves query parameters during navigation
- Memoized handleMove callback

---

## 6. UTILITY FUNCTIONS FOR MAPBOX

### Map Bounds Utilities
**File**: `/apps/web/lib/utils/map-bounds.ts`

1. **`calculateBounds(properties)`**
   - Input: Array of properties with coordinates
   - Output: Bounding box object
   - Purpose: Find geographic extent of properties

2. **`calculateZoomLevel(bounds)`**
   - Input: MapBounds object
   - Output: Zoom level (0-22)
   - Algorithm: Logarithmic scaling based on degree spread
   - Handles: Buildings to countries
   ```
   >10° = zoom 4 (continental)
   3-6.5° = zoom 6 (Ecuador country view)
   0.05° = zoom 13 (neighborhood)
   <0.001° = zoom 18 (building)
   ```

3. **`getSmartViewport(properties)`**
   - Input: Array of properties
   - Output: Viewport configuration
   - Logic:
     - 0 results: Default Cuenca view (zoom 11)
     - 1 result: Street-level closeup (zoom 16)
     - 2+ results: Auto-fit all properties

4. **`boundsToMapBoxFormat(bounds)`**
   - Converts bounds to Mapbox API format
   - Input: `{sw_lng, sw_lat, ne_lng, ne_lat}`
   - Output: `[[sw_lng, sw_lat], [ne_lng, ne_lat]]`

### URL Helper Utilities
**File**: `/apps/web/lib/utils/url-helpers.ts`

- **`buildBoundsUrl(boundsData, searchParams)`**
  - Creates URL with map bounds
  - Preserves existing query params (e.g., ai_search)
  - Used for shareable map links

---

## 7. MAP TYPES & CONSTANTS

### Type Definitions
**File**: `/apps/web/lib/types/map.ts`

```typescript
interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number;      // 0-60 degrees
  bearing?: number;    // 0-360 degrees
}

interface PropertyMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
  transactionType: TransactionType;
  // ... more fields
}

interface MapFilters {
  transactionType?: TransactionType[];
  category?: PropertyCategory[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
}
```

### Constants
**File**: `/apps/web/lib/types/map.ts`

```typescript
DEFAULT_MAP_CONFIG = {
  AZUAY_CENTER: { latitude: -2.9001, longitude: -79.0058 },
  ECUADOR_CENTER: { latitude: -0.1807, longitude: -78.4678 },
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
  DEFAULT_PITCH: 0,
  DEFAULT_BEARING: 0,
}

MAPBOX_STYLES = {
  LIGHT: "mapbox://styles/mapbox/light-v11",
  DARK: "mapbox://styles/mapbox/dark-v11",
  STREETS: "mapbox://styles/mapbox/streets-v12",
  SATELLITE: "mapbox://styles/mapbox/satellite-streets-v12",
}

CLUSTER_CONFIG = {
  RADIUS: 40,          // pixels
  MAX_ZOOM: 16,        // Stop clustering at zoom 16
  MIN_ZOOM: 0,
  MIN_POINTS: 2,
}
```

---

## 8. PERFORMANCE OPTIMIZATIONS IMPLEMENTED

### 1. Component Memoization
- **MapContainer**: Memoized with `React.memo()` to prevent re-renders from parent
- **MapLayers**: Memoized - only re-renders when properties change
- **useMapTheme**: Returns memoized object - prevents MapContainer thrashing

### 2. Viewport Memoization
- ViewState is recalculated when values actually change, not just references
- Prevents infinite re-render loops with React.memo()

### 3. Event Delegation
- Click listeners attached on `onLoad` event, not in render
- Prevents re-registration on every render

### 4. URL Synchronization
- Uses Mapbox `idle` event instead of debounce
- Eliminates artificial 500ms delays
- Preserves query parameters using refs

### 5. Bounds Calculation
- Uses refs to access searchParams without creating dependencies
- Prevents infinite effect loops

---

## 9. CURRENTLY IMPLEMENTED FEATURES

### Full Features
- [x] Interactive Mapbox GL map
- [x] Dark/light mode auto-switching
- [x] Property marker display (circle layer)
- [x] Marker clustering (2+ properties group together)
- [x] Cluster count display (text labels)
- [x] Transaction type color coding (SALE=blue, RENT=green)
- [x] Interactive popup on marker click
- [x] URL state persistence (shareable map links)
- [x] Browser history support (back/forward navigation)
- [x] Viewport bounds in URL (ne_lat, ne_lng, sw_lat, sw_lng)
- [x] Hover cursor feedback
- [x] Mouse enter/leave handlers
- [x] Popup with property details
- [x] Favorite toggle in popup (with auth check)
- [x] "View Details" navigation to property page
- [x] Responsive navbar padding (80px top)
- [x] Smart viewport fitting (0, 1, or multiple results)

### Partially Implemented
- [ ] AI Search integration commented out
- [ ] Client-side filtering (code commented)
- [ ] fitBounds animation on search results (commented)
- [ ] SearchResultsBadge (commented)

### TODO / Commented Out

**File**: `/apps/web/components/map/map-view.tsx` (lines 191-279)
```typescript
// CLIENT-SIDE FILTERING (commented)
// - Filter properties by searchResults
// - Filter by URL params (minPrice, maxPrice, category, bedrooms, etc.)
// - Real-time filtering without server re-renders

// FITBOUNDS ANIMATION (commented)
// - Apply fitBounds when searchResults change
// - 600ms smooth transition
// - Account for navbar + filter bar padding
```

---

## 10. INTEGRATION POINTS

### Parent Component: MapView
**File**: `/apps/web/components/map/map-view.tsx`

Orchestrates:
- Initialization (useMapInitialization)
- Theme (useMapTheme)
- Viewport (useMapViewport)
- Bounds calculation and zoom level
- Render states (error, loading, success)

### Related Components
- **MapFilters**: Sidebar with filtering UI
- **MapSearchBar**: Search input
- **MapSearchIntegration**: AI search integration
- **PropertyListDrawer**: Sidebar with property list

---

## 11. CONFIGURATION LOCATIONS

### Environment Variables
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token (required)

### Map Container Props
```tsx
<Map
  padding={{ top: 80, bottom: 0, left: 0, right: 0 }}  // Navbar offset
  minZoom={3}
  maxZoom={20}
  style={{ width: "100%", height: "100%" }}
/>
```

### Source Configuration (GeoJSON)
```tsx
<Source
  clusterMaxZoom={15}    // Stop clustering at this zoom
  clusterRadius={50}     // Cluster detection radius in pixels
/>
```

### Layer Paint/Layout Properties
All defined inline in `<Layer>` components using Mapbox style expressions

---

## 12. KNOWN ISSUES & IMPROVEMENTS

### Code Health
1. **Commented Code**
   - Lines 170-180: useMemo for viewState (now handled differently)
   - Lines 191-241: Client-side filtering logic (ready for re-enable)
   - Lines 243-279: fitBounds animation (ready for re-enable)

2. **TODO Comments**
   - Line 95: searchResults not used (marked with TODO)
   - Line 301: searchResults TODO

### Performance Notes
- Map re-renders only on property changes (memoized)
- Click handlers attached once on `onLoad`, not per-render
- URL updates use `idle` event, not debounce
- ViewState properly memoized to prevent MapContainer thrashing

### Potential Improvements
1. Re-enable client-side filtering for URL-based filters
2. Re-enable fitBounds animation for AI search results
3. Implement viewport-based property loading (only show visible)
4. Add geolocation button
5. Add draw custom search area feature

---

## 13. FILE STRUCTURE SUMMARY

```
apps/web/
├── components/map/
│   ├── ui/
│   │   ├── map-container.tsx         (Map + event setup)
│   │   ├── map-layers.tsx            (Source + 3 Layers)
│   │   ├── map-popup-manager.tsx     (Popup state)
│   │   ├── map-error-state.tsx
│   │   └── map-loading-state.tsx
│   ├── hooks/
│   │   ├── use-map-initialization.ts (Token + hydration)
│   │   ├── use-map-theme.ts          (Dark/light mode)
│   │   └── use-map-viewport.ts       (Viewport + URL sync)
│   ├── map-view.tsx                  (Orchestrator)
│   ├── property-popup.tsx            (Popup component)
│   ├── property-popup-compact.tsx
│   ├── property-card-horizontal.tsx
│   ├── property-card-compact.tsx
│   ├── map-search-bar.tsx
│   ├── map-filters.tsx
│   ├── property-list-drawer.tsx
│   └── [other UI components]
│
└── lib/
    ├── types/
    │   └── map.ts                    (Types + constants)
    └── utils/
        ├── map-bounds.ts             (Bounds + zoom calc)
        ├── url-helpers.ts            (URL sync)
        └── [other utils]
```

---

## 14. MAPBOX GL JS VERSION COMPATIBILITY

- **react-map-gl**: v8.1.0 (supports Mapbox GL 3.0+)
- **mapbox-gl**: Installed as peer dependency
- **CSS Import**: `mapbox-gl/dist/mapbox-gl.css` (line 44, map-container.tsx)

---

## SUMMARY

InmoApp uses a well-structured, performance-optimized Mapbox implementation with:

1. **Core Features**:
   - Interactive map with markers and clustering
   - Transaction type color coding
   - Property popups with full details
   - Dark/light mode support
   - URL state persistence

2. **Architecture**:
   - Separated concerns (components, hooks, utilities)
   - React.memo() for performance
   - Custom hooks for reusability
   - Type-safe TypeScript

3. **Mapbox APIs Used**:
   - GeoJSON Source with clustering
   - 3 Layers (unclustered points, clusters, cluster count)
   - Popup for details
   - Event listeners (click, hover)
   - Native Mapbox GL methods (getLayer, getMap, getBounds)

4. **Ready for Enhancement**:
   - Commented code for client-side filtering
   - Commented code for fitBounds animation
   - AI search integration hooks in place
   - URL parameter system ready for filter persistence

