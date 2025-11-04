# InmoApp Mapbox - Quick Reference Guide

## Component Hierarchy

```
<MapView>
├── Initialization: useMapInitialization()
├── Theme: useMapTheme()
├── Viewport: useMapViewport()
└── <MapContainer> (React.memo)
    ├── <Map> (react-map-gl)
    │   ├── <MapLayers> (React.memo)
    │   │   └── <Source id="properties">
    │   │       ├── <Layer id="unclustered-point" type="circle">
    │   │       ├── <Layer id="clusters" type="circle">
    │   │       └── <Layer id="cluster-count" type="symbol">
    │   └── <MapPopupManager>
    │       └── <PropertyPopup> or <PropertyPopupCompact>
    │           └── <Popup> (react-map-gl)
    └── [other map UI components]
```

## Key Files by Responsibility

| File | Purpose | Key Exports |
|------|---------|-------------|
| `map-container.tsx` | Map + event setup | `MapContainer` (memoized) |
| `map-layers.tsx` | Source + layers | `MapLayers` (memoized) |
| `map-popup-manager.tsx` | Popup state | `MapPopupManager` |
| `property-popup.tsx` | Popup display | `PropertyPopup` |
| `map-view.tsx` | Orchestrator | `MapView` |
| `use-map-initialization.ts` | Token + hydration | `useMapInitialization` |
| `use-map-theme.ts` | Dark/light mode | `useMapTheme` |
| `use-map-viewport.ts` | Viewport + URL | `useMapViewport` |
| `map-bounds.ts` | Math utilities | `calculateZoomLevel`, `getSmartViewport` |
| `map.ts` | Types + constants | `DEFAULT_MAP_CONFIG`, `MAPBOX_STYLES` |

## React Map GL Components

```typescript
import { Map, Source, Layer, Popup } from "react-map-gl/mapbox";

// Map (main container)
<Map viewState={...} onMove={...} mapStyle={...} mapboxAccessToken={...} />

// Source (GeoJSON data provider)
<Source id="properties" type="geojson" data={geojson} cluster={true} />

// Layer (visual representation)
<Layer id="unclustered-point" type="circle" paint={{...}} filter={...} />

// Popup (detail display)
<Popup longitude={lng} latitude={lat}>Content</Popup>
```

## Mapbox GL Native API Usage

```typescript
// Get native map instance
const map = mapRef.current.getMap();

// Retrieve layer
const layer = map.getLayer("unclustered-point");

// Get canvas (for cursor)
map.getCanvas().style.cursor = "pointer";

// Attach event listeners
map.on("click", "unclustered-point", (e) => { ... });
map.on("mouseenter", "unclustered-point", () => { ... });
map.on("mouseleave", "unclustered-point", () => { ... });
map.on("idle", () => { ... }); // URL sync trigger

// Get viewport bounds
const bounds = mapRef.current.getBounds();
const ne = bounds.getNorthEast(); // {lat, lng}
const sw = bounds.getSouthWest(); // {lat, lng}
```

## Layer Configuration Reference

### Unclustered Points (Individual Properties)
- **ID**: `unclustered-point`
- **Type**: `circle`
- **Filter**: `["!", ["has", "point_count"]]`
- **Paint**:
  - Radius: 8px
  - Color: SALE=blue, RENT=green
  - Stroke: 2px white
  - Opacity: 80%
- **Events**: click, mouseenter, mouseleave

### Clusters (Grouped Properties)
- **ID**: `clusters`
- **Type**: `circle`
- **Filter**: `["has", "point_count"]`
- **Paint**:
  - Radius: steps 20-40px based on count
  - Color: cyan (2-9) → yellow (10-49) → pink (50+)
  - Stroke: 2px white
  - Opacity: 90%
- **Events**: None (parent interaction only)

### Cluster Count Labels
- **ID**: `cluster-count`
- **Type**: `symbol`
- **Layout**: Text field `{point_count_abbreviated}`
- **Paint**: White text
- **Font**: DIN Offc Pro Medium

## Hook Usage Patterns

```typescript
// Initialization (in MapView)
const { mounted, mapboxToken, isError } = useMapInitialization();

// Theme (in MapView)
const { mapStyle } = useMapTheme(); // Returns memoized object

// Viewport (in MapView)
const { viewState, handleMove } = useMapViewport({
  initialViewport,
  initialCenter,
  initialZoom,
  mounted,
  mapRef
});

// Then pass to MapContainer
<MapContainer
  mapRef={mapRef}
  viewState={viewState}
  onMove={handleMove}
  mapStyle={mapStyle}
  mapboxToken={mapboxToken}
  properties={properties}
/>
```

## Event Flow for Marker Interaction

