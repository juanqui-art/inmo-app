# Next.js 16 Cache Deep Dive - Guía Completa

**Documento:** Referencia educativa
**Última actualización:** Noviembre 9, 2025
**Basado en:** Documentación oficial Next.js 16.0.1 + Experiencia InmoApp

---

## 📚 Tabla de Contenidos

1. [Las 4 Capas de Cache](#las-4-capas-de-cache)
2. [Request Memoization](#request-memoization)
3. [Data Cache](#data-cache)
4. [Full Route Cache](#full-route-cache)
5. [Router Cache](#router-cache)
6. [Comparison: React.cache() vs Cache Components](#comparison-reactcache-vs-cache-components)
7. [Datos sobre fetch() Auto-Deduplication](#por-qué-fetch-se-deduplica-automáticamente)
8. [Por Qué Prisma NO Se Cachea](#por-qué-prisma-no-se-cachea-automáticamente)
9. [Ejemplos Prácticos para InmoApp](#ejemplos-prácticos-para-inmapp)

---

## Las 4 Capas de Cache

Next.js 16 tiene un sistema de cache en capas:

### Visualización:

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT (Navegador)                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Router Cache (In-memory, Sesión)                    │ │
│ │ - RSC Payload                                       │ │
│ │ - Duración: Sesión o 5 min                          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↑↓
┌─────────────────────────────────────────────────────────┐
│ SERVER                                                  │
│ ┌──────────────────────┐  ┌────────────────────────┐   │
│ │ Full Route Cache     │  │ Rendering             │   │
│ │ (Persistent, Disco)  │  │                       │   │
│ │ - HTML + RSC Payload │  │ ┌──────────────────┐  │   │
│ │ - Duración: Persist  │  │ │ Request Memo.    │  │   │
│ └──────────────────────┘  │ │ (In-memory)      │  │   │
│                            │ │ - Dedup. 1 req  │  │   │
│ ┌──────────────────────┐  │ │ - 100-300ms      │  │   │
│ │ Data Cache           │  │ └──────────────────┘  │   │
│ │ (Persistent, Disco)  │  │                       │   │
│ │ - fetch() results    │  │ ↓ Hit Data Cache      │   │
│ │ - Duración: Config   │  │                       │   │
│ └──────────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tabla Rápida:

| Cache | Ubicación | Tipo | Duración | Propósito |
|-------|-----------|------|----------|-----------|
| **Request Memoization** | Server RAM | In-memory | 1 request | Dedup. en render |
| **Data Cache** | Server Disco | Persistent | Config | Store fetch() |
| **Full Route Cache** | Server Disco | Persistent | Config | HTML + RSC |
| **Router Cache** | Client RAM | In-memory | Sesión | Navigation |

---

## Request Memoization

### ¿Qué es?

**Deduplicación automática de calls idénticos dentro de UN request.**

### Ubicación en el Diagrama:

```
REQUEST (100-300ms)
  ├─ Component A → fetch(url)  → Query 1 (340ms)
  ├─ Component B → fetch(url)  → Cache HIT (0ms) ⚡
  └─ Component C → fetch(url)  → Cache HIT (0ms) ⚡
REQUEST TERMINA → Cache se borra
```

### Características:

| Característica | Valor |
|---|---|
| **Deduplicación automática** | ✅ SÍ (para GET/HEAD fetch) |
| **Scope** | 1 request solamente |
| **Aplica a** | `fetch()` GET/HEAD automáticamente |
| **Para DB/Prisma** | ❌ NO (necesitas `React.cache()`) |
| **Duración** | ~100-300ms (lifetime de 1 request) |
| **Requiere config** | ❌ NO |
| **Compatible con cookies()** | ✅ SÍ |

### Ejemplo: fetch() Se Deduplica Automáticamente

```typescript
// AUTOMÁTICO - Sin hacer nada:
const user1 = await fetch('https://api.com/users/123')
const user2 = await fetch('https://api.com/users/123')
const user3 = await fetch('https://api.com/users/123')

// RESULTADO:
// - 1 HTTP request
// - user2 y user3 usan cached result (0ms)
// - Total: 1 query en lugar de 3
```

**Por qué funciona automáticamente:**
- Next.js extiende el `fetch` API
- Intercepta calls con same URL + options
- Almacena en memory la primera respuesta
- Retorna cached para subsecuentes

### Ejemplo: Prisma NO Se Deduplica

```typescript
// MANUAL REQUERIDO:
const user1 = await db.user.findUnique({ where: { id: 123 } })
const user2 = await db.user.findUnique({ where: { id: 123 } })
const user3 = await db.user.findUnique({ where: { id: 123 } })

// RESULTADO:
// - 3 queries a PostgreSQL
// - Cada una ~340ms
// - Total: 1,020ms (sin optimización)

// SOLUCIÓN: Envolver con React.cache()
const getCachedUser = cache(async (id) => {
  return db.user.findUnique({ where: { id } })
})

const user1 = await getCachedUser(123)  // Query 1 (340ms)
const user2 = await getCachedUser(123)  // Cache HIT (0ms)
const user3 = await getCachedUser(123)  // Cache HIT (0ms)

// RESULTADO:
// - 1 query a PostgreSQL
// - Total: 340ms (67% más rápido)
```

---

## Data Cache

### ¿Qué es?

**Cache persistente del servidor que guarda resultados de `fetch()`**

### Ubicación:

```
Full Route Cache → Data Cache ↔ External API/DB

Duración: Configurada (default indefinido)
Scope: Entre múltiples requests
Persistencia: Sí, hasta revalidación
```

### Cambio CRÍTICO en Next.js 16:

**Next.js 15 y anteriores:**
```typescript
await fetch('https://api.com/data')
// ✅ Cacheado automáticamente (force-cache)
```

**Next.js 16:**
```typescript
await fetch('https://api.com/data')
// ❌ NO cacheado por defecto (no-store en dynamic routes)
```

### Cómo Activar Data Cache:

#### **Opción 1: Force-cache**
```typescript
const data = await fetch('https://api.com/users', {
  cache: 'force-cache'  // ← Persistente indefinidamente
})
```

#### **Opción 2: Time-based Revalidation**
```typescript
const data = await fetch('https://api.com/products', {
  next: { revalidate: 3600 }  // ← Revalida cada hora
})
```

**Comportamiento (stale-while-revalidate):**
```
t=0     → Query API → Cache (1 hora)
t=30min → Cache HIT (sirve cached)
t=1h    → Cache MISS → Query API (background)
t=1h+10s → Cache HIT (ya actualizado)
```

#### **Opción 3: Tag-based Revalidation**
```typescript
const data = await fetch('https://api.com/posts', {
  next: { tags: ['posts', 'blog'] }  // ← Etiquetas
})

// Después, en Server Action:
import { revalidateTag } from 'next/cache'

export async function createPost(formData) {
  await db.post.create({...})
  revalidateTag('posts')  // ← Invalida cache
}
```

### Características:

| Característica | Valor |
|---|---|
| **Aplica a** | `fetch()` únicamente |
| **Aplica a Prisma/DB** | ❌ NO |
| **Duración** | Configurable (default: indefinido) |
| **Persistencia** | ✅ Entre requests |
| **Requiere config** | ✅ SÍ (debe ser explícito en v16) |
| **Compatible con cookies()** | ✅ SÍ |
| **Permite tag-based invalidation** | ✅ SÍ |

### Para InmoApp:

**Problema:**
```typescript
// Tu app usa Prisma, NO fetch()
const properties = await propertyRepository.list(bounds)
```

**Data Cache no aplica porque:**
- ❌ No es `fetch()`
- ❌ Prisma va directo a PostgreSQL
- ❌ Sin intervención de Next.js cache

---

## Full Route Cache

### ¿Qué es?

**Pre-renderización y cache de rutas completas en build time**

### Ubicación:

```
BUILD TIME (npm run build)
  ├─ Static rendering de rutas
  ├─ HTML generado
  ├─ Guardado en disco
  └─ Deployment

REQUEST TIME (usuario visita)
  ├─ Check: ¿Full Route Cache hit?
  ├─ SÍ → Sirve HTML cached (muy rápido)
  └─ NO → Renderiza dinámicamente
```

### Características:

| Característica | Valor |
|---|---|
| **Qué cachea** | HTML + RSC Payload |
| **Cuándo se cachea** | Build time (static routes) |
| **Duración** | Persistent (hasta redeployment) |
| **Compatible con cookies()** | ⚠️ NO (hace ruta dinámica) |
| **Permite revalidación** | ✅ SÍ (ISR) |

### En InmoApp:

**Implementado:**
```typescript
// apps/web/app/(public)/page.tsx
export const revalidate = 300  // ✅ ISR cada 5 min
```

**No implementado:**
```typescript
// apps/web/app/(public)/mapa/page.tsx
// ❌ Sin config → Dinámica en cada request

// apps/web/app/(public)/propiedades/[id-slug]/page.tsx
// ❌ Sin config → Dinámica en cada request
```

---

## Router Cache

### ¿Qué es?

**Cache del lado cliente (navegador) que almacena rutas visitadas**

### Ubicación:

```
CLIENT (Navegador)
  ├─ URL /page1 visitada → Guarda RSC Payload
  ├─ URL /page2 visitada → Guarda RSC Payload
  └─ Usuario navega a /page1 → Usa cached (no request al server)
```

### Características:

| Característica | Valor |
|---|---|
| **Ubicación** | Client-side (navegador) |
| **Tipo** | In-memory |
| **Duración** | Sesión (se borra con refresh) |
| **Scope** | Rutas navegadas |
| **Default** | Pages no cached, layouts cached |

### Comportamiento de Prefetching:

```typescript
<Link href="/products" prefetch={true}>
  // En background, Next.js prefetcha esta ruta
  // La guarda en Router Cache
  // Si el usuario hace click, es instantáneo
</Link>
```

---

## Comparison: React.cache() vs Cache Components

Esta es la decisión MÁS IMPORTANTE para InmoApp.

### React.cache() (HOY)

```typescript
import { cache } from 'react'

export const getCachedProperties = cache(async (bounds) => {
  return propertyRepository.list({ bounds })
})

// Uso:
const props1 = await getCachedProperties(bounds)
const props2 = await getCachedProperties(bounds)  // Cache hit
```

**Características:**

| Aspecto | React.cache() |
|---|---|
| **Status** | ✅ Stable (API oficial de React) |
| **Duración** | 1 request (~100ms) |
| **Scope** | Dentro del mismo render |
| **Compatible con cookies()** | ✅ SÍ |
| **Funciona con Prisma** | ✅ SÍ |
| **Requiere config** | ❌ NO |
| **Invalidación** | Automática (al terminar request) |
| **Propósito** | Request-level deduplication |

**Beneficios:**
- ✅ Compatible con autenticación actual
- ✅ Stable (no experimental)
- ✅ 67% reducción de queries (cuando hay duplicados)

**Limitaciones:**
- ❌ No persiste entre requests
- ❌ Cada nuevo usuario = nueva query

---

### Cache Components (`use cache`) (FUTURO)

```typescript
export async function getProperties(bounds) {
  'use cache'  // ← Directiva
  cacheTag('properties')
  cacheLife('hours')

  return propertyRepository.list({ bounds })
}
```

**Características:**

| Aspecto | use cache |
|---|---|
| **Status** | ⚠️ Experimental (Next.js 16.0.0) |
| **Duración** | Persistente (configurable) |
| **Scope** | Entre múltiples requests |
| **Compatible con cookies()** | ❌ NO (en v16.0.0) ❌ |
| **Funciona con Prisma** | ✅ SÍ (con `use cache`) |
| **Requiere config** | ✅ SÍ (`cacheComponents: true`) |
| **Invalidación** | Manual (tags + revalidateTag) |
| **Propósito** | Persistent cross-request caching |

**Beneficios:**
- ✅ Persistencia entre requests
- ✅ Fine-grained invalidation (tags)
- ✅ Oficial de Next.js

**Limitaciones:**
- ❌ Incompatible con `cookies()` en v16.0.0
- ⚠️ Experimental (puede cambiar)
- ❌ Requiere refactoring de auth

---

### La Decisión para InmoApp:

**HOY:** Use `React.cache()`
```typescript
✅ Works now
✅ Compatible with auth
❌ Request-level only
```

**MAÑANA (cuando Next.js 16.1+):** Consider `use cache: private`
```typescript
⏳ Wait for stabilization
✅ Compatible with cookies (private mode)
✅ Persistent caching
```

---

## Por Qué fetch() Se Deduplica Automáticamente

### El Código:

```typescript
// Sin hacer nada especial:
const user = await fetch('https://api.com/users/5')
const user = await fetch('https://api.com/users/5')
const user = await fetch('https://api.com/users/5')

// RESULTADO: 1 HTTP request (no 3)
```

### Por Qué Funciona:

**Next.js extiende el `fetch` API nativo:**

```javascript
// Pseudocódigo de Next.js:
const memoizationCache = new Map()

export function extendedFetch(url, options) {
  const cacheKey = `${url}:${JSON.stringify(options)}`

  // ¿Tengo esto en cache?
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey)  // ⚡ Cache HIT
  }

  // Si no, hago la request
  const result = originalFetch(url, options)
  memoizationCache.set(cacheKey, result)  // Guardo

  return result
}
```

### Características de la Auto-Deduplication:

| Característica | Valor |
|---|---|
| **Aplica a** | `fetch()` con GET o HEAD |
| **Aplica a POST/DELETE** | ❌ NO |
| **Scope** | 1 request únicamente |
| **Requiere config** | ❌ NO |
| **Automatizado** | ✅ SÍ |
| **Documentado** | ✅ SÍ (oficial de Next.js) |

### Cita Oficial de Next.js:

> "Next.js extends the [`fetch` API](#fetch) to automatically **memoize** requests that have the same URL and options. This means you can call a fetch function for the same data in multiple places in a React component tree while only executing it once."

---

## Por Qué Prisma NO Se Cachea Automáticamente

### El Código:

```typescript
// Llamadas idénticas:
const user = await db.user.findUnique({ where: { id: 5 } })
const user = await db.user.findUnique({ where: { id: 5 } })
const user = await db.user.findUnique({ where: { id: 5 } })

// RESULTADO: 3 queries a PostgreSQL ❌
```

### Por Qué NO Se Cachea:

**Prisma NO pasa por Next.js:**

```
fetch()  → Next.js wrapper → Can intercept → Can deduplicate
Prisma   → Direct DB call → No interception → No deduplication
```

### Flujo Actual vs Optimizado:

**ACTUAL (sin cache):**
```
Component A → db.query() → PostgreSQL (340ms) → data
Component B → db.query() → PostgreSQL (340ms) → data
Component C → db.query() → PostgreSQL (340ms) → data
Total: 1,020ms + 3 queries
```

**OPTIMIZADO (con React.cache()):**
```
Component A → cache(db.query) → PostgreSQL (340ms) → data → cache
Component B → cache(db.query) → Memory (0ms) → data ⚡
Component C → cache(db.query) → Memory (0ms) → data ⚡
Total: 340ms + 1 query (67% improvement)
```

### La Solución: React.cache()

```typescript
import { cache } from 'react'

// Wrap la función con cache()
export const getCachedUser = cache(async (id) => {
  return db.user.findUnique({ where: { id } })
})

// Ahora se deduplica:
const user1 = await getCachedUser(5)  // Query → PostgreSQL
const user2 = await getCachedUser(5)  // Hit → Memory
const user3 = await getCachedUser(5)  // Hit → Memory
```

### Por Qué No Es Automático:

1. **Prisma es un cliente de DB independiente**
   - No está integrado con Next.js
   - Next.js no puede interceptar las calls

2. **No hay estandarización en DB clients**
   - MongoDB, MySQL, Firebase, etc. = interfaces diferentes
   - Next.js no puede "entender" todas

3. **fetch() es estándar HTTP**
   - Todos los `fetch()` calls tienen la misma interfaz
   - Fácil de interceptar y deduplicar

4. **React.cache() es la solución**
   - Framework-agnostic
   - Funciona con cualquier async function
   - Debe ser manual pero simple

---

## Ejemplos Prácticos para InmoApp

### Caso 1: Sin Cache (Actual)

```typescript
// apps/web/app/(public)/mapa/page.tsx

export default async function MapPage(props) {
  const bounds = extractBoundsFromProps(props)

  // Llamada 1: Query a PostgreSQL
  const { properties } = await propertyRepository.list({
    filters: { bounds }
  })

  // Llamada 2: En otro componente o lógica
  // Query 2 a PostgreSQL (mismo bounds)

  // Llamada 3: En otro componente
  // Query 3 a PostgreSQL (mismo bounds)

  // RESULTADO: 3 queries (si hay duplicados)
}
```

**Flujo:**
```
User pans map 3 times with same bounds:
  Query 1: 340ms
  Query 2: 340ms
  Query 3: 340ms
Total: 1,020ms ❌
```

---

### Caso 2: Con React.cache() (Recomendado)

**Archivo 1: Cache wrapper**
```typescript
// apps/web/lib/cache/properties-cache.ts

import { cache } from 'react'
import { propertyRepository } from '@repo/database'

// Wrap con cache()
export const getCachedPropertiesByBounds = cache(
  async (bounds: {
    minLatitude: number
    maxLatitude: number
    minLongitude: number
    maxLongitude: number
  }) => {
    console.log('📊 Query: Fetching properties by bounds...')

    const { properties, count } = await propertyRepository.list({
      filters: { bounds },
      take: 1000
    })

    return { properties, count }
  }
)
```

**Archivo 2: Usar en página**
```typescript
// apps/web/app/(public)/mapa/page.tsx

import { getCachedPropertiesByBounds } from '@/lib/cache/properties-cache'

export default async function MapPage(props) {
  const bounds = extractBoundsFromProps(props)

  // Llamada 1: Query a PostgreSQL
  const { properties } = await getCachedPropertiesByBounds(bounds)

  // Llamada 2: Con mismo bounds
  // Hit de cache (0ms) ⚡

  // Llamada 3: Con mismo bounds
  // Hit de cache (0ms) ⚡

  return <Map properties={properties} />
}
```

**Flujo:**
```
User pans map 3 times with same bounds:
  Query 1: 340ms
  Cache HIT: 0ms  ⚡
  Cache HIT: 0ms  ⚡
Total: 340ms (67% improvement) ✅
```

**Impacto real:**
- Sin cache: 1,020ms
- Con cache: 340ms
- Mejora: 680ms (66% más rápido)

---

### Caso 3: Con unstable_cache (Legacy Alternative)

```typescript
// apps/web/lib/cache/properties-cache.ts

import { unstable_cache } from 'next/cache'
import { propertyRepository } from '@repo/database'

// Persistencia entre requests + tagging
export const getCachedPropertiesByBounds = unstable_cache(
  async (bounds) => {
    console.log('📊 Query: Fetching properties by bounds...')

    return propertyRepository.list({
      filters: { bounds },
      take: 1000
    })
  },
  ['properties-by-bounds'],  // Cache key
  {
    tags: ['properties'],      // Para invalidación
    revalidate: 3600           // 1 hora
  }
)
```

**Invalidar en Server Action:**
```typescript
// apps/web/app/actions/properties.ts

import { revalidateTag } from 'next/cache'

export async function createPropertyAction(formData) {
  const newProperty = await propertyRepository.create({...})

  // Invalida el cache
  revalidateTag('properties')

  revalidatePath('/mapa')
}
```

**Flujo:**
```
Usuario 1 pans mapa:
  Query 1: 340ms → guardado en Data Cache (1 hora)

Usuario 2 pans mapa (5 min después):
  Cache HIT: 0ms ⚡ (sin query)

Usuario 3 crea propiedad:
  revalidateTag('properties') → invalida

Usuario 4 pans mapa:
  Query 2: 340ms (cache fue invalidado)
```

---

### Caso 4: Con use cache (Futuro, cuando se arregle)

```typescript
// apps/web/app/(public)/mapa/page.tsx
// (Requiere Next.js 16.1+)

import { cacheTag, cacheLife } from 'next/cache'

export default async function MapPage(props) {
  const bounds = extractBoundsFromProps(props)

  const properties = await getMapProperties(bounds)

  return <Map properties={properties} />
}

async function getMapProperties(bounds) {
  'use cache'  // ← Directiva

  cacheTag('map-properties')  // ← Para invalidación
  cacheLife({ stale: 60 * 15 })  // ← 15 minutos

  return propertyRepository.list({
    filters: { bounds },
    take: 1000
  })
}
```

---

## Tabla Comparativa Final

### Para tu decisión:

| Aspecto | React.cache() | unstable_cache | use cache |
|---------|---------------|---|---|
| **Estabilidad** | ✅ Stable | ⚠️ Unstable | ⚠️ Experimental |
| **HOY funciona** | ✅ SÍ | ✅ SÍ | ❌ Con caveats |
| **Compatible con cookies()** | ✅ SÍ | ✅ SÍ | ❌ NO (v16.0) |
| **Request deduplication** | ✅ SÍ | ✅ SÍ | ✅ SÍ |
| **Persistent (multi-request)** | ❌ NO | ✅ SÍ | ✅ SÍ |
| **Tag-based invalidation** | ❌ NO | ✅ SÍ | ✅ SÍ |
| **Duración** | 1 request | Configurable | Configurable |
| **Requiere config** | ❌ NO | ❌ NO | ✅ SÍ |
| **Documentación** | ✅ Oficial | ⚠️ Partial | ✅ Oficial |
| **Recomendación InmoApp** | ✅ HOY | ⏳ Alternative | ⏳ Futuro |

---

## Conclusión y Recomendación

### Para InmoApp HOY:

**Usa `React.cache()`**

```typescript
import { cache } from 'react'

export const getCachedPropertiesByBounds = cache(async (bounds) => {
  return propertyRepository.list({ bounds })
})
```

**Beneficios:**
- ✅ 67% más rápido en casos con deduplicación
- ✅ Compatible con autenticación actual
- ✅ Zero config, stable API
- ✅ Implementable en 1-2 horas

**Limitaciones aceptables:**
- ❌ Solo dentro de 1 request
- ❌ No persiste entre usuarios
- ✅ Pero NextJS 16 no tiene mejor opción hoy

### Para InmoApp FUTURO:

**Monitorea Next.js 16.1+**
- Cuando arreglen `use cache` + `cookies()`
- Considera migración a `use cache: private`
- Agregar persistent caching + tag-based invalidation

### La Verdad:

Cache es **complejo pero necesario**. Next.js 16 lo hace tan fácil como posible.

- ✅ `React.cache()` es lo más simple
- ✅ Funciona con Prisma sin cambios
- ✅ Compatible con tu auth actual
- ⏳ Otras opciones vienen después

**Start simple, scale when needed.**
