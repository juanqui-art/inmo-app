/**
 * PRICE HELPER UTILITIES
 *
 * Funciones para trabajar con precios en histograma y filtros
 */

/**
 * Formatea un número como precio en moneda USD (locale: es-EC)
 *
 * @example
 * formatPrice(200000)  // "$200,000"
 * formatPrice(75500)   // "$75,500"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Encuentra el bucket más cercano a un precio dado
 * Usado para "snapping" cuando usuario arrastra handle o escribe input
 *
 * @example
 * const buckets = [
 *   { bucket: 0, count: 31 },
 *   { bucket: 10000, count: 15 },
 *   { bucket: 20000, count: 8 },
 * ]
 * findNearestBucket(12345, buckets) // 10000 (bucket más cercano)
 * findNearestBucket(25000, buckets) // 20000 (bucket más cercano)
 */
export function findNearestBucket(
  price: number,
  distribution: { bucket: number; count: number }[]
): number {
  if (distribution.length === 0) return price

  return distribution.reduce((prev, curr) => {
    return Math.abs(curr.bucket - price) < Math.abs(prev.bucket - price)
      ? curr
      : prev
  }).bucket
}

/**
 * Calcula el número de propiedades dentro de un rango de precios
 * basado en la distribución del histograma
 *
 * @example
 * const distribution = [
 *   { bucket: 0, count: 31 },
 *   { bucket: 10000, count: 15 },
 *   { bucket: 20000, count: 8 },
 * ]
 * calculatePropertyCount(distribution, 5000, 15000) // 31 + 15 = 46
 */
export function calculatePropertyCount(
  distribution: { bucket: number; count: number }[],
  minPrice: number,
  maxPrice: number
): number {
  return distribution
    .filter((bucket) => bucket.bucket >= minPrice && bucket.bucket <= maxPrice)
    .reduce((sum, bucket) => sum + bucket.count, 0)
}

/**
 * Convierte posición X en SVG a precio
 * Usado cuando usuario arrastra handle en histograma
 *
 * @param x - Coordenada X en SVG
 * @param svgWidth - Ancho total del SVG
 * @param minPrice - Precio mínimo del rango
 * @param maxPrice - Precio máximo del rango
 *
 * @example
 * xToPrice(150, 300, 0, 300000) // 150,000
 */
export function xToPrice(
  x: number,
  svgWidth: number,
  minPrice: number,
  maxPrice: number
): number {
  const normalized = Math.max(0, Math.min(1, x / svgWidth))
  return minPrice + normalized * (maxPrice - minPrice)
}

/**
 * Convierte precio a posición X en SVG
 * Usado para renderizar handles en su posición correcta
 *
 * @param price - Precio a convertir
 * @param svgWidth - Ancho total del SVG
 * @param minPrice - Precio mínimo del rango
 * @param maxPrice - Precio máximo del rango
 *
 * @example
 * priceToX(150000, 300, 0, 300000) // 150 (mitad del SVG)
 */
export function priceToX(
  price: number,
  svgWidth: number,
  minPrice: number,
  maxPrice: number
): number {
  const normalized = (price - minPrice) / (maxPrice - minPrice)
  return Math.max(0, Math.min(svgWidth, normalized * svgWidth))
}

/**
 * Valida que un rango de precios sea válido
 * (min <= max)
 *
 * @example
 * isValidPriceRange(100000, 200000) // true
 * isValidPriceRange(200000, 100000) // false
 */
export function isValidPriceRange(minPrice: number, maxPrice: number): boolean {
  return minPrice <= maxPrice
}

/**
 * Determina si una barra del histograma está dentro del rango seleccionado
 * Usado para resaltar/dimear barras
 *
 * @example
 * const bucket = { bucket: 50000, count: 10 }
 * isBucketInRange(bucket, 40000, 60000) // true
 * isBucketInRange(bucket, 60000, 100000) // false
 */
export function isBucketInRange(
  bucket: { bucket: number; count: number },
  minPrice: number,
  maxPrice: number
): boolean {
  return bucket.bucket >= minPrice && bucket.bucket <= maxPrice
}

/**
 * Genera texto legible del rango de precios
 * Usado en labels e información del filtro
 *
 * @example
 * formatPriceRange(0, 200000) // "$0 - $200,000"
 * formatPriceRange(75000, undefined) // "$75,000 - Sin límite"
 */
export function formatPriceRange(
  minPrice: number | undefined,
  maxPrice: number | undefined
): string {
  const minStr = minPrice ? formatPrice(minPrice) : '$0'
  const maxStr = maxPrice ? formatPrice(maxPrice) : 'Sin límite'
  return `${minStr} - ${maxStr}`
}
