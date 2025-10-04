/**
 * SUPABASE CLIENTS - Configuración base
 *
 * Este paquete provee funciones para crear clientes de Supabase
 * reutilizables en diferentes contextos (browser, server, etc.)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase genérico
 * Útil para contexts donde no necesitas SSR (scripts, CLIs, etc.)
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Crea un cliente de Supabase con Service Role Key (admin)
 * ADVERTENCIA: Solo usar en servidor, NUNCA en browser
 * Bypasea Row Level Security (RLS)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Valida que las variables de entorno de Supabase existan
 */
export function validateSupabaseEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing required Supabase environment variables: ${missing.join(', ')}`)
  }

  return true
}
