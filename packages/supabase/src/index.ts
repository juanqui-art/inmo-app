/**
 * @repo/supabase
 *
 * Paquete compartido para configuración y utilidades de Supabase
 */

// Re-export Supabase types para conveniencia
export type {
  AuthError,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
// Export clients
export { createAdminClient, createClient, validateSupabaseEnv } from "./client";
