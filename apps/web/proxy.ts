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

import { env } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Tipos de roles permitidos
type UserRole = "CLIENT" | "AGENT" | "ADMIN";

// Configuración de rutas protegidas
const routePermissions = {
  "/dashboard": ["AGENT", "ADMIN"] as UserRole[],
  "/admin": ["ADMIN"] as UserRole[],
  "/perfil": ["CLIENT", "AGENT", "ADMIN"] as UserRole[], // Todos los usuarios autenticados
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
  const isDev = process.env.NODE_ENV === "development";

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
          CLIENT: "/perfil",
          ADMIN: "/admin",
          AGENT: "/dashboard",
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
      CLIENT: "/perfil",
      ADMIN: "/admin",
      AGENT: "/dashboard",
    };

    const redirectUrl = new URL(redirectMap[userRole] || "/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Agregar Security Headers
  // Development: Permissive CSP for Fast Refresh and HMR
  // Production: Strict CSP with whitelisted domains only
  const devCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
    "img-src 'self' data: blob: https://*",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss: http: https:",
    "frame-src 'self' https://accounts.google.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const prodCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
    "img-src 'self' data: blob: https://*.supabase.co https://*.tiles.mapbox.com https://api.mapbox.com https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://api.openai.com https://vitals.vercel-insights.com https://accounts.google.com wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Apply security headers
  supabaseResponse.headers.set("X-DNS-Prefetch-Control", "on");
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "origin-when-cross-origin");
  supabaseResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), interest-cohort=()");
  supabaseResponse.headers.set("Content-Security-Policy", isDev ? devCSP : prodCSP);

  // HSTS only in production (localhost doesn't have HTTPS)
  if (!isDev) {
    supabaseResponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
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
