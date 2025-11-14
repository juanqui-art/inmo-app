# Sistema de Autenticación - InmoApp

> Documentación completa del sistema de autenticación | Última actualización: Noviembre 14, 2025

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#-arquitectura-general)
2. [Modelo de Datos](#️-modelo-de-datos)
3. [Flujos de Autenticación](#-flujos-de-autenticación)
   - [Signup (Email/Password)](#1️⃣-flujo-de-registro-signup---emailpassword)
   - [Login (Email/Password)](#2️⃣-flujo-de-login-emailpassword)
   - [OAuth (Google)](#3️⃣-flujo-de-oauth-google-login)
4. [Protección de Rutas](#️-protección-de-rutas)
5. [Sistema de Cookies y Sesiones](#-sistema-de-cookies-y-sesiones)
6. [Database Trigger](#-database-trigger---sincronización-automática)
7. [Componentes Clave](#-componentes-clave)
8. [Seguridad y Mejores Prácticas](#-seguridad-y-mejores-prácticas)
9. [Ejemplo Completo: Flujo de Favoritos](#-flujo-completo---ejemplo-real)
10. [Referencias](#-referencias)

---

## 🏗️ Arquitectura General

El sistema de autenticación de InmoApp está construido sobre **Supabase Auth** y sigue una arquitectura moderna de Next.js 16 con múltiples capas de seguridad.

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  • Componentes UI (auth-modal.tsx, google-button.tsx)       │
│  • Client-side Supabase (usa cookies del navegador)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  PROXY (Edge Runtime)                        │
├─────────────────────────────────────────────────────────────┤
│  • Intercepta TODAS las requests                            │
│  • Refresca tokens expirados automáticamente                │
│  • Protege rutas (/dashboard, /admin, /perfil)             │
│  • NO valida roles (solo autenticación básica)              │
│  📂 apps/web/proxy.ts                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER COMPONENTS / ACTIONS                     │
├─────────────────────────────────────────────────────────────┤
│  • Server Actions (signupAction, loginAction, logoutAction) │
│  • Auth Helpers (getCurrentUser, requireAuth, requireRole)  │
│  • Server-side Supabase (usa cookies del request)          │
│  📂 apps/web/app/actions/auth.ts                           │
│  📂 apps/web/lib/auth.ts                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                             │
├─────────────────────────────────────────────────────────────┤
│  • Maneja autenticación (email/password + OAuth)            │
│  • Gestiona tokens JWT                                       │
│  • Almacena metadata del usuario                            │
│  • Tabla: auth.users (sistema de Supabase)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (Database Trigger)
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────┤
│  • Tabla: public.users (datos de usuario + rol)            │
│  • Trigger: sync_user_from_auth() - sincroniza auth→DB      │
│  • Repositorio: UserRepository (abstrae operaciones)        │
│  📂 packages/database/prisma/schema.prisma                 │
│  📂 packages/database/src/repositories/users.ts            │
└─────────────────────────────────────────────────────────────┘
```

### Principios Clave

1. **Separación de Responsabilidades**: Auth (Supabase) y Data (PostgreSQL) son sistemas independientes
2. **Sincronización Automática**: Database trigger mantiene ambos sistemas sincronizados
3. **Seguridad Multicapa**: 3 capas de validación (proxy, layout, server action)
4. **Type-Safety**: TypeScript + Zod para validación end-to-end

---

## 🗂️ Modelo de Datos

### Tabla `users` (PostgreSQL - Prisma)

**Ubicación:** `packages/database/prisma/schema.prisma:18-35`

```typescript
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      UserRole @default(CLIENT)  // ← ROLES: CLIENT, AGENT, ADMIN
  phone     String?
  avatar    String?  // ← Google profile photo
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  properties   Property[]   // Propiedades que creó (si es AGENT)
  favorites    Favorite[]   // Favoritos del usuario
  appointments Appointment[] // Citas agendadas
}

enum UserRole {
  CLIENT  // Puede buscar, favoritar, agendar citas
  AGENT   // Puede crear/editar propiedades + todo lo de CLIENT
  ADMIN   // Acceso completo (futuro)
}
```

### Tabla `auth.users` (Supabase Auth)

Esta tabla es manejada automáticamente por Supabase y contiene:

```json
{
  "id": "uuid-del-usuario",
  "email": "juan@example.com",
  "encrypted_password": "bcrypt-hash",
  "email_confirmed_at": "2025-11-14T10:00:00Z",
  "raw_user_meta_data": {
    "name": "Juan Pérez",
    "role": "CLIENT",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  }
}
```

### Sincronización

**Importante**: La tabla `public.users` está **sincronizada automáticamente** con `auth.users` mediante un Database Trigger. Ver [Database Trigger](#-database-trigger---sincronización-automática).

---

## 🔄 Flujos de Autenticación

### 1️⃣ Flujo de Registro (Signup - Email/Password)

**Ubicación:** `apps/web/app/actions/auth.ts:33-98`

```
Usuario llena formulario → Validación Zod → Supabase.signUp() →
Database Trigger → Usuario creado en DB → Redirige según rol
```

#### Paso a Paso Detallado

**1. Usuario ingresa datos:**
```typescript
{
  name: "Juan Pérez",
  email: "juan@example.com",
  password: "Pass1234",
  role: "CLIENT"
}
```

**2. Validación con Zod** (`apps/web/lib/validations/auth.ts:40-57`)
```typescript
const signupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[a-zA-Z]/, "Debe contener al menos una letra")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  role: z.enum(["CLIENT", "AGENT", "ADMIN"]),
});
```

**3. Llamada a Supabase Auth** (`apps/web/app/actions/auth.ts:58-69`)
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      role,  // ← Este metadata es capturado por el trigger
    },
  },
});
```

**4. Database Trigger se ejecuta automáticamente**
- Detecta nuevo usuario en `auth.users`
- Crea registro en `public.users` con metadata
- Asigna el rol especificado

**5. Supabase guarda sesión en cookies**
```
sb-<project>-auth-token
sb-<project>-auth-token-code-verifier
```

**6. Redirección según rol** (`apps/web/app/actions/auth.ts:88-97`)
```typescript
switch (role) {
  case "CLIENT": redirect("/perfil")
  case "AGENT": redirect("/dashboard")
  case "ADMIN": redirect("/admin")
}
```

---

### 2️⃣ Flujo de Login (Email/Password)

**Ubicación:** `apps/web/app/actions/auth.ts:109-175`

```
Usuario ingresa credenciales → Validación → Supabase.signInWithPassword() →
Consulta rol desde DB → Redirige según rol
```

#### Paso a Paso Detallado

**1. Usuario ingresa credenciales:**
```typescript
{
  email: "juan@example.com",
  password: "Pass1234"
}
```

**2. Validación básica con Zod** (`apps/web/lib/validations/auth.ts:23-29`)

**3. Autenticación con Supabase** (`apps/web/app/actions/auth.ts:131-134`)
```typescript
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**4. Consulta rol del usuario desde DB** (`apps/web/app/actions/auth.ts:150-151`)
```typescript
const dbUser = await userRepository.findById(authData.user.id);
```

**¿Por qué consultar la DB?** Porque el rol está en `public.users`, NO en `auth.users`. La base de datos de PostgreSQL es nuestra fuente de verdad para permisos.

**5. Validación adicional** (`apps/web/app/actions/auth.ts:153-159`)
```typescript
if (!dbUser) {
  // Usuario existe en auth pero no en DB (caso edge)
  await supabase.auth.signOut();
  return { error: { general: "Usuario no encontrado" } };
}
```

**6. Redirección según rol** (`apps/web/app/actions/auth.ts:165-174`)

---

### 3️⃣ Flujo de OAuth (Google Login)

Este es el flujo más complejo. Involucra redirecciones entre múltiples dominios.

```
Click "Google" → Guarda intent → Redirige a Google → Usuario autoriza →
Google redirige a /auth/callback → Intercambia code por sesión →
Trigger crea usuario en DB → Redirige a /perfil → Ejecuta intent
```

#### Diagrama de Flujo Detallado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace click en "Continuar con Google"              │
│    📂 google-button.tsx:26                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Guarda "intent" en localStorage                           │
│    Ejemplo: { action: "favorite", propertyId: "123" }       │
│    📂 auth-modal.tsx:39-49                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Llama a Supabase OAuth API                                │
│    supabase.auth.signInWithOAuth({                          │
│      provider: "google",                                     │
│      redirectTo: "/auth/callback"                           │
│    })                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Supabase redirige al usuario a Google                    │
│    URL: https://accounts.google.com/o/oauth2/v2/auth?...    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Usuario aprueba en Google                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Google redirige de vuelta a InmoApp                       │
│    URL: /auth/callback?code=ABC123...                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Callback handler intercepta el request                    │
│    📂 app/auth/callback/route.ts:15                         │
│                                                              │
│    a) Extrae el "code" del query param                      │
│    b) Intercambia code por sesión:                          │
│       supabase.auth.exchangeCodeForSession(code)            │
│    c) Supabase guarda cookies de sesión                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Database Trigger se ejecuta                               │
│    📂 migrations/sync-google-avatar.sql:9-42                │
│                                                              │
│    INSERT INTO public.users (                                │
│      id, email, name, avatar                                 │
│    ) VALUES (                                                │
│      new.id,                                                 │
│      new.email,                                              │
│      new.raw_user_meta_data->>'full_name',                  │
│      new.raw_user_meta_data->>'avatar_url'  ← Google photo  │
│    ) ON CONFLICT DO UPDATE                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Redirige a /perfil con flag de éxito                     │
│    URL: /perfil?authSuccess=true                            │
│    📂 callback/route.ts:42                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. AuthSuccessHandler detecta el flag                       │
│     📂 auth-success-handler.tsx:18                          │
│                                                              │
│     a) Lee intent del localStorage                          │
│     b) Ejecuta la acción (ej: guardar favorito)            │
│     c) Muestra modal de éxito                               │
│     d) Redirige de vuelta a la página original              │
└─────────────────────────────────────────────────────────────┘
```

#### Código Clave

**Google Button** (`apps/web/components/auth/google-button.tsx:26-45`)
```typescript
const handleGoogleLogin = async () => {
  // 1. Guardar intent antes del redirect
  onBeforeRedirect?.()

  // 2. Iniciar OAuth flow
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  // Si no hay error, Google redirige automáticamente
}
```

**Callback Handler** (`apps/web/app/auth/callback/route.ts:15-47`)
```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    // Intercambiar code por sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ✅ Éxito - Usuario autenticado
      // El trigger ya creó el usuario en DB
      return NextResponse.redirect(`${origin}/perfil?authSuccess=true`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
```

---

## 🛡️ Protección de Rutas

InmoApp usa un sistema de **doble capa** para proteger rutas:

### Capa 1: Proxy (Edge Runtime) - Autenticación Básica

**Ubicación:** `apps/web/proxy.ts:26-81`

```typescript
const protectedRoutes = ["/dashboard", "/admin", "/perfil"]

export async function proxy(request: NextRequest) {
  // 1. Crear cliente de Supabase que maneja cookies
  const supabase = createServerClient(...)

  // 2. Verificar si hay usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // 4. Si es ruta protegida y no hay usuario → redirigir a /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)  // Guardar destino
    return NextResponse.redirect(loginUrl)
  }

  // 5. Si está autenticado y va a /login → redirigir a /dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}
```

**¿Por qué no validar roles aquí?**

El proxy se ejecuta en **Edge Runtime** (Vercel Edge), que **NO puede usar Prisma**. Por lo tanto, no puede consultar el rol del usuario desde la base de datos.

**Configuración del matcher** (`apps/web/proxy.ts:84-95`)
```typescript
export const config = {
  matcher: [
    // Ejecutar en todas las rutas EXCEPTO archivos estáticos
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

### Capa 2: Server Components - Validación de Roles

**Ejemplo:** Layout de dashboard (hipotético)

```typescript
// apps/web/app/dashboard/layout.tsx
import { requireRole } from "@/lib/auth"

export default async function DashboardLayout({ children }) {
  // Solo AGENT y ADMIN pueden acceder
  const user = await requireRole(['AGENT', 'ADMIN'])

  return <div>{children}</div>
}
```

### Helpers de Autorización

**Ubicación:** `apps/web/lib/auth.ts:22-126`

#### 1. `getCurrentUser()` - Obtener usuario actual

```typescript
/**
 * Obtiene el usuario autenticado actual con su rol desde DB
 * Retorna null si no hay usuario autenticado
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  // Consultar usuario completo desde DB (incluye rol)
  const dbUser = await userRepository.findById(authUser.id)

  if (!dbUser) {
    // Usuario en Supabase Auth pero no en DB → logout
    await supabase.auth.signOut()
    return null
  }

  return dbUser
}
```

#### 2. `requireAuth()` - Requerir autenticación

```typescript
/**
 * Requiere que el usuario esté autenticado
 * Si no lo está, redirige a /login
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
```

#### 3. `requireRole()` - Requerir rol específico

```typescript
/**
 * Requiere que el usuario tenga uno de los roles especificados
 * Si no tiene permiso, redirige a su ruta por defecto
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    // Redirigir a ruta por defecto según rol
    switch (user.role) {
      case "CLIENT": redirect("/perfil")
      case "AGENT": redirect("/dashboard")
      case "ADMIN": redirect("/admin")
    }
  }

  return user
}
```

#### 4. `checkPermission()` - Verificar ownership

```typescript
/**
 * Verifica si el usuario actual tiene permiso sobre un recurso
 * (ej: editar una propiedad que le pertenece)
 */
export async function checkPermission(
  resourceOwnerId: string,
  allowAdminOverride = true
): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) return false

  // ADMIN puede todo (si está habilitado)
  if (allowAdminOverride && user.role === "ADMIN") {
    return true
  }

  // Verificar ownership
  return user.id === resourceOwnerId
}
```

#### 5. `requireOwnership()` - Requerir ser dueño

```typescript
/**
 * Requiere que el usuario sea dueño del recurso o ADMIN
 * Si no tiene permiso, lanza error
 */
export async function requireOwnership(
  resourceOwnerId: string,
  errorMessage = "No tienes permiso para realizar esta acción"
) {
  const hasPermission = await checkPermission(resourceOwnerId)

  if (!hasPermission) {
    throw new Error(errorMessage)
  }
}
```

### Ejemplo de Uso en Server Action

```typescript
// apps/web/app/actions/properties.ts (ejemplo)
export async function deletePropertyAction(propertyId: string) {
  // 1. Obtener la propiedad
  const property = await propertyRepository.findById(propertyId)

  if (!property) {
    return { error: "Propiedad no encontrada" }
  }

  // 2. Verificar que el usuario tenga permiso (es el agente o es admin)
  await requireOwnership(property.agentId)

  // 3. Eliminar propiedad
  await propertyRepository.delete(propertyId)

  revalidatePath("/dashboard")
  return { success: true }
}
```

---

## 🍪 Sistema de Cookies y Sesiones

### Tipos de Clientes de Supabase

InmoApp usa **3 tipos diferentes** de clientes de Supabase según el contexto:

#### 1. Browser Client (Client Components)

**Ubicación:** `apps/web/lib/supabase/client.ts:17-23`

```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

**Usado en:**
- Componentes con `"use client"`
- Botones interactivos
- Google OAuth button

**Características:**
- ✅ Lee/escribe cookies del navegador automáticamente
- ✅ Detecta cambios de sesión en tiempo real
- ❌ No puede usarse en servidor

---

#### 2. Server Client (Server Components / Actions)

**Ubicación:** `apps/web/lib/supabase/server.ts:19-47`

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Puede fallar en Server Components (solo lectura)
            // Server Actions SÍ pueden escribir cookies
          }
        },
      },
    }
  )
}
```

**Usado en:**
- Server Components
- Server Actions
- API Routes

**Características:**
- ✅ Lee cookies del request del servidor
- ✅ Puede escribir cookies (en Server Actions)
- ❌ No puede escribir cookies en Server Components (solo lectura)

---

#### 3. Edge Client (Proxy)

**Ubicación:** `apps/web/proxy.ts:33-54`

```typescript
import { createServerClient } from "@supabase/ssr"

