# Map Feature - InmoApp

Implementación completa del mapa interactivo con markers, clustering y sincronización de URL.

---

## 📍 Overview

**Estado:** ✅ Completo (con recientes fixes)
**Ubicación:** `/mapa` route
**Componentes principales:** `map-view.tsx`, `map-container.tsx`, hooks de mapa

El mapa es el corazón de InmoApp. Permite a los usuarios:
- ✅ Ver properties en un mapa interactivo
- ✅ Navegar usando pan y zoom
- ✅ Ver clusters de properties cercanas
- ✅ Hacer clic en markers para ver detalles
- ✅ Compartir posiciones del mapa (shareable URLs)
- ✅ Filtrar properties (backend completo)

---

## ✨ Features Implementadas

### 1. Interactive Map Rendering
✅ **Status:** Completo

MapBox GL renderiza el mapa base con:
- Light/dark mode automático
- Navegación fluid (pan, zoom)
- Min/max zoom configurables

```typescript
<Map
  {...viewState}
  mapStyle={mapStyle}  // light-v11 o dark-v11
  minZoom={3}
  maxZoom={20}
  padding={{ top: 80 }} // Considera header fijo
/>
```

### 2. Property Markers
✅ **Status:** Completo

Cada property se muestra como un marker:
- Precio como badge
- Colores según tipo (SALE: azul, RENT: verde)
- Hover effects
- Click para mostrar popup

**Problema resuelto:** Markers desaparecían en parte superior
**Solución:** `map.getBounds()` + padding de MapBox

### 3. Smart Clustering
✅ **Status:** Completo (Recently fixed)

Supercluster agrupa markers cercanos:
- Dinámico según zoom level
- Glassmorphism design con gradientes
- Click en cluster → zoom in
- Tamaño del cluster → cantidad de properties

**Problema anterior:** Clustering filtraba properties en área superior
**Solución:** Usar `map.getBounds()` en lugar de cálculo simétrico

### 4. URL State Synchronization
✅ **Status:** Completo

El estado del mapa se sincroniza con URL:
```
/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
```

**Beneficios:**
- Shareable map links
- Browser history (back/forward)
- Deep linking
- Bookmarkable states

**Implementación:**
- `useMapViewport()` detecta cambios
- Debounce de 500ms (previene spam)
- `buildBoundsUrl()` construye URL
- `parseBoundsParams()` parsea URL

### 5. Dynamic Filtering (Backend Completo)
✅ **Status:** Backend completo, UI pendiente

El servidor filtra properties basándose en:
- `transactionType` (SALE, RENT)
- `category` (HOUSE, APARTMENT, etc)
- `minPrice`, `maxPrice`
- `bedrooms`, `bathrooms`
- `minArea`, `maxArea`
- Text search

**URL params:**
```
/mapa?ne_lat=...&transactionType=SALE&minPrice=100000&maxPrice=500000
```

**Estado:** El backend procesa los filtros, pero falta UI sidebar

---

## 🔧 Technical Implementation

### Components Hierarchy

```
MapPage (Server, mapa/page.tsx)
  ├── Fetch properties from DB
  └── <MapView> (Client)
       ├── useMapInitialization()
       ├── useMapTheme()
       ├── useMapViewport() ← Viewport + URL sync
       └── <MapContainer> (Client)
            ├── useMapClustering() ← Clustering with map.getBounds()
            └── <Map>
                 ├── <ClusterMarker>
                 ├── <PropertyMarker>
                 └── <PropertyPopup>
```

### Key Files

| Archivo | Responsabilidad |
|---------|-----------------|
| `map-view.tsx` | Orchestrator component |
| `map-container.tsx` | MapBox GL wrapper |
| `use-map-viewport.ts` | Viewport + URL sync |
| `use-map-clustering.ts` | Clustering logic ← Recently fixed |
| `property-marker.tsx` | Individual marker |
| `cluster-marker.tsx` | Cluster marker |
| `use-map-theme.ts` | Dark mode support |
| `use-map-initialization.ts` | MapBox token setup |

### Hooks Deep Dive

#### `useMapViewport` (70 líneas)
**Responsabilidades:**
1. Gestiona `viewState` (lat, lng, zoom, pitch, bearing)
2. Sincroniza cambios con URL (debounced)
3. Calcula `debouncedBounds` usando `map.getBounds()`
4. Previene infinite loops con `useRef`

**Datos:**
```typescript
viewState = {
  longitude: -79.00,
  latitude: -2.90,
  zoom: 12,
  pitch: 0,
  bearing: 0,
  transitionDuration: 0
}

debouncedBounds = {
  ne_lat: -2.85,
  ne_lng: -78.90,
  sw_lat: -2.95,
  sw_lng: -79.10
}
```

#### `useMapClustering` (100+ líneas)
**Responsabilidades:**
1. Inicializa Supercluster con properties
2. Calcula clusters para viewport actual
3. **Nuevo:** Usa `map.getBounds()` para bounds precisos
4. Retorna clusters + individual points

**Problema anterior:**
```typescript
// ❌ Bounds simétricos (INCORRECTO)
const latDelta = (180 / 2^zoom) * 1.2;
bounds = [lng - delta, lat - delta, lng + delta, lat + delta];
// Esto filtraba properties en área superior
```

