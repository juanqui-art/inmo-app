/**
 * USER REPOSITORY
 *
 * Abstrae todas las operaciones de base de datos relacionadas con usuarios
 * Centraliza lógica de negocio y validaciones
 */

import type { Prisma, User, UserRole } from "@prisma/client";
import { db } from "../client";
import { sanitizePlainText, sanitizeOptional } from "../utils/sanitize";

/**
 * User select (campos seguros para retornar)
 * Excluye información sensible
 */
export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  avatar: true,
  subscriptionTier: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Pick<User, keyof typeof userSelect>;

/**
 * Repository para operaciones de usuarios
 */
export class UserRepository {
  /**
   * Encuentra un usuario por ID
   */
  async findById(id: string): Promise<SafeUser | null> {
    return db.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  /**
   * Encuentra un usuario por email
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    return db.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    return db.user.create({
      data,
      select: userSelect,
    });
  }

  /**
   * Actualiza un usuario existente
   * Incluye validación de permisos
   *
   * SANITIZATION: User-provided text fields are sanitized to prevent XSS attacks
   * - name, phone: Plain text only (no HTML)
   * - avatar: URL validation handled separately (not sanitized as HTML)
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput,
    currentUserId: string,
  ): Promise<SafeUser> {
    // Solo el propio usuario o un admin pueden actualizar
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const canUpdate = currentUser.id === id || currentUser.role === "ADMIN";

    if (!canUpdate) {
      throw new Error("Unauthorized: Cannot update other users");
    }

    // Sanitize user-provided fields (Defense in Depth - Layer 2)
    const sanitizedData: Prisma.UserUpdateInput = {
      ...data,
      ...(data.name && { name: sanitizeOptional(data.name as string | null, sanitizePlainText) }),
      ...(data.phone && { phone: sanitizeOptional(data.phone as string | null, sanitizePlainText) }),
      // Note: avatar is a URL and should be validated separately (not HTML sanitized)
    };

    return db.user.update({
      where: { id },
      data: sanitizedData,
      select: userSelect,
    });
  }

  /**
   * Elimina un usuario
   * Solo admins pueden eliminar usuarios
   */
  async delete(id: string, currentUserId: string): Promise<SafeUser> {
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only admins can delete users");
    }

    return db.user.delete({
      where: { id },
      select: userSelect,
    });
  }

  /**
   * Lista usuarios con filtros y paginación
   */
  async list(params: {
    role?: UserRole;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ users: SafeUser[]; total: number }> {
    const { role, search, skip = 0, take = 20 } = params;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: userSelect,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Obtiene usuarios que son agentes
   */
  async getAgents(): Promise<SafeUser[]> {
    return db.user.findMany({
      where: { role: "AGENT" },
      select: userSelect,
      orderBy: { name: "asc" },
    });
  }
}

/**
 * Singleton del repositorio
 * Usar este en lugar de crear nuevas instancias
 */
export const userRepository = new UserRepository();