const supabase = createServerClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  }
)
```

**Usado en:**
- Proxy (anteriormente middleware)
- Se ejecuta en Edge Runtime (Vercel Edge)

**Características:**
- ✅ Intercepta todas las requests
- ✅ Refresca tokens expirados automáticamente
- ❌ NO puede usar Prisma (Edge Runtime no soporta PostgreSQL)

---

### Cookies que Supabase Guarda

Cuando un usuario inicia sesión, Supabase guarda estas cookies:

```
sb-<project-ref>-auth-token
sb-<project-ref>-auth-token-code-verifier
```

**Contenido del token:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v2.public.aHR0cHM6Ly9...",
  "expires_at": 1699999999,
  "user": {
    "id": "a1b2c3d4-...",
    "email": "juan@example.com",
    "user_metadata": {
      "name": "Juan Pérez",
      "role": "CLIENT",
      "avatar_url": "https://..."
    }
  }
}
```

**Expiración:**
- `access_token`: Expira en **1 hora**
- `refresh_token`: Expira en **30 días**

El **proxy** automáticamente refresca el `access_token` cuando expira, usando el `refresh_token`.

**Configuración de seguridad:**
- Cookies son `httpOnly` (no accesibles desde JavaScript)
- Cookies son `secure` (solo HTTPS en producción)
- Cookies son `sameSite: lax` (protección CSRF)

