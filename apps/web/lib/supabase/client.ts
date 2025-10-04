/**
 * SUPABASE CLIENT - Para usar en el BROWSER
 *
 * ¿Cuándo usar este client?
 * - En componentes con 'use client'
 * - Cuando el código se ejecuta en el navegador del usuario
 * - Ejemplo: Botones, forms interactivos, etc.
 *
 * ¿Cómo funciona?
 * - Crea un client de Supabase que puede leer/escribir cookies del browser
 * - Las cookies guardan la sesión del usuario (token de autenticación)
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Obtener las variables de entorno (URL y KEY de Supabase)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Crear el client que maneja cookies automáticamente
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
