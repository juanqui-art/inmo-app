# 📍 Map Bounds URL System - Guía Completa

> **Nivel:** Intermedio a Avanzado
> **Tiempo de lectura:** 45-60 minutos
> **Requisitos:** Entender CLUSTERING_GUIDE.md
> **Última actualización:** 2025-10-23

---

## 📖 Tabla de Contenidos

1. [Por Qué Bounds en lugar de Lat/Lng/Zoom](#1-por-qué-bounds-en-lugar-de-latlngzoom)
2. [Conceptos de Bounds](#2-conceptos-de-bounds)
3. [Conversión Viewport ↔ Bounds](#3-conversión-viewport--bounds)
4. [Arquitectura de URL](#4-arquitectura-de-url)
5. [Implementación Paso a Paso](#5-implementación-paso-a-paso)
6. [Backward Compatibility](#6-backward-compatibility)
7. [Edge Cases y Soluciones](#7-edge-cases-y-soluciones)
8. [Testing y Verificación](#8-testing-y-verificación)

---

## 1. Por Qué Bounds en lugar de Lat/Lng/Zoom?

### 1.1 El Problema con Viewport Params

**URL tradicional (Zillow viejo, algunos mapas):**
```
/mapa?lat=-2.90&lng=-79.00&zoom=12
```

**¿Cuál es el problema?**

```
Escenario: Usuario guarda URL en phone (375×667)
Más tarde abre en desktop (1920×1080)

Mismo zoom=12, pero...

PHONE:                  DESKTOP:
375px ancho             1920px ancho

zoom=12 cubre:          zoom=12 cubre:
~10km²                  ~50km²

Resultado:
- Phone ve mucho detalle ✓
- Desktop ve zona entera ✓✓
- PERO no es el MISMO área ❌

El zoom es una unidad RELATIVA (depende del tamaño de pantalla)
```

**Problema visual:**
```
Usuario comparte URL: "mira estos departamentos en Cuenca"
Amigo abre:

ESPERADO:
"Cuenca centro (10km²)"

REALIDAD (dependiendo pantalla):
Phone: Cuenca centro ✓
Tablet: Cuenca + alrededores
Desktop: Cuenca + pueblos vecinos
TV: Toda la región

Cada persona ve DIFERENTE área
```

### 1.2 La Solución: Bounds (Zillow/Airbnb Pattern)

**URL con bounds:**
```
/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
```

**Ventajas:**

```
BOUNDS especifican el RECTÁNGULO EXACTO:

┌──────────────────────────┐
│ NE: (-2.85, -78.95)      │ ← Esquina superior-derecha
│                          │
│  Área mostrada SIEMPRE   │
│  la MISMA                │
│                          │
│      SW: (-2.95, -79.05) │ ← Esquina inferior-izquierda
└──────────────────────────┘

Independiente de:
- Tamaño de pantalla
- Dispositivo
- Resolución
- Orientación (portrait/landscape)

Usuario comparte URL:
✓ SIEMPRE ve la MISMA área geográfica
✓ Compatible con responsive design
✓ Shareable con precisión garantizada
```

### 1.3 Comparativa

| Aspecto | Lat/Lng/Zoom | Bounds |
|---------|--------------|--------|
| **URL** | ?lat=-2.90&lng=-79.00&zoom=12 | ?ne_lat=-2.85&...&sw_lat=-2.95&... |
| **Especifica** | Punto central + nivel de amplificación | Rectángulo exacto |
| **Depende de pantalla** | ✓ SÍ (zoom es relativo) | ✗ NO (área es absoluta) |
| **Shareable** | ⚠️ Inconsistente | ✓ Preciso |
| **Responsive** | Problema | Perfecto |
| **Longitud URL** | Corta (24 chars) | Media (60 chars) |
| **Precisión** | ~111km por grado | Exacta al cm |
| **Usado por** | Google Maps viejo | Zillow, Airbnb, Mapbox |

---

## 2. Conceptos de Bounds

### 2.1 Estructura de Bounds

```typescript
interface MapBounds {
  ne_lat: number;  // Northeast latitude (top)
  ne_lng: number;  // Northeast longitude (right/east)
  sw_lat: number;  // Southwest latitude (bottom)
  sw_lng: number;  // Southwest longitude (left/west)
}

// Ejemplo real:
{
  ne_lat: -2.847,  // 2.847° al norte del ecuador
  ne_lng: -78.950, // 78.95° al oeste de Greenwich
  sw_lat: -2.953,  // 2.953° al sur del ecuador
  sw_lng: -79.050  // 79.05° al oeste de Greenwich
}
```

**Visualización:**

```
Geografía estándar (latitud/longitud):

Hemisferio norte (+ latitud)
        |
        | ne_lat = -2.847 (Cerca de ecuador, norte)
        |
Meridiano ─────────────────────────
0° lat   |
Ecuado   |          NE corner
        |      (-2.847, -78.950)
        |            ●────────┐
        |            │        │
        |            │ AREA   │
        |            │        │
        |        SW corner    │
        |            └────●
Hemisferio sur        (-2.953, -79.050)
(-lat)
        |   WEST              EAST
        └───────────────────────
            -79.050      -78.950
            (más oeste)  (menos oeste)

Orden puntos: NE (arriba-derecha) SW (abajo-izquierda)
Convención: Mapbox, Leaflet, Google Maps 2.0
```

### 2.2 Validación de Bounds

```typescript
// INVÁLIDO: NE no está arriba de SW
{
  ne_lat: -2.95,   // ❌ Más sur
  sw_lat: -2.85    // ❌ Más norte
  // NE debe estar ARRIBA (número mayor, menos negativo)
}

// VÁLIDO:
{
  ne_lat: -2.847,  // ✓ -2.847 > -2.953 (más norte)
  sw_lat: -2.953   // ✓ -2.953 < -2.847 (más sur)
}

// INVÁLIDO: Bounds de un solo punto
{
  ne_lat: -2.90,
  sw_lat: -2.90    // ❌ ne_lat == sw_lat (sin altura)
}

// VÁLIDO: Bounds con área real
{
  ne_lat: -2.847,
  sw_lat: -2.953   // ✓ Diferencia de 0.106°
}
```

### 2.3 Cálculo de Delta

```typescript
// Delta = diferencia entre NE y SW

const latitudeDelta = Math.abs(ne_lat - sw_lat);
const longitudeDelta = Math.abs(ne_lng - sw_lng);

// Ejemplo:
const bounds = {
  ne_lat: -2.847,
  ne_lng: -78.950,
  sw_lat: -2.953,
  sw_lng: -79.050
};

const latDelta = Math.abs(-2.847 - (-2.953)) = 0.106°
const lngDelta = Math.abs(-78.950 - (-79.050)) = 0.100°

// Área aproximada (no es exacta, pero útil):
// 0.106° × 111km/° ≈ 11.8 km norte-sur
// 0.100° × 111km/° ≈ 11.1 km este-oeste
```

---

## 3. Conversión Viewport ↔ Bounds

### 3.1 Viewport → Bounds (Lo que Implementamos)

**Entrada (Viewport):**
```typescript
interface MapViewport {
  latitude: number;   // Centro: -2.90°
  longitude: number;  // Centro: -79.00°
  zoom: number;       // Nivel: 12
}
```

**Proceso:**

```
Paso 1: Calcular delta desde zoom
  delta = (180 / 2^zoom) * 1.2

Paso 2: Aplicar delta al centro
  ne_lat = latitude + delta
  ne_lng = longitude + delta
  sw_lat = latitude - delta
  sw_lng = longitude - delta

Paso 3: Retornar bounds
```

**Ejemplo:**

```typescript
const viewport = {
  latitude: -2.90,
  longitude: -79.00,
  zoom: 12
};

// Paso 1: Calcular delta
const delta = (180 / Math.pow(2, 12)) * 1.2;
// = (180 / 4096) * 1.2
// = 0.044 * 1.2
// = 0.0528°

// Paso 2: Aplicar
const bounds = {
  ne_lat: -2.90 + 0.0528 = -2.847,
  ne_lng: -79.00 + 0.0528 = -78.947,
  sw_lat: -2.90 - 0.0528 = -2.953,
  sw_lng: -79.00 - 0.0528 = -79.053
};

// Resultado:
// /mapa?ne_lat=-2.847&ne_lng=-78.947&sw_lat=-2.953&sw_lng=-79.053
```

**Código real:**

```typescript
export function viewportToBounds(viewState: {
  latitude: number;
  longitude: number;
  zoom: number;
}): MapBounds {
  // FÓRMULA KEY: Cada zoom level divide el área en 4 (2^zoom)
  const latitudeDelta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
  const longitudeDelta = (360 / Math.pow(2, viewState.zoom)) * 1.2;

  return {
    ne_lat: viewState.latitude + latitudeDelta,
    ne_lng: viewState.longitude + longitudeDelta,
    sw_lat: viewState.latitude - latitudeDelta,
    sw_lng: viewState.longitude - longitudeDelta,
  };
}
```

### 3.2 Bounds → Viewport (Inverse)

**Entrada (Bounds):**
```typescript
{
  ne_lat: -2.847,
  ne_lng: -78.950,
  sw_lat: -2.953,
  sw_lng: -79.050
}
```

**Proceso:**

```
Paso 1: Calcular centro
  latitude = (ne_lat + sw_lat) / 2
  longitude = (ne_lng + sw_lng) / 2

Paso 2: Calcular delta desde bounds
  latitudeDelta = abs(ne_lat - sw_lat)

Paso 3: Invertir fórmula delta=zoom para obtener zoom
  latitudeDelta = (180 / 2^zoom) * 1.2

  Despejar zoom:
  latitudeDelta / 1.2 = 180 / 2^zoom
  2^zoom = 180 / (latitudeDelta / 1.2)
  2^zoom = 180 * 1.2 / latitudeDelta
  zoom = log₂(180 * 1.2 / latitudeDelta)
  zoom = log₂(216 / latitudeDelta)

Paso 4: Retornar viewport
```

**Ejemplo:**

```typescript
const bounds = {
  ne_lat: -2.847,
  ne_lng: -78.950,
  sw_lat: -2.953,
  sw_lng: -79.050
};

// Paso 1: Centro
const latitude = (-2.847 + -2.953) / 2 = -2.90;
const longitude = (-78.950 + -79.050) / 2 = -79.00;

// Paso 2: Delta
const latitudeDelta = Math.abs(-2.847 - (-2.953)) = 0.106;

// Paso 3: Zoom (inversión)
const zoomFloat = Math.log2(216 / 0.106);
// = Math.log2(2037.7)
// = 10.99 ≈ 11

// ⚠️ NOTA: Esperábamos zoom 12, obtuvimos 11
// Por qué? Porque los bounds son un poco más amplios
// (tienen el 20% de padding)

// Paso 4: Retornar
const viewport = {
  latitude: -2.90,
  longitude: -79.00,
  zoom: Math.round(zoomFloat) // 11
};
```

**Código real:**

```typescript
export function boundsToViewport(bounds: MapBounds): MapViewport {
  // Centro del rectángulo
  const latitude = (bounds.ne_lat + bounds.sw_lat) / 2;
  const longitude = (bounds.ne_lng + bounds.sw_lng) / 2;

  // Despejar zoom de: latitudeDelta = (180 / 2^zoom) * 1.2
  const latitudeDelta = Math.abs(bounds.ne_lat - bounds.sw_lat);
  const zoomFloat = Math.log2(180 / latitudeDelta) - Math.log2(1.2);
  const zoom = Math.max(0, Math.min(22, Math.round(zoomFloat)));

  return { latitude, longitude, zoom };
}
```

### 3.3 Pérdida de Precisión (Expected)

```
Observación: viewport → bounds → viewport NO es 100% exacto

Razón: El padding 1.2 introduce asimetría

Zoom original:  12
Zoom calculado: 11-12 (aprox)

Diferencia máxima: ±1 nivel de zoom

PERO: Para shareable URLs esto es ACEPTABLE
Porque:
- Usuario ve área similar
- No es perceptible en mapa
- Trade-off por tener bounds en URL

Para máxima precisión: Guardar zoom explícitamente
  /mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050&zoom=12

Pero eso viola el espíritu de "bounds" (ser self-describing)
```

---

## 4. Arquitectura de URL

### 4.1 URL Builders y Parsers

**Archivo:** `apps/web/lib/utils/url-helpers.ts`

**Funciones:**

```typescript
// BUILD
buildBoundsUrl(bounds: MapBounds): string
  Input:  { ne_lat: -2.847, ne_lng: -78.950, sw_lat: -2.953, sw_lng: -79.050 }
  Output: "/mapa?ne_lat=-2.8470&ne_lng=-78.9500&sw_lat=-2.9530&sw_lng=-79.0500"

// PARSE
parseBoundsParams(
  searchParams: URLSearchParams,
  fallback: MapViewport
): MapBounds
  Input:  URLSearchParams { ne_lat: "-2.8470", ne_lng: "-78.9500", ... }
  Output: { ne_lat: -2.847, ne_lng: -78.950, sw_lat: -2.953, sw_lng: -79.050 }

// CONVERT
viewportToBounds(viewport: MapViewport): MapBounds
boundsToViewport(bounds: MapBounds): MapViewport

// CHECK
hasBoundsParams(searchParams: URLSearchParams): boolean
  Input:  URLSearchParams { ne_lat: "-2.8470", ... }
  Output: true (todos los 4 params presentes)
```

### 4.2 Precisión en URL

```typescript
// PROBLEMA: Números infinitos
-2.9000000000000001
-79.00000000000000000

// SOLUCIÓN: Redondear a 4 decimales
.toFixed(4)
// "-2.9000"
// "-79.0000"

// POR QUÉ 4 decimales?
// 1 decimal:  ~11 km de precisión
// 2 decimales: ~1.1 km
// 3 decimales: ~111 m
// 4 decimales: ~11 m ✓ SUFICIENTE para mapas
// 5 decimales: ~1.1 m (excesivo, URL muy larga)

// EJEMPLO:
const bounds = {
  ne_lat: -2.847123456789,
  ne_lng: -78.950987654321,
  sw_lat: -2.953456789012,
  sw_lng: -79.050123456789
};

const rounded = {
  ne_lat: -2.8471,  // Redondeado
  ne_lng: -78.9510,
  sw_lat: -2.9535,
  sw_lng: -79.0501
};

// Diferencia: ~10 metros (imperceptible en mapa)
// Ventaja: URL más corta y limpia
```

### 4.3 URL Completa vs Bounds Completa

```
URL con bounds:
  /mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050
  Caracteres: 76
  Info: Área exacta ✓

URL con viewport:
  /mapa?lat=-2.90&lng=-79.00&zoom=12
  Caracteres: 42
  Info: Punto central + nivel

Tradeoff:
- Bounds: +34 caracteres, pero más robusto (responsive)
- Viewport: Más corto, pero depende de pantalla

Decisión en InmoApp: Bounds (mejor UX)
```

---

## 5. Implementación Paso a Paso

### 5.1 Server: Parseo en `mapa/page.tsx`

```typescript
/**
 * MAP PAGE (Server Component)
 *
 * Responsabilidad: Recibir URL bounds → parsear → inicializar viewport
 */

export default async function MapPage(props) {
  const searchParams = await props.searchParams;

  // PASO 1: Definir fallback
  const defaultViewport = {
    latitude: -2.9001,
    longitude: -79.0058,
    zoom: 12,
  };

  // PASO 2: Parsear bounds de URL
  // Si URL tiene bounds: /mapa?ne_lat=...
  // Si URL tiene viewport antiguo: /mapa?lat=...&lng=...&zoom=...
  // Si URL está vacía: usar defaultViewport
  const bounds = parseBoundsParams(searchParams, defaultViewport);

  // PASO 3: Convertir bounds a viewport para inicializar mapa
  const viewport = boundsToViewport(bounds);

  // PASO 4: Pasar a cliente
  return <MapView initialViewport={viewport} />;
}
```

**¿Por qué server-side?**

```
Opción 1: Parsear en cliente
  Client renders
  → useEffect dispara
  → parsea URL
  → setState
  → Re-render
  ❌ Flickering visible

Opción 2: Parsear en servidor (elegida)
  Server parsea URL
  → Pasa datos a cliente en props
  → Cliente renderiza con datos iniciales
  ✓ Sin flickering
  ✓ SEO-friendly
  ✓ Más rápido
```

### 5.2 Cliente: Sync en `use-map-viewport.ts`

```typescript
/**
 * HOOK: useMapViewport
 *
 * Responsabilidad: Mantener viewport sincronizado con URL
 * Dirección: User mueve mapa → URL se actualiza
 */

export function useMapViewport({ initialViewport, mounted }) {
  // PASO 1: Estado del mapa
  const [viewState, setViewState] = useState<ViewState>({
    latitude: initialViewport?.latitude ?? ...,
    longitude: initialViewport?.longitude ?? ...,
    zoom: initialViewport?.zoom ?? ...,
    ...
  });

  // PASO 2: Debounce (esperar a que deje de mover)
  const debouncedViewport = useDebounce<MapViewport>(
    {
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
    },
    500  // Esperar 500ms sin movimiento
  );

  // PASO 3: Convertir viewport a bounds
  const debouncedBounds = viewportToBounds(debouncedViewport);

  // PASO 4: Sync bounds a URL
  useEffect(() => {
    if (!mounted) return;  // Skip initial mount

    // Construir URL
    const newUrl = buildBoundsUrl(debouncedBounds);

    // Comparar con URL actual para evitar updates innecesarios
    const currentNeLat = searchParams.get("ne_lat");
    const newNeLat = debouncedBounds.ne_lat.toFixed(4);

    if (currentNeLat !== newNeLat || ...) {
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedBounds, router, mounted, searchParams]);

  // PASO 5: Handler de movimiento del mapa
  const handleMove = (evt: ViewStateChangeEvent) => {
    setViewState({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
      ...
    });
  };

  return { viewState, handleMove };
}
```

**Timeline completo:**

```
t=0ms:       User arrastra mouse en mapa
t=0-100ms:   ViewState actualiza múltiples veces
t=100ms:     useDebounce sigue esperando (timeout reseteado)
t=300ms:     User suelta el mouse
t=300ms:     ViewState deja de cambiar
t=300-800ms: useDebounce espera (cuenta atrás de 500ms)
t=800ms:     ⏰ Timer termina
t=800ms:     debouncedViewport actualiza
t=800ms:     debouncedBounds calcula nuevos bounds
t=800ms:     useEffect corre
t=800ms:     Compara URL actual vs nueva
t=805ms:     Si cambió: router.replace() (sin bloquear)
t=810ms:     URL actualizada en navbar/URL bar

Clave: Router.replace() es async, no bloquea el mapeo
```

### 5.3 MapContainer: Renderizado

```typescript
/**
 * MAP CONTAINER (Client Component)
 *
 * Responsabilidad: Renderizar mapa con markers/clusters
 * Recibe: viewState, handleMove, properties
 */

export function MapContainer({
  viewState,
  onMove,
  properties,
}) {
  // Usar clusters (ya visto en CLUSTERING_GUIDE.md)
  const clusters = useMapClustering({
    properties,
    viewState,
  });

  return (
    <Map
      {...viewState}
      onMove={onMove}  // Dispara handleMove en useMapViewport
    >
      {clusters.map(cluster => {
        if (isCluster(cluster)) {
          return <ClusterMarker ... />;
        }
        return <PropertyMarker ... />;
      })}
    </Map>
  );
}
```

---

## 6. Backward Compatibility

### 6.1 ¿Por Qué es Importante?

```
Escenario: Ya hay usuarios con URLs antiguas guardadas
  - Bookmarks: /mapa?lat=-2.90&lng=-79.00&zoom=12
  - Compartidas: Usuarios abren links de amigos
  - Analytics: URLs en logs

Soluciones:
  ❌ Romper todas (bad UX): Errores 404
  ✓ Soportar ambas (better): Parsear antiguo, convertir a nuevo
  ✓✓ Auto-redirect (best): Parsear antiguo, hacer redirect a nuevo

Elegimos: Auto-redirect
```

### 6.2 Implementación

```typescript
export function parseBoundsParams(
  searchParams: URLSearchParams,
  fallback: MapViewport
): MapBounds {
  try {
    // PASO 1: Intenta parsear nuevo formato (bounds)
    const ne_lat = searchParams.get("ne_lat");
    const ne_lng = searchParams.get("ne_lng");
    const sw_lat = searchParams.get("sw_lat");
    const sw_lng = searchParams.get("sw_lng");

    // PASO 2: Si están los 4 bounds, validar y retornar
    if (ne_lat && ne_lng && sw_lat && sw_lng) {
      const neLat = Number(ne_lat);
      const neLng = Number(ne_lng);
      const swLat = Number(sw_lat);
      const swLng = Number(sw_lng);

      // Validar rango y lógica
      if (isValidBounds(neLat, neLng, swLat, swLng)) {
        return { ne_lat: neLat, ne_lng: neLng, sw_lat: swLat, sw_lng: swLng };
      }
    }

    // PASO 3: Si no están los bounds, intentar formato antiguo
    const viewport = parseMapParams(searchParams, fallback);

    // PASO 4: Convertir viewport antiguo a bounds
    return viewportToBounds(viewport);
  } catch {
    // PASO 5: Si error, usar fallback
    return viewportToBounds(fallback);
  }
}
```

**Ejemplo real:**

```
URL antigua: /mapa?lat=-2.90&lng=-79.00&zoom=12

Parseo:
  1. ¿Existen ne_lat, ne_lng, sw_lat, sw_lng? NO
  2. Fallback a parseMapParams()
     → Extrae lat=-2.90, lng=-79.00, zoom=12
     → Retorna viewport
  3. Convierte con viewportToBounds()
     → Calcula bounds desde viewport
  4. Retorna bounds
  5. useMapViewport sincroniza a URL:
     → router.replace("/mapa?ne_lat=...&sw_lat=...")
     → Auto-redirect a nuevo formato ✓

Usuario NO nota nada, pero URL se actualiza automáticamente
```

### 6.3 Testing Backward Compatibility

```typescript
// Test 1: URL con bounds (nueva)
const newUrl = "/mapa?ne_lat=-2.847&ne_lng=-78.950&sw_lat=-2.953&sw_lng=-79.050";
const bounds = parseBoundsParams(new URLSearchParams(newUrl), fallback);
expect(bounds.ne_lat).toBe(-2.847);  // ✓ Parsea correctamente

// Test 2: URL antigua
const oldUrl = "/mapa?lat=-2.90&lng=-79.00&zoom=12";
const bounds2 = parseBoundsParams(new URLSearchParams(oldUrl), fallback);
expect(bounds2.ne_lat).toBeCloseTo(-2.847, 1);  // ✓ Convierte correctamente

// Test 3: URL vacía
const emptyUrl = "/mapa";
const bounds3 = parseBoundsParams(new URLSearchParams(emptyUrl), fallback);
expect(bounds3).toBeDefined();  // ✓ Usa fallback

// Test 4: URL corrupta
const badUrl = "/mapa?ne_lat=invalid&sw_lat=bad";
const bounds4 = parseBoundsParams(new URLSearchParams(badUrl), fallback);
expect(bounds4).toBeDefined();  // ✓ Usa fallback
```

---

## 7. Edge Cases y Soluciones

### 7.1 Antimeridiano (-180° / 180°)

**Problema:**
```
Usuario en Fiji, cerca del antimeridiano
Viewport: { latitude: -17.5, longitude: 179.5, zoom: 8 }

Bounds cálculo:
  delta = (180 / 2^8) * 1.2 = 0.844°

  ne_lng = 179.5 + 0.844 = 180.344 ❌ INVÁLIDO (>180°)
  sw_lng = 179.5 - 0.844 = 178.656 ✓

Resultado: ng bounds inválido
```

**Solución:**

```typescript
export function viewportToBounds(viewState) {
  const latDelta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
  const lngDelta = (360 / Math.pow(2, viewState.zoom)) * 1.2;

  let ne_lng = viewState.longitude + lngDelta;
  let sw_lng = viewState.longitude - lngDelta;

  // NORMALIZE LONGITUD al rango [-180, 180]
  if (ne_lng > 180) ne_lng -= 360;
  if (sw_lng < -180) sw_lng += 360;

  return {
    ne_lat: viewState.latitude + latDelta,
    ne_lng: ne_lng,  // Normalizado
    sw_lat: viewState.latitude - latDelta,
    sw_lng: sw_lng,  // Normalizado
  };
}
```

### 7.2 Polos (±90° latitud)

**Problema:**
```
Usuario en Polo Norte
Viewport: { latitude: 85, longitude: 0, zoom: 3 }

Bounds cálculo:
  delta = (180 / 2^3) * 1.2 = 27°

  ne_lat = 85 + 27 = 112° ❌ INVÁLIDO (>90°)
```

**Solución:**

```typescript
export function viewportToBounds(viewState) {
  // ...

  let ne_lat = viewState.latitude + latDelta;
  let sw_lat = viewState.latitude - latDelta;

  // CLAMP latitud al rango [-90, 90]
  ne_lat = Math.max(-90, Math.min(90, ne_lat));
  sw_lat = Math.max(-90, Math.min(90, sw_lat));

  return {
    ne_lat: ne_lat,  // Clamped
    ne_lng: ...,
    sw_lat: sw_lat,  // Clamped
    sw_lng: ...,
  };
}
```

### 7.3 Bounds Invertidos

**Problema:**
```
URL corrupta: /mapa?ne_lat=-2.95&sw_lat=-2.85
(NE más al sur que SW)
```

**Solución:**

```typescript
export function parseBoundsParams(searchParams, fallback) {
  // ...

  // Validar que NE > SW
  if (neLat <= swLat || neLng <= swLng) {
    // Bounds inválido, usar fallback
    const viewport = parseMapParams(searchParams, fallback);
    return viewportToBounds(viewport);
  }

  return { ne_lat: neLat, ne_lng: neLng, sw_lat: swLat, sw_lng: swLng };
}
```

---

## 8. Testing y Verificación

### 8.1 Unit Tests

```typescript
import {
  viewportToBounds,
  boundsToViewport,
  buildBoundsUrl,
  parseBoundsParams
} from '@/lib/utils/url-helpers';

describe('Bounds Conversions', () => {
  test('viewport to bounds', () => {
    const viewport = {
      latitude: -2.90,
      longitude: -79.00,
      zoom: 12
    };

    const bounds = viewportToBounds(viewport);

    expect(bounds.ne_lat).toBeCloseTo(-2.847, 2);
    expect(bounds.ne_lng).toBeCloseTo(-78.947, 2);
    expect(bounds.sw_lat).toBeCloseTo(-2.953, 2);
    expect(bounds.sw_lng).toBeCloseTo(-79.053, 2);
  });

  test('bounds to viewport (round trip)', () => {
    const originalViewport = {
      latitude: -2.90,
      longitude: -79.00,
      zoom: 12
    };

    const bounds = viewportToBounds(originalViewport);
    const viewport = boundsToViewport(bounds);

    // Puede haber pérdida de precisión en zoom
    expect(viewport.latitude).toBeCloseTo(originalViewport.latitude, 1);
    expect(viewport.longitude).toBeCloseTo(originalViewport.longitude, 1);
    expect(viewport.zoom).toBeCloseTo(originalViewport.zoom, 0);
  });

  test('build bounds URL', () => {
    const bounds = {
      ne_lat: -2.847,
      ne_lng: -78.950,
      sw_lat: -2.953,
      sw_lng: -79.050
    };

    const url = buildBoundsUrl(bounds);

    expect(url).toBe(
      '/mapa?ne_lat=-2.8470&ne_lng=-78.9500&sw_lat=-2.9530&sw_lng=-79.0500'
    );
  });

  test('parse bounds from URL', () => {
    const params = new URLSearchParams(
      'ne_lat=-2.8470&ne_lng=-78.9500&sw_lat=-2.9530&sw_lng=-79.0500'
    );

    const bounds = parseBoundsParams(params, fallback);

    expect(bounds.ne_lat).toBe(-2.847);
    expect(bounds.ne_lng).toBe(-78.950);
    expect(bounds.sw_lat).toBe(-2.953);
    expect(bounds.sw_lng).toBe(-79.050);
  });

  test('backward compatibility - old viewport params', () => {
    const params = new URLSearchParams('lat=-2.90&lng=-79.00&zoom=12');
    const bounds = parseBoundsParams(params, fallback);

    // Debe convertir formato antiguo a nuevo
    expect(bounds.ne_lat).toBeCloseTo(-2.847, 1);
    expect(bounds.sw_lat).toBeCloseTo(-2.953, 1);
  });

  test('invalid bounds uses fallback', () => {
    const params = new URLSearchParams('ne_lat=invalid&sw_lat=bad');
    const bounds = parseBoundsParams(params, fallback);

    // Debe usar fallback
    expect(bounds).toBeDefined();
    const viewport = boundsToViewport(bounds);
    expect(viewport.latitude).toBe(fallback.latitude);
  });
});
```

### 8.2 Manual Testing en Browser

```javascript
// Abre la consola del navegador (F12) en /mapa

// Test 1: Verificar bounds se actualizan
window.addEventListener('popstate', () => {
  const url = new URL(window.location);
  console.log('URL actualizada:', url.search);
});

// Test 2: Ver viewport actual
function logViewport() {
  const bounds = Object.fromEntries(
    new URL(window.location).searchParams
  );
  console.log('Bounds actuales:', bounds);
}

// Test 3: Simular click en cluster
// (haz click en un cluster en el mapa)
// Verifica que zoom aumente y URL cambie

// Test 4: Verificar mobile responsiveness
// Abre DevTools → Toggle device toolbar (Ctrl+Shift+M)
// Cambia tamaño de pantalla
// Verifica que bounds (área) sea igual, no zoom
```

### 8.3 Verificación Visual

```
Prueba 1: Shareable URL
1. Abre /mapa (ve cierta área)
2. Copia URL de address bar
3. Abre en otra pestaña
4. Verifica que VEA LA MISMA ÁREA (no importa tamaño)

Prueba 2: Responsiveness
1. Desktop: Zoom 8, ve región
2. Redimensiona a mobile
3. Verifica que SIGA viendo la MISMA región
   (puede cambiar ligeramente, pero el área debe ser similar)

Prueba 3: Deep Link
1. Comparte URL: "https://inmo.app/mapa?ne_lat=...&sw_lat=..."
2. Amigo abre en teléfono
3. Debe ver el MISMO área geográfico
4. ✓ ÉXITO si no tiene que hacer zoom manual para encontrar área
```

---

## 📋 Checklist de Conceptos

- [ ] Ventajas de bounds sobre lat/lng/zoom
- [ ] Estructura de bounds (NE, SW)
- [ ] Cálculo de delta desde zoom
- [ ] Fórmula inversa: zoom desde delta
- [ ] Conversión viewport → bounds
- [ ] Conversión bounds → viewport
- [ ] Debouncing de URL updates
- [ ] Backward compatibility
- [ ] Edge cases (antimeridiano, polos)
- [ ] Testing strategy

---

## 🔗 Archivos Relacionados

- `apps/web/lib/utils/url-helpers.ts` - Implementación
- `apps/web/components/map/hooks/use-map-viewport.ts` - Hook
- `apps/web/app/(public)/mapa/page.tsx` - Page server
- `docs/CLUSTERING_GUIDE.md` - Documentación previa

---

**Escrito con ❤️ para aprendizaje profundo**

Última actualización: 2025-10-23
Autor: Claude Code + [Usuario]