---

## 🔄 Database Trigger - Sincronización Automática

### ¿Qué Problema Resuelve?

**Problema:** Supabase Auth y PostgreSQL son dos sistemas separados:
- `auth.users` (Supabase) - Maneja autenticación, tokens, passwords
- `public.users` (PostgreSQL) - Maneja roles, datos de negocio, relaciones

**Solución:** Un Database Trigger que **sincroniza automáticamente** ambas tablas.

### Código del Trigger

**Ubicación:** `packages/database/migrations/sync-google-avatar.sql:9-49`

```sql
-- Crear función que sincroniza avatar y otros datos del usuario
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  -- Insertar nuevo usuario en public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    avatar,
    created_at,
    updated_at
  )
  VALUES (
    new.id,                                                -- ID de auth.users
    new.email,                                            -- Email
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),  -- Nombre
    new.raw_user_meta_data->>'avatar_url',               -- Avatar de Google
    now(),
    now()
  )
  -- Si el usuario ya existe (por ID), actualizar datos
  ON CONFLICT (id) DO UPDATE SET
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
```

### ¿Cuándo se Ejecuta?

```sql
AFTER INSERT OR UPDATE ON auth.users
```

Se ejecuta **después** de:
1. **Signup con email/password**: `supabase.auth.signUp()`
2. **Login con Google OAuth**: `supabase.auth.signInWithOAuth()`
3. **Actualización de metadata**: `supabase.auth.updateUser()`

