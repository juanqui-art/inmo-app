# Matriz de Permisos - InmoApp

> **Última actualización**: Noviembre 18, 2025
> **Status**: ✅ Implementado con Middleware de Protección Centralizada

---

## 📊 Resumen Ejecutivo

InmoApp implementa un sistema de **protección en 3 capas** (defense in depth):

1. **Proxy (proxy.ts)** → Primera línea: Verifica roles ANTES de llegar a las páginas
2. **Server Components** → Segunda línea: `requireRole()` en páginas sensibles
3. **Server Actions** → Tercera línea: Validación en operaciones de DB

---

## 🔒 Matriz de Permisos Completos

### Navegación de Páginas

| Ruta | CLIENT | AGENT | ADMIN | Protección |
|------|--------|-------|-------|------------|
| `/` (Home) | ✅ | ✅ | ✅ | Pública |
| `/propiedades` | ✅ | ✅ | ✅ | Pública |
| `/propiedades/[id]` | ✅ | ✅ | ✅ | Pública |
| `/buscar` | ✅ | ✅ | ✅ | Pública |
| `/agentes` | ✅ | ✅ | ✅ | Pública |
| `/login` | ✅ (no auth) | ✅ (no auth) | ✅ (no auth) | Pública |
| `/signup` | ✅ (no auth) | ✅ (no auth) | ✅ (no auth) | Pública |
| `/perfil` | ✅ | ✅ | ✅ | Proxy + `requireAuth()` |
| `/dashboard` | ❌ | ✅ | ✅ | **Proxy + `requireRole(['AGENT', 'ADMIN'])`** |
| `/dashboard/propiedades` | ❌ | ✅ | ✅ | **Proxy** |
| `/dashboard/propiedades/nueva` | ❌ | ✅ | ✅ | **Proxy** |
| `/dashboard/propiedades/[id]/editar` | ❌ | ✅ (owner) | ✅ | **Proxy + Ownership** |
| `/admin` | ❌ | ❌ | ✅ | **Proxy + `requireRole(['ADMIN'])`** |

**Notas**:
- ✅ (no auth): Solo visible si NO está autenticado
- ✅ (owner): Solo el dueño del recurso
- **Proxy**: Protegido por middleware centralizado (nueva capa Nov 2025)

---

### Operaciones sobre Propiedades

| Acción | CLIENT | AGENT | ADMIN | Server Action |
|--------|--------|-------|-------|---------------|
| Ver propiedades públicas | ✅ | ✅ | ✅ | - |
| Ver detalles de propiedad | ✅ | ✅ | ✅ | - |
| Buscar/Filtrar propiedades | ✅ | ✅ | ✅ | `searchPropertiesAction` |
| **Crear propiedad** | ❌ | ✅ | ✅ | `createPropertyAction` |
| **Editar propia propiedad** | ❌ | ✅ | ✅ | `updatePropertyAction` |
| **Editar propiedad de otro** | ❌ | ❌ | ✅ | `updatePropertyAction` |
| **Eliminar propia propiedad** | ❌ | ✅ | ✅ | `deletePropertyAction` |
| **Eliminar propiedad de otro** | ❌ | ❌ | ✅ | `deletePropertyAction` |
| **Subir imágenes (propia)** | ❌ | ✅ | ✅ | `uploadPropertyImagesAction` |
| **Subir imágenes (otro)** | ❌ | ❌ | ✅ | `uploadPropertyImagesAction` |
| **Eliminar imágenes (propia)** | ❌ | ✅ | ✅ | `deletePropertyImageAction` |
| **Eliminar imágenes (otro)** | ❌ | ❌ | ✅ | `deletePropertyImageAction` |
| **Reordenar imágenes (propia)** | ❌ | ✅ | ✅ | `reorderPropertyImagesAction` |
| **Reordenar imágenes (otro)** | ❌ | ❌ | ✅ | `reorderPropertyImagesAction` |

**Validación**:
- AGENT/ADMIN: `requireRole(['AGENT', 'ADMIN'])`
- Ownership: `requireOwnership(property.agentId)` con logging de seguridad

---

### Operaciones sobre Favoritos

| Acción | CLIENT | AGENT | ADMIN | Server Action |
|--------|--------|-------|-------|---------------|
| Ver favoritos propios | ✅ | ✅ | ✅ | `getUserFavoritesAction` |
| Agregar favorito | ✅ | ✅ | ✅ | `toggleFavoriteAction` |
| Eliminar favorito | ✅ | ✅ | ✅ | `toggleFavoriteAction` |
| Ver favoritos de otros | ❌ | ❌ | ❌ | - |

**Validación**:
- Requiere autenticación: `getCurrentUser()`

---

### Operaciones sobre Citas (Appointments)

