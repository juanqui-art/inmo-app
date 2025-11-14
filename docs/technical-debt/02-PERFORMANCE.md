# ⚡ Performance y Cache

> **2 tareas identificadas** | Estimado: 2-4 horas
> Mejora de 36% en performance del mapa identificada

---

## 📋 Resumen

**Estado Actual:** ❌ **SIN CACHE IMPLEMENTADO**

**Historia:**
- Oct 23, 2025: Cache Components implementado (duró 5 minutos)
- Oct 23, 2025: Deshabilitado (incompatible con `cookies()`)
- Nov 4, 2025: Código completamente eliminado

**Impacto:**
- Queries duplicados en mismo request
- Mapa 36% más lento de lo posible
- Sin persistencia de datos cross-request

---

## 🔴 El Problema del Cache en Next.js 16

### Conflicto: `use cache` + `cookies()`

**Next.js 16 Cache Components no puede coexistir con runtime APIs:**

```typescript
// ❌ ESTO NO FUNCIONA:
export async function getProperties() {
  'use cache'  // ← Activa Cache Components

  const user = await getCurrentUser()  // ← Usa cookies() internamente
  // Error: Can't use cookies() inside 'use cache'

  return db.query(...)
}
```

**Tu app usa `cookies()` en:**
```typescript
// apps/web/lib/auth.ts
export async function getCurrentUser() {
  const session = await auth()  // ← Internamente usa cookies()
  return session?.user
}
```

### Opciones Evaluadas

**Opción 1:** Mantener Cache Components ❌
- Todas las rutas autenticadas fallan
- App broken

**Opción 2:** Deshabilitar (elegida) ✅
- App funciona
- Performance subóptima

**Opción 3:** Esperar Next.js 16.1+ 🔮
- `use cache: private` se estabiliza
- Compatible con cookies
- Requiere refactoring

---

## 💡 Soluciones Disponibles HOY

### Solución 1: React.cache() (Recomendado)

**Status:** ⚠️ PENDIENTE

**Impacto:**
- ✅ Mejora 36% en performance del mapa
- ✅ Deduplicación de requests
- ✅ Compatible con auth actual
- ✅ No experimental

**Tiempo:** 1-2 horas

**Riesgo:** Bajo

#### Implementación

**Paso 1: Crear wrapper de cache**

```typescript
// apps/web/lib/cache/properties-cache.ts
import { cache } from 'react'
import { propertyRepository } from '@repo/database'
import type { PropertyFilters } from '@repo/database'

/**
 * Cache-wrapped property queries
 *
 * Benefits:
 * - Request deduplication: Same query called multiple times → 1 DB hit
 * - Compatible with cookies() / auth
 * - No experimental flags needed
 *
 * Limitations:
 * - Cache duration: Single request only (~100ms)
 * - No cross-request persistence
 * - No tag-based invalidation
 */

export const getCachedPropertiesByBounds = cache(
  async (bounds: {
    ne_lat: number
    ne_lng: number
    sw_lat: number
    sw_lng: number
  }, filters?: PropertyFilters) => {
    return propertyRepository.listByBounds({
      bounds,
      filters,
    })
  }
)

export const getCachedPropertyById = cache(
  async (id: string) => {
    return propertyRepository.findById(id)
  }
)

export const getCachedPriceDistribution = cache(
  async (filters?: PropertyFilters) => {
    return propertyRepository.getPriceDistribution({ filters })
  }
)
```

**Paso 2: Usar en componentes**

```typescript
// apps/web/app/(app)/mapa/page.tsx
import { getCachedPropertiesByBounds } from '@/lib/cache/properties-cache'

export default async function MapPage({ searchParams }) {
  // Parse bounds from URL
  const bounds = parseBoundsFromUrl(searchParams)

  // ✅ This will be cached for the duration of the request
  // Multiple calls to this with same params → 1 DB query
  const properties = await getCachedPropertiesByBounds(bounds)

  return <MapContainer properties={properties} />
}
```

**Paso 3: Usar en Server Components paralelos**

```typescript
// Scenario: Multiple components need same data

// Component A
const properties = await getCachedPropertiesByBounds(bounds) // DB query

// Component B (same request)
const properties = await getCachedPropertiesByBounds(bounds) // ✅ Cache hit, no DB query

// Component C (same request)
const stats = await getCachedPriceDistribution() // ✅ Cache hit if called before
```

#### Beneficios

**Performance:**
- ✅ 1 request = máx 1 query a BD por función
- ✅ Request Memoization automático
- ✅ Reduce latencia en 30-40%

