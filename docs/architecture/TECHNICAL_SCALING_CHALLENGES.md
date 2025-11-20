# Problemas Técnicos de Escalamiento - InmoApp

> **Análisis de cuellos de botella y soluciones técnicas según crece el tráfico**
> Complemento a: `docs/business/COST_SCALING_ANALYSIS.md`
> Actualizado: Noviembre 20, 2025

---

## 📊 Resumen Ejecutivo

Este documento identifica los **principales problemas técnicos** que surgirán a medida que InmoApp escale de 100 → 100,000 usuarios, y proporciona soluciones pragmáticas.

**Contexto:**
- Stack: Next.js 16 + Prisma + PostgreSQL + Supabase + Mapbox
- Architecture: Server Components + Server Actions + Edge Middleware
- Current scale: MVP (0-1,000 usuarios)

**Problemas críticos identificados:**
1. 🔴 **Database connection pooling** (crítico a 5k+ usuarios)
2. 🔴 **Query performance sin índices compuestos** (crítico a 10k+ propiedades)
3. 🟡 **Map rendering con 1000+ markers** (importante a 5k+ propiedades)
4. 🟡 **Image loading sin CDN** (importante a 50k+ usuarios)
5. 🟡 **OpenAI rate limits** (importante a 5k+ búsquedas/día)
6. 🟢 **State management escalabilidad** (menor preocupación)

---

## 🎯 Tabla de Problemas por Escala

| Escala | Problema Principal | Impacto | Solución Requerida | Tiempo Est. |
|--------|-------------------|---------|-------------------|-------------|
| **100-1k** | Emails no entregados | 🔴 Crítico | Domain verification | 15 min |
| **1k-5k** | Queries lentas (map bounds) | 🟡 Alto | Composite indexes | 2-3h |
| **5k-10k** | Connection pool exhaustion | 🔴 Crítico | Supabase Pro + pooler config | 1-2h |
| **10k-25k** | Map rendering lento (1k+ markers) | 🟡 Alto | Viewport-based pagination | 4-6h |
| **25k-50k** | Image bandwidth excesivo | 🟡 Alto | Cloudflare R2 + Images | 8-12h |
| **50k-100k** | OpenAI rate limits | 🟡 Medio | Caching + Batch API | 4-6h |
| **100k+** | Database size (20GB+) | 🔴 Crítico | Partitioning + archiving | 16-24h |

---

## 🗄️ 1. Problemas de Database

### 1.1 Connection Pool Exhaustion (🔴 CRÍTICO a 5k+ usuarios)

**Problema:**
Supabase Free tier tiene límite de **100 conexiones concurrentes**. Con serverless functions (Next.js), cada request puede abrir múltiples conexiones.

**Cuándo ocurre:**
- ~5,000 usuarios activos simultáneamente
- ~500 requests/segundo (picos de tráfico)
- Supabase empieza a rechazar conexiones: `Error: too many connections`

**Solución actual (parcial):**
```typescript
// packages/database/prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")  // Pooler en puerto 6543 (Transaction Mode)
  directUrl = env("DIRECT_URL")    // Direct connection (solo migraciones)
}
```

✅ **Ya usas Pooler** (puerto 6543) - esto ayuda, pero no es suficiente a gran escala.

**Problema restante:**
- Free tier: 100 max connections
- Pro tier ($25/mes): 200 max connections
- Cada serverless function puede mantener conexiones abiertas

**Solución completa:**

#### Fase 1: Supabase Pro + Connection Management (2h)
```typescript
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client'

// OPTIMIZATION: Global singleton to reuse connections across requests
declare global {
  var prisma: PrismaClient | undefined
}

export const db = global.prisma ?? new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Pooler (puerto 6543)
    },
  },
})

if (process.env.NODE_ENV !== 'production') global.prisma = db

// CRITICAL: Set connection timeout to prevent hanging connections
// Vercel serverless functions have 10s timeout by default
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 9000 // 9s (before Vercel 10s limit)
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
    ),
  ])
}
```

#### Fase 2: Query Timeout Wrapper (1h)
```typescript
// packages/database/src/repositories/properties.ts
export class PropertyRepository {
  async findById(id: string): Promise<SerializedProperty | null> {
    // Wrap all queries with timeout to prevent connection leaks
    return withTimeout(findByIdCached(id))
  }
}
```

