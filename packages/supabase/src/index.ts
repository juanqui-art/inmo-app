/**
 * @repo/supabase
 *
 * Paquete compartido para configuración y utilidades de Supabase
 */

// Export clients
export { createClient, createAdminClient, validateSupabaseEnv } from './client'

// Re-export Supabase types para conveniencia
export type { SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js'