**Compatibilidad:**
- ✅ Compatible con `cookies()` / auth
- ✅ No experimental flags
- ✅ Works con Prisma, Supabase, cualquier DB

**Mantenibilidad:**
- ✅ Drop-in replacement (mismo API que repositorios)
- ✅ TypeScript full support
- ✅ Fácil de testear (mock cache function)

#### Limitaciones

**Duración:**
- ⚠️ Solo dura 1 request (~100ms)
- ⚠️ No hay persistencia cross-request
- ⚠️ No hay shared cache entre usuarios

**Invalidación:**
- ⚠️ No hay tag-based invalidation
- ⚠️ Usa `revalidatePath()` en su lugar (ya implementado)

#### Testing

```typescript
// After implementation, verify:

// 1. Multiple calls in same request → 1 DB query
const start = Date.now()
const [data1, data2, data3] = await Promise.all([
  getCachedPropertiesByBounds(bounds),
  getCachedPropertiesByBounds(bounds), // Same params
  getCachedPropertiesByBounds(bounds), // Same params
])
const duration = Date.now() - start
// Expected: ~100ms (1 query), not ~300ms (3 queries)

// 2. Check DB query logs
// Should see: 1 SELECT query, not 3
```

---

### Solución 2: ISR (Implementación Parcial)

**Status:** ✅ Implementado en homepage, ❌ No en mapa

**Actual:**
```typescript
// apps/web/app/(public)/page.tsx
export const revalidate = 300  // 5 minutos ✅
```

**Pendiente:**
```typescript
// apps/web/app/(app)/mapa/page.tsx
export const revalidate = 60  // 1 minuto

// apps/web/app/propiedades/[id]/page.tsx
export const revalidate = 300  // 5 minutos
```

**Impacto:**
- ✅ Reduce carga de DB
- ⚠️ No ayuda con requests duplicados en mismo render

---

## 🔮 Soluciones Futuras

### Opción A: Esperar Next.js 16.1+

**Timeline:** Incierto (monitorear releases)

**Cambios esperados:**
- `use cache: private` se estabiliza
- Compatible con `cookies()`
- Tag-based invalidation mejora

**Migración:**
```typescript
// Future: Migrate from React.cache() to 'use cache: private'
'use cache: private'  // ← When stable

export async function getPropertiesByBounds(bounds) {
  const user = await getCurrentUser()  // ✅ Now works
  return db.query(...)
}
```

**Decisión:** Monitorear releases, migrar cuando esté listo

---

### Opción B: Refactorizar Auth Pattern

**Esfuerzo:** Alto (2-3 días)

**Idea:**
- Separar autenticación de queries
- Usar `use cache: private` para contenido user-specific
- Usar `use cache: public` para contenido compartido

**Ejemplo:**
```typescript
// Public cache (no cookies)
'use cache: public'
export async function getPublicProperties() {
  return db.property.findMany({ where: { status: 'AVAILABLE' } })
}

// Private cache (with cookies)
'use cache: private'
export async function getUserFavorites(userId: string) {
  return db.favorite.findMany({ where: { userId } })
}
```

**Decisión:** Diferir hasta que sea necesario para scale

---

## 📊 Performance Benchmarks

### Actual (Sin Cache)

```
Scenario: Mapa con 50 propiedades
├─ Properties query: ~120ms
├─ Price distribution: ~80ms
├─ Duplicate properties query (sidebar): ~120ms
└─ Total: ~320ms
```

### Con React.cache()

```
Scenario: Mapa con 50 propiedades
├─ Properties query: ~120ms (first call)
├─ Price distribution: ~80ms
├─ Duplicate properties query: ~0ms (cache hit) ✅
└─ Total: ~200ms (36% faster)
```

### Con Cache Components (Futuro)

```
Scenario: Mapa con 50 propiedades (multiple users)
├─ Properties query: ~120ms (first user)
├─ Subsequent users: ~5ms (cache hit) ✅
└─ Cross-request cache: ~95% faster
```

---

## 🎯 Plan de Acción Recomendado

### Corto Plazo (Esta Semana)

**Prioridad 1:** Implementar React.cache() (1-2h)
- [ ] Crear `apps/web/lib/cache/properties-cache.ts`
- [ ] Wrap `propertyRepository.listByBounds()`
- [ ] Wrap `propertyRepository.getPriceDistribution()`
- [ ] Usar en `/mapa/page.tsx`
- [ ] Test con múltiples componentes
- [ ] Verificar logs de DB (debe ver reducción de queries)

**ROI:** Alto - 36% mejora con 2 horas de trabajo

---

### Medio Plazo (Próximas Semanas)