**Resultado esperado:**
- Connection reuse: 80% reducción en nuevas conexiones
- Timeout protection: Previene hanging connections
- Supabase Pro: 200 max connections = 10k+ usuarios simultáneos

---

### 1.2 Query Performance - Composite Indexes (🔴 CRÍTICO a 10k+ propiedades)

**Problema:**
La query más frecuente (`findInBounds`) filtra por:
1. Geographic bounds (latitude + longitude)
2. Filters (transactionType, category, price, bedrooms, etc.)

**Query actual:**
```typescript
// packages/database/src/repositories/properties.ts:218
const properties = await db.property.findMany({
  where: {
    latitude: { gte: -2.953, lte: -2.847 },
    longitude: { gte: -79.053, lte: -78.947 },
    transactionType: 'SALE',
    price: { gte: 50000, lte: 300000 },
    bedrooms: { gte: 3 },
    status: 'AVAILABLE',
  },
  take: 1000,
  orderBy: { createdAt: 'desc' },
})
```

**Índices actuales:**
```prisma
// packages/database/prisma/schema.prisma
model Property {
  // ...
  @@index([latitude, longitude])        // ✅ Geospatial index
  @@index([transactionType, status])    // ✅ Transaction + status
  @@index([category])                   // ✅ Category
  @@index([city, state])                // ✅ City + state
  @@index([price])                      // ✅ Price
}
```

**Problema:**
PostgreSQL puede usar **solo 1 índice por query** (en la mayoría de los casos). Si filtramos por lat/lng + price + transactionType, el optimizer elige 1 índice y hace **full scan** en el resto.

**Análisis de Performance:**

| Propiedades | Sin optimización | Con composite index | Mejora |
|-------------|------------------|---------------------|--------|
| **1,000** | ~50ms | ~20ms | 60% |
| **10,000** | ~500ms | ~100ms | 80% |
| **50,000** | ~2,500ms | ~300ms | 88% |
| **100,000** | ~5,000ms | ~500ms | 90% |

**Solución: Composite Indexes (2-3h)**

```prisma
// packages/database/prisma/schema.prisma
model Property {
  // ... existing fields

  // NEW: Composite indexes for most common query patterns
  @@index([status, transactionType, latitude, longitude], name: "idx_map_query_optimal")
  @@index([status, transactionType, price], name: "idx_list_filter_price")
  @@index([status, city, transactionType], name: "idx_list_filter_city")
  @@index([agentId, status, createdAt], name: "idx_agent_dashboard")

  // Keep existing indexes for backward compatibility
  @@index([latitude, longitude])
  @@index([transactionType, status])
  @@index([category])
  @@index([city, state])
  @@index([price])
}
```

**Migración:**
```bash
cd packages/database
bunx prisma migrate dev --name add_composite_indexes
```

**Trade-offs:**
- ✅ Queries 80-90% más rápidas
- ❌ Índices usan más storage (~5-10% adicional)
- ❌ Inserts/updates ligeramente más lentos (~5-10%)

**Recomendación:**
Implementar cuando tengas **>5,000 propiedades** o queries **>200ms**.

---

### 1.3 N+1 Query Problem (🟢 RESUELTO)

**Estado:** ✅ Ya implementado

```typescript
// packages/database/src/repositories/properties.ts:40-58
export const propertySelect = {
  // ... property fields
  images: {
    select: { id: true, url: true, alt: true, order: true },
    orderBy: { order: "asc" as const },
  },
  agent: {
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  },
} satisfies Prisma.PropertySelect;
```

✅ **Correcto:** Usa `select` con relaciones incluidas (1 query en vez de N+1).

**No se requiere acción.**

---

### 1.4 Database Size Growth (🟡 IMPORTANTE a 50k+ propiedades)

**Proyección de crecimiento:**

| Propiedades | Images (avg 5/prop) | Users | Total DB Size | Supabase Tier |
|-------------|---------------------|-------|---------------|---------------|
| **1,000** | 5,000 | 500 | ~500MB | Free (500MB) ⚠️ |
| **5,000** | 25,000 | 2,500 | ~2.5GB | Pro (8GB) ✅ |
| **10,000** | 50,000 | 5,000 | ~5GB | Pro (8GB) ⚠️ |
| **25,000** | 125,000 | 12,500 | ~12GB | Pro + extra storage |
| **50,000** | 250,000 | 25,000 | ~25GB | Pro + extra storage |