| Acción | CLIENT | AGENT | ADMIN | Server Action |
|--------|--------|-------|-------|---------------|
| **Agendar cita** | ✅ | ❌ | ⚠️* | `createAppointmentAction` |
| Ver citas propias (como cliente) | ✅ | ✅ | ✅ | `getUserAppointmentsAction` |
| Ver citas de sus propiedades | ❌ | ✅ | ✅ | `getAgentAppointmentsAction` |
| **Confirmar cita (como agente)** | ❌ | ✅ (owner) | ✅ | `updateAppointmentStatusAction` |
| **Cancelar cita (como agente)** | ❌ | ✅ (owner) | ✅ | `updateAppointmentStatusAction` |
| Ver slots disponibles | ✅ | ✅ | ✅ | `getAvailableSlotsAction` |

**Notas**:
- ⚠️* ADMIN técnicamente puede, pero UX no está optimizada para esto
- **Solo CLIENT** puede agendar citas (validación con logging)
- **Solo el agente dueño** de la propiedad puede confirmar/cancelar
- Ownership validada con `requireOwnership(appointment.agentId)`

---

### Autenticación y Autorización

| Acción | CLIENT | AGENT | ADMIN | Server Action |
|--------|--------|-------|-------|---------------|
| Registrarse (signup) | ✅ | ✅ | ✅ | `signupAction` |
| Iniciar sesión (login) | ✅ | ✅ | ✅ | `loginAction` |
| Cerrar sesión (logout) | ✅ | ✅ | ✅ | `logoutAction` |
| Cambiar contraseña | ✅ | ✅ | ✅ | (pendiente) |
| Cambiar rol (auto) | ❌ | ❌ | ❌ | - |
| Cambiar rol (admin) | ❌ | ❌ | ⏳ | (futuro: admin panel) |

**Validación**:
- Signup: Guardar rol en `user_metadata` (para proxy)
- Login: Redirigir según rol del usuario

---

## 🔐 Capas de Protección (Defense in Depth)

### Capa 1: Proxy (proxy.ts) - **NUEVA** ✨

**Ejecuta**: ANTES de cada request (Edge Runtime)
**Verifica**: Roles usando `user_metadata` (sin consultar DB)
**Acción**: Redirige a login o área del usuario si no autorizado

```typescript
// Rutas protegidas
const routePermissions = {
  "/dashboard": ["AGENT", "ADMIN"],
  "/admin": ["ADMIN"],
  "/perfil": ["CLIENT", "AGENT", "ADMIN"],
}
```

**Logging**: Registra intentos de acceso no autorizado con:
- `unauthorized_access`: Usuario no autenticado
- `role_mismatch`: Usuario con rol no permitido
- `missing_role`: Usuario sin rol en metadata

---

### Capa 2: Server Components (páginas)

**Ejecuta**: En la página, DESPUÉS del proxy
**Verifica**: Roles usando `requireRole()` + consulta a DB
**Acción**: Redirige o renderiza error

```typescript
// Ejemplo: apps/web/app/dashboard/page.tsx
const user = await requireRole(['AGENT', 'ADMIN'])
```

**Logging**: Registra role_mismatch en server component layer

---

### Capa 3: Server Actions (operaciones)

**Ejecuta**: Al ejecutar la acción (crear, editar, eliminar)
**Verifica**: Roles + Ownership usando `requireOwnership()`
**Acción**: Lanza error si no autorizado

```typescript
// Ejemplo: uploadPropertyImagesAction
await requireOwnership(
  property.agentId,
  "No tienes permiso para modificar esta propiedad"
)
```

**Logging**: Registra ownership check failures

---

## 📈 Eventos de Seguridad (Logging)

Todos los intentos de acceso no autorizado se registran con:

```typescript
console.warn("[SECURITY] {event}", {
  userId: string,
  userRole: string,
  requiredRoles: string[],
  timestamp: ISO string,
  layer: "proxy" | "server-component" | "server-action",
})
```

**Eventos registrados**:

| Evento | Descripción | Capa |
|--------|-------------|------|
| `unauthorized_access` | Usuario no autenticado intentó acceder | Proxy |
| `role_mismatch` | Usuario con rol no permitido | Proxy, Server Component |
| `missing_role` | Usuario sin rol en metadata | Proxy |
| `Ownership check failed` | Usuario intentó modificar recurso ajeno | Server Action |
| `Role restriction - only CLIENT` | No-CLIENT intentó agendar cita | Server Action |
| `Role restriction - only AGENT/ADMIN` | No-AGENT intentó ver citas de agente | Server Action |

---

## 🎯 Mejoras Implementadas (Nov 2025)

### ✅ Middleware de Protección Centralizada

**Antes**:
- Cada página protegía manualmente con `requireRole()`
- Fácil olvidar proteger nuevas páginas
- Sin logging de intentos no autorizados

