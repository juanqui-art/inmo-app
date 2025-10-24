# 🔧 Solución de Problemas - Mapa

Guía para resolver los problemas más comunes del mapa interactivo.

---

## 🚨 Problema #1: Markers Desapareciendo en la Parte Superior

### Síntomas
- Markers visibles en partes laterales y inferior ✅
- Markers cerca del navbar (h-32) desaparecen ❌
- Al hacer zoom específico, algunos markers desaparecen

### Root Cause
El cálculo de bounds para data fetching era simétrico y no consideraba el navbar.

**Antes del fix:**
```typescript
// ❌ INCORRECTO: Mismo delta arriba y abajo
const bounds = {
  ne_lat: latitude + latitudeDelta,
  sw_lat: latitude - latitudeDelta,
};
// Resultado: Menos bounds arriba (donde está navbar)
```

### ✅ Solución Implementada

Se implementó `map.getBounds()` que retorna los bounds EXACTOS de lo visible.

**Archivos modificados:**
- `components/map/hooks/use-map-viewport.ts` (Commit 0ec87fc)
- `components/map/hooks/use-map-clustering.ts` (Commit d2e2bc8)
- `components/map/ui/map-container.tsx` - Added padding (Commit 5f7fde4)

**Código:**
```typescript
// ✅ CORRECTO: Bounds precisos de MapBox
const bounds = mapRef.current.getBounds();
const ne = bounds.getNorthEast();
const sw = bounds.getSouthWest();
// Resultado: Bounds asimétricos, considera navbar
```

### Verificar que está Fixed

1. Abre `/mapa`
2. Zoom in hasta ver ~50 properties
3. Verifica markers en la parte SUPERIOR cerca del navbar
4. **Espera:** Todos los markers sean visibles ✅

### Si Sigue Fallando

**Opción 1:** Hard refresh
```bash
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

**Opción 2:** Limpiar cache
```bash
rm -rf .next
bun run dev
```

**Opción 3:** Verificar que mapRef está siendo pasado
```typescript
// En map-view.tsx
const mapRef = useRef<MapRef>(null);
// ✅ ¿Se pasa a MapContainer?
<MapContainer mapRef={mapRef} ... />

// En map-container.tsx
// ✅ ¿Se pasa a useMapClustering?
const clusters = useMapClustering({
  mapRef,  // ← IMPORTANTE
  properties,
  viewState,
});
```

---

## 🚨 Problema #2: URL No Se Actualiza al Mover el Mapa

### Síntomas
- Draggeas el mapa pero URL no cambia
- Refrescas y vuelves a la posición anterior
- No puedes compartir links del mapa

### Root Cause
Infinite loop was preventing URL updates.

**Anterior:** El `useEffect` re-ejecutaba infinitamente cuando router.replace() actualizaba URL.

### ✅ Solución

Use `useRef` to track last URL string.

**Archivo:** `components/map/hooks/use-map-viewport.ts`

```typescript
const lastUrlRef = useRef<string>('');

useEffect(() => {
  const newUrl = buildBoundsUrl(debouncedBounds);

  // ✅ Solo actualiza si URL cambió realmente
  if (newUrl !== lastUrlRef.current) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl);
  }
}, [debouncedBounds, router]);
```

### Verificar que está Fixed

1. Abre `/mapa`
2. Arrastra el mapa varios puntos
3. Observa la URL en el navegador
4. **Espera:** Que cambiar después de 500ms (debounce)

### Si No Funciona

**Verificar debounce:**
```typescript
// En use-map-viewport.ts
const debouncedViewport = useDebounce(viewState, 500);
// ✅ Espera 500ms antes de actualizar