### Flujo Visual

```
Usuario se registra
      ↓
supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name: "Juan", role: "CLIENT" }
  }
})
      ↓
auth.users (Supabase)
  INSERT INTO auth.users VALUES (
    id: "a1b2c3d4",
    email: "juan@example.com",
    raw_user_meta_data: { "name": "Juan", "role": "CLIENT" }
  )
      ↓
TRIGGER EJECUTA sync_user_from_auth()
      ↓
public.users (PostgreSQL)
  INSERT INTO public.users VALUES (
    id: "a1b2c3d4",  ← Mismo ID!
    email: "juan@example.com",
    name: "Juan",
    role: "CLIENT",  ← Extraído de metadata
    avatar: null
  )
      ↓
Usuario completamente creado en ambas tablas
```

---

## 📦 Componentes Clave

### 1. Auth Modal

**Ubicación:** `apps/web/components/auth/auth-modal.tsx:33-149`

Modal estilo Realtor.com que aparece cuando un usuario no autenticado intenta:
- Guardar un favorito
- Agendar una cita
- Acceder a funciones protegidas

```typescript
export function AuthModal({ open, onOpenChange, propertyId }) {
  const saveAuthIntent = () => {
    // Guardar intent en localStorage
    localStorage.setItem("authIntent", JSON.stringify({
      action: "favorite",
      propertyId,
      redirectTo: pathname  // Para volver después
    }))

    localStorage.setItem("showAuthSuccess", "true")
  }

  const handleContinueWithEmail = (e) => {
    saveAuthIntent()
    router.push(`/signup?email=${encodeURIComponent(email)}`)
  }

  const handleGoogleBeforeRedirect = () => {
    saveAuthIntent()
    // Google OAuth se encarga del resto
  }

  return (
    <Dialog>
      <form onSubmit={handleContinueWithEmail}>
        <Input type="email" />
        <Button>Continuar</Button>
      </form>
      <GoogleButton onBeforeRedirect={handleGoogleBeforeRedirect} />
    </Dialog>
  )
}
```

