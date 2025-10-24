# InmoApp Architecture

Entiende cómo está construido InmoApp.

---

## 📐 High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                  Browser / Client                    │
├─────────────────────────────────────────────────────┤
│                  Next.js App Router                  │
│  ┌─────────────────────────────────────────────┐    │
│  │         Server Components (RSC)             │    │
│  │  - Page rendering                           │    │
│  │  - Data fetching (DB queries)               │    │
│  │  - Auth checks                              │    │
│  └─────────────────────────────────────────────┘    │
│                       ↓                              │
│  ┌─────────────────────────────────────────────┐    │
│  │         Client Components                   │    │
│  │  - Interactive UI (Map, Filters)            │    │
│  │  - State management (hooks)                 │    │
│  │  - User interactions                        │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│            Server Actions (Backend Logic)           │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐               │
│  │  Prisma ORM  │→ │  PostgreSQL   │               │
│  └──────────────┘  │  (Supabase)   │               │
│                    └──────────────┘               │
│                                                     │
│  ┌──────────────┐                                 │
│  │  Supabase    │  (Auth, Storage)                │
│  │  (supabase)  │                                 │
│  └──────────────┘                                 │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (public)/          # Route group para páginas públicas
│   │   ├── layout.tsx     # Header + Footer
│   │   ├── page.tsx       # Homepage (/)
│   │   ├── propiedades/   # Property listings (/propiedades)
│   │   │   ├── page.tsx   # Listings page (server component)
│   │   │   └── [id]/
│   │   │       └── page.tsx # Property detail page
│   │   └── mapa/
│   │       └── page.tsx   # Map page (server component) ← AQUÍ CARGA PROPERTIES
│   │
│   ├── api/               # API Routes (si necesita)
│   ├── actions/           # Server Actions (mutations)
│   ├── middleware.ts      # Auth middleware
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── layout/           # Layout components
│   │   └── public-header-client.tsx
│   ├── map/              # Map-related components
│   │   ├── map-view.tsx  # Orchestrator component
│   │   ├── hooks/        # Map hooks
│   │   │   ├── use-map-viewport.ts    # Viewport + URL sync
│   │   │   └── use-map-clustering.ts  # Clustering logic ← CLAVE
│   │   ├── ui/
│   │   │   └── map-container.tsx      # MapBox GL wrapper
│   │   ├── property-marker.tsx        # Individual marker
│   │   ├── cluster-marker.tsx         # Cluster marker
│   │   ├── property-popup.tsx         # Popup on click
│   │   └── property-list-drawer.tsx   # Side drawer
│   └── ...other components
│
├── lib/                  # Utilities
│   ├── types/
│   │   ├── map.ts           # Map types (ViewState, Bounds, etc)
│   │   └── ...other types
│   ├── utils/
│   │   ├── url-helpers.ts   # URL parsing and building ← IMPORTANTE
│   │   └── ...other utils
│   ├── hooks/               # Shared hooks
│   ├── cache/               # Caching utilities
│   └── ...other libs
│
├── public/              # Static files
└── docs/               # Esta documentación ← TÚ ESTÁS AQUÍ
```

---

## 🔄 Data Flow: Visitando el Mapa

### 1️⃣ Usuario abre `/mapa`

```
URL: /mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
                    ↓