**Después**:
- ✅ Protección automática en `proxy.ts`
- ✅ Imposible olvidar proteger rutas
- ✅ Logging completo de eventos de seguridad
- ✅ Verificación en Edge Runtime (sin consultar DB)
- ✅ Defense in depth (3 capas)

---

### ✅ Refactorización de Validaciones

**Antes**:
```typescript
// Código duplicado en 6 lugares
if (property.agentId !== user.id && user.role !== "ADMIN") {
  return { error: "No tienes permiso" }
}
```

**Después**:
```typescript
// Helper reutilizable con logging incluido
await requireOwnership(
  property.agentId,
  "No tienes permiso para modificar esta propiedad"
)
```

**Reducción de código**: 18 líneas → 3 líneas (83% menos código duplicado)

---

### ✅ Logging de Seguridad Estructurado

Todos los eventos de autorización ahora se registran automáticamente en:

- **Proxy**: Intentos de acceso a rutas protegidas
- **requireRole**: Mismatches de roles en páginas
- **requireOwnership**: Intentos de modificar recursos ajenos
- **Server Actions**: Validaciones específicas (CLIENT-only, AGENT-only)

**Beneficio**: Auditoría completa de seguridad, detección de ataques

---

## 📝 Ejemplos de Uso

### Proteger una Nueva Página

```typescript
// apps/web/app/dashboard/analytics/page.tsx
import { requireRole } from "@/lib/auth"

export default async function AnalyticsPage() {
  // ✅ Proxy ya verificó que usuario es AGENT/ADMIN
  // ✅ Esta es la segunda capa de defensa
  const user = await requireRole(['AGENT', 'ADMIN'])

  return <div>Analytics para {user.name}</div>
}
```

**Resultado**:
- ✅ Proxy verifica ANTES de llegar a la página
- ✅ requireRole verifica de nuevo (defensa en profundidad)
- ✅ Logging automático si hay mismatch

---

### Proteger una Server Action con Ownership

```typescript
// apps/web/app/actions/custom.ts
"use server"

import { requireRole, requireOwnership } from "@/lib/auth"

export async function updateCustomAction(resourceId: string, data: any) {
  // 1. Verificar rol
  const user = await requireRole(['AGENT', 'ADMIN'])

  // 2. Obtener recurso
  const resource = await db.customResource.findUnique({
    where: { id: resourceId }
  })
  if (!resource) throw new Error("Resource not found")

  // 3. Verificar ownership (con logging automático)
  await requireOwnership(resource.ownerId)

  // 4. Actualizar
  return db.customResource.update({ where: { id: resourceId }, data })
}
```

**Resultado**:
- ✅ Solo AGENT/ADMIN pueden ejecutar
- ✅ Solo owner (o ADMIN) puede modificar
- ✅ Logging automático de intentos no autorizados

---

## 🔍 Verificación de Permisos

### Para Desarrolladores

Al implementar una nueva funcionalidad, verifica:

1. **¿Es una ruta protegida?** → Agregar a `routePermissions` en `proxy.ts`
2. **¿Es una página sensible?** → Agregar `requireRole()` en la página
3. **¿Es una operación sobre recursos?** → Usar `requireOwnership()` en la Server Action

### Para Auditores

Revisar:

1. `apps/web/proxy.ts` → Rutas protegidas centralizadamente
2. `apps/web/app/*/page.tsx` → Páginas con `requireRole()`
3. `apps/web/app/actions/*.ts` → Server Actions con validación
4. Logs de consola → Eventos de seguridad registrados

---

## 📚 Archivos Relevantes

- **Proxy**: `apps/web/proxy.ts` - Protección centralizada
- **Auth Helpers**: `apps/web/lib/auth.ts` - `requireRole`, `requireOwnership`
- **Server Actions**:
  - `apps/web/app/actions/properties.ts` - CRUD de propiedades
  - `apps/web/app/actions/appointments.ts` - Gestión de citas
  - `apps/web/app/actions/favorites.ts` - Favoritos
- **Documentation**: Este archivo (`PERMISSIONS_MATRIX.md`)

---

## 🎓 Mejores Prácticas

### ✅ DO

- Usar `requireRole()` en páginas sensibles
- Usar `requireOwnership()` para validar recursos
- Agregar nuevas rutas protegidas a `routePermissions` en `proxy.ts`
- Confiar en el logging automático (no duplicar)

### ❌ DON'T

- Validar roles manualmente (usar helpers)
- Duplicar lógica de autorización
- Crear rutas protegidas sin agregar al proxy
- Ignorar logs de seguridad

---

**Última actualización**: Noviembre 18, 2025
**Próxima revisión**: Al implementar panel de admin completo o nuevos roles