**Solución implementada:**
```typescript
// ✅ Bounds precisos de MapBox (CORRECTO)
if (mapRef?.current) {
  const bounds = mapRef.current.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  // Bounds asimétricos, considera el header de 80px
}
```

---

## 🐛 Issues Resueltas

### Issue #1: Markers Desapareciendo en Parte Superior
**Síntoma:** Markers no visibles en los primeros ~64px bajo header
**Causa Raíz:** Combinación de problemas
1. Header tenía `z-index: 50`
2. Markers tenían `z-index: 0`
3. Además: Clustering usaba bounds incorrecto

**Soluciones aplicadas:**
1. ✅ `padding={{ top: 80 }}` en MapBox (visual fix)
2. ✅ `map.getBounds()` en clustering (data accuracy fix)

**Commits:**
- `5f7fde4` - MapBox padding
- `0ec87fc` - getBounds() en useMapViewport
- `d2e2bc8` - getBounds() en useMapClustering

---

## 📊 Data Flow: Visitando el Mapa

```
1. URL: /mapa?ne_lat=-2.85&ne_lng=-78.95...
   ↓
2. Server: parseBoundsParams() → bounds
   ↓
3. Server: getCachedPropertiesByBounds(bounds) → query DB
   ↓
4. Server: boundsToViewport() → viewport para inicializar map
   ↓
5. Client: MapView renderiza con properties
   ↓
6. Client: useMapViewport() + useMapClustering()
   ↓
7. MapBox renderiza markers/clusters
   ↓
8. Usuario arrastra mapa
   ↓
9. handleMove() → viewState actualiza
   ↓
10. useMapViewport() debounce 500ms
    ↓
11. map.getBounds() calcula bounds precisos
    ↓
12. router.replace() actualiza URL
    ↓
13. Server re-ejecuta (soft navigation)
    ↓
14. Ciclo repite desde paso 2
```

---

## 🎯 Next Steps

### ⏳ In Progress / Planned

#### 1. Filter UI Sidebar (HIGH PRIORITY)
```
Status: Design phase
Backend: ✅ Completo
Frontend: ❌ Pendiente

Components needed:
- MapFilters (container)
- TransactionTypeFilter (checkboxes)
- PriceRangeFilter (range slider)
- CategoryFilter (checkboxes)
- BedroomFilter (number selector)
```

#### 2. Property Search with Geocoding
```
Status: Design phase
Requiere: MapBox Geocoding API

Feature:
- Search bar en map header
- Auto-complete locations
- Click resultado → fly to location
```

#### 3. Bounds Fitting
```
Status: Design phase
Requiere: calculateOptimalBounds()

Feature:
- When filters change → fit view to show all results
- When cluster expands → fit cluster bounds
```

#### 4. Property Details Drawer
```
Status: Partially done
PropertyPopup: ✅ Existe
PropertyListDrawer: ❌ Comentado

Feature:
- Show properties list alongside map
- Hover property → highlight marker
- Click property → navigate to detail page
```

---

## 🚀 Performance Metrics

**Current:**
- Initial load: ~1-2s (including Prisma query)
- Properties fetched: ~1000 by default
- Clustering calculation: <50ms
- URL update debounce: 500ms
- Marker render: <100ms per marker

**Optimizations done:**
- ✅ `React.cache()` deduplicates DB requests
- ✅ `useMemo()` para clustering
- ✅ Debouncing para URL updates
- ✅ MapBox native padding (no JS calculations)

---

## 🧪 Testing the Map

### Manual Testing Checklist

- [ ] Open `/mapa` - map loads
- [ ] Zoom in/out - works smoothly
- [ ] Pan (drag) - viewport updates
- [ ] Markers visible - in all areas including top
- [ ] Click marker - shows popup
- [ ] Popup has correct property info
- [ ] Close popup - works
- [ ] Click cluster - zooms to cluster
- [ ] URL changes while dragging - updates with bounds
- [ ] Refresh page - loads same viewport (URL state works)
- [ ] Share URL - copied URL loads same map
- [ ] Try zoom 3, 12, 16 - clustering works at all levels
- [ ] Dark mode - works correctly

### Automated Testing (TODO)
```typescript
test('useMapViewport does not infinite loop', () => {
  // Verify bounds change triggers URL update only once
});

test('useMapClustering with map.getBounds()', () => {
  // Verify all properties in viewport included in clustering
});

test('markers visible in all viewport areas', () => {
  // Verify top area not clipped
});
```

---

## 📚 Related Docs

- **[Architecture](../ARCHITECTURE.md)** - Cómo todo encaja
- **[Clustering Solution](../decisions/CLUSTERING_SOLUTION.md)** - Decisión técnica
- **[Map Padding](../decisions/PADDING_IMPLEMENTATION.md)** - Por qué 80px
- **[Performance](../technical/PERFORMANCE.md)** - Optimizaciones
- **[Map Issues](../troubleshooting/MAP_ISSUES.md)** - Solución de problemas

---

**Last Updated:** Oct 24, 2025
**Features Status:** 5/7 completas
**Next Priority:** Filter UI sidebar

¿Listo para trabajar en filtros? Ver [guides/ADDING_FEATURES.md](../guides/ADDING_FEATURES.md)