**Problema:**
Supabase Pro incluye **8GB database**. Después de eso, pagas **$0.125/GB/mes**.

**Soluciones:**

#### Opción 1: Archive de propiedades vendidas/alquiladas (4-6h)
```prisma
// packages/database/prisma/schema.prisma
model PropertyArchive {
  id              String           @id @default(uuid())
  // ... same fields as Property
  archivedAt      DateTime         @default(now()) @map("archived_at")
  originalId      String           @unique @map("original_id")

  @@map("property_archives")
}
```

```typescript
// packages/database/src/repositories/properties.ts
export class PropertyRepository {
  /**
   * Archive properties sold/rented >6 months ago
   * Moves to PropertyArchive table (cheaper cold storage)
   */
  async archiveOldProperties(): Promise<number> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return db.$transaction(async (tx) => {
      // Find old properties
      const oldProperties = await tx.property.findMany({
        where: {
          status: { in: ['SOLD', 'RENTED'] },
          updatedAt: { lte: sixMonthsAgo },
        },
      })

      // Copy to archive
      await tx.propertyArchive.createMany({
        data: oldProperties.map(p => ({ ...p, originalId: p.id })),
      })

      // Delete from main table
      await tx.property.deleteMany({
        where: { id: { in: oldProperties.map(p => p.id) } },
      })

      return oldProperties.length
    })
  }
}
```

**Resultado esperado:**
- Reduce database size en **30-40%** (propiedades inactivas archivadas)
- Archive table puede estar en **cheaper storage tier**
- Queries activas 30-40% más rápidas (menos data to scan)

#### Opción 2: Database Partitioning (16-24h, avanzado)
```sql
-- Partition by city for geographic isolation
CREATE TABLE properties_cuenca PARTITION OF properties
  FOR VALUES IN ('Cuenca');

CREATE TABLE properties_gualaceo PARTITION OF properties
  FOR VALUES IN ('Gualaceo');

-- Partition by status for hot/cold data separation
CREATE TABLE properties_available PARTITION OF properties
  FOR VALUES IN ('AVAILABLE');

CREATE TABLE properties_sold PARTITION OF properties
  FOR VALUES IN ('SOLD', 'RENTED');
```

**Trade-offs:**
- ✅ Queries 50-70% más rápidas (solo scan particiones relevantes)
- ✅ Backup/restore más eficiente
- ❌ Requiere migración compleja
- ❌ Prisma soporte limitado (requiere raw SQL)

**Recomendación:**
- **<25k propiedades:** No es necesario
- **25k-50k propiedades:** Implementar archiving
- **>50k propiedades:** Evaluar partitioning

---

## 🗺️ 2. Problemas de Mapbox / Frontend

### 2.1 Map Rendering Performance (🟡 IMPORTANTE a 5k+ propiedades)

**Problema:**
Mapbox clustering funciona bien hasta ~1,000 markers. Con más markers:
- Initial render: 2-3 segundos
- Pan/zoom: Lag perceptible
- Memory usage: 200-300MB

**Query actual:**
```typescript
// packages/database/src/repositories/properties.ts:174
take: 1000, // Default limit for map queries
```

**Análisis de performance:**

| Markers | Load Time | Memory | FPS (pan/zoom) |
|---------|-----------|--------|----------------|
| **500** | ~500ms | ~100MB | 60 FPS ✅ |
| **1,000** | ~1,000ms | ~200MB | 45-60 FPS ⚠️ |
| **2,000** | ~2,500ms | ~400MB | 30-45 FPS 🔴 |
| **5,000** | ~6,000ms | ~1GB | 15-30 FPS 🔴 |

**Solución 1: Viewport-Based Pagination (4-6h)**

En vez de cargar todas las propiedades del viewport, carga por "tiles" o reduce el límite dinámicamente según zoom:

