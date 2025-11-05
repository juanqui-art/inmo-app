# ⚡ Quick Reference - Clustering & Bounds

> **Propósito:** Cheat sheet para consultas rápidas
> **Uso:** Pegada a lado del monitor mientras estudias
> **Última actualización:** 2025-10-23

---

## 🎯 Una Línea: ¿Qué Hace?

```
Clustering:   Agrupa 1000 markers → 5 clusters (performance)
Bounds URL:   Specifica rectángulo exacto del mapa (responsive)
```

---

## 📊 Fórmulas Clave

### Delta (Area) desde Zoom

```typescript
// Cálculo
const delta = (180 / Math.pow(2, zoom)) * 1.2;

// Tabla rápida
Zoom 0:  81°   (mundo)
Zoom 3:  27°   (continente)
Zoom 5:  6.75° (país)
Zoom 7:  1.68° (provincia)
Zoom 10: 0.21° (ciudad)
Zoom 12: 0.053°(barrio)
Zoom 16: 0.0033°(calle)
```

### Zoom desde Delta

```typescript
// Inversa
const zoom = Math.log2(180 / delta) - Math.log2(1.2);

// Simplificado
const zoom = Math.log2(216 / delta);
```

### Centro desde Bounds

```typescript
latitude = (ne_lat + sw_lat) / 2
longitude = (ne_lng + sw_lng) / 2
```

---

## 🔧 Funciones Principales

### `viewportToBounds()`

```typescript
Input:  { latitude: -2.90, longitude: -79.00, zoom: 12 }
        ↓
Compute: delta = (180 / 2^12) * 1.2 = 0.053°
        ↓
Output: {
  ne_lat: -2.90 + 0.053 = -2.847
  ne_lng: -79.00 + 0.053 = -78.947
  sw_lat: -2.90 - 0.053 = -2.953
  sw_lng: -79.00 - 0.053 = -79.053
}
```

### `boundsToViewport()`

```typescript
Input:  {
  ne_lat: -2.847, ne_lng: -78.947,
  sw_lat: -2.953, sw_lng: -79.053
}
       ↓
Compute:
  center_lat = (-2.847 + -2.953) / 2 = -2.90
  center_lng = (-78.947 + -79.053) / 2 = -79.00
  delta = |-2.847 - (-2.953)| = 0.106°
  zoom = log₂(216 / 0.106) ≈ 11
       ↓
Output: { latitude: -2.90, longitude: -79.00, zoom: 11 }

⚠️ Note: zoom puede variar ±1 por el padding
```

### `buildBoundsUrl()`

```typescript
Input:  { ne_lat: -2.847, ne_lng: -78.947, sw_lat: -2.953, sw_lng: -79.053 }
       ↓
Round:  -2.847 → "-2.8470" (4 decimales)
       ↓
Output: "/mapa?ne_lat=-2.8470&ne_lng=-78.9470&sw_lat=-2.9530&sw_lng=-79.0530"
```

### `parseBoundsParams()`

```typescript
Input:  URLSearchParams { "ne_lat": "-2.8470", ... }
       ↓
Validate: All 4 present? Valid range? NE > SW?
       ↓
Output: { ne_lat: -2.847, ne_lng: -78.947, ... }

Fallback: Si falta algo, intenta formato antiguo (lat/lng/zoom)
         Si ambos fallan, usa default viewport
```

---

## 🗺️ URL Patterns

### Nuevo (Bounds)
```
/mapa?ne_lat=-2.847&ne_lng=-78.947&sw_lat=-2.953&sw_lng=-79.053
Descripción: "Muéstrame exactamente este rectángulo"
Ventaja: Responsive, shareable, exacto
```

### Antiguo (Viewport) - Sigue funcionando
```
/mapa?lat=-2.90&lng=-79.00&zoom=12
Descripción: "Centro aquí, amplía 2^12 veces"
Nota: Se convierte automáticamente a bounds
```

### Vacía - Usa defaults
```
/mapa
Descripción: Centro de Cuenca, zoom 12
```

---

## 🎬 Flow: Usuario Mueve Mapa

```
t=0ms:       Arrastrar mouse
t=0-100ms:   ViewState actualiza (multiple times)
t=100ms:     useDebounce cuenta atrás: 500ms
t=300ms:     Suelta mouse, ViewState estable
t=300-800ms: useDebounce espera (timeout reseteado = 500ms)
t=800ms:     ⏰ Timer termina
t=800ms:     ✓ debouncedViewport actualiza
t=800ms:     ✓ viewportToBounds calcula
t=800ms:     ✓ buildBoundsUrl genera URL
t=805ms:     ✓ router.replace(url) (async, no bloquea)
t=810ms:     ✓ URL bar actualizada
```

---

## 🐛 Debugging Checklist

### Markers Desaparecen (Zoom < 7)

```
❌ Bounds fijos: delta = constant (siempre 1°)
✓ Bounds dinámicos: delta = (180 / 2^zoom) * 1.2

Para verificar en consola:
  const delta = (180 / Math.pow(2, 3)) * 1.2;
  console.log(delta);  // Debe ser ~27°, no 1°
```

### URL No Actualiza

```
❌ Sin debounce: useEffect se corre 60 veces/seg
✓ Con debounce: useEffect se corre 1 vez/500ms

Para verificar:
  Abre DevTools Console
  Arrastra mapa
  Verifica que URL cambie MAX 1-2 veces (no 60)
```

### Bounds Inválidos

