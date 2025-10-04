/**
 * PRISMA CLIENT - Database access layer
 *
 * Este módulo provee un singleton de PrismaClient
 * para acceso a la base de datos de forma type-safe
 */

import { PrismaClient } from '@prisma/client'

// Prisma Client Singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Instancia global de Prisma Client
 * Usar este para todas las queries a la base de datos
 *
 * @example
 * ```ts
 * const users = await db.user.findMany()
 * ```
 */
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// En desarrollo, guardar la instancia globalmente para hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
