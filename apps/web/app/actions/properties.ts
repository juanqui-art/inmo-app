/**
 * SERVER ACTIONS - Properties CRUD
 *
 * Server Actions para operaciones de propiedades
 * - Validación con Zod
 * - Permisos verificados por PropertyRepository
 * - Revalidación de cache con revalidatePath
 */

'use server'

import { propertyRepository } from '@repo/database'
import { requireRole } from '@/lib/auth'
import { createPropertySchema, updatePropertySchema } from '@/lib/validations/property'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * CREATE PROPERTY ACTION
 * Solo AGENT y ADMIN pueden crear propiedades
 */
export async function createPropertyAction(_prevState: any, formData: FormData) {
  // 1. Verificar que el usuario es AGENT o ADMIN
  const user = await requireRole(['AGENT', 'ADMIN'])

  // 2. Extraer y transformar datos del formulario
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    type: formData.get('type') as 'SALE' | 'RENT',
    status: (formData.get('status') as any) || 'AVAILABLE',
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined,
    bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : undefined,
    area: formData.get('area') ? Number(formData.get('area')) : undefined,
    address: formData.get('address') as string | undefined,
    city: formData.get('city') as string | undefined,
    state: formData.get('state') as string | undefined,
    zipCode: formData.get('zipCode') as string | undefined,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,
  }

  // 3. Validar con Zod
  const validatedData = createPropertySchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    }
  }

  try {
    // 4. Crear propiedad usando el repository
    await propertyRepository.create(validatedData.data, user.id)

    // 5. Revalidar cache
    revalidatePath('/dashboard/propiedades')

    // 6. Redirigir a la lista
    redirect('/dashboard/propiedades')
  } catch (error) {
    console.error('Error creating property:', error)
    return {
      error: {
        general: error instanceof Error ? error.message : 'Error al crear la propiedad',
      },
    }
  }
}

/**
 * UPDATE PROPERTY ACTION
 * Solo el owner o ADMIN pueden actualizar
 */
export async function updatePropertyAction(_prevState: any, formData: FormData) {
  // 1. Verificar autenticación
  const user = await requireRole(['AGENT', 'ADMIN'])

  // 2. Extraer datos
  const propertyId = formData.get('id') as string

  const rawData = {
    id: propertyId,
    title: formData.get('title') as string | undefined,
    description: formData.get('description') as string | undefined,
    price: formData.get('price') ? Number(formData.get('price')) : undefined,
    type: formData.get('type') as 'SALE' | 'RENT' | undefined,
    status: formData.get('status') as any | undefined,
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined,
    bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : undefined,
    area: formData.get('area') ? Number(formData.get('area')) : undefined,
    address: formData.get('address') as string | undefined,
    city: formData.get('city') as string | undefined,
    state: formData.get('state') as string | undefined,
    zipCode: formData.get('zipCode') as string | undefined,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,
  }

  // 3. Validar
  const validatedData = updatePropertySchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    }
  }

  try {
    // 4. Actualizar (repository verifica ownership)
    const { id, ...updateData } = validatedData.data
    await propertyRepository.update(id, updateData, user.id)

    // 5. Revalidar
    revalidatePath('/dashboard/propiedades')
    revalidatePath(`/dashboard/propiedades/${id}/editar`)

    // 6. Redirigir
    redirect('/dashboard/propiedades')
  } catch (error) {
    console.error('Error updating property:', error)
    return {
      error: {
        general: error instanceof Error ? error.message : 'Error al actualizar la propiedad',
      },
    }
  }
}

/**
 * DELETE PROPERTY ACTION
 * Solo el owner o ADMIN pueden eliminar
 */
export async function deletePropertyAction(propertyId: string) {
  // 1. Verificar autenticación
  const user = await requireRole(['AGENT', 'ADMIN'])

  try {
    // 2. Eliminar (repository verifica ownership)
    await propertyRepository.delete(propertyId, user.id)

    // 3. Revalidar
    revalidatePath('/dashboard/propiedades')

    return { success: true }
  } catch (error) {
    console.error('Error deleting property:', error)
    return {
      error: error instanceof Error ? error.message : 'Error al eliminar la propiedad',
    }
  }
}
