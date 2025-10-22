/**
 * SUPABASE CLIENTS - Configuración base
 *
 * Este paquete provee funciones para crear clientes de Supabase
 * reutilizables en diferentes contextos (browser, server, etc.)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@repo/env'

/**
 * Crea un cliente de Supabase genérico
 * Útil para contexts donde no necesitas SSR (scripts, CLIs, etc.)
 */
export function createClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Crea un cliente de Supabase con Service Role Key (admin)
 * ADVERTENCIA: Solo usar en servidor, NUNCA en browser
 * Bypasea Row Level Security (RLS)
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required to create an admin client. ' +
      'This should only be called on the server side.'
    )
  }

  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Valida que las variables de entorno de Supabase existan
 *
 * Note: This function is now a no-op since validation happens at module load
 * via @repo/env. Kept for backward compatibility.
 */
export function validateSupabaseEnv() {
  return true
}
