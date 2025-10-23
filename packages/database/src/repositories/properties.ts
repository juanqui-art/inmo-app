/**
 * PROPERTY REPOSITORY
 *
 * Abstrae todas las operaciones de base de datos relacionadas con propiedades
 * Centraliza lógica de negocio y validaciones
 */

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
 */
export interface PropertyFilters {
  transactionType?: TransactionType
  category?: PropertyCategory
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
 * Repository para operaciones de propiedades
 */
export class PropertyRepository {
  /**
   * Encuentra una propiedad por ID
   */
  async findById(id: string): Promise<PropertyWithRelations | null> {
    return db.property.findUnique({
      where: { id },
      select: propertySelect,
    })
  }

  /**
   * Lista propiedades con filtros y paginación
   */
  async list(params: {
    filters?: PropertyFilters
    skip?: number
    take?: number
  }): Promise<{ properties: PropertyWithRelations[]; total: number }> {
    const { filters = {}, skip = 0, take = 20 } = params

    const where: Prisma.PropertyWhereInput = {
      ...(filters.transactionType && { transactionType: filters.transactionType }),
      ...(filters.category && { category: filters.category }),
      ...(filters.status && { status: filters.status }),
      ...(filters.agentId && { agentId: filters.agentId }),
      ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
      ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
      ...(filters.bedrooms && { bedrooms: { gte: filters.bedrooms } }),
      ...(filters.bathrooms && { bathrooms: { gte: filters.bathrooms } }),
      ...(filters.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
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

    return { properties, total }
  }

  /**
   * Crea una nueva propiedad
   * Solo agentes pueden crear propiedades
   */
  async create(
    data: Omit<Prisma.PropertyUncheckedCreateInput, 'agentId'>,
    currentUserId: string
  ): Promise<PropertyWithRelations> {
    // Verificar que el usuario es un agente
    const user = await db.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    })

    if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only agents can create properties')
    }

    return db.property.create({
      data: {
        ...data,
        agentId: currentUserId, // Asegurar que la propiedad pertenece al usuario actual
      },
      select: propertySelect,
    })
  }

  /**
   * Actualiza una propiedad existente
   * Solo el agente dueño o admins pueden actualizar
   */
  async update(
    id: string,
    data: Prisma.PropertyUpdateInput,
    currentUserId: string
  ): Promise<PropertyWithRelations> {
    // Verificar permisos
    const property = await db.property.findUnique({
      where: { id },
      select: { agentId: true },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const user = await db.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    })

    const canUpdate = property.agentId === currentUserId || user?.role === 'ADMIN'

    if (!canUpdate) {
      throw new Error('Unauthorized: Only the property owner or admins can update')
    }

    return db.property.update({
      where: { id },
      data,
      select: propertySelect,
    })
  }

  /**
   * Elimina una propiedad
   * Solo el agente dueño o admins pueden eliminar
   */
  async delete(id: string, currentUserId: string): Promise<PropertyWithRelations> {
    // Verificar permisos (mismo que update)
    const property = await db.property.findUnique({
      where: { id },
      select: { agentId: true },
    })

    if (!property) {
      throw new Error('Property not found')
    }

    const user = await db.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    })

    const canDelete = property.agentId === currentUserId || user?.role === 'ADMIN'

    if (!canDelete) {
      throw new Error('Unauthorized: Only the property owner or admins can delete')
    }

    return db.property.delete({
      where: { id },
      select: propertySelect,
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
    const {
      minLatitude,
      maxLatitude,
      minLongitude,
      maxLongitude,
      filters = {},
      skip = 0,
      take = 1000, // Mayor por defecto para mapas
    } = params

    // Validar que las coordenadas sean válidas
    if (minLatitude > maxLatitude) {
      throw new Error('minLatitude debe ser menor que maxLatitude')
    }
    if (minLongitude > maxLongitude) {
      throw new Error('minLongitude debe ser menor que maxLongitude')
    }

    const where: Prisma.PropertyWhereInput = {
      // Bounding box geográfico
      latitude: {
        gte: minLatitude,
        lte: maxLatitude,
      },
      longitude: {
        gte: minLongitude,
        lte: maxLongitude,
      },
      // Filtros adicionales (mismo patrón que list())
      ...(filters.transactionType && { transactionType: filters.transactionType }),
      ...(filters.category && { category: filters.category }),
      ...(filters.status && { status: filters.status }),
      ...(filters.agentId && { agentId: filters.agentId }),
      ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
      ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
      ...(filters.bedrooms && { bedrooms: { gte: filters.bedrooms } }),
      ...(filters.bathrooms && { bathrooms: { gte: filters.bathrooms } }),
      ...(filters.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
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

    return { properties, total }
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
 * Convierte una propiedad con Decimals a formato serializable
 * Convierte null a undefined para compatibilidad con Client Components
 */
export function serializeProperty(
  property: PropertyWithRelations
): SerializedProperty {
  return {
    ...property,
    // Core fields (Decimal → number)
    price: Number(property.price),
    // Optional Decimal fields (null → undefined for Client Components)
    bathrooms: property.bathrooms ? Number(property.bathrooms) : undefined,
    area: property.area ? Number(property.area) : undefined,
    // Geographic coordinates (can be null)
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    // Optional string fields
    city: property.city ?? undefined,
    state: property.state ?? undefined,
    // Optional number fields
    bedrooms: property.bedrooms ?? undefined,
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
