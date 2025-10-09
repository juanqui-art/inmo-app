/**
 * AUTH UTILITIES
 *
 * Funciones helper para autenticación y autorización
 * - getCurrentUser: Obtener usuario autenticado con rol desde DB
 * - requireAuth: Requerir autenticación (redirige si no auth)
 * - requireRole: Validar rol requerido (redirige si no tiene permiso)
 * - checkPermission: Verificar si usuario tiene permiso sobre un recurso
 * - requireOwnership: Requerir ownership (lanza error si no es dueño)
 */

import { userRepository } from "@repo/database";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Obtiene el usuario autenticado actual con su rol desde DB
 * Retorna null si no hay usuario autenticado
 *
 * Uso: const user = await getCurrentUser()
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Obtener usuario completo desde DB (incluye rol)
  const dbUser = await userRepository.findById(authUser.id);

  if (!dbUser) {
    // Usuario en Supabase Auth pero no en DB → logout
    await supabase.auth.signOut();
    return null;
  }

  return dbUser;
}

/**
 * Requiere que el usuario esté autenticado
 * Si no lo está, redirige a /login
 *
 * Uso: const user = await requireAuth()
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Requiere que el usuario tenga uno de los roles especificados
 * Si no tiene permiso, redirige a su ruta por defecto
 *
 * Uso: const user = await requireRole(['AGENT', 'ADMIN'])
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    // Redirigir a ruta por defecto según rol
    switch (user.role) {
      case "ADMIN":
        redirect("/admin");
      case "AGENT":
        redirect("/dashboard");
      case "CLIENT":
        redirect("/perfil");
      default:
        redirect("/");
    }
  }

  return user;
}

/**
 * Verifica si el usuario actual tiene permiso sobre un recurso
 * (ej: editar una propiedad que le pertenece)
 *
 * Uso: const canEdit = await checkPermission(property.agentId)
 */
export async function checkPermission(
  resourceOwnerId: string,
  allowAdminOverride = true,
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // ADMIN puede todo (si está habilitado)
  if (allowAdminOverride && user.role === "ADMIN") {
    return true;
  }

  // Verificar ownership
  return user.id === resourceOwnerId;
}

/**
 * Requiere que el usuario sea dueño del recurso o ADMIN
 * Si no tiene permiso, lanza error
 *
 * Uso: await requireOwnership(property.agentId)
 */
export async function requireOwnership(
  resourceOwnerId: string,
  errorMessage = "No tienes permiso para realizar esta acción",
) {
  const hasPermission = await checkPermission(resourceOwnerId);

  if (!hasPermission) {
    throw new Error(errorMessage);
  }
}

/**
 * Type para usuario seguro (usado en componentes)
 */
export type SafeUser = Awaited<ReturnType<typeof getCurrentUser>>;

/**
 * DEPRECATED: Usar getCurrentUser() en su lugar
 */
export async function getUserWithRole() {
  const user = await requireAuth();
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  return {
    ...authUser!,
    dbUser: user,
  };
}
