# Map Feature - InmoApp

Implementación del mapa interactivo con Mapbox GL usando enfoque simplificado.

---

## 📍 Overview

**Estado:** ✅ Funcional (implementación simplificada Nov 2025)
**Ubicación:** `/mapa` route
**Componente principal:** `map-view.tsx` (single file, ~260 líneas)
**Arquitectura:** Mapbox GL nativo con clustering integrado

El mapa permite a los usuarios:
- ✅ Ver properties en un mapa interactivo
- ✅ Navegar usando pan y zoom
- ✅ Ver clusters de properties cercanas (clustering nativo de Mapbox)
- ✅ Hacer clic en markers para ver detalles en popup
- ✅ Badges de precio con iconos SDF

---

## 🏗️ Arquitectura Actual

### Componente Principal

**Archivo:** `apps/web/components/map/map-view.tsx` (~260 líneas)

```
MapView (single component)
  ├── react-map-gl <Map>
  ├── <Source> (GeoJSON con clustering nativo)
  ├── 3 Layers:
  │   ├── clusters (circle layer) - círculos azules
  │   ├── cluster-count (symbol layer) - números
  │   └── properties-badge-layer (symbol layer) - badges con precio
  └── <Popup> (inline, simple)
```

**Características:**
- Single file component (sin hooks personalizados)
- Clustering **nativo de Mapbox** (no usa Supercluster library)
- Dark mode hardcoded
- No URL synchronization
- No theme switching
- Event handlers inline

---

## 🎨 Implementación Visual

### 1. Clusters (Círculos Azules)

```typescript
<Layer
  id="clusters"
  type="circle"
  filter={["has", "point_count"]}
  paint={{
    "circle-radius": [
      "step",
      ["get", "point_count"],
      16,  // < 10 properties
      10, 20,  // 10-25 properties
      25, 24,  // 25-50 properties
      50, 30,  // 50+ properties
    ],
    "circle-color": "#3b82f6",  // Blue
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-opacity": 0.8,
  }}
/>
```

