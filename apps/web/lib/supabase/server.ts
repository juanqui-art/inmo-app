/**
 * SUPABASE CLIENT - Para usar en el SERVIDOR
 *
 * ¿Cuándo usar este client?
 * - En Server Components (componentes SIN 'use client')
 * - En Server Actions (funciones con 'use server')
 * - En API Routes
 *
 * ¿Cómo funciona?
 * - Crea un client que lee las cookies desde el REQUEST del servidor
 * - Next.js maneja las cookies de forma especial en el servidor
 * - Necesita usar cookies() de 'next/headers'
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Obtener el objeto de cookies del request
  const cookieStore = await cookies();

  // Crear el client de Supabase para servidor
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Función para LEER cookies
        getAll() {
          return cookieStore.getAll();
        },
        // Función para ESCRIBIR cookies (cuando hay login/logout)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Esto puede fallar en Server Components (solo lectura)
            // Los Server Actions SÍ pueden escribir cookies
          }
        },
      },
    },
  );
}
