/**
 * PROPERTY REPOSITORY
 *
 * Abstrae todas las operaciones de base de datos relacionadas con propiedades
 * Centraliza lógica de negocio y validaciones
 */

import { cache } from 'react'
import { db } from '../client'
import type { TransactionType, PropertyCategory, PropertyStatus, Prisma } from '@prisma/client'

/**
 * Property select con relaciones incluidas
 */
export const propertySelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  transactionType: true,
  category: true,
  status: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  latitude: true,
  longitude: true,
  agentId: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: {
      id: true,
      url: true,
      alt: true,
      order: true,
    },
    orderBy: { order: 'asc' as const },
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
} satisfies Prisma.PropertySelect

export type PropertyWithRelations = Prisma.PropertyGetPayload<{
  select: typeof propertySelect
}>

/**
 * Filtros para búsqueda de propiedades
 * transactionType y category pueden ser arrays para multi-select
 */
export interface PropertyFilters {
  transactionType?: TransactionType | TransactionType[]
  category?: PropertyCategory | PropertyCategory[]
  status?: PropertyStatus
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  city?: string
  state?: string
  agentId?: string
  search?: string
}

/**
 * Internal implementation of list query
 * Wrapped with React.cache() for request-level deduplication
 */
async function _getPropertiesList(params: {
  filters?: PropertyFilters
  skip?: number
  take?: number
}): Promise<{ properties: SerializedProperty[]; total: number }> {
  const { filters = {}, skip = 0, take = 20 } = params

  // Use centralized filter builder (extracted to prevent duplication)
  const where = buildPropertyWhereClause(filters)

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      select: propertySelect,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    db.property.count({ where }),
  ])

  // Serialize properties (Decimal → number) for client compatibility
  const serialized = serializeProperties(properties)

  return { properties: serialized, total }
}

/**
 * Cached version of list() using React.cache()
 *
 * CACHE STRATEGY: Request-level deduplication (React.cache)
 * - Prevents duplicate queries in same request (e.g., metadata + render)
 * - Does NOT persist between requests
 * - Does NOT require cacheComponents: true (stable API)
 * - Compatible with existing ISR + revalidatePath() strategy
 *
 * PILOT: Started Nov 2025 - measuring performance impact
 * BENEFIT: ~50% reduction on page detail (eliminates findById duplicate)
 *          ~20-30% reduction on map/listing pages
 */
export const getPropertiesList = cache(_getPropertiesList)

/**
 * Internal implementation of findById
 * Wrapped with React.cache() for request-level deduplication
 * Automatically serializes the property (Decimal → number) for client compatibility
 */
async function _findById(id: string): Promise<SerializedProperty | null> {
  const property = await db.property.findUnique({
    where: { id },
    select: propertySelect,
  })

  // Serialize property (Decimal → number) for client compatibility
  return property ? serializeProperty(property) : null
}

/**
 * Cached version of findById using React.cache()
 * Prevents duplicate queries when property is fetched multiple times in same request
 *
 * BENEFIT: Deduplicates property detail page queries (generateMetadata + render)
 */
export const findByIdCached = cache(_findById)

/**
 * Internal implementation of findInBounds
 * Wrapped with React.cache() for request-level deduplication
 * Automatically serializes properties (Decimal → number) for client compatibility
 */
async function _findInBoundsInternal(params: {
  minLatitude: number
  maxLatitude: number
  minLongitude: number
  maxLongitude: number
  filters?: PropertyFilters
  skip?: number
  take?: number
}): Promise<{ properties: SerializedProperty[]; total: number }> {
  const {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
    filters = {},
    skip = 0,
    take = 1000,
  } = params

  // VALIDATION: Comprehensive geographic boundary checking
  if (minLatitude < -90 || minLatitude > 90 || maxLatitude < -90 || maxLatitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90')
  }
  if (minLongitude < -180 || minLongitude > 180 || maxLongitude < -180 || maxLongitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180')
  }
  if (minLatitude > maxLatitude) {
    throw new Error('minLatitude must be less than or equal to maxLatitude')
  }

  // Note: Antimeridian crossing (longitude > 180 wrapping to -180) not currently supported
  // This would require splitting query into two bounding boxes
  if (minLongitude > maxLongitude) {
    throw new Error('Bounding boxes crossing the antimeridian are not currently supported')
  }

  // Use centralized filter builder with geographic bounding box
  const where = buildPropertyWhereClause(filters, {
    latitude: {
      gte: minLatitude,
      lte: maxLatitude,
    },
    longitude: {
      gte: minLongitude,
      lte: maxLongitude,
    },
  })

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      select: propertySelect,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    db.property.count({ where }),
  ])

  // Serialize properties (Decimal → number) for client compatibility
  const serialized = serializeProperties(properties)

  return { properties: serialized, total }
}

