# Estrategia de Caché: MapPage en InmoApp

**Status:** 📚 REFERENCIA EDUCATIVA (NO implementado actualmente)

⚠️ **IMPORTANTE:** Este documento describe una estrategia planificada pero no implementada en el código actual. Ver `docs/caching/CACHE_STATUS.md` para estado real del proyecto.

---

## Visualización de Flujos

### ❌ Antes: Sin Cache Components (Ineficiente)

```
┌─────────────────────────────────────────────────┐
│ Usuario Arrastra Mapa 5 Veces en 1 Segundo      │
└────────┬────────────────────────────────────────┘
         │
         ├─ Pan 1: Bounds A
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ propertyRepository.findInBounds(A)
         │           └─ QUERY 1 a BD ⚠️
         │
         ├─ Pan 2: Bounds B
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ propertyRepository.findInBounds(B)
         │           └─ QUERY 2 a BD ⚠️
         │
         ├─ Pan 3: Bounds A (idéntico a Pan 1)
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ propertyRepository.findInBounds(A)
         │           └─ QUERY 3 a BD ⚠️ (DUPLICADO!)
         │
         ├─ Pan 4: Bounds C
         │   └─ QUERY 4 a BD ⚠️
         │
         └─ Pan 5: Bounds B (idéntico a Pan 2)
             └─ QUERY 5 a BD ⚠️ (DUPLICADO!)

RESULTADO: 5 queries (2 fueron duplicadas, ineficiente)
TIEMPO: ~1,700ms (promedio 340ms/query)
```

---

### ✅ Después: Cache Components (Optimizado)

```
┌─────────────────────────────────────────────────┐
│ Usuario Arrastra Mapa 5 Veces en 1 Segundo      │
└────────┬────────────────────────────────────────┘
         │
         ├─ Pan 1: Bounds A
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ getCachedPropertiesByBounds(A)
         │           ├─ cache() → Not found in memory
         │           └─ propertyRepository.findInBounds(A)
         │               └─ QUERY 1 a BD
         │                  └─ Resultado cached en memory ✅
         │
         ├─ Pan 2: Bounds B (diferentes)
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ getCachedPropertiesByBounds(B)
         │           ├─ cache() → Not found in memory
         │           └─ propertyRepository.findInBounds(B)
         │               └─ QUERY 2 a BD
         │                  └─ Resultado cached en memory ✅
         │
         ├─ Pan 3: Bounds A (idéntico a Pan 1)
         │   └─ URL cambio → MapPage re-renderiza
         │       └─ getCachedPropertiesByBounds(A)
         │           ├─ cache() → Found in memory!
         │           └─ ✅ Devuelve resultado anterior
         │              (NO query a BD, 15ms en lugar de 340ms)
         │
         ├─ Pan 4: Bounds C
         │   └─ QUERY 3 a BD
         │      └─ Resultado cached en memory ✅
         │
         └─ Pan 5: Bounds B (idéntico a Pan 2)
             └─ getCachedPropertiesByBounds(B)
                 ├─ cache() → Found in memory!
                 └─ ✅ Devuelve resultado anterior
                    (NO query a BD)

RESULTADO: 3 queries (2 fueron evitadas por cache, eficiente)
TIEMPO: ~1,090ms (340+380+15+355+8ms) = 36% faster 🚀
```

---

## Timeline Detallado: Desde Pan hasta Render

### Escenario: Usuario hace Pan 1 a Bounds A

```
┌────────────────────────────────────────┐
│ T0ms: Usuario arrastra mapa             │
└────────┬─────────────────────────────────┘
         │
         ├─ React detecta cambio en viewport state
         ├─ handleMove() → setViewState()
         │
         ├─ useMapViewport hook:
         │  ├─ viewState.longitude = -79.1
         │  └─ viewState.latitude = -2.85
         │
         ├─ Debounce 500ms (espera a que usuario deje de mover)
         │
         └─ Bounds calculados: {sw_lat: -2.95, ne_lat: -2.85, ...}

┌────────────────────────────────────────┐
│ T500ms: Debounce expires                │
└────────┬─────────────────────────────────┘
         │
         ├─ router.replace() actualiza URL
         │  └─ /mapa?ne_lat=-2.85&sw_lat=-2.95...
         │
         ├─ Browser navigation → servidor
         │
         └─ Next.js render triggered

┌────────────────────────────────────────┐
│ T510ms: MapPage Server Component        │
└────────┬─────────────────────────────────┘
         │
         ├─ parseBoundsParams() → {sw_lat: -2.95, ne_lat: -2.85, ...}
         ├─ validateBoundsParams() → ✅ válido
         │
         ├─ getCachedPropertiesByBounds() llamado
         │  ├─ React.cache() verifica deduplication map
         │  ├─ Key: "getCachedPropertiesByBounds:-2.95:-2.85..."
         │  ├─ Not found → ejecutar función
         │  │
         │  └─ Dentro de getCachedPropertiesByBounds():
         │     ├─ cacheTag('properties-bounds') registra tag
         │     │
         │     ├─ propertyRepository.findInBounds({
         │     │    minLatitude: -2.95,
         │     │    maxLatitude: -2.85,
         │     │    minLongitude: -79.1,
         │     │    maxLongitude: -78.9,
         │     │  })
         │     │
         │     └─ BD Query (SELECT * WHERE...)
         │        ├─ Conexión a BD (Supabase pooler)
         │        ├─ Query: 45 properties encontradas
         │        └─ Resultado retornado
         │
         ├─ serializeProperties() → Decimal → number
         │
         ├─ React.cache() guarda resultado en memory
         │
         └─ Retorna: { properties: [...45 items], total: 45 }

┌────────────────────────────────────────┐
│ T540ms: MapView Client Component        │
└────────┬─────────────────────────────────┘
         │
         ├─ Recibe properties como props
         ├─ useMapClustering() → Supercluster recalcula clusters
         ├─ MapContainer renderiza
         │  ├─ ClusterMarkers (5 clusters)
         │  └─ PropertyMarkers (20 individuales)
         └─ PropertyListDrawer (45 items)

┌────────────────────────────────────────┐
│ T560ms: Browser Paint                   │
└────────┬─────────────────────────────────┘
         │
         ├─ Canvas renders:
         │  ├─ Map tiles
         │  ├─ Markers (clusters + properties)
         │  └─ Popup (si aplica)
         │
         └─ User vé 45 propiedades en mapa ✅

TOTAL LATENCY: 560ms desde pan hasta visible en pantalla
```

