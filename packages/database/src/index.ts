/**
 * @repo/database
 *
 * Paquete de acceso a base de datos usando Prisma ORM
 * Provee type-safe queries y mutations
 */

// Export Prisma Client instance
export { db } from './client'

// Re-export Prisma types para conveniencia
export * from '@prisma/client'

// Export repositories (implementados a continuación)
export * from './repositories'
