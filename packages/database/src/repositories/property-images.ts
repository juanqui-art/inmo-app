/**
 * PROPERTY IMAGES REPOSITORY
 *
 * Operaciones de base de datos para las imágenes de propiedades
 */

import { db } from '../client'

/**
 * Tipo para crear una imagen
 */
export interface CreatePropertyImageInput {
  url: string
  alt?: string
  order: number
  propertyId: string
}

/**
 * Repository para operaciones de imágenes de propiedades
 */
export class PropertyImageRepository {
  /**
   * Crear una nueva imagen
   */
  async create(data: CreatePropertyImageInput) {
    return db.propertyImage.create({
      data,
    })
  }

  /**
   * Crear múltiples imágenes
   */
  async createMany(images: CreatePropertyImageInput[]) {
    return db.propertyImage.createMany({
      data: images,
    })
  }

  /**
   * Obtener todas las imágenes de una propiedad
   */
  async findByProperty(propertyId: string) {
    return db.propertyImage.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    })
  }

  /**
   * Obtener una imagen por ID
   */
  async findById(id: string) {
    return db.propertyImage.findUnique({
      where: { id },
    })
  }

  /**
   * Eliminar una imagen
   */
  async delete(id: string) {
    return db.propertyImage.delete({
      where: { id },
    })
  }

  /**
   * Actualizar el orden de una imagen
   */
  async updateOrder(id: string, order: number) {
    return db.propertyImage.update({
      where: { id },
      data: { order },
    })
  }

  /**
   * Actualizar el orden de múltiples imágenes
   */
  async updateManyOrders(updates: { id: string; order: number }[]) {
    // Usar transacción para actualizar todas las imágenes
    return db.$transaction(
      updates.map(({ id, order }) =>
        db.propertyImage.update({
          where: { id },
          data: { order },
        })
      )
    )
  }

  /**
   * Eliminar todas las imágenes de una propiedad
   */
  async deleteByProperty(propertyId: string) {
    return db.propertyImage.deleteMany({
      where: { propertyId },
    })
  }

  /**
   * Contar imágenes de una propiedad
   */
  async countByProperty(propertyId: string) {
    return db.propertyImage.count({
      where: { propertyId },
    })
  }
}

/**
 * Singleton del repositorio
 */
export const propertyImageRepository = new PropertyImageRepository()
