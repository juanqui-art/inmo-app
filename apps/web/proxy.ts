/**
 * PROXY - Protección Centralizada de Rutas (Autenticación + Autorización)
 *
 * ¿Qué hace?
 * 1. Se ejecuta ANTES de cada request
 * 2. Verifica si el usuario está autenticado
 * 3. Refresca tokens expirados automáticamente
 * 4. Valida ROLES usando user_metadata (sin consultar DB)
 * 5. Redirige según autenticación y autorización
 * 6. Registra eventos de seguridad (logging)
 *
 * Rutas protegidas:
 * - /dashboard/* → Requiere AGENT o ADMIN
 * - /admin/* → Requiere ADMIN
 * - /perfil/* → Requiere autenticación (cualquier rol)
 *
 * NOTA: Las páginas mantienen validación con requireRole() como segunda capa
 * de defensa (defense in depth). El proxy es la primera línea de seguridad.
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// Tipos de roles permitidos
type UserRole = "CLIENT" | "AGENT" | "ADMIN";

// Configuración de rutas protegidas
const routePermissions = {
  "/dashboard": ["AGENT", "ADMIN"] as UserRole[],
  "/admin": ["ADMIN"] as UserRole[],
  "/perfil": ["CLIENT", "AGENT", "ADMIN"] as UserRole[], // Todos los roles autenticados
} as const;

/**
 * Registra eventos de seguridad (intentos de acceso no autorizado)
 */
function logSecurityEvent(
  event: "unauthorized_access" | "role_mismatch" | "missing_role",
  details: {
    pathname: string;
    userId?: string;
    userRole?: string;
    requiredRoles?: string[];
  },
) {
  console.warn(`[SECURITY] ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
    userAgent: "proxy",
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Verificar usuario autenticado y obtener metadata
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener rol del user_metadata (guardado durante signup)
  const userRole = user?.user_metadata?.role as UserRole | undefined;

  // 1. Verificar rutas protegidas que requieren roles específicos
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      // Sin usuario → redirigir a login
      if (!user) {
        logSecurityEvent("unauthorized_access", {
          pathname,
          requiredRoles: allowedRoles,
        });
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Usuario sin rol en metadata → redirigir a login (inconsistencia)
      if (!userRole) {
        logSecurityEvent("missing_role", {
          pathname,
          userId: user.id,
          requiredRoles: allowedRoles,
        });
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Usuario con rol NO permitido → redirigir a su área
      if (!allowedRoles.includes(userRole)) {
        logSecurityEvent("role_mismatch", {
          pathname,
          userId: user.id,
          userRole,
          requiredRoles: allowedRoles,
        });

        // Redirigir según rol actual
        const redirectMap: Record<UserRole, string> = {
          ADMIN: "/admin",
          AGENT: "/dashboard",
          CLIENT: "/perfil",
        };

        const redirectUrl = new URL(redirectMap[userRole] || "/", request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Usuario autorizado → continuar
      break;
    }
  }

  // 2. Si está autenticado y va a login/signup, redirigir a su área
  if (user && userRole && (pathname === "/login" || pathname === "/signup")) {
    const redirectMap: Record<UserRole, string> = {
      ADMIN: "/admin",
      AGENT: "/dashboard",
      CLIENT: "/perfil",
    };

    const redirectUrl = new URL(redirectMap[userRole] || "/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

// Configurar dónde se ejecuta el proxy
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - public files (png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
