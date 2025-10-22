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

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  // Crear el client que maneja cookies automáticamente
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
