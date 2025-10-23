/**
 * PROPERTIES CACHE
 *
 * Cacheador inteligente para consultas de propiedades con Cache Components de Next.js 16
 *
 * PATRÓN: React cache() para deduplicación de requests en el mismo render
 * + revalidateTag() para invalidación en-demanda
 *
 * WHY THIS APPROACH?
 * - Cache Components deduplican requests idénticos en el mismo render
 * - revalidateTag invalida cuando properties cambian (create/update/delete)
 * - Compatible con ISR (revalidate = 300)
 * - Mantiene datos frescos sin loops de renderización
 *
 * FLOW:
 * 1. MapPage pide propiedades por bounds
 * 2. getCachedPropertiesByBounds usa React.cache()
 * 3. Si request idéntico: usa cache en-memory
 * 4. Si diferente: consulta DB
 * 5. Resultado se cachea por 300s (ISR)
 * 6. Cuando agent crea property: revalidateTag('properties-bounds') invalida
 *
 * VENTAJAS:
 * ✅ Cero queries a DB si URL no cambia
 * ✅ Deduplicación automática en renders múltiples
 * ✅ Revalidación limpia cuando datos cambian
 * ✅ Type-safe con TypeScript
 * ✅ Zero client-side data fetching
 */

import { cache } from 'react'
import { cacheTag } from 'next/cache'
import { propertyRepository, serializeProperties } from '@repo/database'
import type { PropertyFilters } from '@repo/database'

/**
 * Parámetros normalizados para caché
 * Asegura que requests idénticos generen la misma cache key
 */
interface CachedPropertiesParams {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
  filters?: PropertyFilters
  take?: number
}

/**
 * Obtiene propiedades dentro de un bounding box con caching automático
 *
 * DEDUPLICACIÓN: Si mapea/page.tsx y otra página piden los mismos bounds,
 * React.cache() devuelve el resultado cached en-memory (sin query)
 *
 * REVALIDACIÓN: Cuando agent crea property, usa revalidateTag('properties-bounds')
 * para invalidar y forzar nueva query en siguiente request
 *
 * @param params - Bounds geográfico + filtros opcionales
 * @returns Propiedades serializadas (Decimal → number)
 *
 * @example
 * ```typescript
 * // En MapPage (Server Component)
 * const { properties } = await getCachedPropertiesByBounds({
 *   minLatitude: -2.953,
 *   maxLatitude: -2.847,
 *   minLongitude: -79.053,
 *   maxLongitude: -78.947,
 *   filters: { transactionType: 'SALE' },
 * })
 * ```
 */
export const getCachedPropertiesByBounds = cache(
  async (params: CachedPropertiesParams) => {
    const {
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
      filters = {},
      take = 1000,
    } = params

    // Tag this cache for later invalidation with revalidateTag()
    // When properties change, revalidateTag('properties-bounds') will clear this
    cacheTag('properties-bounds')

    // Consultar BD
    const { properties: dbProperties, total } =
      await propertyRepository.findInBounds({
        minLatitude,
        maxLatitude,
        minLongitude,
        maxLongitude,
        filters,
        take,
      })

    // Serializar Decimal → number para client compatibility
    const properties = serializeProperties(dbProperties)

    return {
      properties,
      total,
    }
  }
)

/**
 * Obtiene una propiedad única por ID con caching automático
 *
 * Útil para property detail pages que se visitan múltiples veces
 *
 * @param id - Property ID
 * @returns Propiedad serializada
 *
 * @example
 * ```typescript
 * // En property/[id]/page.tsx
 * const property = await getCachedPropertyById(id)
 * ```
 */
export const getCachedPropertyById = cache(async (id: string) => {
  const property = await propertyRepository.findById(id)

  if (!property) {
    return null
  }

  // Serializar
  return serializeProperties([property])[0]
})

/**
 * Valida parámetros de bounds para evitar queries inválidas
 *
 * Usado por page components antes de llamar a getCachedPropertiesByBounds
 *
 * @throws Error si coordenadas son inválidas
 */
export function validateBoundsParams(params: {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
}): void {
  const {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
  } = params

  if (minLatitude >= maxLatitude) {
    throw new Error('Invalid bounds: minLatitude must be less than maxLatitude')
  }

  if (minLongitude >= maxLongitude) {
    throw new Error('Invalid bounds: minLongitude must be less than maxLongitude')
  }

  // Ecuador bounds (approximate)
  const ECUADOR_BOUNDS = {
    minLat: -5.1,
    maxLat: 1.5,
    minLng: -81.2,
    maxLng: -75.2,
  }

  if (
    minLatitude < ECUADOR_BOUNDS.minLat ||
    maxLatitude > ECUADOR_BOUNDS.maxLat ||
    minLongitude < ECUADOR_BOUNDS.minLng ||
    maxLongitude > ECUADOR_BOUNDS.maxLng
  ) {
    console.warn(
      'WARNING: Bounds outside Ecuador. This may be unintended.',
      params
    )
  }
}

/**
 * NEXT STEPS - REVALIDACIÓN
 *
 * Para usar revalidateTag(), agrega esto a server actions que crean/actualizan propiedades:
 *
 * ```typescript
 * // app/actions/properties.ts
 * import { revalidateTag } from 'next/cache'
 *
 * export async function createProperty(data: PropertyInput) {
 *   const property = await propertyRepository.create(data, userId)
 *
 *   // Invalida el caché del mapa cuando nueva property
 *   revalidateTag('properties-bounds')
 *
 *   return property
 * }
 *
 * export async function updateProperty(id: string, data: PropertyInput) {
 *   const property = await propertyRepository.update(id, data, userId)
 *
 *   // Invalida ambos caches
 *   revalidateTag('properties-bounds')
 *   revalidateTag(`property-${id}`)
 *
 *   return property
 * }
 * ```
 */
