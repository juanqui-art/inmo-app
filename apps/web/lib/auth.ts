/**
 * AUTH UTILITIES
 * Funciones helper para autenticación
 */

import { createClient } from '@/lib/supabase/server'
import { userRepository } from '@repo/database'
import { redirect } from 'next/navigation'

/**
 * Obtiene el usuario actual autenticado
 * Si no hay usuario, redirige a /login
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Obtiene el usuario completo desde la BD (incluye rol y metadata)
 */
export async function getUserWithRole() {
  const authUser = await getCurrentUser()

  // Obtener usuario de la BD usando el repository
  const dbUser = await userRepository.findById(authUser.id)

  if (!dbUser) {
    throw new Error('User not found in database')
  }

  return {
    ...authUser,
    dbUser,
  }
}