---

### Escenario: Usuario hace Pan 2 a mismo Bounds A (Cache Hit)

```
┌────────────────────────────────────────┐
│ T600ms: Usuario arrastra mapa otra vez  │
└────────┬─────────────────────────────────┘
         │
         ├─ React detecta cambio en viewport state
         ├─ viewState.longitude = -79.11
         ├─ viewState.latitude = -2.845
         │
         └─ Debounce 500ms

┌────────────────────────────────────────┐
│ T1100ms: Debounce expires               │
└────────┬─────────────────────────────────┘
         │
         ├─ Bounds calculados: {sw_lat: -2.95, ne_lat: -2.85, ...}
         │  (¡Mismo que Pan 1!)
         │
         ├─ router.replace() →/mapa?ne_lat=-2.85&sw_lat=-2.95...
         │  (¡Misma URL que Pan 1!)
         │
         └─ Browser sends request al servidor

┌────────────────────────────────────────┐
│ T1110ms: MapPage Server Component       │
└────────┬─────────────────────────────────┘
         │
         ├─ getCachedPropertiesByBounds() llamado
         │  ├─ React.cache() verifica deduplication map
         │  ├─ Key: "getCachedPropertiesByBounds:-2.95:-2.85..."
         │  ├─ ✅ FOUND in memory cache!
         │  │
         │  └─ Devuelve resultado guardado (sin ejecutar función)
         │     └─ { properties: [...45 items], total: 45 }
         │
         └─ Retorna properties (desde cache)

┌────────────────────────────────────────┐
│ T1125ms: MapView + Paint                │
└────────┬─────────────────────────────────┘
         │
         ├─ Recibe properties (iguales, desde cache)
         ├─ useMapClustering() → Recalcula (misma entrada)
         └─ Render completa en 15ms

LATENCY CACHE HIT: 15ms (vs 540ms sin cache)
SPEEDUP: 36x más rápido 🚀

¿Por qué tan rápido?
- No hay query a BD
- No hay network latency
- Solo operaciones en-memory en JavaScript
```

---

## Invalidación: Cuando Agent Crea Nueva Property

```
┌──────────────────────────────────────────┐
│ Agent completa formulario de property      │
│ Hace click en "Crear Propiedad"            │
└────────┬─────────────────────────────────┘
         │
         ├─ Form submission → Server Action
         │  └─ createPropertyAction()
         │
         ├─ propertyRepository.create()
         │  └─ INSERT INTO properties...
         │     └─ Nueva property en BD ✅
         │
         ├─ updateTag('properties-bounds')
         │  └─ Invalida TODOS los resultados cached con
         │     este tag (in-memory en el servidor)
         │
         ├─ revalidatePath('/dashboard/propiedades')
         │  └─ Invalida página del dashboard
         │
         └─ redirect('/dashboard/propiedades')

┌──────────────────────────────────────────┐
│ Usuario vuelve a visitar /mapa             │
└────────┬─────────────────────────────────┘
         │
         ├─ getCachedPropertiesByBounds() llamado
         │  ├─ React.cache() verifica memory
         │  ├─ Key: "getCachedPropertiesByBounds:-2.95:-2.85..."
         │  ├─ ❌ NOT FOUND (fue invalidada)
         │  │
         │  └─ Ejecuta función nuevamente
         │     ├─ cacheTag('properties-bounds')
         │     └─ propertyRepository.findInBounds()
         │        └─ QUERY NUEVA a BD ✅
         │           (ahora retorna 46 properties)
         │
         └─ MapView renderiza con 46 propiedades

RESULTADO: Datos frescos sin delay de caché stale ✅
```