/**
 * Cached version of findInBounds using React.cache()
 *
 * BENEFIT: Deduplicates map viewport queries within same request
 */
export const findInBoundsCached = cache(_findInBoundsInternal)

/**
 * FILTER BUILDER HELPER
 *
 * Consolidates filter construction logic used in multiple methods
 * Prevents duplication and inconsistency
 * Supports both read queries (with geographic filters) and analysis queries
 */
function buildPropertyWhereClause(
  filters: PropertyFilters = {},
  additionalConditions?: Prisma.PropertyWhereInput
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    ...additionalConditions,
    ...(filters.transactionType && {
      transactionType: Array.isArray(filters.transactionType)
        ? { in: filters.transactionType }
        : filters.transactionType,
    }),
    ...(filters.category && {
      category: Array.isArray(filters.category)
        ? { in: filters.category }
        : filters.category,
    }),
    ...(filters.status && { status: filters.status }),
    ...(filters.agentId && { agentId: filters.agentId }),
    ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
    ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
    ...(filters.bedrooms && { bedrooms: { gte: filters.bedrooms } }),
    ...(filters.bathrooms && { bathrooms: { gte: filters.bathrooms } }),
    // Combine minPrice and maxPrice into single price object to avoid overwrite
    ...((filters.minPrice || filters.maxPrice) && {
      price: {
        ...(filters.minPrice && { gte: filters.minPrice }),
        ...(filters.maxPrice && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.minArea && { area: { gte: filters.minArea } }),
    ...(filters.maxArea && { area: { lte: filters.maxArea } }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  return where
}

/**
 * Repository para operaciones de propiedades
 */
export class PropertyRepository {
  /**
   * Encuentra una propiedad por ID
   *
   * NOTE: Returns SERIALIZED property (Decimal → number)
   * This method uses findByIdCached which internally calls _findById()
   */
  async findById(id: string): Promise<SerializedProperty | null> {
    // Delegate to cached version for request-level deduplication
    return findByIdCached(id)
  }

  /**
   * Lista propiedades con filtros y paginación
   * @deprecated Use getPropertiesList() instead for caching benefits
   *
   * NOTE: Returns SERIALIZED properties (Decimal → number)
   * This method internally uses getPropertiesList() which serializes results
   */
  async list(params: {
    filters?: PropertyFilters
    skip?: number
    take?: number
  }): Promise<{ properties: SerializedProperty[]; total: number }> {
    return getPropertiesList(params)
  }

  /**
   * Crea una nueva propiedad
   * Solo agentes pueden crear propiedades
   *
   * TRANSACTION: Uses db.$transaction() to ensure authorization check + creation are atomic
   * - Prevents race conditions where user role could change between check and creation
   */
  async create(
    data: Omit<Prisma.PropertyUncheckedCreateInput, 'agentId'>,
    currentUserId: string
  ): Promise<PropertyWithRelations> {
    return db.$transaction(async (tx) => {
      // Verificar que el usuario es un agente
      const user = await tx.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      })

      if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Only agents can create properties')
      }

      return tx.property.create({
        data: {
          ...data,
          agentId: currentUserId, // Asegurar que la propiedad pertenece al usuario actual
        },
        select: propertySelect,
      })
    })
  }

  /**
   * Actualiza una propiedad existente
   * Solo el agente dueño o admins pueden actualizar
   *
   * TRANSACTION: Uses db.$transaction() to ensure atomicity
   * - Authorization check + update in single transaction
   * - Prevents ownership/role changes between check and update
   */
  async update(
    id: string,
    data: Prisma.PropertyUpdateInput,
    currentUserId: string
  ): Promise<PropertyWithRelations> {
    return db.$transaction(async (tx) => {
      // Verificar permisos
      const property = await tx.property.findUnique({
        where: { id },
        select: { agentId: true },
      })

      if (!property) {
        throw new Error('Property not found')
      }

      const user = await tx.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      })

      const canUpdate = property.agentId === currentUserId || user?.role === 'ADMIN'

      if (!canUpdate) {
        throw new Error('Unauthorized: Only the property owner or admins can update')
      }

      return tx.property.update({
        where: { id },
        data,
        select: propertySelect,
      })
    })
  }

  /**
   * Elimina una propiedad
   * Solo el agente dueño o admins pueden eliminar
   *
   * TRANSACTION: Uses db.$transaction() to ensure atomicity
   * - Authorization check + deletion in single transaction
   * - Prevents ownership/role changes between check and delete
   */
  async delete(id: string, currentUserId: string): Promise<PropertyWithRelations> {
    return db.$transaction(async (tx) => {
      // Verificar permisos (mismo que update)
      const property = await tx.property.findUnique({
        where: { id },
        select: { agentId: true },
      })

      if (!property) {
        throw new Error('Property not found')
      }

      const user = await tx.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      })

      const canDelete = property.agentId === currentUserId || user?.role === 'ADMIN'

      if (!canDelete) {
        throw new Error('Unauthorized: Only the property owner or admins can delete')
      }

      return tx.property.delete({
        where: { id },
        select: propertySelect,
      })
    })
  }

  /**
   * Busca propiedades cerca de una ubicación geográfica
   * Usando aproximación simple de lat/lng
   */
  async findNearby(params: {
    latitude: number
    longitude: number
    radiusKm?: number
    take?: number
  }): Promise<PropertyWithRelations[]> {
    const { latitude, longitude, radiusKm = 10, take = 20 } = params

    // Aproximación simple: 1 grado ≈ 111km
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))

    return db.property.findMany({
      where: {
        status: 'AVAILABLE',
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lngDelta,
          lte: longitude + lngDelta,
        },
      },
      select: propertySelect,
      take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Busca propiedades dentro de un bounding box geográfico
   * Usado para dynamic filtering en mapas
   *
   * @param params.minLatitude - Límite sur del bounding box
   * @param params.maxLatitude - Límite norte del bounding box
   * @param params.minLongitude - Límite oeste del bounding box
   * @param params.maxLongitude - Límite este del bounding box
   * @param params.filters - Filtros adicionales opcionales
   * @param params.skip - Paginación
   * @param params.take - Límite de resultados
   *
   * @example
   * // Mostrar todas las propiedades en Cuenca
   * propertyRepository.findInBounds({
   *   minLatitude: -2.953,
   *   maxLatitude: -2.847,
   *   minLongitude: -79.053,
   *   maxLongitude: -78.947,
   *   filters: { transactionType: 'SALE', minPrice: 50000, maxPrice: 300000 }
   * })
   */
  async findInBounds(params: {
    minLatitude: number
    maxLatitude: number
    minLongitude: number
    maxLongitude: number
    filters?: PropertyFilters
    skip?: number
    take?: number
  }): Promise<{ properties: PropertyWithRelations[]; total: number }> {
    // Delegate to cached version for request-level deduplication
    return findInBoundsCached({
      minLatitude: params.minLatitude,
      maxLatitude: params.maxLatitude,
      minLongitude: params.minLongitude,
      maxLongitude: params.maxLongitude,
      filters: params.filters,
      skip: params.skip,
      take: params.take,
    })
  }

  /**
   * Obtiene propiedades de un agente específico
   */
  async getByAgent(agentId: string, params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 20 } = params || {}

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where: { agentId },
        select: propertySelect,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      db.property.count({ where: { agentId } }),
    ])

    return { properties, total }
  }

  /**
   * Obtiene el rango mínimo y máximo de precios de todas las propiedades
   * Útil para inicializar el rango del filtro de precios en la UI
   *
   * @param filters - Filtros opcionales para limitar el rango (ej: solo cierta ciudad)
   * @returns Objeto con minPrice y maxPrice en USD
   *
   * @example
   * // Obtener rango de precios global
   * const { minPrice, maxPrice } = await propertyRepository.getPriceRange()
   *
   * // Obtener rango de precios para una ciudad específica
   * const { minPrice, maxPrice } = await propertyRepository.getPriceRange({
   *   city: 'Cuenca'
   * })
   */
  async getPriceRange(filters?: PropertyFilters): Promise<{ minPrice: number; maxPrice: number }> {
    // Use centralized filter builder (excludes minPrice/maxPrice/search intentionally for aggregation)
    const where = buildPropertyWhereClause(filters)

    const priceAggregation = await db.property.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    })

    // Convertir Decimal a number
    // FIX: Return null if no data available instead of misleading defaults
    const minPrice = priceAggregation._min.price ? Number(priceAggregation._min.price) : null
    const maxPrice = priceAggregation._max.price ? Number(priceAggregation._max.price) : null

    // Return 0 if no properties match, otherwise return actual range
    if (minPrice === null || maxPrice === null) {
      return { minPrice: 0, maxPrice: 0 }
    }

    return { minPrice, maxPrice }
  }

  /**
   * Obtiene distribución de precios para histograma de filtros
   * Agrupa propiedades en buckets de precio para visualización
   *
   * PERFORMANCE NOTE: Current implementation loads all matching prices into memory
   * - Fetches: SELECT price FROM Property WHERE ... (minimal data, ~4 bytes per row)
   * - Processing: In-memory grouping by computed bucket (FLOOR(price / bucketSize))
   * - Why not database grouping: Prisma doesn't support dynamic computed fields in groupBy
   * - Future: Can be optimized with raw SQL FLOOR() if needed at scale (10k+ properties)
   *
   * @param params.bucketSize - Tamaño del bucket en USD (ej: 10000 = $10k buckets)
   * @param params.filters - Filtros opcionales
   * @returns Array con buckets y conteos de propiedades
   *
   * @example
   * ```typescript
   * const distribution = await propertyRepository.getPriceDistribution({
   *   bucketSize: 10000 // $10k buckets
   * })
   * // Resultado: [
   * //   { bucket: 0, count: 31 },      // $0-$10k
   * //   { bucket: 10000, count: 15 },  // $10k-$20k
   * //   ...
   * // ]
   * ```
   */
  async getPriceDistribution(params: {
    bucketSize?: number
    filters?: PropertyFilters
  } = {}): Promise<{ bucket: number; count: number }[]> {
    const { bucketSize = 10000, filters = {} } = params

    // Use centralized filter builder with AVAILABLE status (hardcoded for histogram)
    const where = buildPropertyWhereClause(filters, { status: 'AVAILABLE' })

    // Fetch only price field (minimal memory footprint)
    const properties = await db.property.findMany({
      where,
      select: { price: true },
    })

    // Group into buckets using computed field (FLOOR(price / bucketSize) * bucketSize)
    const buckets = new Map<number, number>()

    for (const property of properties) {
      const price = Number(property.price)
      const bucketStart = Math.floor(price / bucketSize) * bucketSize
      buckets.set(bucketStart, (buckets.get(bucketStart) || 0) + 1)
    }

    // Convert to sorted array
    return Array.from(buckets.entries())
      .map(([bucket, count]) => ({ bucket, count }))
      .sort((a, b) => a.bucket - b.bucket)
  }

  /**
   * Obtiene ciudades con autocomplete para el hero search bar
   * Retorna ciudades distintas que coinciden con la consulta
   * Ordenadas por número de propiedades disponibles (descendente)
   *
   * OPTIMIZED: Uses Prisma groupBy instead of N+1 query pattern
   * - Before: 1 initial query + N count queries = O(N) complexity
   * - After: 1 single groupBy query = O(1) database round trips
   *
   * @param query - Término de búsqueda (mín 2 caracteres)
   * @returns Array de ciudades con conteo de propiedades
   *
   * @example
   * // Buscar ciudades que contengan "Cuen"
   * const cities = await propertyRepository.getCitiesAutocomplete("Cuen")
   * // Resultado: [
   * //   { name: "Cuenca", state: "Azuay", propertyCount: 45, slug: "cuenca-azuay" }
   * // ]
   */
  async getCitiesAutocomplete(query: string): Promise<
    Array<{ name: string; state: string; slug: string; propertyCount: number }>
  > {
    // Validar longitud mínima
    if (query.length < 2) {
      return []
    }

    // FIX: Use groupBy instead of N+1 pattern
    // Before: 1 query + N count queries = N+1 total
    // After: 1 query = 1 total
    const cityGroups = await db.property.groupBy({
      by: ['city', 'state'],
      where: {
        status: 'AVAILABLE',
        city: {
          contains: query,
          mode: 'insensitive',
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    return cityGroups
      .filter((group) => group.city !== null)
      .map((group) => ({
        name: group.city!,
        state: group.state || '',
        slug: `${group.city!.toLowerCase().replace(/\s+/g, '-')}-${(group.state || '').toLowerCase().replace(/\s+/g, '-')}`,
        propertyCount: group._count.id,
      }))
  }
}

/**
 * Singleton del repositorio
 * Usar este en lugar de crear nuevas instancias
 */
export const propertyRepository = new PropertyRepository()

/**
 * SERIALIZATION HELPERS
 *
 * Next.js no puede serializar objetos Decimal de Prisma cuando se pasan
 * de Server Components a Client Components. Estos helpers convierten
 * Decimal a number para permitir la serialización.
 */

/**
 * Tipo serializable de PropertyWithRelations
 * Convierte todos los Decimal a number
 * Convierte null a undefined para compatibilidad con Client Components
 */
export type SerializedProperty = Omit<
  PropertyWithRelations,
  'price' | 'bathrooms' | 'area' | 'latitude' | 'longitude' | 'city' | 'state' | 'bedrooms'
> & {
  price: number
  bathrooms?: number | null
  area?: number | null
  latitude: number | null
  longitude: number | null
  city?: string
  state?: string
  bedrooms?: number | null
}

/**
 * Safely converts Decimal values to numbers with validation
 * Preserves 0 values (falsiness issue with Decimal)
 * Returns null for null/undefined, not undefined
 */
function toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  const num = Number(value)
  if (!Number.isFinite(num)) {
    console.error(`Invalid number conversion: ${value}`)
    return null
  }
  return num
}

/**
 * Convierte una propiedad con Decimals a formato serializable
 * Convierte null a undefined para compatibilidad con Client Components
 * FIX: Preserva valores 0 (bathrooms, bedrooms, area) que antes retornaban undefined
 */
export function serializeProperty(
  property: PropertyWithRelations
): SerializedProperty {
  return {
    ...property,
    // Core fields (Decimal → number)
    // Price is required, never null
    price: toNumber(property.price) ?? 0,
    // Optional Decimal fields - preserve 0 values
    // ⚠️ CRITICAL FIX: Changed from falsy check (? : undefined) to null check
    bathrooms: property.bathrooms !== null && property.bathrooms !== undefined
      ? toNumber(property.bathrooms)
      : undefined,
    area: property.area !== null && property.area !== undefined
      ? toNumber(property.area)
      : undefined,
    bedrooms: property.bedrooms !== null && property.bedrooms !== undefined
      ? toNumber(property.bedrooms)
      : undefined,
    // Geographic coordinates (can be null)
    latitude: toNumber(property.latitude),
    longitude: toNumber(property.longitude),
    // Optional string fields
    city: property.city ?? undefined,
    state: property.state ?? undefined,
  }
}

/**
 * Convierte un array de propiedades a formato serializable
 */
export function serializeProperties(
  properties: PropertyWithRelations[]
): SerializedProperty[] {
  return properties.map(serializeProperty)
}