```
User clicks marker
  ↓
mapRef.current.on("click", "unclustered-point", ...)
  ↓
Extract propertyId from event.features[0]
  ↓
handlePropertyClick(propertyId)
  ↓
setSelectedPropertyId(propertyId)  // in MapPopupManager
  ↓
<PropertyPopup> renders
  ↓
Display property details in popup
  ↓
User clicks "View Details" or close button
  ↓
Navigation or popup close
```

## URL State Management

```typescript
// Map moves/pans/zooms
mapRef.current.on("idle", updateUrlOnIdle)
  ↓
Get current bounds: mapRef.current.getBounds()
  ↓
Convert to bounds object: { ne_lat, ne_lng, sw_lat, sw_lng }
  ↓
Build URL with bounds + preserve params: buildBoundsUrl()
  ↓
Update browser URL: router.replace(newUrl)
  ↓
URL becomes shareable: /mapa?ne_lat=-2.8&ne_lng=-78.9&sw_lat=-2.95&sw_lng=-79.15
```

## Viewport Calculations

```typescript
// Calculate zoom from bounds spread
const lngDiff = bounds.ne_lng - bounds.sw_lng;
const latDiff = bounds.ne_lat - bounds.sw_lat;
const maxDiff = Math.max(lngDiff, latDiff);

if (maxDiff > 10) return 4;        // Countries
if (maxDiff > 3) return 6;         // Ecuador
if (maxDiff > 0.05) return 13;     // Neighborhoods
if (maxDiff > 0.001) return 17;    // Streets
return 18;                          // Buildings

// Smart viewport for search results
- 0 results: Default Cuenca (zoom 11)
- 1 result: Street level (zoom 16)
- 2+ results: Auto-fit all (calculated zoom)
```

## Configuration Constants

```typescript
DEFAULT_MAP_CONFIG = {
  AZUAY_CENTER: { latitude: -2.9001, longitude: -79.0058 },
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
}

MAPBOX_STYLES = {
  LIGHT: "mapbox://styles/mapbox/light-v11",
  DARK: "mapbox://styles/mapbox/dark-v11",
}

CLUSTER_CONFIG = {
  RADIUS: 40,        // pixels
  MAX_ZOOM: 15,      // Stop clustering here
}
```

## Performance Tips

1. **Memoize components**: `React.memo(MapContainer)`, `React.memo(MapLayers)`
2. **Memoize hooks**: `useMapTheme()` returns memoized object
3. **Event attachment**: Attach on `onLoad`, not per-render
4. **URL sync**: Use `idle` event, not debounce
5. **Refs for dependencies**: Store searchParams in ref to avoid infinite loops

## Common Patterns

### Filter Properties
```typescript
// Currently commented out in map-view.tsx
const displayedProperties = properties.filter(prop => {
  if (searchResults) return searchResults.some(r => r.id === prop.id);
  if (filter.minPrice) return prop.price >= filter.minPrice;
  // ... more filters
});
```

### Fit Bounds Animation
```typescript
// Currently commented out in map-view.tsx
mapRef.current.fitBounds(mapBoxBounds, {
  padding: { top: 130, bottom: 50, left: 50, right: 50 },
  duration: 600,
  maxZoom: 17,
});
```

### Change Cursor on Hover
```typescript
const onMouseEnter = () => map.getCanvas().style.cursor = "pointer";
const onMouseLeave = () => map.getCanvas().style.cursor = "";

map.on("mouseenter", "unclustered-point", onMouseEnter);
map.on("mouseleave", "unclustered-point", onMouseLeave);
```

## Debug Checklist

- [ ] Mapbox token in env: `NEXT_PUBLIC_MAPBOX_TOKEN`
- [ ] Properties have coordinates: `latitude` and `longitude` not null
- [ ] GeoJSON valid: Features array with Point geometry
- [ ] Layers attached: Check DevTools > React Scan
- [ ] Events firing: Check console in `onLoad` callback
- [ ] URL syncing: Check browser URL on map idle
- [ ] Popup positioning: Check `latitude`/`longitude` in popup props
- [ ] Clustering visible: Zoom out to see clusters form

## Environment Variables

```bash
# Required in .env.local (apps/web) or root
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...  # Public key from Mapbox

# Used by MapView initialization
NEXT_PUBLIC_SUPABASE_URL=...     # For data loading
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # For auth
```

## Testing Map Features

1. **Markers appear**: Navigate to /mapa with properties
2. **Clustering works**: Zoom out to see clusters form
3. **Colors correct**: Blue for SALE, green for RENT
4. **Popup opens**: Click marker
5. **URL updates**: Pan/zoom map, check URL
6. **Dark mode**: Toggle theme, map style changes
7. **Responsive**: Map fills screen on mobile
8. **Navbar offset**: Map top padding accommodates navbar

