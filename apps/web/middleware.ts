/**
 * MIDDLEWARE - Protección de Rutas
 *
 * ¿Qué hace?
 * 1. Se ejecuta ANTES de cada request
 * 2. Verifica si el usuario está autenticado
 * 3. Refresca tokens expirados automáticamente
 * 4. Redirige a /login si no está autenticado
 *
 * ¿Dónde se ejecuta?
 * - Todas las rutas definidas en 'matcher'
 * - NO se ejecuta en /login, /signup (públicas)
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas que no requieren autenticación
  const publicPaths = ['/login', '/signup', '/']
  const isPublicPath = publicPaths.some((path) => pathname === path)

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

  // Verificar usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas (requieren auth)
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    // No hay sesión, redirigir a login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si está autenticado y va a login/signup, redirigir a dashboard
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
