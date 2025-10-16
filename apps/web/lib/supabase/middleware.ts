/**
 * SUPABASE CLIENT - Para usar en MIDDLEWARE
 *
 * ¿Qué es el Middleware?
 * - Es código que se ejecuta ANTES de cada request
 * - Se usa para verificar si el usuario está autenticado
 * - Puede redirigir a /login si no hay sesión
 *
 * ¿Por qué un client especial?
 * - El middleware necesita REFRESCAR el token de autenticación
 * - Los tokens de Supabase expiran después de 1 hora
 * - Este client renueva automáticamente los tokens expirados
 *
 * ¿Cómo funciona?
 * - Lee las cookies del request
 * - Verifica si el token expiró
 * - Si expiró, pide uno nuevo a Supabase
 * - Actualiza las cookies del response
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  // Crear una respuesta que podemos modificar
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Leer cookies del request
        getAll() {
          return request.cookies.getAll();
        },
        // Escribir cookies en el response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: No solo leer el token, sino VALIDARLO con Supabase
  // Esto refresca automáticamente tokens expirados
  await supabase.auth.getUser();

  // Retornar el response (con cookies actualizadas si hubo refresh)
  return supabaseResponse;
}
