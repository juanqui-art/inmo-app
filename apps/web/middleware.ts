/**
 * MIDDLEWARE - Protección de Rutas con Control de Roles
 *
 * ¿Qué hace?
 * 1. Se ejecuta ANTES de cada request
 * 2. Verifica si el usuario está autenticado
 * 3. Valida permisos según rol del usuario (CLIENT, AGENT, ADMIN)
 * 4. Refresca tokens expirados automáticamente
 * 5. Redirige según permisos y estado de autenticación
 *
 * Roles y Rutas:
 * - CLIENT: /perfil/* (favoritos, citas)
 * - AGENT: /dashboard/* (gestión de propiedades y citas)
 * - ADMIN: /admin/* (panel de administración)
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@repo/database'

// Mapeo de rutas a roles permitidos
const routePermissions: Record<string, string[]> = {
  '/dashboard': ['AGENT', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/perfil': ['CLIENT', 'AGENT', 'ADMIN'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas (no requieren autenticación)
  // const publicPaths = ['/login', '/signup', '/', '/propiedades']
  // const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith('/propiedades/'))

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

  // Obtener ruta protegida que coincida
  const protectedRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  )

  // Si es ruta protegida y no hay usuario, redirigir a login
  if (protectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay usuario y está en ruta protegida, verificar permisos
  if (protectedRoute && user) {
    const allowedRoles = routePermissions[protectedRoute]

    // Obtener rol del usuario desde la base de datos
    const dbUser = await userRepository.findById(user.id)

    if (!dbUser) {
      // Usuario no existe en DB, logout
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar si el rol del usuario está permitido para esta ruta
    if (allowedRoles && !allowedRoles.includes(dbUser.role)) {
      // No tiene permisos, redirigir según rol
      const redirectUrl = getDefaultRouteForRole(dbUser.role, request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si está autenticado y va a login/signup, redirigir según rol
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dbUser = await userRepository.findById(user.id)
    if (dbUser) {
      const redirectUrl = getDefaultRouteForRole(dbUser.role, request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

/**
 * Obtiene la ruta por defecto según el rol del usuario
 */
function getDefaultRouteForRole(role: string, baseUrl: string): URL {
  switch (role) {
    case 'ADMIN':
      return new URL('/admin', baseUrl)
    case 'AGENT':
      return new URL('/dashboard', baseUrl)
    case 'CLIENT':
      return new URL('/perfil', baseUrl)
    default:
      return new URL('/', baseUrl)
  }
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