```typescript
// apps/web/lib/utils/map-helpers.ts
export function calculateOptimalLimit(zoomLevel: number): number {
  // Higher zoom = smaller viewport = fewer properties needed
  if (zoomLevel >= 15) return 200  // Street level
  if (zoomLevel >= 13) return 500  // Neighborhood level
  if (zoomLevel >= 11) return 1000 // City level
  return 2000 // Region level
}
```

```typescript
// apps/web/app/actions/properties.ts
export async function getPropertiesInBounds(params: {
  bounds: { ne_lat, ne_lng, sw_lat, sw_lng }
  zoomLevel: number
  filters?: PropertyFilters
}) {
  const optimalLimit = calculateOptimalLimit(params.zoomLevel)

  return propertyRepository.findInBounds({
    ...params.bounds,
    filters: params.filters,
    take: optimalLimit,
  })
}
```

**Resultado esperado:**
- Load time reducido en **60-70%** (menos markers)
- Memory usage reducido en **50-60%**
- FPS estable en 60 (smooth pan/zoom)

**Solución 2: Server-Side Clustering (8-12h, avanzado)**

En vez de enviar 1000 markers al frontend y clustearlos en el cliente, clustea en el backend con PostGIS:

```sql
-- Requiere PostGIS extension en Supabase
CREATE EXTENSION IF NOT EXISTS postgis;

-- ST_ClusterKMeans para clustering geográfico
SELECT
  ST_X(ST_Centroid(geom)) as lng,
  ST_Y(ST_Centroid(geom)) as lat,
  COUNT(*) as property_count,
  AVG(price) as avg_price
FROM (
  SELECT
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) as geom,
    price
  FROM properties
  WHERE status = 'AVAILABLE'
    AND latitude BETWEEN -2.953 AND -2.847
    AND longitude BETWEEN -79.053 AND -78.947
) subq
GROUP BY ST_ClusterKMeans(geom, 50) -- 50 clusters
```

**Trade-offs:**
- ✅ Clustering 10x más rápido (backend optimizado)
- ✅ Menos data transfer (cluster summaries vs full properties)
- ❌ Requiere PostGIS (Supabase Pro)
- ❌ Complexity aumenta significativamente

**Recomendación:**
- **<2k propiedades:** No hacer nada (funciona bien)
- **2k-5k propiedades:** Viewport-based pagination
- **>5k propiedades:** Server-side clustering

---

### 2.2 Map Loads - Costos de Mapbox (🟡 IMPORTANTE a 16k+ usuarios)

**Problema:**
Cada inicialización de mapa = 1 map load. Límite gratuito: **50,000 map loads/mes**.

Con 3 map loads/usuario promedio:
- 16,667 usuarios = 50,000 map loads = Límite alcanzado
- Después de eso: Pricing no público, pay-as-you-go

**Solución 1: Lazy Loading (2-3h)**

No cargar el mapa hasta que el usuario scrollee a la sección:

```typescript
// apps/web/components/map/lazy-map-wrapper.tsx
'use client'

import { useInView } from 'react-intersection-observer'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./map-view'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Don't render on server
})

export function LazyMapWrapper({ properties }: { properties: MapProperty[] }) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Only load once
    threshold: 0.1,    // Load when 10% visible
  })

  return (
    <div ref={ref} className="h-[600px]">
      {inView ? <MapView properties={properties} /> : <MapSkeleton />}
    </div>
  )
}
```

**Resultado esperado:**
- Reduce map loads en **30-40%** (usuarios que no scrollean)
- Page load más rápido (no bloquea con Mapbox init)

**Solución 2: Static Map Preview (4-6h)**

En listing pages, muestra static map image en vez de interactive map:

