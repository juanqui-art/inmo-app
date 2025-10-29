# 📚 Smart Clustering - Guía Completa de Estudio

> **Nivel:** Intermedio
> **Tiempo de lectura:** 45-60 minutos
> **Requisitos previos:** Conocimiento básico de React, TypeScript, mapas
> **Última actualización:** 2025-10-23

---

## 📖 Tabla de Contenidos

1. [Conceptos Fundamentales](#1-conceptos-fundamentales)
2. [Problema que Resuelve](#2-problema-que-resuelve)
3. [Supercluster: El Algoritmo](#3-supercluster-el-algoritmo)
4. [Implementación en Código](#4-implementación-en-código)
5. [Fórmula Matemática de Bounds](#5-fórmula-matemática-de-bounds)
6. [Optimizaciones y Performance](#6-optimizaciones-y-performance)
7. [Casos de Uso Reales](#7-casos-de-uso-reales)
8. [Debugging y Troubleshooting](#8-debugging-y-troubleshooting)

---

## 1. Conceptos Fundamentales

### 1.1 ¿Qué es un Cluster de Puntos?

En un mapa con muchas ubicaciones, un **cluster** es un grupo de puntos próximos que se representan como uno solo.

**Visualización:**

```
SIN CLUSTERING:              CON CLUSTERING:
❌ Caos visual               ✅ Limpio y escalable

● ● ● ● ● ● ●              ● 25
● ● ● ● ● ● ●              (representa 25 puntos)
● ● ● ● ● ● ●
● ● ● ● ● ● ●              ● 12
  (49 puntos)               (representa 12 puntos)

Performance: 60 FPS        Performance: 59 FPS
```

### 1.2 ¿Por Qué es Importante?

**Escenario real:**
```
Base de datos: 100,000 propiedades en toda Sudamérica
Usuario quiere ver todas
Sin clustering: Intenta renderizar 100,000 markers
Resultado:
  - Navegador usa 2GB RAM
  - FPS cae a 1-2
  - App se congela/crashea

Con clustering:
- Zoom alejado: 50 clusters (1KB de datos)
- Performance: 60 FPS
- RAM: 10MB
- Usuario puede zoom in para ver detalles
```

### 1.3 Conceptos Clave

| Término | Definición | Ejemplo |
|---------|-----------|---------|
| **Marker** | Un punto individual en el mapa | Una propiedad específica |
| **Cluster** | Grupo de markers cercanos | "25 propiedades en El Ejido" |
| **Zoom Level** | Nivel de amplificación del mapa | 0 (mundo) a 20 (calle) |
| **Bounds** | Rectángulo geográfico visible | NE: (-2.85, -78.95) SW: (-2.95, -79.05) |
| **Viewport** | Área visible del mapa | Lat, Lng, Zoom |
| **Radius** | Distancia en pixels para agrupar | 40px = puntos a <40px se agrupan |
| **Delta** | Diferencia entre centro y borde | Zoom 12 → delta = 0.044° |

---

## 2. Problema que Resuelve

### 2.1 El Problema Original

Tu aplicación:
```typescript
// ❌ PROBLEMA: Renderizar 1000 propiedades como markers individuales

properties.map(prop => (
  <PropertyMarker
    key={prop.id}
    latitude={prop.latitude}
    longitude={prop.longitude}
    price={prop.price}
  />
))

// Resultado:
// React renderiza 1000 componentes <Marker>
// Cada uno tiene event listeners, state, etc.
// Total: 1000 elementos DOM en el árbol
// Performance: ⚠️ 15-20 FPS (muy lento)
```

**Síntomas del problema:**
- Mover el mapa = lag visible
- Hacer zoom = congelamiento
- Hacer click en marker = demora 2-3 segundos
- App se siente "pesada"

### 2.2 Por Qué Ocurre

**Cada marker individual requiere:**
```javascript
{
  // Rendering
  DOM node:              1 elemento
  Event listeners:       click, hover, dragstart = 3 escuchas
  State (React):         highlighted, selected = 2 variables
  Calculation cost:      isPriceInRange, isInBounds = 2 funciones

  // Total por marker: ~20 operaciones
  // Total para 1000 markers: 20,000 operaciones
  // JavaScript single-threaded: ⚠️ Cuello de botella
}
```

**Bottleneck visual:**
```
Frame time presupuesto: 16ms (para 60 FPS)
JavaScript execution:
  - Renderizar 1000 markers: 8ms
  - Actualizar state: 4ms
  - Event listeners: 3ms
  - Otros: 2ms
  Total: 17ms ⚠️ EXCEDIDO

Resultado: Frame rate cae a 30 FPS
```

### 2.3 La Solución - Clustering

```typescript
// ✅ SOLUCIÓN: Agrupar markers antes de renderizar

const clusters = useMapClustering({ properties, viewState });
// clusters ahora tiene 5-50 elementos (no 1000)

clusters.map(cluster => {
  if (isCluster(cluster)) {
    return <ClusterMarker pointCount={25} />; // 1 componente
  }
  return <PropertyMarker {...cluster.properties} />; // 1 componente
})

// Resultado:
// React renderiza 30 componentes (promedio)
// Event listeners: 30
// Total operaciones: ~600
// Performance: ✅ 55-60 FPS (fluido)
```

---

## 3. Supercluster: El Algoritmo

### 3.1 ¿Qué es Supercluster?

Supercluster es una librería JavaScript que implementa:
- **Algoritmo:** K-D Tree (árbol de búsqueda espacial)
- **Propósito:** Agrupar puntos 2D (latitud, longitud) rápidamente
- **Complejidad temporal:** O(log n) - muy eficiente

### 3.2 K-D Tree - Estructura de Datos Espacial

**¿Cómo funciona?**

Imagina que quieres encontrar todos los restaurants en un radio de 1km:

```
❌ SIN índice (búsqueda lineal):
  for each restaurant in database:
    if distance(you, restaurant) < 1km:
      return restaurant

  Complejidad: O(n) = examinar todos
  1000 restaurants → 1000 comparaciones

✅ CON K-D Tree:
  Estructura tipo árbol:

        (Lat: -2.90)
       /            \
    (-2.85)       (-2.95)
    /    \         /     \
  (...)  (...)   (...)   (...)

  Búsqueda: Navegar solo ramas relevantes
  1000 restaurants → 50 comparaciones
```

**Construcción del árbol:**

```
Paso 1: Ordenar por latitud
┌─────────────────────┐
│ -2.80, -2.85, ...   │
└─────────────────────┘

Paso 2: Dividir en mitad (root)
        -2.90 ← mitad
       /      \
   -2.85      -2.95

Paso 3: Repetir recursivamente en cada mitad
```

### 3.3 Operaciones de Supercluster

```typescript
// 1. INICIALIZAR
const supercluster = new Supercluster({
  radius: 40,      // pixels
  maxZoom: 16,
  minZoom: 0,
});

// 2. CARGAR DATOS
supercluster.load(geojsonPoints);

// 3. QUERIES

// 3a. Obtener clusters para un área visible
const clusters = supercluster.getClusters(
  [west, south, east, north],  // bounds
  zoomLevel                      // nivel de zoom
);
// Retorna: array mezcla de clusters + markers individuales

// 3b. Cuando usuario hace click en cluster
const children = supercluster.getChildren(clusterId);
// Retorna: todos los puntos dentro del cluster

// 3c. A qué zoom se expande un cluster
const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
// Retorna: zoom nivel donde cluster se divide en sub-clusters
```

### 3.4 Ejemplo Paso a Paso

```typescript
// DATOS ORIGINALES
const properties = [
  { id: 1, lat: -2.891, lng: -79.002, price: 100k },
  { id: 2, lat: -2.892, lng: -79.003, price: 120k },
  { id: 3, lat: -2.893, lng: -79.004, price: 115k },
  { id: 4, lat: -2.850, lng: -79.050, price: 200k },
  { id: 5, lat: -2.851, lng: -79.051, price: 210k },
];

// PASO 1: Convertir a GeoJSON
const geojson = properties.map(p => ({
  type: "Feature",
  properties: p,
  geometry: {
    type: "Point",
    coordinates: [p.lng, p.lat],
  },
}));

// PASO 2: Crear índice
const supercluster = new Supercluster({ radius: 40, maxZoom: 16 });
supercluster.load(geojson);

// PASO 3: Query
const bounds = [-79.06, -2.85, -79.00, -2.89]; // [W, S, E, N]
const zoom = 7;

const result = supercluster.getClusters(bounds, zoom);

// RESULTADO:
// [
//   {
//     id: "cluster_123",  // ID generado
//     type: "Feature",
//     properties: {
//       cluster: true,
//       cluster_id: 123,
//       point_count: 3,      // 3 propiedades aquí
//       point_count_abbreviated: "3"
//     },
//     geometry: {
//       type: "Point",
//       coordinates: [-79.002, -2.892]  // Centro del cluster
//     }
//   },
//   {
//     id: "cluster_456",
//     properties: { cluster: true, point_count: 2 },
//     geometry: { ... }
//   }
// ]
```

---

## 4. Implementación en Código

### 4.1 El Hook: `useMapClustering`

**Archivo:** `apps/web/components/map/hooks/use-map-clustering.ts`

**Responsabilidad:** Calcular clusters para el viewport actual

```typescript
/**
 * INPUT:
 * - properties: Array de propiedades
 * - viewState: { latitude, longitude, zoom }
 *
 * OUTPUT:
 * - clusters: Array de clusters + markers individuales
 */
export function useMapClustering({
  properties,
  viewState,
}: UseMapClusteringProps): ClusterOrPoint[] {
```

**Paso 1: Inicializar Supercluster (memoized)**

```typescript
const supercluster = useMemo(() => {
  const cluster = new Supercluster({
    radius: 40,      // En pixels de la pantalla
    maxZoom: 16,     // No agrupar si zoom > 16
    minZoom: 0,      // Agrupar desde zoom 0
    minPoints: 2,    // Mínimo 2 puntos para cluster
  });

  // Convertir propiedades a GeoJSON
  const points = properties
    .filter(p => p.latitude !== null && p.longitude !== null)
    .map(property => ({
      type: "Feature" as const,
      properties: property,
      geometry: {
        type: "Point" as const,
        coordinates: [property.longitude!, property.latitude!],
      },
    }));

  // Indexar
  cluster.load(points);
  return cluster;
}, [properties]);
// ⚠️ Solo recalcula si properties cambia
// Si hay 1000 properties fijas, solo se hace ONCE
```

**¿Por qué `useMemo`?**

Sin `useMemo`:
```typescript
// ❌ MALO
function useMapClustering({ properties, viewState }) {
  const supercluster = new Supercluster(...);  // Cada render
  supercluster.load(properties);                // Cada render
  // Si renderiza 60 veces/segundo: 60 indexaciones
  // = 60 × 500ms = 30,000ms = 30 SEGUNDOS de lag
}

// ✅ BUENO
function useMapClustering({ properties, viewState }) {
  const supercluster = useMemo(() => {
    // Solo cuando properties cambia
    // Si 1000 properties, solo 1 indexación
  }, [properties]);
}
```

**Paso 2: Calcular Bounds Dinámicos**

```typescript
const clusters = useMemo(() => {
  // FÓRMULA MATEMÁTICA:
  // Area visible en grados = 360 / 2^zoom

  const latitudeDelta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
  const longitudeDelta = (360 / Math.pow(2, viewState.zoom)) * 1.2;

  const bounds = [
    viewState.longitude - longitudeDelta,  // WEST
    viewState.latitude - latitudeDelta,    // SOUTH
    viewState.longitude + longitudeDelta,  // EAST
    viewState.latitude + latitudeDelta,    // NORTH
  ];

  // Query Supercluster
  return supercluster.getClusters(
    bounds as [number, number, number, number],
    Math.floor(viewState.zoom)
  );
}, [supercluster, viewState.longitude, viewState.latitude, viewState.zoom]);
```

**Paso 3: Return para Renderizar**

```typescript
return clusters;
// Array listo para MapContainer
```

### 4.2 El Componente: `ClusterMarker`

**Responsabilidad:** Renderizar visualmente un cluster

```typescript
/**
 * Input: { latitude, longitude, pointCount, onClick }
 * Output: <Marker /> con badge circular
 */
export function ClusterMarker({
  latitude,
  longitude,
  pointCount,
  onClick,
}: ClusterMarkerProps) {
```

**Lógica de Tamaño:**

```typescript
function getClusterStyle(pointCount: number) {
  // PEQUEÑO: 2-5 propiedades
  if (pointCount < 6) {
    return {
      size: 32,              // px
      color: "bg-blue-400",  // TailwindCSS
      textSize: "text-xs",
      ringColor: "ring-blue-400/30",
    };
  }

  // MEDIANO: 6-10 propiedades
  if (pointCount < 11) {
    return {
      size: 40,
      color: "bg-blue-500",
      textSize: "text-sm",
      ringColor: "ring-blue-500/30",
    };
  }

  // GRANDE: 11-25 propiedades
  if (pointCount < 26) {
    return {
      size: 48,
      color: "bg-blue-600",
      textSize: "text-base",
      ringColor: "ring-blue-600/30",
    };
  }

  // MUY GRANDE: 25+ propiedades
  return {
    size: 56,
    color: "bg-blue-700",
    textSize: "text-lg",
    ringColor: "ring-blue-700/30",
  };
}
```

**Render:**

```tsx
<Marker latitude={latitude} longitude={longitude}>
  <div
    className={`
      w-full h-full
      ${style.color}              // bg-blue-500 (ej)
      rounded-full
      flex items-center justify-center
      shadow-lg
      transition-all duration-200
      hover:scale-110 hover:shadow-xl
      ring-4 ${style.ringColor}
      border-2 border-white
    `}
    style={{ width: style.size, height: style.size }}
  >
    <span className={`${style.textSize} font-bold text-white`}>
      {pointCount}
    </span>
  </div>

  {/* Efecto pulso al hover */}
  <div
    className={`
      absolute inset-0
      ${style.color}
      rounded-full
      opacity-0 group-hover:opacity-30
      animate-ping
      pointer-events-none
    `}
  />
</Marker>
```

### 4.3 Integración en MapContainer

```typescript
/**
 * Mapear clusters a componentes React
 * Diferenciar entre clusters e individuales
 */
{clusters.map((cluster) => {
  // Extraer coordenadas
  const [longitude, latitude] = cluster.geometry.coordinates as [
    number,
    number,
  ];

  // ¿Es un cluster?
  if (isCluster(cluster)) {
    const { point_count: pointCount } = cluster.properties;

    return (
      <ClusterMarker
        key={`cluster-${cluster.id}`}
        latitude={latitude}
        longitude={longitude}
        pointCount={pointCount}
        onClick={() => {
          // Hacer zoom cuando usuario hace click
          const expansionZoom = Math.min(
            viewState.zoom + 2,  // +2 niveles
            16                   // Máximo
          );
          handleClusterClick(longitude, latitude, expansionZoom);
        }}
      />
    );
  }

  // Es un marker individual
  const property = (cluster as PropertyPoint).properties;
  return (
    <PropertyMarker
      key={property.id}
      latitude={latitude}
      longitude={longitude}
      price={property.price}
      transactionType={property.transactionType}
      isHighlighted={highlightedPropertyId === property.id}
      onClick={() => handleMarkerClick(property)}
    />
  );
})}
```

---

## 5. Fórmula Matemática de Bounds

### 5.1 Origen de la Fórmula

**Sistema de coordenadas geográficas:**

```
Latitud:   -90° (sur) a +90° (norte)    = 180°
Longitud: -180° (oeste) a +180° (este) = 360°

El mundo completo:
┌──────────────────┐
│ 180°  mundo  -180│
│                  │
│ 90°           0° │
│                  │
│-90°             -180°
└──────────────────┘
```

**Niveles de zoom en Web Mercator (estándar MapBox):**

```
Zoom 0:  Mundo entero en 1 tile (256 × 256 px)
Zoom 1:  Mundo dividido en 4 tiles (2 × 2)
Zoom 2:  Mundo dividido en 16 tiles (4 × 4)
Zoom 3:  Mundo dividido en 64 tiles (8 × 8)
...
Zoom z:  Mundo dividido en 2^z × 2^z tiles

Patrón: Cada zoom level añade 2 × 2 = 4 tiles
```

**Correspondencia Zoom ↔ Grados:**

```
Cada zoom level divide el área anterior en 4:

Zoom 0: 360° × 180°
Zoom 1: 180° × 90°         (360/2 × 180/2)
Zoom 2: 90° × 45°          (180/2 × 90/2)
Zoom 3: 45° × 22.5°        (90/2 × 45/2)
...
Zoom z: (360 / 2^z) × (180 / 2^z)
```

### 5.2 Fórmula Final

```
ANCHO (longitud):  360 / 2^zoom
ALTO (latitud):    180 / 2^zoom

Nuestro código:
  longitudeDelta = (360 / 2^zoom) * 1.2
  latitudeDelta = (180 / 2^zoom) * 1.2

El × 1.2 es padding: 20% extra para capturar edges
```

### 5.3 Ejemplos Verificables

```typescript
// ZOOM 3 - Vista de continente
const latDelta = (180 / Math.pow(2, 3)) * 1.2;
// = (180 / 8) * 1.2
// = 22.5 * 1.2
// = 27°

// Con centro en -2.90°, bounds serían:
// NE: -2.90 + 27 = 24.1° (norte de EE.UU.)
// SW: -2.90 - 27 = -29.9° (sur de Argentina)
// ✓ Correcto: ve casi toda Sudamérica

// ZOOM 7 - Vista provincial
const latDelta = (180 / Math.pow(2, 7)) * 1.2;
// = (180 / 128) * 1.2
// = 1.40 * 1.2
// = 1.68°

// Con centro en -2.90°, bounds serían:
// NE: -2.90 + 1.68 = -1.22°
// SW: -2.90 - 1.68 = -4.58°
// ✓ Correcto: ve provincia de Azuay completa

// ZOOM 12 - Vista de ciudad
const latDelta = (180 / Math.pow(2, 12)) * 1.2;
// = (180 / 4096) * 1.2
// = 0.044 * 1.2
// = 0.053°

// Con centro en -2.90°, bounds serían:
// NE: -2.90 + 0.053 = -2.847°
// SW: -2.90 - 0.053 = -2.953°
// ✓ Correcto: ve Cuenca centro y alrededores

// ZOOM 16 - Vista de barrio
const latDelta = (180 / Math.pow(2, 16)) * 1.2;
// = (180 / 65536) * 1.2
// = 0.00275 * 1.2
// = 0.0033°

// ✓ Correcto: ve solo algunas cuadras
```

### 5.4 Problemas sin esta Fórmula

```typescript
// ❌ PROBLEMA: Bounds fijos
const bounds = [
  viewState.longitude - 1,
  viewState.latitude - 1,
  viewState.longitude + 1,
  viewState.latitude + 1,
];

// Zoom 3: 1° = ~111 km (OK)
// Zoom 7: 1° = ~111 km (OK, pero mapa muestra 500+ km ❌)
// Zoom 12: 1° = ~111 km (pero mapa muestra <10 km ❌)
// Zoom 20: 1° = ~111 km (pero mapa muestra <100m ❌)

// Resultado: Markers desaparecen en zoomlevels extremos
```

---

## 6. Optimizaciones y Performance

### 6.1 useMemo - Evitar recálculos

```typescript
// ✅ BIEN: Índice solo cuando properties cambia
const supercluster = useMemo(() => {
  const cluster = new Supercluster(...);
  cluster.load(points);
  return cluster;
}, [properties]);
// 1000 propiedades × 60 renders/seg = 1 indexación total ✓

// ❌ MAL: Índice en cada render
function BadComponent() {
  const supercluster = new Supercluster(...);
  supercluster.load(points);
  // 1000 propiedades × 60 renders/seg = 60 indexaciones
  // = 500ms × 60 = 30 SEGUNDOS lag
}
```

### 6.2 useDebounce - Evitar spam de URLs

```typescript
// ❌ SIN debounce:
useEffect(() => {
  const url = buildBoundsUrl(viewState);
  router.replace(url);  // Se llama 60 veces/segundo
}, [viewState]);

// ✅ CON debounce:
const debouncedViewport = useDebounce(viewState, 500);
useEffect(() => {
  const url = buildBoundsUrl(debouncedViewport);
  router.replace(url);  // Se llama 1 vez cuando deja de mover
}, [debouncedViewport]);
```

**Impacto:**
```
Sin debounce:  60 router.replace/seg = servidor lento, URL caótica
Con debounce:  1 router.replace/seg = limpio, predecible
```

### 6.3 Type Guards - Diferenciar en tiempo de ejecución

```typescript
// ❌ MAL: Asumir tipo
clusters.forEach(cluster => {
  console.log(cluster.properties.point_count);  // ❌ Puede no existir
});

// ✅ BIEN: Type guard
function isCluster(cluster: ClusterOrPoint): cluster is ClusterPoint {
  return "cluster" in cluster.properties &&
         cluster.properties.cluster === true;
}

clusters.forEach(cluster => {
  if (isCluster(cluster)) {
    console.log(cluster.properties.point_count);  // ✓ Seguro
  } else {
    console.log(cluster.properties.price);        // ✓ Seguro
  }
});
```

---

## 7. Casos de Uso Reales

### 7.1 Caso 1: Usuario abre el mapa

```
Evento: User opens /mapa

1. Server renderiza <MapPage>
   - Parsea URL bounds (o fallback a defaults)
   - Convierte bounds → viewport

2. Cliente monta <MapView>
   - MapBox carga tiles
   - useMapClustering calcula clusters

3. Renderizado inicial
   - Zoom 12 (ciudad)
   - 50 markers individuales
   - 3 clusters pequeños
   - FPS: 60
```

### 7.2 Caso 2: Usuario hace zoom out

```
Evento: User zooms out (zoom 12 → zoom 7)

Timeline:
t=0ms:    User wheel event
t=0-50ms: ViewState actualiza
t=50ms:   useMapClustering recalcula
          (ahora hay 5 clusters de 100+ puntos c/u)
t=100ms:  Renderiza nuevos clusters
t=150ms:  useDebounce espera 500ms más
t=650ms:  URL actualiza a nuevos bounds
         /mapa?ne_lat=...&sw_lat=...

Punto clave: Renderizado es instantáneo, URL es async (no bloquea)
```

### 7.3 Caso 3: Usuario hace click en cluster

```
Evento: User clicks cluster with 25 propiedades

1. onClick handler dispara
   const expansionZoom = Math.min(zoom + 2, 16);

2. handleClusterClick actualiza viewport

3. MapBox anima zoom (500ms)

4. Mientras anima, useMapClustering recalcula
   (el cluster de 25 ahora se divide en sub-clusters)

5. Resultado: Cluster se expande en tiempo real
   UX fluido, sin saltitos

Alternativa Zillow/Google: Usar getClusterExpansionZoom()
   const optimalZoom = supercluster.getClusterExpansionZoom(clusterId);
   (calcula automáticamente el zoom exacto)
```

---

## 8. Debugging y Troubleshooting

### 8.1 Markers Desaparecen en Zoom Bajo

**Síntoma:**
```
Zoom 5: Muchos markers
Zoom 3: Casi nada visible (❌)
Zoom 1: Vacío total
```

**Causa:**
```
Bounds calculation con fórmula simple:
delta = viewState.zoom * 0.5  // ❌ Incorrecto

Zoom 3: delta = 3 * 0.5 = 1.5°
Pero mapa visible = 45°
Bounds solo cubre pequeña parte
```

**Solución:**
```typescript
// ✅ Usar fórmula correcta
const delta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
```

### 8.2 URL Actualiza Demasiado

**Síntoma:**
```
Usuario arrastra el mapa
URL cambia 60 veces/segundo
```

**Causa:**
```typescript
useEffect(() => {
  const url = buildBoundsUrl(viewState);  // Sin debounce
  router.replace(url);
}, [viewState]);  // Re-corre cada pixel
```

**Solución:**
```typescript
const debouncedViewport = useDebounce(viewState, 500);
useEffect(() => {
  const url = buildBoundsUrl(debouncedViewport);
  router.replace(url);
}, [debouncedViewport]);  // Solo cuando deja de mover
```

### 8.3 Clustering se Activa Incorrectamente

**Síntoma:**
```
Zoom 14: Aún ve clusters (debería ver markers individuales)
Zoom 16: Markers desaparecen
```

**Causa:**
```
maxZoom incorrecto en Supercluster config
const cluster = new Supercluster({ maxZoom: 18 });
// Si maxZoom > 16, sigue agrupando
```

**Solución:**
```typescript
const cluster = new Supercluster({
  maxZoom: 16,  // Correcto: zoom > 16 = sin clusters
  radius: 40,
  minPoints: 2,
});
```

### 8.4 Verificar Bounds Calculados

```typescript
// En la consola browser
const delta = (180 / Math.pow(2, 7)) * 1.2;
console.log(delta);  // 1.406

const viewState = { latitude: -2.90, longitude: -79.00, zoom: 7 };
const bounds = [
  viewState.longitude - delta,  // -80.406
  viewState.latitude - delta,   // -4.306
  viewState.longitude + delta,  // -77.594
  viewState.latitude + delta,   // -1.494
];
// Verificar visualmente: ¿Cubre todo lo visible en el mapa?
```

---

## 📋 Checklist de Conceptos Entendidos

- [ ] Qué es clustering y por qué es importante
- [ ] K-D Tree como estructura de datos
- [ ] Cómo funciona Supercluster
- [ ] Fórmula matemática de bounds
- [ ] Conversión viewport → bounds
- [ ] Conversión bounds → viewport
- [ ] useMemo para optimización
- [ ] useDebounce para URL syncing
- [ ] Type guards para diferenciar clusters
- [ ] Debugging de problemas comunes

---

## 🔗 Archivos Relacionados

- `apps/web/components/map/hooks/use-map-clustering.ts` - Hook
- `apps/web/components/map/cluster-marker.tsx` - Componente visual
- `apps/web/components/map/ui/map-container.tsx` - Integración
- `apps/web/lib/utils/url-helpers.ts` - Utilidades de URL
- `docs/MAP_BOUNDS_GUIDE.md` - Documentación de URL bounds (próxima)

---

**Escrito con ❤️ para aprendizaje profundo**

Última actualización: 2025-10-23
Autor: Claude Code + [Usuario]
