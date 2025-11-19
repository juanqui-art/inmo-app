/**
 * SERVER ACTIONS - Admin
 *
 * Funciones administrativas para gestión de usuarios,
 * propiedades globales y métricas de la plataforma.
 *
 * SEGURIDAD: Todas las acciones verifican rol ADMIN
 */

"use server";

import { revalidatePath } from "next/cache";
import { db, userRepository, propertyRepository } from "@repo/database";
import type { UserRole, PropertyStatus, AppointmentStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";

// ==================== TYPES ====================

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalAppointments: number;
  totalFavorites: number;
  usersByRole: { role: UserRole; count: number }[];
  propertiesByStatus: { status: PropertyStatus; count: number }[];
  appointmentsByStatus: { status: AppointmentStatus; count: number }[];
  recentUsers: number; // Últimos 30 días
  recentProperties: number; // Últimos 30 días
}

export interface UserWithCounts {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    properties: number;
    favorites: number;
    appointments: number;
  };
}

export interface PropertyWithAgent {
  id: string;
  title: string;
  price: number;
  transactionType: string;
  category: string;
  status: PropertyStatus;
  city: string | null;
  state: string | null;
  createdAt: Date;
  agent: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    favorites: number;
    appointments: number;
  };
}

// ==================== USER MANAGEMENT ====================

/**
 * Obtiene lista de usuarios con conteos
 * Solo ADMIN puede acceder
 */
export async function getUsersAction(params?: {
  role?: UserRole;
  search?: string;
  skip?: number;
  take?: number;
}): Promise<{ users: UserWithCounts[]; total: number }> {
  // Verificar permisos
  await requireRole(["ADMIN"]);

  const { role, search, skip = 0, take = 20 } = params || {};

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            favorites: true,
            appointments: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}

/**
 * Obtiene un usuario específico por ID
 * Solo ADMIN puede acceder
 */
export async function getUserByIdAction(userId: string): Promise<UserWithCounts | null> {
  await requireRole(["ADMIN"]);

  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          properties: true,
          favorites: true,
          appointments: true,
        },
      },
    },
  });
}

/**
 * Actualiza el rol de un usuario
 * Solo ADMIN puede acceder
 * No puede cambiar su propio rol
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole(["ADMIN"]);

  // No puede cambiar su propio rol
  if (userId === admin.id) {
    return { success: false, error: "No puedes cambiar tu propio rol" };
  }

  try {
    await userRepository.update(userId, { role: newRole }, admin.id);

    revalidatePath("/admin/usuarios");
    revalidatePath(`/admin/usuarios/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar rol"
    };
  }
}

/**
 * Elimina un usuario (soft delete en el futuro, hard delete por ahora)
 * Solo ADMIN puede acceder
 * No puede eliminarse a sí mismo
 */
export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole(["ADMIN"]);

  // No puede eliminarse a sí mismo
  if (userId === admin.id) {
    return { success: false, error: "No puedes eliminar tu propia cuenta" };
  }

  try {
    await userRepository.delete(userId, admin.id);

    revalidatePath("/admin/usuarios");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar usuario"
    };
  }
}

// ==================== PROPERTY MANAGEMENT ====================

/**
 * Obtiene todas las propiedades con información del agente
 * Solo ADMIN puede acceder
 */
export async function getAllPropertiesAction(params?: {
  status?: PropertyStatus;
  search?: string;
  agentId?: string;
  skip?: number;
  take?: number;
}): Promise<{ properties: PropertyWithAgent[]; total: number }> {
  await requireRole(["ADMIN"]);

  const { status, search, agentId, skip = 0, take = 20 } = params || {};

  const where = {
    ...(status && { status }),
    ...(agentId && { agentId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { address: { contains: search, mode: "insensitive" as const } },
        { city: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        transactionType: true,
        category: true,
        status: true,
        city: true,
        state: true,
        createdAt: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            appointments: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    db.property.count({ where }),
  ]);

  // Convertir Decimal a number para serialización
  const serializedProperties = properties.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return { properties: serializedProperties, total };
}

/**
 * Actualiza el estado de una propiedad
 * Solo ADMIN puede acceder
 */
export async function updatePropertyStatusAction(
  propertyId: string,
  newStatus: PropertyStatus
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole(["ADMIN"]);

  try {
    await propertyRepository.update(propertyId, { status: newStatus }, admin.id);

    revalidatePath("/admin/propiedades");
    revalidatePath(`/propiedades/${propertyId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating property status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar estado"
    };
  }
}

/**
 * Elimina una propiedad
 * Solo ADMIN puede acceder
 */
export async function deletePropertyAction(
  propertyId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireRole(["ADMIN"]);

  try {
    await propertyRepository.delete(propertyId, admin.id);

    revalidatePath("/admin/propiedades");

    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar propiedad"
    };
  }
}

// ==================== ANALYTICS ====================

/**
 * Obtiene estadísticas globales de la plataforma
 * Solo ADMIN puede acceder
 */
export async function getAdminStatsAction(): Promise<AdminStats> {
  await requireRole(["ADMIN"]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalProperties,
    totalAppointments,
    totalFavorites,
    usersByRole,
    propertiesByStatus,
    appointmentsByStatus,
    recentUsers,
    recentProperties,
  ] = await Promise.all([
    // Total counts
    db.user.count(),
    db.property.count(),
    db.appointment.count(),
    db.favorite.count(),

    // Group by role
    db.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),

    // Group by status
    db.property.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    // Appointments by status
    db.appointment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    // Recent activity (last 30 days)
    db.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    db.property.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    totalUsers,
    totalProperties,
    totalAppointments,
    totalFavorites,
    usersByRole: usersByRole.map((u) => ({
      role: u.role,
      count: u._count.role,
    })),
    propertiesByStatus: propertiesByStatus.map((p) => ({
      status: p.status,
      count: p._count.status,
    })),
    appointmentsByStatus: appointmentsByStatus.map((a) => ({
      status: a.status,
      count: a._count.status,
    })),
    recentUsers,
    recentProperties,
  };
}

/**
 * Obtiene métricas por período para gráficas
 * Solo ADMIN puede acceder
 */
export async function getAdminMetricsByPeriodAction(
  days: number = 30
): Promise<{
  users: { date: string; count: number }[];
  properties: { date: string; count: number }[];
  appointments: { date: string; count: number }[];
}> {
  await requireRole(["ADMIN"]);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get users created per day
  const users = await db.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Get properties created per day
  const properties = await db.property.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Get appointments created per day
  const appointments = await db.appointment.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const groupByDate = (items: { createdAt: Date }[]) => {
    const grouped = new Map<string, number>();

    for (const item of items) {
      const date = item.createdAt.toISOString().split("T")[0];
      grouped.set(date, (grouped.get(date) || 0) + 1);
    }

    return Array.from(grouped.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  };

  return {
    users: groupByDate(users),
    properties: groupByDate(properties),
    appointments: groupByDate(appointments),
  };
}