```typescript
// apps/web/components/property/static-map-preview.tsx
export function StaticMapPreview({
  latitude,
  longitude,
  zoom = 14
}: {
  latitude: number
  longitude: number
  zoom?: number
}) {
  // Mapbox Static Images API (no cuenta como map load!)
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${longitude},${latitude},${zoom},0/400x300@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`

  return (
    <Image
      src={staticMapUrl}
      alt="Property location"
      width={400}
      height={300}
      // Click to load interactive map
      onClick={() => loadInteractiveMap()}
    />
  )
}
```

**Trade-offs:**
- ✅ Static images NO cuentan como map loads
- ✅ Cache-able (CDN friendly)
- ❌ No interactivo (users esperan pan/zoom)

**Recomendación:**
- **Property detail page:** Interactive map (high engagement)
- **Property listing cards:** Static map preview (low engagement)

---

### 2.3 Frontend State Management (🟢 MENOR PREOCUPACIÓN)

**Estado actual:**
```typescript
// apps/web/stores/property-grid-store.ts
// Uses Zustand for client-side state
```

**Problema potencial:**
Con 1000+ properties en memoria, Zustand puede ser lento en re-renders.

**Solución (si se vuelve problema):**
Virtualización con `react-window` o `tanstack-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

export function PropertyGrid({ properties }: { properties: Property[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: properties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Height of each card
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[800px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const property = properties[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PropertyCard property={property} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Resultado esperado:**
- Solo renderiza 10-15 cards visibles (vs 1000)
- Scroll performance 10x mejor
- Memory usage 80% menor

**Recomendación:**
Implementar **solo si** experimentas lag con >500 properties en la grid.

---

## 🖼️ 3. Problemas de Images / Storage

### 3.1 Image Loading - Bandwidth (🟡 IMPORTANTE a 25k+ usuarios)

**Problema:**
Supabase Storage cobra **$0.09/GB egress** después de 250GB/mes (Pro tier).

Con 5 images/property × 1MB average:
- 10k propiedades = 50k images = 50GB storage
- 25k usuarios × 10 images viewed = 250GB egress = Límite alcanzado
- Después: $0.09/GB = $45/mes por cada 500GB adicionales

**Análisis de bandwidth:**

| Usuarios/mes | Images viewed | Egress | Supabase Cost |
|--------------|---------------|--------|---------------|
| **5k** | 50k | ~50GB | $0 (dentro de free 250GB) |
| **25k** | 250k | ~250GB | $0 (límite alcanzado) |
| **50k** | 500k | ~500GB | $22.50/mes |
| **100k** | 1M | ~1TB | $67.50/mes |

**Solución: Cloudflare R2 + Images (8-12h)**

Cloudflare R2 tiene **egress gratuito** + optimización automática de imágenes:

```typescript
// packages/storage/src/cloudflare-client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2(file: File, key: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: 'inmoapp-images',
    Key: key,
    Body: file,
    ContentType: file.type,
  }))

  // Return Cloudflare Images URL (automatic optimization)
  return `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}/${key}/public`
}
```

**Cloudflare Images features:**
- ✅ Automatic WebP/AVIF conversion
- ✅ On-the-fly resizing (`/w=400,h=300`)
- ✅ Global CDN caching
- ✅ **Egress gratuito**

**Pricing:**
- R2 Storage: $0.015/GB/mes (vs $0.021 Supabase)
- Images: $5/mes por 100k transformaciones
- Egress: **GRATIS** (vs $0.09/GB Supabase)

**ROI:**
A 100k usuarios (1M images/mes):
- Supabase: $67.50/mes egress + $21/mes storage = $88.50/mes
- Cloudflare: $0 egress + $15/mes storage + $5/mes images = $20/mes
- **Ahorro: $68.50/mes (77%)**

**Migración:**
1. Setup Cloudflare R2 bucket
2. Migrate existing images (script)
3. Update `PropertyImage.url` schema to accept R2 URLs
4. Deploy new upload code

**Recomendación:**
Implementar cuando alcances **>200GB egress/mes** (~20k usuarios).

---

## 🤖 4. Problemas de OpenAI / AI Search

### 4.1 Rate Limits (🟡 IMPORTANTE a 10k+ búsquedas/día)

**Problema:**
OpenAI tiene rate limits según tier:

| Tier | Requests/min | Tokens/min | Cost |
|------|--------------|------------|------|
| **Free** | 3 | 40k | $0 |
| **Tier 1** | 500 | 2M | After $5 spent |
| **Tier 2** | 5k | 10M | After $50 spent |
| **Tier 3** | 10k | 30M | After $500 spent |

**Uso actual por búsqueda:**
- System prompt: ~1,500 tokens
- User query: ~50 tokens
- Response: ~300 tokens
- **Total: ~1,850 tokens**

Con 10k búsquedas/día:
- 10k × 1,850 = 18.5M tokens/día = 617k tokens/min (promedio)
- **Tier 2 required** (10M tokens/min)

**Problema de rate limiting:**
Si múltiples usuarios buscan simultáneamente:
- Burst de 100 búsquedas/min = 185k tokens/min = ✅ OK en Tier 1
- Burst de 500 búsquedas/min = 925k tokens/min = ⚠️ Cerca del límite Tier 1
- Burst de 1000 búsquedas/min = 1.85M tokens/min = 🔴 Requiere Tier 2

**Solución 1: Search Result Caching (4-6h)**

Cache resultados de búsquedas populares:

```typescript
// apps/web/lib/ai/search-cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function getCachedSearch(query: string): Promise<ParseResult | null> {
  // Normalize query (lowercase, trim)
  const normalizedQuery = query.toLowerCase().trim()

  // Check cache (24h TTL)
  const cached = await redis.get<ParseResult>(`search:${normalizedQuery}`)
  return cached
}

export async function setCachedSearch(query: string, result: ParseResult): Promise<void> {
  const normalizedQuery = query.toLowerCase().trim()
  await redis.set(`search:${normalizedQuery}`, result, { ex: 86400 }) // 24h
}
```

```typescript
// apps/web/lib/ai/search-parser.ts
export async function parseSearchQuery(query: string): Promise<ParseResult> {
  // Check cache first
  const cached = await getCachedSearch(query)
  if (cached) {
    console.log('🎯 Cache hit:', query)
    return cached
  }

  // Call OpenAI (existing code)
  const result = await openai.chat.completions.create({ ... })

  // Cache result
  await setCachedSearch(query, result)

  return result
}
```

**Resultado esperado:**
- Cache hit rate: 30-40% (búsquedas repetidas)
- API calls reducidos en 30-40%
- Latencia 10x mejor (Redis vs OpenAI)

**Costo:**
- Upstash Redis Free: 10k commands/día
- Upstash Redis Pro ($10/mes): 100k commands/día

**Solución 2: Batch API (50% descuento)**

Para búsquedas no urgentes (análisis, refinamiento):

```typescript
// apps/web/lib/ai/batch-search.ts
export async function queueBatchSearch(queries: string[]): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Create batch job
  const batch = await openai.batches.create({
    input_file_id: await uploadBatchFile(queries),
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
  })

  return batch.id // Poll for results later
}
```

**Trade-offs:**
- ✅ 50% descuento ($0.15 → $0.075 per 1M tokens)
- ❌ Latencia: 1-24 horas (no real-time)

**Recomendación:**
- Real-time search: Use caching
- Análisis batch (recomendaciones, trending searches): Use Batch API

---

### 4.2 Duplicate API Call (🟢 IDENTIFICADO, pendiente fix)

**Problema conocido:**
Ver `archive/sessions/AI-SEARCH-CONSOLIDATED.md` - Session 3 identificó duplicate API call en inline search.

**Impacto:**
- 2x costo de OpenAI (minor, pero innecesario)
- 2x latencia (user-facing)

**Solución:**
Ya documentado en debt técnico. Fix estimado: 1-2h.

---

## 🔐 5. Problemas de Auth / Security

### 5.1 Session Management a Escala (🟢 MANEJADO)

**Estado actual:**
Supabase Auth maneja sessions automáticamente con JWT tokens.

**Límites:**
- Free tier: 50k MAUs
- Pro tier: 100k MAUs
- Después: $0.00325/MAU

**Problema potencial:**
Con 100k+ usuarios, auth puede ser cuello de botella en:
1. Token refresh (cada 1 hora)
2. Permission checks (cada request)

**Solución (si se vuelve problema):**

Edge caching de user roles:

```typescript
// apps/web/lib/auth-cache.ts
import { Redis } from '@upstash/redis'

export async function getCachedUserRole(userId: string): Promise<UserRole | null> {
  const cached = await redis.get<UserRole>(`role:${userId}`)
  return cached
}

export async function setCachedUserRole(userId: string, role: UserRole): Promise<void> {
  await redis.set(`role:${userId}`, role, { ex: 3600 }) // 1h TTL
}
```

**Resultado esperado:**
- Permission checks 10x más rápidos
- Reduce load en Supabase Auth

**Recomendación:**
Implementar **solo si** auth checks son >50ms consistentemente.

---

### 5.2 Rate Limiting (🔴 CRÍTICO - Actualmente NO implementado)

**Problema:**
Actualmente NO hay rate limiting. Un atacante puede:
- Spam AI search ($$$ costos OpenAI)
- DDoS endpoints (exhaust DB connections)
- Brute force login (account takeover)

**Solución: Upstash Rate Limiting (4-6h)**

```typescript
// apps/web/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Different limits for different endpoints
export const rateLimits = {
  aiSearch: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 searches/min
  }),

  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '5 m'), // 5 login attempts/5min
  }),

  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests/min
  }),
}
```

```typescript
// apps/web/app/actions/ai-search.ts
export async function searchPropertiesWithAI(query: string) {
  const ip = headers().get('x-forwarded-for') || 'unknown'

  // Rate limit check
  const { success } = await rateLimits.aiSearch.limit(ip)
  if (!success) {
    throw new Error('Too many requests. Please try again later.')
  }

  // Existing code...
}
```

**Límites recomendados:**

| Endpoint | Limit | Razón |
|----------|-------|-------|
| AI Search | 10/min | Prevent OpenAI abuse |
| Login | 5/5min | Prevent brute force |
| API (general) | 100/min | Prevent DDoS |
| Property creation | 5/hour | Prevent spam |

**Costo:**
- Upstash Redis Free: 10k commands/día = ~300 users/día
- Upstash Redis Pro ($10/mes): 100k commands/día = ~3k users/día
- Upstash Redis Enterprise ($40/mes): 1M commands/día = ~30k users/día

**Recomendación:**
Implementar **INMEDIATAMENTE** antes de lanzar a producción.

---

## 📊 6. Monitoring & Observability

### 6.1 Falta de Logging Estructurado (🔴 CRÍTICO)

**Problema:**
Ver `docs/technical-debt/06-LOGGING-MONITORING.md` para análisis completo.

**Resumen:**
- ❌ No hay logging estructurado
- ❌ No hay error tracking (Sentry)
- ❌ No hay performance monitoring
- ❌ No hay alertas

**Impacto a escala:**
- Debugging 10x más lento (sin context)
- Downtime detection retrasado (sin alertas)
- Performance regressions no detectadas

**Solución:**
Ver `docs/technical-debt/06-LOGGING-MONITORING.md` - Plan completo de 22h.

**ROI:**
$1,244/mes ahorro vs $56/mes tooling cost = 22x ROI.

---

## 🎯 Roadmap de Implementación por Escala

### 0-1,000 Usuarios (MVP Launch)

**Prioridad 🔴 CRÍTICA:**
1. ✅ Email domain verification (15 min) - BLOCKER
2. ✅ Rate limiting básico (4-6h) - SECURITY
3. ✅ Error tracking (Sentry) (3h) - DEBUGGING

**Prioridad 🟡 ALTA:**
4. ✅ Structured logging (Pino) (3h)
5. ✅ Query timeouts (1h)

**Total:** ~14-17h

---

### 1,000-5,000 Usuarios (Growth Phase)

**Prioridad 🔴 CRÍTICA:**
1. ✅ Supabase Pro upgrade ($25/mes)
2. ✅ Connection pool optimization (2h)
3. ✅ Composite database indexes (3h)

**Prioridad 🟡 ALTA:**
4. ✅ AI search caching (Upstash) (4-6h)
5. ✅ Map lazy loading (2-3h)

**Total:** ~11-14h + $25/mes

---

### 5,000-25,000 Usuarios (Scale Phase)

**Prioridad 🔴 CRÍTICA:**
1. ✅ Viewport-based map pagination (4-6h)
2. ✅ Query performance monitoring (2h)

**Prioridad 🟡 ALTA:**
3. ✅ Cloudflare R2 migration (8-12h)
4. ✅ Property archiving (4-6h)
5. ✅ Static map previews (4-6h)

**Total:** ~22-32h

---

### 25,000-100,000 Usuarios (Enterprise Scale)

**Prioridad 🔴 CRÍTICA:**
1. ✅ Server-side clustering (8-12h)
2. ✅ Database partitioning (16-24h)
3. ✅ Advanced rate limiting (4h)

**Prioridad 🟡 ALTA:**
4. ✅ OpenAI Batch API (4-6h)
5. ✅ CDN optimization (6-8h)

**Total:** ~38-54h

---

## 📈 Métricas de Performance Target

### Database Performance

| Métrica | Current | Target (5k users) | Target (100k users) |
|---------|---------|-------------------|---------------------|
| **Query time (findInBounds)** | ~50ms | <100ms | <200ms |
| **Connection pool usage** | ~20% | <60% | <80% |
| **Database size** | ~500MB | <5GB | <20GB |
| **Query timeout rate** | 0% | <0.1% | <0.5% |

### Frontend Performance

| Métrica | Current | Target (5k props) | Target (50k props) |
|---------|---------|-------------------|-------------------|
| **Map initial render** | ~500ms | <1s | <2s |
| **Map pan/zoom FPS** | 60 | 45-60 | 30-45 |
| **Memory usage (map)** | ~100MB | <300MB | <500MB |
| **Property grid render** | ~200ms | <500ms | <1s |

### API Performance

| Métrica | Current | Target (5k users) | Target (100k users) |
|---------|---------|-------------------|---------------------|
| **AI search latency** | ~2s | <3s | <3s (with cache) |
| **AI search cache hit** | 0% | >30% | >50% |
| **Rate limit violations** | N/A | <1% | <0.5% |
| **API error rate** | ~2% | <1% | <0.5% |

---

## 🔧 Herramientas de Monitoring Recomendadas

### Performance Monitoring

1. **Vercel Analytics** ($20/mes)
   - Core Web Vitals
   - Real User Monitoring (RUM)
   - Server-side timing

2. **Sentry** (Free - $26/mes)
   - Error tracking
   - Performance traces
   - Session replay

3. **Upstash Redis** ($0 - $40/mes)
   - Rate limiting
   - Caching
   - Real-time metrics

### Database Monitoring

1. **Supabase Dashboard** (Incluido)
   - Query performance
   - Connection pool usage
   - Database size

2. **Prisma Studio** (Incluido)
   - Local database browser
   - Query builder

3. **pganalyze** ($49/mes - Enterprise)
   - Advanced query analysis
   - Index recommendations
   - Vacuum/autovacuum insights

---

## 📚 Referencias

### Documentos Internos
- `docs/business/COST_SCALING_ANALYSIS.md` - Análisis de costos operacionales
- `docs/technical-debt/00-DEEP-ANALYSIS.md` - Deuda técnica completa
- `docs/technical-debt/06-LOGGING-MONITORING.md` - Plan de observabilidad
- `docs/caching/CACHE_STATUS.md` - Estado de caching

### Recursos Externos
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js 16 Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Mapbox Performance Tips](https://docs.mapbox.com/mapbox-gl-js/guides/performance/)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)

---

## ✅ Checklist de Implementación

Usa esta checklist para trackear implementación de soluciones:

### Crítico (Antes de 1k usuarios)
- [ ] Email domain verification
- [ ] Rate limiting (Upstash)
- [ ] Error tracking (Sentry)
- [ ] Structured logging (Pino)
- [ ] Query timeouts

### Alta Prioridad (Antes de 5k usuarios)
- [ ] Supabase Pro upgrade
- [ ] Connection pool optimization
- [ ] Composite database indexes
- [ ] AI search caching
- [ ] Map lazy loading

### Media Prioridad (Antes de 25k usuarios)
- [ ] Viewport-based map pagination
- [ ] Cloudflare R2 migration
- [ ] Property archiving
- [ ] Static map previews

### Baja Prioridad (Antes de 100k usuarios)
- [ ] Server-side clustering
- [ ] Database partitioning
- [ ] OpenAI Batch API
- [ ] CDN optimization avanzado

---

**Última actualización:** Noviembre 20, 2025
**Próxima revisión:** Al alcanzar 5,000 usuarios o cada 3 meses

**¿Preguntas?** Este documento complementa el análisis de costos. Para decisiones de arquitectura, consulta también:
- `docs/architecture/` - Decisiones de diseño
- `docs/technical-debt/` - Problemas conocidos y soluciones