### 2. Auth Success Handler

**Ubicación:** `apps/web/components/auth/auth-success-handler.tsx:18-62`

Maneja el flujo post-autenticación:

```typescript
export function AuthSuccessHandler() {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Detectar si viene de OAuth exitoso
    const authSuccess = searchParams.get("authSuccess")

    if (authSuccess === "true") {
      setShowSuccess(true)

      // Leer intent del localStorage
      const intent = JSON.parse(localStorage.getItem("authIntent"))

      // Redirigir de vuelta después de 2.5s
      setTimeout(() => {
        router.push(intent.redirectTo || "/")
      }, 2500)
    }
  }, [searchParams])

  return (
    <>
      <AuthIntentExecutor />  {/* Ejecuta el favorito */}
      <SuccessModal open={showSuccess} autoCloseDuration={2500} />
    </>
  )
}
```

### 3. User Repository

**Ubicación:** `packages/database/src/repositories/users.ts:31-161`

Abstrae todas las operaciones con usuarios:

```typescript
export class UserRepository {
  // Buscar por ID (usado constantemente en auth)
  async findById(id: string): Promise<SafeUser | null> {
    return db.user.findUnique({
      where: { id },
      select: userSelect  // Solo campos seguros
    })
  }

  // Actualizar usuario (con validación de permisos)
  async update(id: string, data: UserUpdateInput, currentUserId: string) {
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    // Solo el propio usuario o ADMIN pueden actualizar
    const canUpdate = currentUser.id === id || currentUser.role === 'ADMIN'

    if (!canUpdate) {
      throw new Error('Unauthorized')
    }

    return db.user.update({ where: { id }, data })
  }

  // Lista usuarios con filtros y paginación
  async list(params: {
    role?: UserRole
    search?: string
    skip?: number
    take?: number
  }): Promise<{ users: SafeUser[]; total: number }>

  // Obtiene usuarios que son agentes
  async getAgents(): Promise<SafeUser[]>
}

// Singleton del repositorio
export const userRepository = new UserRepository()
```