```

### 2️⃣ Server Component (page.tsx) procesa

```typescript
export default async function MapPage(props) {
  const searchParams = await props.searchParams;

  // Parsear bounds desde URL
  const bounds = parseBoundsParams(searchParams, defaultViewport);

  // Convertir bounds → viewport
  const viewport = boundsToViewport(bounds);

  // Query DB con bounds precisos
  const { properties } = await getCachedPropertiesByBounds({
    minLatitude: bounds.sw_lat,
    maxLatitude: bounds.ne_lat,
    minLongitude: bounds.sw_lng,
    maxLongitude: bounds.ne_lng,
  });

  // Renderizar con datos
  return <MapView properties={properties} initialViewport={viewport} />;
}
```

### 3️⃣ Client Component (MapView) inicializa

```typescript
export function MapView({ properties, initialViewport }) {
  const mapRef = useRef<MapRef>(null);

  // Hook: Maneja viewport y URL sync
  const { viewState, handleMove } = useMapViewport({
    initialViewport,
    mounted,
    mapRef,
  });

  return (
    <MapContainer
      mapRef={mapRef}
      viewState={viewState}
      onMove={handleMove}
      properties={properties}
    />
  );
}
```

### 4️⃣ Mapa renderiza con clustering

```typescript
export function MapContainer({ mapRef, properties, viewState, onMove }) {
  // Hook: Calcula clusters basándose en bounds precisos
  const clusters = useMapClustering({
    properties,
    viewState,
    mapRef,  // ← Usa map.getBounds() para bounds precisos
  });

  return (
    <Map ref={mapRef} {...viewState} onMove={onMove}>
      {/* Renderiza clusters y markers */}
      {clusters.map(cluster => (
        <ClusterMarker ... /> // O <PropertyMarker .../>
      ))}
    </Map>
  );
}
```

### 5️⃣ Usuario mueve el mapa

```
handleMove() → setViewState() → viewport cambia
                    ↓
            debouncedViewport (500ms)
                    ↓
        useMemo recalcula debouncedBounds
        usando map.getBounds()
                    ↓
        useEffect detecta cambio
                    ↓
        router.replace() actualiza URL
                    ↓
        Server Component re-ejecuta (soft nav)
                    ↓
        getCachedPropertiesByBounds() nueva query
                    ↓
        MapView re-renderiza con nuevas properties
```

---

## 🎯 Conceptos Clave

### 1. Server Components (RSC)
**Qué:** Componentes que corren SOLO en el servidor
**Dónde:** `app/` y cualquier componente que importan
**Ventaja:** Acceso directo a BD, seguridad
**Ejemplo:** `mapa/page.tsx` consulta BD

```typescript
export default async function MapPage(props) {
  // Este código corre en el SERVIDOR
  const properties = await db.property.findMany(...);
  return <MapView properties={properties} />; // Envía datos al cliente
}
```

### 2. Client Components
**Qué:** Componentes que corren en el NAVEGADOR
**Dónde:** Componentes con `"use client"` al inicio
**Ventaja:** Interactividad, hooks, estado
**Ejemplo:** `MapView`, hooks de mapa

```typescript
"use client";

export function MapView({ properties }) {
  // Este código corre en el NAVEGADOR
  const [state, setState] = useState(...);
  return <MapContainer properties={properties} />;
}
```

### 3. Viewport vs Bounds
**Viewport:** Centro + Zoom (cómo renderiza MapBox)
```typescript
{
  latitude: -2.90,    // Centro
  longitude: -79.00,  // Centro
  zoom: 12           // Nivel de zoom
}
```

**Bounds:** Rectángulo visible (para DB queries)
```typescript
{
  ne_lat: -2.85,     // Esquina superior derecha
  ne_lng: -78.95,
  sw_lat: -2.95,     // Esquina inferior izquierda
  sw_lng: -79.05
}
```

**Conversión:**
- Viewport → Bounds: `viewportToBounds()` (aproximado)
- Bounds → Viewport: `boundsToViewport()` (aproximado)
- Mejor: `map.getBounds()` (preciso, considera padding)

### 4. Clustering
**Qué:** Agrupar markers cercanos en 1 cluster
**Por qué:** Performance (50 markers = más rápido que 5000)
**Cómo:** Supercluster (librería JS)
**Importante:** Necesita bounds PRECISOS para funcionar bien

```typescript
const clusters = useMapClustering({
  properties,      // Array de properties
  viewState,      // Viewport actual
  mapRef,         // Ref al map para get Bounds() preciso
});

// Resultado: clusters + individual markers
clusters.map(c => {
  if (isCluster(c)) return <ClusterMarker />;
  return <PropertyMarker />;
});
```

### 5. URL State Management
**Concepto:** La URL contiene el estado del mapa
**Ventaja:** Shareable links, browser history, deep linking

```
URL: /mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
                    ↑
              Bounds en query params
           (determinan qué properties se cargan)
