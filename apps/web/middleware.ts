/**
 * MIDDLEWARE - Protección de Rutas (Autenticación)
 *
 * ¿Qué hace?
 * 1. Se ejecuta ANTES de cada request
 * 2. Verifica si el usuario está autenticado
 * 3. Refresca tokens expirados automáticamente
 * 4. Redirige a /login si no está autenticado
 *
 * NOTA: La validación de ROLES se hace en las páginas (Server Components)
 * para evitar consultas a DB en Edge Runtime (Prisma no funciona aquí)
 *
 * Rutas protegidas (requieren autenticación):
 * - /dashboard/* (validación de rol AGENT/ADMIN en layout)
 * - /admin/* (validación de rol ADMIN en layout)
 * - /perfil/* (validación de rol CLIENT en layout)
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/admin', '/perfil']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Si es ruta protegida y no hay usuario, redirigir a login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado y va a login/signup, redirigir a dashboard
  // (el layout de dashboard hará la validación de rol y redirigirá si es necesario)
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

// Configurar dónde se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - public files (png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