---

## 🔐 Seguridad y Mejores Prácticas

### 1. Validación en Múltiples Capas

```
Client-side (UI)
   ↓ (validación básica de UX)
Server Action
   ↓ (validación con Zod + autenticación)
Repository
   ↓ (validación de permisos)
Database
   ↓ (Row Level Security - RLS)
```

### 2. Nunca Confiar en Datos del Cliente

```typescript
// ❌ MAL - Confiar en datos del cliente
export async function deleteProperty(propertyId: string) {
  await db.property.delete({ where: { id: propertyId } })
}

// ✅ BIEN - Validar ownership
export async function deleteProperty(propertyId: string) {
  const property = await propertyRepository.findById(propertyId)
  await requireOwnership(property.agentId)  // Valida que sea el dueño
  await db.property.delete({ where: { id: propertyId } })
}
```

### 3. Passwords Nunca en DB Propia

Los passwords **NUNCA** se guardan en `public.users`. Supabase Auth los maneja con:
- Bcrypt hashing
- Salt automático
- Almacenamiento separado en `auth.users`

### 4. Tokens JWT Automáticos

Los tokens de sesión:
- Se guardan en cookies `httpOnly` (no accesibles desde JavaScript)
- Se refrescan automáticamente en el proxy
- Expiran en 1 hora (access token)
- Tienen refresh token de 30 días

### 5. Row Level Security (RLS)

Ver documentación completa en: `docs/architecture/RLS_POLICIES.md`

**Nota importante:** Prisma bypasea RLS porque usa el usuario `postgres` directamente. Por eso implementamos seguridad a nivel de aplicación (repositories + server actions).

### 6. CORS y CSRF Protection

- Cookies son `sameSite: lax` (protección CSRF)
- Supabase valida el origen de las requests
- Next.js incluye protección CSRF automática

---

## 🎯 Flujo Completo - Ejemplo Real

Vamos a seguir el flujo completo de un usuario que quiere guardar un favorito:

### Escenario: Usuario no autenticado quiere favoritar una propiedad

```
1. Usuario hace click en ❤️ (botón de favorito)
   📂 components/properties/favorite-button.tsx

   → Detecta que no hay sesión
   → Abre AuthModal

2. Usuario elige "Continuar con Google"
   📂 components/auth/google-button.tsx

   → Guarda intent en localStorage:
      { action: "favorite", propertyId: "123", redirectTo: "/propiedad/123" }
   → Redirige a Google OAuth

3. Google pide autorización
   → Usuario aprueba

4. Google redirige a /auth/callback?code=ABC123
   📂 app/auth/callback/route.ts

   → Intercambia code por sesión
   → Supabase guarda cookies
   → Database Trigger crea usuario en public.users
   → Redirige a /perfil?authSuccess=true

5. Página /perfil se carga
   📂 app/perfil/page.tsx

   → AuthSuccessHandler detecta authSuccess=true
   → Lee intent del localStorage
   → Ejecuta AuthIntentExecutor

6. AuthIntentExecutor ejecuta la acción
   📂 components/auth/auth-intent-executor.tsx

   → Lee: { action: "favorite", propertyId: "123" }
   → Llama a toggleFavoriteAction(propertyId)
   → Propiedad guardada en favoritos ✅

7. Redirige de vuelta a /propiedad/123
   → Muestra SuccessModal: "¡Bienvenido!"
   → Usuario ve su favorito guardado 🎉
```

