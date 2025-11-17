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
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatea un número con separadores de miles (Ecuador: punto)
 * En Ecuador usamos punto (.) para separar miles, no coma
 *
 * @example
 * formatNumberEcuador(1000000)  // "1.000.000"
 * formatNumberEcuador(50000)    // "50.000"
 * formatNumberEcuador(100)      // "100"
 */
export function formatNumberEcuador(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formatea un número con K (miles) y M (millones)
 * Usado para el display del rango en el botón del filtro
 *
 * @example
 * formatPriceCompact(1000000)  // "1M"
 * formatPriceCompact(50000)    // "50K"
 * formatPriceCompact(100)      // "100"
 */
export function formatPriceCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(0)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
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
  distribution: { bucket: number; count: number }[],
): number {
  if (distribution.length === 0) return price;

  const nearest = distribution.reduce((prev, curr) => {
    return Math.abs(curr.bucket - price) < Math.abs(prev.bucket - price)
      ? curr
      : prev;
  });

  return nearest.bucket;
}

/**
 * Encuentra el índice del bucket más cercano a un precio dado
 * Usado para sincronizar Radix Slider con histograma (usando índices, no precios)
 *
 * @example
 * const buckets = [
 *   { bucket: 0, count: 31 },
 *   { bucket: 10000, count: 15 },
 *   { bucket: 20000, count: 8 },
 * ]
 * findBucketIndex(12345, buckets) // 1 (índice del bucket $10000)
 * findBucketIndex(25000, buckets) // 2 (índice del bucket $20000)
 */
export function findBucketIndex(
  price: number,
  distribution: { bucket: number; count: number }[],
): number {
  if (!distribution || distribution.length === 0) return 0;

  let nearestIndex = 0;
  const firstBucket = distribution[0]?.bucket ?? 0;
  let minDistance = Math.abs(firstBucket - price);

  for (let i = 1; i < distribution.length; i++) {
    const bucket = distribution[i]?.bucket ?? 0;
    const distance = Math.abs(bucket - price);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  return nearestIndex;
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
  maxPrice: number,
): number {
  return distribution
    .filter((bucket) => bucket.bucket >= minPrice && bucket.bucket <= maxPrice)
    .reduce((sum, bucket) => sum + bucket.count, 0);
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
  maxPrice: number,
): number {
  const normalized = Math.max(0, Math.min(1, x / svgWidth));
  return minPrice + normalized * (maxPrice - minPrice);
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
  maxPrice: number,
): number {
  const normalized = (price - minPrice) / (maxPrice - minPrice);
  return Math.max(0, Math.min(svgWidth, normalized * svgWidth));
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
  return minPrice <= maxPrice;
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
  maxPrice: number,
): boolean {
  return bucket.bucket >= minPrice && bucket.bucket <= maxPrice;
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
  maxPrice: number | undefined,
): string {
  const minStr = minPrice ? formatPrice(minPrice) : "$0";
  const maxStr = maxPrice ? formatPrice(maxPrice) : "Sin límite";
  return `${minStr} - ${maxStr}`;
}
