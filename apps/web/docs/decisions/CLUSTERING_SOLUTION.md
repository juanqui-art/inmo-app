# ADR: Clustering Solution - Using Supercluster with Precise Bounds

**Fecha:** 2025-10-24
**Estado:** Aceptado ✅
**Tecnología:** Supercluster library with MapBox getBounds()

---

## 📋 Resumen Ejecutivo

**Problema:** Cuando hay muchos properties (100+), renderizar markers individuales:
- Es lento ❌
- Pantalla se llena de markers ❌
- Difícil identificar densidad ❌

**Solución:** Usar **Supercluster** para agrupar markers cercanos en "clusters" que:
- Se expanden al hacer zoom ✅
- Muestran cantidad de properties ✅
- Mantienen visual limpio ✅

**Resultado:** Mapa usable incluso con 1000+ properties 🚀

---

## 🔍 Contexto

### El Problema Original

Sin clustering:
```
Zoom=5 (muy alejado):  5000 markers individuales 😱
Zoom=15 (acercado):    500 markers individuales
```

Esto causa:
- Slow rendering (<20fps)
- Memory leak
- Pantalla ilegible

### Cómo Funciona Supercluster

Supercluster agrupa markers basándose en:
1. **Zoom level actual**
2. **Proximidad geográfica** (distancia Euclidiana)
3. **Radius configurado** (por defecto 80px)

```
ZOOM 5:
  🔵 Cluster: 100+ properties
  🔵 Cluster: 50 properties
  🔵 Cluster: 30 properties

ZOOM 12:
  🔵 Cluster: 10 properties
  🔵 🏠 Individual property
  🔵 🏠 Individual property

ZOOM 17:
  🏠 Individual property (todos)
```

---

## ✅ Decisión

**Usar Supercluster library** con configuración optimizada para real estate.

### Instalación

```bash
bun add supercluster
```

### Implementación

**Archivo:** `components/map/hooks/use-map-clustering.ts`

```typescript
import Supercluster from 'supercluster';
import { useMemo } from 'react';
import { CLUSTER_CONFIG } from '@/lib/types/map';

export function useMapClustering({ properties, viewState, mapRef }) {
  // 1. Crear instancia de Supercluster
  const supercluster = useMemo(() => {
    return new Supercluster({
      radius: CLUSTER_CONFIG.RADIUS,        // 80px
      maxZoom: CLUSTER_CONFIG.MAX_ZOOM,    // 17
      initial: () => ({ count: 0 }),
      map: (props) => ({ count: props.count + 1 }),
      reduce: (acc, props) => {
        acc.count += props.count;
        return acc;
      },
    });
  }, []);

  // 2. Cargar properties cuando cambian
  useEffect(() => {
    if (properties.length > 0) {
      const points = properties.map((p) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.longitude, p.latitude],
        },
        properties: p,
        id: p.id,
      }));
      supercluster.load(points);
    }
  }, [properties, supercluster]);

  // 3. Obtener clusters para viewport actual
  const clusters = useMemo(() => {
    let bounds: [number, number, number, number];

    // ✅ Use precise bounds from MapBox
    if (mapRef?.current) {
      try {
        const mapBounds = mapRef.current.getBounds();
        if (mapBounds) {
          const ne = mapBounds.getNorthEast();
          const sw = mapBounds.getSouthWest();
          bounds = [sw.lng, sw.lat, ne.lng, ne.lat];
        } else {
          bounds = calculateFallbackBounds(viewState);
        }
      } catch (error) {
        bounds = calculateFallbackBounds(viewState);
      }
    } else {
      bounds = calculateFallbackBounds(viewState);
    }

    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [supercluster, viewState, mapRef]);

  return clusters;
}

// Type helpers
export function isCluster(cluster: any): cluster is ClusterMarker {
  return cluster.properties?.cluster === true;
}
```

### Configuración

```typescript
// lib/types/map.ts
export const CLUSTER_CONFIG = {
  RADIUS: 80,           // Pixels - tamaño del cluster en pantalla
  MAX_ZOOM: 17,        // A partir de este zoom, no hay más clusters
  ZOOM_INCREMENT: 2,   // Cuánto zoom cuando clicks en cluster
} as const;
```

---

## 🎯 Alternativas Consideradas

### 1. Sin Clustering (renderizar todos los markers)
```typescript
// ❌ NO HACER: Renderizar 1000 markers
{properties.map(p => <PropertyMarker key={p.id} {...p} />)}
```
**Pros:** Simple
**Cons:** Extremadamente lento, imposible de usar
**Estado:** ❌ Rechazada

### 2. **Supercluster** ← ELEGIDA
```typescript
// ✅ HACER: Usar Supercluster
const clusters = useMapClustering({ properties, viewState, mapRef });
{clusters.map(c => <ClusterMarker /> o <PropertyMarker />)}
```
**Pros:**
- Estándar de industria
- Bien mantenida
- Optimizada para performance
- Fácil integración con MapBox

**Cons:**
- Requiere entender cómo funciona
- Necesita bounds precisos

**Estado:** ✅ Aceptada

### 3. Usar MapBox's native clustering
```typescript
// Agrupar en el layer de MapBox directamente
map.addSource('clusters', {
  type: 'geojson',
  data: ...,
  cluster: true,
  clusterRadius: 50,
});
```
**Pros:** Native, sin librería extra
**Cons:**
- Menos flexible
- Difícil de controlar con React
- No funciona bien con custom UI

**Estado:** ❌ Rechazada

