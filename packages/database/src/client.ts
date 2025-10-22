/**
 * PRISMA CLIENT - Database access layer
 *
 * Este módulo provee un singleton de PrismaClient
 * para acceso a la base de datos de forma type-safe
 */

import { PrismaClient } from '@prisma/client'
import { env } from '@repo/env'

// Prisma Client Singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Instancia global de Prisma Client
 * Usar este para todas las queries a la base de datos
 *
 * IMPORTANTE: Configurado para Supabase Pooler (PgBouncer)
 * - pgbouncer: true → Desactiva prepared statements
 * - connection_limit: 1 → Evita saturación del pool
 *
 * @example
 * ```ts
 * const users = await db.user.findMany()
 * ```
 */
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Configuración para Supabase Pooler (PgBouncer)
  // Referencia: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
  datasourceUrl: env.DATABASE_URL,
})

// En desarrollo, guardar la instancia globalmente para hot reload
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