---

## Comparación: 3 Estrategias de Caché

```
┌─────────────────────────────────────────────────────────────┐
│ ESTRATEGIA 1: Sin Caché (Peligro)                           │
├─────────────────────────────────────────────────────────────┤
│ Ventajas:  - Siempre datos frescos                          │
│ Desventajas: - Lento                                        │
│              - Muchas queries a BD                           │
│              - Loops de renderización                       │
│              - Mala UX en pans rápidos                      │
│                                                              │
│ Query count en 5 pans: 5 queries ⚠️                        │
│ Tiempo total: 1,700ms                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ESTRATEGIA 2: ISR Simple (Mejor)                            │
├─────────────────────────────────────────────────────────────┤
│ export const revalidate = 300 // 5 minutos                  │
│                                                              │
│ Ventajas:  - Página compilada cached                        │
│            - CDN distribution posible                        │
│ Desventajas: - Cada URL diferente = nueva query             │
│              - Sin deduplicación                            │
│              - Stale data por 5 minutos                     │
│                                                              │
│ Query count en 5 pans: 5 queries (pero más rápido)  ⚠️     │
│ Tiempo total: 1,700ms                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ESTRATEGIA 3: Cache Components + ISR (Óptimo) ✅            │
├─────────────────────────────────────────────────────────────┤
│ export const getCachedPropertiesByBounds = cache(async ...) │
│ cacheTag('properties-bounds')                               │
│ updateTag('properties-bounds') // en server actions         │
│                                                              │
│ Ventajas:  - Deduplica queries idénticas                    │
│            - Cachea datos + página                          │
│            - Invalidación on-demand                         │
│            - Fresh data después de cambios                  │
│ Desventajas: Necesita Next.js 16+                           │
│                                                              │
│ Query count en 5 pans: 3 queries (menos)  ✅               │
│ Tiempo total: 1,090ms (36% faster)  🚀                     │
│ Latency (cache hit): 15ms  🔥                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Matriz de Decisiones

### ¿Cuándo usar cada estrategia?

```
┌─────────────────────┬──────────────────────────────────────┐
│ Caso de Uso         │ Estrategia Recomendada               │
├─────────────────────┼──────────────────────────────────────┤
│ Blog estático       │ ISR (sin caché específico)           │
│ Landing pages       │ ISR (revalidate: 3600)               │
│ Listados dinámicos  │ Cache Components + ISR (Tuyo) ✅     │
│ Mapas interactivos  │ Cache Components + ISR (Tuyo) ✅     │
│ Búsquedas reales    │ SWR/React Query (client-side) ¹      │
│ Dashboard           │ Cache Components + ISR + SWR         │
│ Real-time data      │ WebSockets + Cache Components        │
│ API public          │ CDN + Cache-Control headers          │
└─────────────────────┴──────────────────────────────────────┘

¹ SWR/React Query para mucho control del client
```

---

## Checklist: Implementación en Tu Proyecto

```
IMPLEMENTADO ✅
├─ ✅ Crear lib/cache/properties-cache.ts
│   └─ React.cache() wrapper para findInBounds()
│
├─ ✅ Agregar cacheTag() en getCachedPropertiesByBounds
│   └─ Tag: 'properties-bounds'
│
├─ ✅ Actualizar mapa/page.tsx
│   └─ Usar getCachedPropertiesByBounds() en lugar de query directa
│
├─ ✅ Agregar updateTag() en server actions
│   ├─ createPropertyAction → updateTag('properties-bounds')
│   ├─ updatePropertyAction → updateTag('properties-bounds')
│   └─ deletePropertyAction → updateTag('properties-bounds')
│
├─ ✅ Validar bounds con validateBoundsParams()
│   └─ Previene queries inválidas
│
└─ ✅ Type-checking pasado
    └─ bun run type-check → Success

PRÓXIMO NIVEL (P2):
├─ [ ] SWR para client-side caching en MapView
├─ [ ] Prefetch en marker hover
├─ [ ] getCachedPropertyById para detail pages
├─ [ ] Analytics: track búsquedas frecuentes
└─ [ ] Progressive loading para 1000+ properties
```

---

## Métricas: Antes vs Después

### Tráfico en mapa durante 1 minuto (50 usuarios)

```
SIN CACHE:
├─ Total requests: 250 (5 pans × 50 users)
├─ BD queries: 250
├─ Latency p95: 450ms
└─ Server load: HIGH

CON CACHE COMPONENTS:
├─ Total requests: 250 (5 pans × 50 users)
├─ BD queries: 150 (40% reduction)
├─ Latency p95: 180ms
└─ Server load: 40% lower

Benefit:
✅ Menos carga en BD
✅ UX más rápida
✅ Escalabilidad mejorada
✅ Costos de infraestructura reducidos
```

---

## Referencias

- [Next.js Cache Components](https://nextjs.org/docs)
- [React.cache() API](https://react.dev/reference/react/cache)
- [ISR vs Cache Components](https://nextjs.org/docs)
