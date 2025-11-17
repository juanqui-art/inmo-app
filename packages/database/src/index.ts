/**
 * @repo/database
 *
 * Paquete de acceso a base de datos usando Prisma ORM
 * Provee type-safe queries y mutations
 */

// Re-export Prisma types para conveniencia
export * from "@prisma/client";
// Export Prisma Client instance
export { db } from "./client";

// Export repositories (implementados a continuación)
export * from "./repositories";
