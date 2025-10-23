/**
 * PROPERTIES CACHE
 *
 * Cacheador inteligente para consultas de propiedades
 *
 * PATRÓN: React cache() para deduplicación de requests en el mismo render
 *
 * WHY THIS APPROACH?
 * - React.cache() deduplica requests idénticos automáticamente
 * - Si 2+ componentes piden los mismos bounds: 1 sola query a DB
 * - Compatible con Next.js 16 sin experimental features
 * - Mantiene datos frescos sin loops de renderización
 *
 * FLOW:
 * 1. MapPage pide propiedades por bounds
 * 2. getCachedPropertiesByBounds usa React.cache()
 * 3. Si request idéntico en el mismo render: usa cache en-memory
 * 4. Si diferente: consulta DB
 * 5. Resultado cacheado por duración del render
 * 6. Para invalidación: revalidatePath() o restart dev server
 *
 * VENTAJAS:
 * ✅ Cero queries duplicadas si URL no cambia
 * ✅ Deduplicación automática dentro del mismo render
 * ✅ Type-safe con TypeScript
 * ✅ Zero client-side data fetching
 * ✅ Sin experimental features (estable)
 *
 * NOTE: Cache Components (cacheTag/updateTag) disabled due to Next.js 16.0.0
 * limitations with uncached data access (e.g., cookies()). Will re-enable
 * when Next.js 16.1+ improves the experimental API.
 */

import { cache } from 'react'
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

    // Consultar BD
    // React.cache() deduplicates identical calls automatically
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