**Comportamiento:**
- Tamaño aumenta según cantidad de properties
- Color azul uniforme (#3b82f6)
- Click → zoom in automático usando `getClusterExpansionZoom`

### 2. Property Badges (Symbol Layer + SDF Icon)

```typescript
<Layer
  id="properties-badge-layer"
  type="symbol"
  filter={["!", ["has", "point_count"]]}
  layout={{
    "text-field": ["concat", "$", ["get", "formattedPrice"]],
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-size": 15,
    "icon-image": "badge-background",  // SDF icon
    "icon-text-fit": "both",
    "icon-text-fit-padding": [4, 8, 4, 8],
  }}
  paint={{
    "text-color": "#ffffff",
    "icon-color": "#3b82f6",  // Blue
  }}
/>
```

**Técnica SDF (Signed Distance Field):**
- SVG badge background cargado como imagen SDF
- Permite colorear dinámicamente con `icon-color`
- `icon-text-fit` ajusta el badge al texto del precio
- Resultado: badges responsivos que se adaptan al precio

### 3. Cluster Count Labels

```typescript
<Layer
  id="cluster-count"
  type="symbol"
  filter={["has", "point_count"]}
  layout={{
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 14,
  }}
  paint={{
    "text-color": "#ffffff",
  }}
/>
```

---

## 🔧 Configuración

### Clustering Config

**Archivo:** `lib/types/map.ts`

```typescript
export const CLUSTER_CONFIG = {
  RADIUS: 50,           // pixels para agrupar
  MAX_ZOOM: 14,         // dejar de agrupar en zoom 14
  ZOOM_INCREMENT: 1,    // cuánto zoom al hacer click
};
```

### Initial Viewport

```typescript
initialViewState={{
  latitude: -2.9,      // Cuenca, Ecuador
  longitude: -79.0,
  zoom: 6,            // Vista de Ecuador completo
}}
```

### Map Style

- **Actual:** `mapbox://styles/mapbox/dark-v11` (hardcoded)
- **No hay:** Theme switching automático

---

## 💾 Datos (GeoJSON)

### Conversión de Properties

```typescript
const geojsonData = {
  type: "FeatureCollection",
  features: properties.map((property) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [property.longitude, property.latitude],
    },
    properties: {
      id: property.id,
      title: property.title,
      price: property.price,
      formattedPrice: formatPriceCompact(property.price),
      transactionType: property.transactionType,
      category: property.category,
      city: property.city,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
    },
  })),
};
```

### Cluster Properties

```typescript
<Source
  cluster={true}
  clusterMaxZoom={CLUSTER_CONFIG.MAX_ZOOM}
  clusterRadius={CLUSTER_CONFIG.RADIUS}
  clusterProperties={{
    // Calcular max price en el cluster (para coloring futuro)
    maxPrice: ["max", ["get", "price"]],
  }}
/>
```

---

## 🎯 Event Handlers

### Click Handler (Clusters + Properties)

```typescript
const handleClick = (event: MapLayerMouseEvent) => {
  const feature = event.features?.[0];

  // Si es cluster → zoom in
  if (feature.properties?.cluster) {
    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current?.getMap().getSource("properties");

    if (mapboxSource && "getClusterExpansionZoom" in mapboxSource) {
      mapboxSource.getClusterExpansionZoom(
        clusterId,
        (err: Error | null, zoom: number) => {
          if (err) return;
          mapRef.current?.flyTo({
            center: geometry.coordinates,
            zoom: zoom + CLUSTER_CONFIG.ZOOM_INCREMENT,
            duration: 600,
          });
        }
      );
    }
  }

  // Si es property individual → mostrar popup
  else if (feature.properties?.id) {
    const property = properties.find(p => p.id === feature.properties.id);
    setSelectedProperty(property);
  }
};
```

---

## 🪟 Popup

### Implementación Simple

```typescript
{selectedProperty?.latitude && selectedProperty.longitude && (
  <Popup
    latitude={selectedProperty.latitude}
    longitude={selectedProperty.longitude}
    onClose={() => setSelectedProperty(null)}
    closeButton={true}
    closeOnClick={true}
    offset={[0, -10]}
    maxWidth="400px"
  >
    <PropertyCardHorizontal
      property={selectedProperty}
      variant="popup"
    />
  </Popup>
)}
```

**Características:**
- Popup integrado (no component separado)
- Usa `PropertyCardHorizontal` existente
- Close automático al hacer click fuera
- Offset para posicionar encima del badge

**Styling:** Ver `MAPBOX_POPUP_STYLING.md` para CSS overrides

---

## 📂 Archivos Relacionados

```
apps/web/components/map/
├── map-view.tsx                    ← Componente principal (TODO EN UNO)
├── property-card-horizontal.tsx   ← Card usado en popup
├── map-spinner.tsx                 ← Loading state
├── property-popup.tsx              ← (Popup alternativo, no usado actualmente)
├── property-popup-compact.tsx
├── map-filters.tsx                 ← Filtros (separado)
├── property-list-drawer.tsx        ← Drawer lateral
└── filters/                        ← Componentes de filtros
    ├── filter-bar.tsx
    ├── category-filter.tsx
    ├── price-range-filter.tsx
    └── ...

apps/web/lib/
├── types/map.ts                    ← Types + CLUSTER_CONFIG
└── utils/
    └── price-helpers.ts            ← formatPriceCompact()
```

---

## 🚀 Uso

### En una página

```typescript
import { MapView } from "@/components/map/map-view";

export default async function MapPage() {
  const properties = await getProperties(); // Tu data source

  return (
    <div className="h-screen">
      <MapView
        properties={properties}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Mapbox token no configurado

**Error:** "Error: Mapbox token no configurado"

**Solución:**
```bash
# En apps/web/.env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
```

### Badges no aparecen

**Causa:** SDF image no cargó

**Solución:** Verificar que `handleMapLoad` ejecute:
```typescript
const image = new Image(48, 24);
image.src = "data:image/svg+xml;base64," + btoa(badgeSvg);
image.onload = () => {
  if (!map.hasImage("badge-background")) {
    map.addImage("badge-background", image, { sdf: true });
  }
};
```

### Popup styling issues

**Solución:** Ver `MAPBOX_POPUP_STYLING.md` para CSS overrides globales

---

## 📚 Referencias

- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [Mapbox GL JS Layers](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/)
- [SDF Icons Guide](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/)
- Popup Styling: `MAPBOX_POPUP_STYLING.md`
- Troubleshooting: `../troubleshooting/MAP_ISSUES.md`

---

## 🗂️ Documentación Archivada

La implementación anterior (hooks personalizados, Supercluster, URL sync, bounds calculation) fue archivada en:
- `archive/docs-old-map-implementation/`

**Razón:** Se optó por empezar de nuevo con enfoque simplificado (single component, clustering nativo de Mapbox)

Esta documentación refleja la **implementación actual** (Noviembre 2025).

---

**Última actualización:** Noviembre 5, 2025
**Versión implementación:** Simplificada (single component, Mapbox native clustering)
**Componentes:** 1 archivo principal (~260 líneas)