### 4. Backend clustering
```typescript
// Hacer clustering en el servidor
getCachedPropertiesByBounds().then(properties => {
  const clustered = serverCluster(properties, bounds, zoom);
})
```
**Pros:** Distribuye carga al server
**Cons:**
- Requiere más queries
- Latency aumenta
- Complejo de implementar

**Estado:** ❌ Rechazada

---

## 📊 Consecuencias

### Positivas ✅

1. **Excelente Performance** - Renderiza 50-100 items en lugar de 1000+
2. **Visual Limpio** - Mapa no se llena de markers
3. **Información Rápida** - Cluster badge muestra cantidad
4. **Interactivo** - Click en cluster = zoom automático
5. **Estándar Industria** - Usado por Google Maps, Mapbox docs, etc
6. **Escalable** - Funciona igual con 100 o 10,000 properties

### Negativas / Trade-offs ⚠️

1. **Requiere librería extra** - Supercluster (~10KB)
   - Mitigación: Muy pequeña, worth it

2. **Necesita bounds precisos**
   - Solución: Usamos `map.getBounds()`

3. **Clustering delay en re-render**
   - Mitigación: Envuelto en useMemo, muy rápido

4. **Usuario no ve individual count de cada marker**
   - Esto es OK, el cluster badge lo reemplaza

---

## 🔄 Flujo de Clustering

```
User abre mapa (zoom=5)
  ↓
properties.length = 1000
  ↓
supercluster.load(1000 properties)
  ↓
getClusters(bounds, zoom=5)
  ↓
Retorna: [
  { cluster: true, geometry, properties: { count: 200, cluster_id: 1 } },
  { cluster: true, geometry, properties: { count: 150, cluster_id: 2 } },
  ...
]
  ↓
Renderiza ~10 clusters + algunos properties sueltos
  ↓
User hace zoom = 12
  ↓
getClusters(bounds, zoom=12)
  ↓
Retorna: [
  { cluster: true, count: 50 },
  { cluster: false, geometry, properties: { id: 'prop123' } },
  { cluster: false, geometry, properties: { id: 'prop456' } },
  ...
]
  ↓
Renderiza ~20 items (mix clusters + properties)
  ↓
User clicks en cluster
  ↓
handleClusterClick() → zoom to next level
  ↓
Clusters se expanden automáticamente
```

---

## 🎨 UI Components

### Cluster Marker

```tsx
// components/map/cluster-marker.tsx
<Marker latitude={latitude} longitude={longitude}>
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
    <span className="text-white text-xs font-bold">{pointCount}</span>
  </div>
</Marker>
```

**Features:**
- Glassmorphism design
- Badge muestra cantidad
- Hover effect

### Property Marker

```tsx
// components/map/property-marker.tsx
<Marker latitude={latitude} longitude={longitude}>
  <div className="bg-blue-500 rounded-lg px-2 py-1 text-white text-xs font-bold shadow-lg">
    ${price.toLocaleString()}
  </div>
</Marker>
```

**Features:**
- Precio como badge
- Color por tipo (SALE/RENT)
- Clickable para popup

---

## 🧪 Cómo Probar Clustering

### Test 1: Zoom Out
1. Abre `/mapa`
2. Zoom muy afuera (zoom 3-5)
3. **Verifica:** Ves clusters, no miles de markers
4. **Cuenta:** ~10-20 clusters en pantalla

### Test 2: Click en Cluster
1. Haz zoom out (zoom 5)
2. Click en cluster (número azul)
3. **Verifica:** Mapa hace zoom in automáticamente
4. **Espera:** Cluster se expanda mostrando más clusters o properties

### Test 3: Varying Zoom
```
Zoom 3:  ~5 clusters
Zoom 7:  ~20 clusters
Zoom 12: ~50 clusters + properties
Zoom 17: ~500 properties (sin clusters)
```

### Test 4: Performance
```
Abre DevTools → Performance
Haz zoom in/out rápidamente
Busca "Frames" → Deberías ver 60fps
```

---

## 🐛 Debugging Clustering

### Problema: No veo clusters
```typescript
// Verificar que clusters se crean
console.log('clusters:', clusters);
console.log('clusters count:', clusters.length);
```

Si clusters.length es muy alto (>1000), algo está mal:
```typescript
// Verificar bounds
if (mapRef.current) {
  const bounds = mapRef.current.getBounds();
  console.log('bounds:', bounds);
}
```

### Problema: Clusters muestra número 1
```typescript
// Verificar que properties se cargan correctamente
supercluster.load(points);
console.log('loaded points:', points.length);
```

### Problema: Performance lento
```typescript
// Aumentar RADIUS para agrupar más
CLUSTER_CONFIG = {
  RADIUS: 120, // ← Aumenta esto (por defecto 80)
}
```

---

## 📝 Commits Relacionados

1. **Implementación inicial** - `use-map-clustering.ts`
2. **Fix de bounds** - d2e2bc8 - Usar `map.getBounds()`
3. **UI de clusters** - `cluster-marker.tsx`

---

## 📚 Recursos

- [Supercluster docs](https://github.com/mapbox/supercluster)
- [Supercluster example](https://mapbox.github.io/supercluster/example/)
- [MapBox clustering guide](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)

---

## ✅ Checklist

- [x] Supercluster instalado
- [x] `use-map-clustering.ts` implementado
- [x] ClusterMarker component creado
- [x] PropertyMarker component existe
- [x] Bounds precisos con `map.getBounds()`
- [x] useMemo para optimización
- [x] Click en cluster → zoom automático
- [x] Testing manual completado

---

**Conclusión:** Clustering es esencial para un mapa usable con data grande. Supercluster + precise bounds = perfect combo.

**Mantenedor:** InmoApp Engineering Team
**Última actualización:** 2025-10-24
