/**
 * AUTH CALLBACK - Maneja redirect de OAuth providers
 *
 * ¿Qué hace?
 * 1. Google redirige aquí con un "code"
 * 2. Intercambiamos el code por una sesión
 * 3. Supabase guarda las cookies
 * 4. Redirigimos al dashboard
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Si viene un error de OAuth (usuario canceló, etc.)
  const error = searchParams.get("error");
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  // Si hay código, intercambiarlo por sesión
  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    // Éxito! Usuario autenticado
    // El trigger de DB ya creó el usuario en la tabla 'users'
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Si no hay code ni error, redirigir a login
  return NextResponse.redirect(`${origin}/login`);
}