**Monitorear Next.js releases:**
- [ ] Subscribe a Next.js release notes
- [ ] Watch para `use cache: private` stability
- [ ] Test en feature branch cuando esté disponible

**ISR en más páginas:**
- [ ] Add `revalidate` a property detail pages
- [ ] Add `revalidate` a mapa page
- [ ] Tune intervals basado en analytics

---

### Largo Plazo (Próximos Meses)

**Cuando Next.js 16.1+ esté estable:**
- [ ] Evaluar `use cache: private` stability
- [ ] Crear plan de migración
- [ ] Migrate de React.cache() a Cache Components
- [ ] Implementar tag-based invalidation

**Otras optimizaciones:**
- [ ] Database query optimization (indexes)
- [ ] Image optimization pipeline
- [ ] CDN para assets estáticos

---

## 📁 Archivos Relacionados

**Código actual:**
- `packages/database/src/repositories/properties.ts` - Repository base
- `apps/web/app/(app)/mapa/page.tsx` - Mapa page (consumer)
- `apps/web/app/(public)/page.tsx` - Homepage con ISR

**Archivos a crear:**
- `apps/web/lib/cache/properties-cache.ts` - Cache wrappers
- `apps/web/lib/cache/README.md` - Cache strategy doc

**Documentación relacionada:**
- `docs/caching/CACHE_STATUS.md` - Historia completa
- `docs/caching/NEXT_16_CACHE_DEEP_DIVE.md` - Guía de Next.js 16 cache
- `docs/caching/CACHE_COMPONENTS_GUIDE.md` - Referencia (futuro)
- `.claude/07-technical-debt.md` - Plan original

---

## 🧪 Testing Plan

### Test 1: Request Deduplication

```typescript
// Test en browser console o test file
import { getCachedPropertiesByBounds } from '@/lib/cache/properties-cache'

const bounds = { ne_lat: -2.8, ne_lng: -79.0, sw_lat: -2.9, sw_lng: -79.1 }

console.time('First call')
await getCachedPropertiesByBounds(bounds)
console.timeEnd('First call') // ~120ms

console.time('Second call (cached)')
await getCachedPropertiesByBounds(bounds)
console.timeEnd('Second call (cached)') // ~0ms ✅
```

### Test 2: DB Query Count

```bash
# Check Prisma logs
# Should see 1 query, not 2+

# Before:
# prisma:query SELECT ... FROM Property (120ms)
# prisma:query SELECT ... FROM Property (120ms) ← Duplicate

# After:
# prisma:query SELECT ... FROM Property (120ms)
# ✅ No duplicate query
```

### Test 3: Performance Improvement

```typescript
// Measure total page load time
const start = performance.now()

// Render mapa page with multiple components using same data
await MapPage({ searchParams })

const duration = performance.now() - start
console.log(`Page rendered in ${duration}ms`)

// Expected: 30-40% faster than before
```

---

## 💡 Best Practices

### Cuándo Usar React.cache()

✅ **Use para:**
- Queries a DB que se repiten en mismo request
- Operaciones computacionalmente caras
- API calls externos en Server Components
- Cualquier función pura que puede beneficiarse de memoization

❌ **No usar para:**
- Funciones que dependen de request headers (usa `unstable_cache`)
- Mutations (POST, PUT, DELETE)
- Funciones con side effects
- Client Components (usar `useMemo` en su lugar)

### Naming Convention

```typescript
// Prefix con "getCached" para clarity
getCachedPropertiesByBounds()
getCachedPropertyById()
getCachedPriceDistribution()

// Not: getProperties() (ambiguo)
```

---

## 🎓 Learning Resources

**Next.js 16 Cache:**
- [Official Docs: Caching](https://nextjs.org/docs/app/guides/caching)
- [React cache() API](https://react.dev/reference/react/cache)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)

**Arquitectura:**
- `docs/caching/CACHE_STATUS.md` - Estado actual del proyecto
- `docs/caching/NEXT_16_CACHE_DEEP_DIVE.md` - Deep dive técnico

---

## ✅ Success Criteria

Al implementar React.cache(), verificar:

- [ ] DB query count reducido (check Prisma logs)
- [ ] Page load time mejorado (30-40% en mapa)
- [ ] No errores de TypeScript
- [ ] Tests pasan
- [ ] Auth sigue funcionando (no roto por cache)
- [ ] `revalidatePath()` sigue funcionando después de mutations

---

**Última actualización:** Noviembre 14, 2025
**Status:** Documentado, listo para implementación
**Next step:** Implementar React.cache() en mapa (1-2 horas)