---

## 📊 Resumen Visual de Componentes

```
FRONTEND
├── Componentes UI
│   ├── auth-modal.tsx           (Modal de autenticación)
│   ├── google-button.tsx        (Botón OAuth Google)
│   ├── auth-success-handler.tsx (Post-auth flow)
│   └── auth-intent-executor.tsx (Ejecuta acciones pendientes)
│
├── Client Supabase
│   └── lib/supabase/client.ts   (Browser client)

SERVER
├── Proxy
│   └── proxy.ts                  (Edge - Protección básica)
│
├── Server Actions
│   └── app/actions/auth.ts
│       ├── signupAction()        (Registro)
│       ├── loginAction()         (Login)
│       └── logoutAction()        (Logout)
│
├── Auth Helpers
│   └── lib/auth.ts
│       ├── getCurrentUser()      (Obtener usuario + rol)
│       ├── requireAuth()         (Requerir login)
│       ├── requireRole()         (Requerir rol específico)
│       └── requireOwnership()    (Requerir ser dueño)
│
├── Server Supabase
│   └── lib/supabase/server.ts   (Server client)
│
└── Validaciones
    └── lib/validations/auth.ts
        ├── loginSchema           (Zod - Login)
        └── signupSchema          (Zod - Signup)

DATABASE
├── Prisma Schema
│   └── schema.prisma
│       └── model User            (Tabla users)
│
├── Repository
│   └── repositories/users.ts
│       └── UserRepository        (Abstracción DB)
│
└── Migrations
    └── sync-google-avatar.sql
        └── sync_user_from_auth() (Trigger de sincronización)

EXTERNAL
└── Supabase Auth
    ├── auth.users               (Passwords, tokens)
    ├── OAuth Providers          (Google)
    └── JWT Tokens               (Sesiones)
```

---

## 🔍 Puntos Clave para Recordar

1. **Dos sistemas separados**:
   - `auth.users` (Supabase) → Autenticación, passwords, tokens
   - `public.users` (PostgreSQL) → Roles, datos de negocio

2. **Database Trigger sincroniza ambos** automáticamente

3. **Doble capa de protección**:
   - Proxy → Autenticación básica (Edge Runtime)
   - Server Components → Validación de roles (con acceso a DB)

4. **Tres tipos de clientes de Supabase**:
   - Browser (client components)
   - Server (server components/actions)
   - Edge (proxy)

5. **Cookies httpOnly** para seguridad (no accesibles desde JS)

6. **Tokens auto-refresh** en el proxy

7. **Validación en múltiples capas** (UI → Server Action → Repository → DB)

8. **OAuth flow complejo** pero transparente para el usuario

---

## 📚 Referencias

### Archivos Clave

- `apps/web/proxy.ts` - Protección de rutas (Edge)
- `apps/web/lib/auth.ts` - Helpers de autenticación
- `apps/web/app/actions/auth.ts` - Server Actions
- `apps/web/lib/supabase/client.ts` - Browser client
- `apps/web/lib/supabase/server.ts` - Server client
- `apps/web/lib/validations/auth.ts` - Schemas de validación
- `apps/web/components/auth/auth-modal.tsx` - Modal de auth
- `apps/web/components/auth/google-button.tsx` - OAuth button
- `apps/web/app/auth/callback/route.ts` - OAuth callback
- `packages/database/prisma/schema.prisma` - Modelo User
- `packages/database/src/repositories/users.ts` - UserRepository
- `packages/database/migrations/sync-google-avatar.sql` - Database trigger

### Documentación Relacionada

- [RLS Policies](./RLS_POLICIES.md) - Row Level Security
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Configuración de env vars
- [Project Structure](../getting-started/project-structure.md) - Arquitectura general

### Enlaces Externos

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 16 Proxy](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Validation](https://zod.dev/)

---

**Última actualización:** Noviembre 14, 2025
**Versión:** 1.0
**Autor:** Development Team