const debouncedBounds = useMemo(() => {
  // ✅ Se recalcula basado en debouncedViewport
}, [debouncedViewport, mapRef]);
```

**Verificar buildBoundsUrl:**
```typescript
// En lib/utils/url-helpers.ts
export function buildBoundsUrl(bounds: Bounds): string {
  const params = new URLSearchParams();
  params.append('ne_lat', bounds.ne_lat.toString());
  params.append('ne_lng', bounds.ne_lng.toString());
  params.append('sw_lat', bounds.sw_lat.toString());
  params.append('sw_lng', bounds.sw_lng.toString());
  // ✅ Retorna URL con bounds?
  return `/mapa?${params.toString()}`;
}
```

---

## 🚨 Problema #3: Clustering No Funciona

### Síntomas
- Zoom out = miles de markers individuales en lugar de clusters
- Zoom in = clusters no se expanden correctamente
- Números en clusters son incorrectos

### Root Cause
Clustering usaba bounds incorrectos (symmetric).

### ✅ Solución

`use-map-clustering.ts` ahora usa `map.getBounds()`.

```typescript
// ✅ NUEVO: Bounds precisos
const clusters = useMemo(() => {
  let bounds: [number, number, number, number];

  if (mapRef?.current) {
    const mapBounds = mapRef.current.getBounds();
    if (mapBounds) {
      const ne = mapBounds.getNorthEast();
      const sw = mapBounds.getSouthWest();
      bounds = [sw.lng, sw.lat, ne.lng, ne.lat]; // [minLng, minLat, maxLng, maxLat]
    } else {
      bounds = calculateFallbackBounds(viewState);
    }
  } else {
    bounds = calculateFallbackBounds(viewState);
  }

  return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
}, [supercluster, viewState, mapRef]);
```

### Verificar que está Fixed

1. Abre `/mapa`
2. Zoom muy afuera (zoom 3-5)
3. **Espera:** Ver clusters agrupados, no miles de markers
4. Click en cluster → **Espera:** Zoom in y se expanda

### Si No Funciona

**Verificar Supercluster config:**
```typescript
// En use-map-clustering.ts
const supercluster = useMemo(() => {
  return new Supercluster({
    radius: CLUSTER_CONFIG.RADIUS,    // 80
    maxZoom: CLUSTER_CONFIG.MAX_ZOOM, // 17
  });
}, []);
```

**Verificar Supercluster.load():**
```typescript
useEffect(() => {
  if (properties.length > 0) {
    const points = properties.map(p => ({
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
```

---

## 🚨 Problema #4: Mapa No Carga

### Síntomas
- Página mapa está en blanco
- Console muestra errores de MapBox
- MapBox token no funciona

### Root Cause
Missing MapBox token o token inválido.

### ✅ Solución

1. **Verifica .env.local**
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk_public_xxxxxx
```

2. **Verifica que es PUBLIC token** (starts with `pk_`)
   - NO uses el secret token (starts with `sk_`)

3. **Restart dev server**
```bash
bun run dev
```

### Obtener Token

1. Ve a [mapbox.com/account](https://mapbox.com/account)
2. Login con tu cuenta
3. Copia el token que empieza con `pk_`
4. Agrega a `.env.local`
5. Restart dev server

---

## 🚨 Problema #5: Markers Sin Sincronizar Correctamente

### Síntomas
- Haces click en marker pero popup muestra info incorrecta
- Popup desaparece cuando haces scroll
- Marker highlighted no corresponde con popup

### Root Cause
State management issue en map-container.ts

### ✅ Solución

Verifica que `selectedPropertyId` se mantiene correcto:

```typescript
// En map-container.tsx
const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

const selectedProperty = selectedPropertyId
  ? properties.find((p) => p.id === selectedPropertyId)
  : null;

// ✅ Si properties cambia, verifica que selectedPropertyId sigue siendo válido
useEffect(() => {
  if (selectedPropertyId && !properties.find(p => p.id === selectedPropertyId)) {
    setSelectedPropertyId(null);
  }
}, [properties, selectedPropertyId]);
```

---

## 🚨 Problema #6: Performance Lento (Lag en Dragging)

### Síntomas
- Mapa se tarda mucho en responder al drag
- Animation choppy cuando haces zoom
- FPS bajo

### Root Cause
- Demasiadas properties renderizadas
- Clustering mal configurado
- No hay useMemo/useCallback

### ✅ Soluciones

**1. Verificar que clustering está activo**
```typescript
// En use-map-clustering.ts
const clusters = useMemo(() => {
  // ✅ Debe haber clusters, no miles de markers
  return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
}, [supercluster, viewState, mapRef]);

console.log(`Rendering ${clusters.length} items (clusters + markers)`);
```

**2. Aumentar CLUSTER_CONFIG.RADIUS**
```typescript
// En lib/types/map.ts
CLUSTER_CONFIG = {
  RADIUS: 120,      // ← Aumenta esto para agrupar más
  MAX_ZOOM: 17,
  ZOOM_INCREMENT: 2,
};
```

**3. Verificar que no hay re-renders innecesarios**
```typescript
// En map-container.tsx
// ✅ Usar useCallback para handlers
const handleMarkerClick = useCallback((property: MapProperty) => {
  setSelectedPropertyId(property.id);
}, []);

// ✅ Usar useMemo para computations
const clusters = useMapClustering({
  properties,
  viewState,
  mapRef,
});
```

### Performance Check

Abre DevTools → Performance
1. Graba mientras draggeas
2. **Espera:** 60fps constante (verde)
3. Si baja a <50fps, hay problema

---

## 🚨 Problema #7: No Veo el Padding del Navbar

### Síntomas
- Markers aparecen DEBAJO del navbar
- Navbar superpuesto en markers

### Root Cause
MapBox padding no está configurado.

### ✅ Solución

Verifica en `map-container.tsx`:

```typescript
<Map
  {...viewState}
  padding={{ top: 80, bottom: 0, left: 0, right: 0 }}
  // ✅ Top padding debe ser ~altura del navbar (56px + margins)
/>
```

Si el navbar tiene otra altura, ajusta:
```typescript
// Si navbar es h-16 (64px):
padding={{ top: 64, bottom: 0, left: 0, right: 0 }}

// Si navbar es h-14 (56px):
padding={{ top: 80, bottom: 0, left: 0, right: 0 }} // 56 + 24 margin
```

---

## 📋 Checklist de Debugging

Cuando algo no funciona en el mapa:

- [ ] ¿Estás en `/mapa`?
- [ ] ¿Cargó MapBox (sin errores en console)?
- [ ] ¿Tienes `NEXT_PUBLIC_MAPBOX_TOKEN` en `.env.local`?
- [ ] ¿Hiciste restart dev server después de cambiar .env?
- [ ] ¿Markers aparecen en TODA el área (incluyendo top)?
- [ ] ¿URL cambia cuando draggeas?
- [ ] ¿Clusters agrupan properties cuando zoom out?
- [ ] ¿Performance es smooth (60fps)?

Si todos estos son ✅, entonces el mapa está funcionando correctamente.

---

## 📞 Reportar un Bug

Si encuentras un problema no listado aquí:

1. **Reproduce:** Documenta exactamente qué haces
2. **Observa:** Qué esperas vs qué ves
3. **Check console:** Hay errores rojo en DevTools?
4. **Check network:** Hay errores en las peticiones?
5. **Describe:** Crea issue con esta información

**Ejemplo de buen reporte:**
```
Título: Markers desaparecen al hacer zoom a zoom=15 cerca del Ecuador

Pasos:
1. Abre http://localhost:3000/mapa
2. Navega a latitud -0.22, longitud -78.50 (Quito)
3. Zoom hasta zoom=15

Esperado: Veo markers en toda el área
Actual: Markers en lado derecho desaparecen

Console errors: Ninguno
Network errors: Ninguno

Reproducible: Sí, 100% de las veces
```

---

## 📚 Documentación Relacionada

- **[Map Feature](../features/MAP.md)** - Descripción general
- **[Map Bounds Decision](./MAP_BOUNDS_CALCULATION.md)** - Por qué usamos getBounds()
- **[Architecture](../ARCHITECTURE.md)** - Cómo funciona todo

---

**Última actualización:** 2025-10-24
**Mantenedor:** InmoApp Engineering Team