```

**Flujo:**
1. User arrastra mapa
2. `handleMove()` actualiza viewport
3. `useMapViewport()` calcula nuevos bounds
4. `router.replace()` actualiza URL
5. Server re-ejecuta con nuevos bounds
6. `getCachedPropertiesByBounds()` consulta BD
7. Properties se actualizan

---

## 🗄️ Database Schema (Simplified)

```prisma
model Property {
  id            String    @id @default(cuid())
  title         String
  price         Decimal
  latitude      Decimal
  longitude     Decimal
  transactionType TransactionType  // SALE o RENT
  category      PropertyCategory   // HOUSE, APARTMENT, etc
  bedrooms      Int?
  bathrooms     Decimal?
  area          Decimal?
  // ... más campos
}

enum TransactionType {
  SALE
  RENT
}

enum PropertyCategory {
  HOUSE
  APARTMENT
  LAND
  COMMERCIAL
}
```

**Query importante:**
```typescript
// En lib/cache/properties-cache.ts
export async function getCachedPropertiesByBounds({
  minLatitude, maxLatitude,
  minLongitude, maxLongitude,
  filters,
}) {
  return await db.property.findMany({
    where: {
      latitude: { gte: minLatitude, lte: maxLatitude },
      longitude: { gte: minLongitude, lte: maxLongitude },
      // ... filters aplicados aquí
    },
  });
}
```

---

## 🎨 Component Hierarchy

```
MapPage (Server Component)
  ├── Fetch properties from DB
  ├── Parse bounds from URL
  └── <MapView>
       │
       ├── useMapInitialization() hook
       ├── useMapTheme() hook
       ├── useMapViewport() hook ← Viewport + URL sync
       │
       └── <MapContainer> (Client Component)
            │
            ├── useMapClustering() hook ← Clustering logic
            │
            └── <Map> (MapBox GL)
                 ├── <ClusterMarker> × N
                 ├── <PropertyMarker> × N
                 └── <PropertyPopup>
```

---

## 🔌 Key Dependencies

| Librería | Para qué | Dónde se usa |
|----------|----------|-----------|
| `react-map-gl` | Wrapper de MapBox GL | `map-container.tsx` |
| `mapbox-gl` | MapBox GL JS puro | `map-container.tsx` |
| `supercluster` | Clustering de markers | `use-map-clustering.ts` |
| `next/navigation` | Router client-side | Componentes client |
| `@supabase/ssr` | Auth + Storage | Middleware, actions |
| `@prisma/client` | ORM para DB | Server components |

---

## 🚀 Performance Considerations

### 1. Caching
```typescript
// React.cache() deduplicates requests in same render
export const getCachedPropertiesByBounds = React.cache(async (bounds) => {
  return await db.property.findMany(...);
});
```

### 2. Debouncing
```typescript
// URL updates debounced 500ms (previene spam)
const debouncedViewport = useDebounce(viewState, 500);
```

### 3. Memoization
```typescript
// useMapClustering() memoizes clusters
const clusters = useMemo(() => {
  return supercluster.getClusters(bounds, zoom);
}, [supercluster, bounds, zoom]);
```

### 4. useMemo para Bounds
```typescript
// debouncedBounds recalculated only when dependencies change
const debouncedBounds = useMemo(() => {
  if (mapRef?.current) {
    return map.getBounds(); // Exact bounds
  }
  return calculateFallback(); // Symmetric fallback
}, [debouncedViewport, mapRef]);
```

---

## 📚 Related Documentation

- [Map Implementation](./features/MAP.md) - Detalles específicos del mapa
- [Clustering Solution](./decisions/CLUSTERING_SOLUTION.md) - Por qué usamos este approach
- [Database](./technical/DATABASE.md) - Schemas y migrations
- [Performance](./technical/PERFORMANCE.md) - Optimizaciones

---

**Ready?** Ve a [Map Features](./features/MAP.md) para aprender específicamente sobre el mapa.
