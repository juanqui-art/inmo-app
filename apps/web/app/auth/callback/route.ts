/**
 * AUTH CALLBACK - Maneja redirect de OAuth providers
 *
 * Flujo seguro (sin localStorage):
 * 1. Google redirige aquí con "code" + nuestros parámetros (plan, returnUrl)
 * 2. Intercambiamos el code por una sesión
 * 3. Determinamos rol según plan (igual que signupAction)
 * 4. Actualizamos user_metadata con rol si es necesario
 * 5. Redirigimos según rol/plan
 *
 * Parámetros URL:
 * - code: Código de autorización de OAuth (requerido)
 * - plan: "free" | "basic" | "pro" (opcional, desde /vender)
 * - returnUrl: URL a redirigir después del auth (opcional)
 *
 * Flujo de roles (consistente con signupAction):
 * - Sin plan → CLIENT → returnUrl o /perfil
 * - Con plan → AGENT → /dashboard (con upgrade si es pago)
 */

import { createClient } from "@/lib/supabase/server";
import { userRepository } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const plan = searchParams.get("plan");
  const returnUrl = searchParams.get("returnUrl");

  // Si viene un error de OAuth (usuario canceló, etc.)
  const error = searchParams.get("error");
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  // Si hay código, intercambiarlo por sesión
  if (code) {
    const supabase = await createClient();

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data.user) {
      console.error("Error exchanging code:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    // Determinar rol según plan (misma lógica que signupAction)
    const hasPlan = plan && ["free", "basic", "pro"].includes(plan.toLowerCase());
    const role = hasPlan ? "AGENT" : "CLIENT";

    // Verificar si el usuario ya existe en DB
    const existingUser = await userRepository.findById(data.user.id);

    if (existingUser) {
      // Usuario existente
      let userRole = existingUser.role;

      // UPGRADE ROLE if plan selected (e.g. CLIENT logging in from /vender via Google)
      if (
        plan &&
        ["free", "basic", "pro"].includes(plan.toLowerCase()) &&
        userRole === "CLIENT"
      ) {
        // Upgrade to AGENT
        const newRole = "AGENT";
        
        // 1. Update DB
        await userRepository.update(existingUser.id, { role: newRole }, existingUser.id);
        userRole = newRole; // Update local for redirect logic

        // 2. Update Supabase Metadata
        await supabase.auth.updateUser({
          data: {
            ...data.user.user_metadata,
            role: newRole,
            plan: plan,
          },
        });

        console.log("[AUTH CALLBACK] Upgraded user role", { 
          userId: existingUser.id, 
          oldRole: "CLIENT", 
          newRole, 
          plan 
        });
      }

      // Redirigir según rol (actualizado o existente)
      if (returnUrl && returnUrl.startsWith("/")) {
        return NextResponse.redirect(`${origin}${returnUrl}`);
      }

      switch (userRole) {
        case "ADMIN":
          return NextResponse.redirect(`${origin}/admin`);
        case "AGENT":
          // AGENT con plan pago → dashboard con modal de upgrade
          if (plan && ["basic", "pro"].includes(plan.toLowerCase())) {
            return NextResponse.redirect(
              `${origin}/dashboard?upgrade=${plan.toLowerCase()}&authSuccess=true`
            );
          }
          // AGENT con plan FREE → directo a crear propiedad (si venía de /vender)
          if (plan) {
             return NextResponse.redirect(
              `${origin}/dashboard/propiedades/nueva?authSuccess=true`
            );
          }
          return NextResponse.redirect(`${origin}/dashboard`);
        case "CLIENT":
        default:
          return NextResponse.redirect(`${origin}/perfil`);
      }
    }

    // Usuario nuevo - actualizar metadata con rol determinado
    // El trigger de DB usa user_metadata.role para crear el usuario
    await supabase.auth.updateUser({
      data: {
        ...data.user.user_metadata,
        role,
        plan: plan || null,
      },
    });

    // Esperar un momento para que el trigger de DB procese
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirigir según rol asignado
    if (role === "AGENT") {
      // AGENT con plan pago → dashboard con modal de upgrade
      if (plan && ["basic", "pro"].includes(plan.toLowerCase())) {
        return NextResponse.redirect(
          `${origin}/dashboard?upgrade=${plan.toLowerCase()}&authSuccess=true`
        );
      }
      // AGENT con plan FREE → directo a crear propiedad
      return NextResponse.redirect(
        `${origin}/dashboard/propiedades/nueva?authSuccess=true`
      );
    }

    // CLIENT → returnUrl o perfil
    if (returnUrl && returnUrl.startsWith("/")) {
      return NextResponse.redirect(`${origin}${returnUrl}?authSuccess=true`);
    }

    return NextResponse.redirect(`${origin}/perfil?authSuccess=true`);
  }

  // Si no hay code ni error, redirigir a login
  return NextResponse.redirect(`${origin}/login`);
}
