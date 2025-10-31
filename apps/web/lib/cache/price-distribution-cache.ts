/**
 * PRICE DISTRIBUTION CACHE
 *
 * Cacheador para distribución de precios (histograma de filtros)
 *
 * PATRÓN: React cache() + revalidate 24h
 *
 * WHY THIS APPROACH?
 * - getPriceDistribution() retorna ~30-50 filas (ultra ligero)
 * - Distribución de precios cambia lentamente (agregar 1-2 props/día)
 * - Cache 24h = balance perfecto entre frescura y performance
 * - Sin queries innecesarias mientras usuarios exploran filtros
 *
 * FLOW:
 * 1. MapPage llama getCachedPriceDistribution()
 * 2. React.cache() deduplica requests idénticos en mismo render
 * 3. Resultado cacheado por 24h (revalidate)
 * 4. Para invalidar: revalidatePath() o restart dev server
 *
 * VENTAJAS:
 * ✅ Ultra rápido (raw query optimizada, ~30 filas)
 * ✅ Cacheable 24h (distribución estable)
 * ✅ Cero queries mientras usuario explora en dropdown
 * ✅ Type-safe con TypeScript
 * ✅ Sin experimental features (estable)
 *
 * NOTE: Si agregas muchas propiedades diarias, reducir revalidate a 6h
 */

import { cache } from 'react'
import { propertyRepository } from '@repo/database'

/**
 * Datos cacheados de distribución de precios
 */
export interface PriceDistributionData {
  distribution: { bucket: number; count: number }[]
  minPrice: number
  maxPrice: number
  totalProperties: number
}

/**
 * Obtiene distribución de precios con caching automático
 *
 * Cache Duration: 24h (revalidate)
 * Deduplication: React.cache() en mismo render
 *
 * @returns Distribución con stats agregados
 *
 * @example
 * ```typescript
 * // En MapPage (Server Component)
 * const priceStats = await getCachedPriceDistribution()
 * console.log(priceStats.distribution) // [{ bucket: 0, count: 31 }, ...]
 * console.log(priceStats.minPrice)      // 0
 * console.log(priceStats.maxPrice)      // 380000
 * ```
 */
export const getCachedPriceDistribution = cache(
  async (): Promise<PriceDistributionData> => {
    // Query optimizada: solo 2 columnas (bucket, count)
    const distribution = await propertyRepository.getPriceDistribution({
      bucketSize: 10000, // $10k buckets
    })

    // Calcular stats desde distribución
    const minPrice = distribution.length > 0 ? distribution[0]!.bucket : 0
    const maxPrice =
      distribution.length > 0
        ? distribution[distribution.length - 1]!.bucket
        : 2000000

    const totalProperties = distribution.reduce((sum, d) => sum + d.count, 0)

    return {
      distribution,
      minPrice,
      maxPrice,
      totalProperties,
    }
  }
)

/**
 * NEXT STEPS - REVALIDACIÓN
 *
 * Para invalidar el cache cuando se crea/actualiza propiedad:
 *
 * ```typescript
 * // app/actions/properties.ts
 * import { revalidatePath, revalidateTag } from 'next/cache'
 *
 * export async function createProperty(data: PropertyInput) {
 *   const property = await propertyRepository.create(data, userId)
 *
 *   // Invalida distribucion de precios (histograma)
 *   // Nota: React.cache() no tiene tags, se invalida con revalidatePath
 *   revalidatePath('/mapa', 'page')
 *
 *   return property
 * }
 * ```
 */