```
❌ Invalidaciones:
  - ne_lat <= sw_lat (invertido)
  - ne_lng > 180 o < -180 (fuera de rango)
  - sw_lat > 90 (fuera de rango)

✓ Soluciones:
  - Normalizar longitud: if (lng > 180) lng -= 360;
  - Clampear latitud: lat = Math.max(-90, Math.min(90, lat));
  - Validar en parseo: if (ne_lat <= sw_lat) return fallback;
```

### Backward Compatibility Broken

```
❌ URLs antiguas generan error
✓ URLs antiguas auto-convierten

Para verificar:
  Prueba: /mapa?lat=-2.90&lng=-79.00&zoom=12
  Debería funcionar
  La URL debería actualizar a formato nuevo
```

---

## 📈 Performance Checklist

### useMemo (Supercluster)

```typescript
❌ Sin memoization:
  properties → render → nuevoProceso() → 1000 indexaciones

✓ Con memoization:
  properties → render → useMemo → 1 indexación

Resultado: 500ms → 5ms por render
```

### useDebounce (URL Updates)

```typescript
❌ Sin debounce:
  60 eventos/seg × 500ms = 30 segundos

✓ Con debounce (500ms):
  1 evento/500ms = 2 eventos/segundo máximo

Resultado: Router no se satura
```

---

## ✅ Testing Checklist

### Unit Tests

```typescript
✓ viewportToBounds() produce bounds válidos
✓ boundsToViewport() recupera zoom aproximado
✓ Round-trip: viewport → bounds → viewport ≈ original
✓ parseBoundsParams() rechaza valores inválidos
✓ Backward compatibility: URL antigua → nueva
✓ buildBoundsUrl() produce URL correcta
```

### Integration Tests

```typescript
✓ Usuario mueve mapa → URL actualiza
✓ Usuario abre URL antigua → funciona + auto-convierte
✓ Compartir URL → amigo ve misma área
✓ Mobile responsive: diferentes tamaños → misma área
✓ Extremos: zoom 0 (mundo) y zoom 20 (calle)
```

### Manual Testing

```
✓ Abre /mapa (ve área por defecto)
✓ Mueve mapa (URL cambia cada ~500ms)
✓ Copia URL (comparte con amigo)
✓ Amigo abre (ve MISMA área, no zoom)
✓ Desktop + Mobile (ambos ven MISMA área geográfica)
✓ Zoom extremos: 0-20 sin errores
```

---

## 🎓 Conceptos Clave (Una Frase)

| Concepto | Descripción |
|----------|-----------|
| **Viewport** | Centro + amplificación (relativo a pantalla) |
| **Bounds** | Rectángulo exacto (absoluto) |
| **Delta** | Diferencia grados: ne - sw |
| **Zoom** | Nivel amplificación: 0 (mundo) a 20 (cm) |
| **K-D Tree** | Árbol búsqueda espacial O(log n) |
| **Cluster** | Grupo puntos cercanos < 40px |
| **Supercluster** | Librería que usa K-D tree |
| **Debounce** | Esperar a que acción termine antes de reaccionar |
| **Padding (1.2)** | 20% extra bounds para capturar edges |
| **Normalization** | Asegurar longitude ∈ [-180, 180] |

---

## 🚨 Edge Cases

| Caso | Problema | Solución |
|------|----------|----------|
| **Antimeridiano** | ne_lng > 180 | `if (lng > 180) lng -= 360` |
| **Polo** | ne_lat > 90 | `lat = Math.min(90, lat)` |
| **Bounds invertido** | ne_lat < sw_lat | Rechazar + fallback |
| **Punto único** | ne_lat == sw_lat | Rechazar + fallback |
| **URL antigua** | lat/lng/zoom | Detectar + convertir automático |
| **URL corrupta** | valores inválidos | Usar fallback default |
| **Zoom extremo** | zoom > 20 | Clampear a [0, 22] |

---

## 📞 Troubleshooting Rápido

```
"Markers desaparecen en zoom bajo"
→ Verificar fórmula: delta = (180 / 2^zoom) * 1.2
→ Logs: console.log(delta) en cada zoom

"URL cambia demasiado"
→ Verificar debounce: 500ms
→ Logs: console.log(debouncedBounds) en useEffect

"URLs antiguas no funcionan"
→ Verificar: parseBoundsParams fallback
→ Logs: console.log(searchParams) en page.tsx

"Bounds inválidos en URL"
→ Verificar validaciones en parseBoundsParams()
→ Logs: console.log(isValidBounds) antes de retornar

"Performance lag en mapa"
→ Verificar useMemo en Supercluster
→ DevTools Profiler: ¿Se recalcula cada frame?
```

---

## 📚 Lectura Recomendada

1. **Empieza aquí:** Este archivo (5 min)
2. **Profundo:** `CLUSTERING_GUIDE.md` (45 min)
3. **Detallado:** `MAP_BOUNDS_URL_GUIDE.md` (45 min)
4. **Código real:** Ver archivos `.ts` mientras lees

---

## 🔗 Quick Links al Código

```
Implementación:
  - Hook: apps/web/components/map/hooks/use-map-clustering.ts
  - Hook: apps/web/components/map/hooks/use-map-viewport.ts
  - Utils: apps/web/lib/utils/url-helpers.ts
  - Component: apps/web/components/map/cluster-marker.tsx
  - Container: apps/web/components/map/ui/map-container.tsx
  - Page: apps/web/app/(public)/mapa/page.tsx

Documentación:
  - Este archivo (Quick Reference)
  - CLUSTERING_GUIDE.md (Detallado)
  - MAP_BOUNDS_URL_GUIDE.md (Muy detallado)
```

---

**Keep this page open while studying** 📌

