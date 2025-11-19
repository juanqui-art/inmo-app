# Arquitectura de Dashboards por Roles

> **Fecha**: 19 de noviembre, 2025
> **Estado**: Propuesta de Implementación
> **Relacionado**: `docs/analysis/USER_ROLES_ANALYSIS.md`

---

## Resumen Ejecutivo

Este documento define la arquitectura de rutas y componentes para los dashboards de cada rol de usuario en InmoApp. La estrategia recomendada es **rutas separadas con componentes compartidos**, aprovechando la protección centralizada en `proxy.ts`.

---

## Estrategia: Rutas Separadas

### Por Qué Rutas Separadas (No Una Sola)

| Criterio | Rutas Separadas | Ruta Única Condicional |
|----------|-----------------|------------------------|
| **URLs claras** | `/admin/usuarios` | `/dashboard?view=admin-users` |
| **Bundle Size** | Solo carga código del rol | Carga todo, oculta con `if` |
| **Seguridad** | Protección por ruta en proxy | Lógica compleja en cada componente |
| **Mantenimiento** | Archivos separados por dominio | Un archivo gigante con muchos `if` |
| **SEO/Accesibilidad** | URLs semánticas | Query params poco claros |

---

## Estructura de Rutas Propuesta

```
apps/web/app/
├── (public)/                    # Sin autenticación
│   ├── page.tsx                 # Home
│   ├── propiedades/             # Listado público
│   └── mapa/                    # Mapa público
│
├── (auth)/                      # Redirige si ya autenticado
│   ├── login/
│   └── signup/
│
├── perfil/                      # CLIENT + AGENT + ADMIN
│   ├── layout.tsx               # Layout simple (header + contenido)
│   ├── page.tsx                 # Datos personales
│   ├── favoritos/               # Lista de favoritos
│   │   └── page.tsx
│   ├── citas/                   # Citas agendadas como cliente
│   │   └── page.tsx
│   └── configuracion/           # Preferencias de cuenta
│       └── page.tsx
│
├── dashboard/                   # AGENT + ADMIN
│   ├── layout.tsx               # Sidebar + header dashboard
│   ├── page.tsx                 # Stats del agente
│   ├── propiedades/             # CRUD propiedades
│   │   ├── page.tsx             # Listado
│   │   ├── nueva/page.tsx       # Crear
│   │   └── [id]/
│   │       └── editar/page.tsx  # Editar
│   ├── citas/                   # Citas de sus propiedades
│   │   └── page.tsx
│   ├── clientes/                # Clientes interesados
│   │   └── page.tsx
│   └── analytics/               # Estadísticas propias
│       └── page.tsx
│
└── admin/                       # Solo ADMIN
    ├── layout.tsx               # Layout admin (alertas globales)
    ├── page.tsx                 # Panel principal
    ├── usuarios/                # Gestión de usuarios
    │   ├── page.tsx             # Listado
    │   └── [id]/page.tsx        # Detalle/editar
    ├── propiedades/             # Todas las propiedades
    │   ├── page.tsx             # Listado global
    │   └── [id]/page.tsx        # Detalle/moderar
    ├── citas/                   # Todas las citas
    │   └── page.tsx
    ├── analytics/               # Métricas plataforma
    │   └── page.tsx
    └── configuracion/           # Config global
        └── page.tsx
```

---

## Protección de Rutas

### Configuración en `proxy.ts`

```typescript
const routePermissions: Record<string, UserRole[]> = {
  // Rutas de cliente (todos los autenticados)
  "/perfil": ["CLIENT", "AGENT", "ADMIN"],

  // Rutas de agente
  "/dashboard": ["AGENT", "ADMIN"],

  // Rutas de admin
  "/admin": ["ADMIN"],
};
```

### Defensa en Profundidad

Cada ruta tiene múltiples capas de protección:

```
1. Proxy (Edge)     → Verifica rol en user_metadata (rápido)
2. Page (Server)    → requireRole() verifica en DB (autoritativo)
3. Action (Server)  → Valida permisos específicos
4. Repository (DB)  → Verifica ownership en transacción
```

---

## Funcionalidades por Rol

### CLIENT - Área Personal (`/perfil`)

| Ruta | Funcionalidad | Componentes |
|------|---------------|-------------|
| `/perfil` | Datos personales, avatar, contacto | `ProfileForm`, `AvatarUpload` |
| `/perfil/favoritos` | Lista de propiedades guardadas | `FavoritesList`, `PropertyCard` |
| `/perfil/citas` | Citas agendadas como cliente | `AppointmentsList`, `AppointmentCard` |
| `/perfil/configuracion` | Preferencias, notificaciones | `SettingsForm`, `NotificationPrefs` |

**Acciones disponibles:**
- Ver/editar perfil
- Ver/eliminar favoritos
- Ver citas propias
- Cancelar citas pendientes

---

### AGENT - Dashboard de Agente (`/dashboard`)

| Ruta | Funcionalidad | Componentes |
|------|---------------|-------------|
| `/dashboard` | Stats, acciones rápidas | `DashboardStats`, `QuickActions` |
| `/dashboard/propiedades` | CRUD de propiedades propias | `PropertyTable`, `PropertyFilters` |
| `/dashboard/propiedades/nueva` | Crear propiedad | `PropertyForm`, `ImageUploader` |
| `/dashboard/propiedades/[id]/editar` | Editar propiedad | `PropertyForm`, `ImageManager` |
| `/dashboard/citas` | Citas de sus propiedades | `AgentAppointments`, `AppointmentActions` |
| `/dashboard/clientes` | Clientes interesados | `ClientsList`, `ClientActivity` |
| `/dashboard/analytics` | Métricas propias | `ViewsChart`, `FavoritesChart` |

**Acciones disponibles:**
- CRUD completo de propiedades propias
- Confirmar/cancelar citas
- Ver estadísticas de sus propiedades
- Contactar clientes interesados

**Datos mostrados:**
- Propiedades: solo las propias (`agentId = user.id`)
- Citas: solo de sus propiedades
- Analytics: métricas de su portfolio

---

### ADMIN - Panel de Administración (`/admin`)

| Ruta | Funcionalidad | Componentes |
|------|---------------|-------------|
| `/admin` | Métricas globales, alertas | `AdminDashboard`, `SystemAlerts` |
| `/admin/usuarios` | Gestión de usuarios | `UsersTable`, `RoleEditor` |
| `/admin/usuarios/[id]` | Detalle de usuario | `UserProfile`, `UserActivity` |
| `/admin/propiedades` | Todas las propiedades | `AllPropertiesTable`, `ModerationActions` |
| `/admin/propiedades/[id]` | Moderar propiedad | `PropertyDetail`, `AdminActions` |
| `/admin/citas` | Todas las citas | `AllAppointmentsTable` |
| `/admin/analytics` | Métricas de plataforma | `PlatformMetrics`, `GrowthCharts` |
| `/admin/configuracion` | Config global | `SystemSettings`, `FeatureFlags` |

**Acciones disponibles:**
- Ver/editar cualquier usuario
- Cambiar roles de usuarios
- Suspender/activar cuentas
- Editar/eliminar cualquier propiedad
- Ver todas las citas
- Acceso a métricas globales

**Datos mostrados:**
- Usuarios: todos los usuarios de la plataforma
- Propiedades: todas (de todos los agentes)
- Citas: todas las citas
- Analytics: métricas agregadas de toda la plataforma

---

## Navegación por Rol

### Sidebar Configuration

```typescript
// components/dashboard/sidebar-config.ts

export const sidebarConfig: Record<UserRole, SidebarSection[]> = {
  CLIENT: [
    {
      title: "Mi Cuenta",
      items: [
        { title: "Mi Perfil", href: "/perfil", icon: User },
        { title: "Favoritos", href: "/perfil/favoritos", icon: Heart },
        { title: "Mis Citas", href: "/perfil/citas", icon: Calendar },
        { title: "Configuración", href: "/perfil/configuracion", icon: Settings },
      ],
    },
  ],

  AGENT: [
    {
      title: "Dashboard",
      items: [
        { title: "Inicio", href: "/dashboard", icon: Home },
        { title: "Mis Propiedades", href: "/dashboard/propiedades", icon: Building },
        { title: "Citas", href: "/dashboard/citas", icon: Calendar },
        { title: "Clientes", href: "/dashboard/clientes", icon: Users },
        { title: "Analytics", href: "/dashboard/analytics", icon: BarChart },
      ],
    },
    {
      title: "Mi Cuenta",
      items: [
        { title: "Perfil", href: "/perfil", icon: User },
        { title: "Configuración", href: "/perfil/configuracion", icon: Settings },
      ],
    },
  ],

  ADMIN: [
    {
      title: "Administración",
      items: [
        { title: "Panel Admin", href: "/admin", icon: Shield },
        { title: "Usuarios", href: "/admin/usuarios", icon: Users },
        { title: "Propiedades", href: "/admin/propiedades", icon: Building },
        { title: "Citas", href: "/admin/citas", icon: Calendar },
        { title: "Analytics", href: "/admin/analytics", icon: BarChart },
        { title: "Configuración", href: "/admin/configuracion", icon: Settings },
      ],
    },
    {
      title: "Agente",
      items: [
        { title: "Mi Dashboard", href: "/dashboard", icon: Home },
        { title: "Mis Propiedades", href: "/dashboard/propiedades", icon: Building },
      ],
    },
    {
      title: "Mi Cuenta",
      items: [
        { title: "Perfil", href: "/perfil", icon: User },
      ],
    },
  ],
};
```

---

## Componentes Compartidos

### Base Components (Reutilizables entre roles)

```
components/
├── dashboard/
│   ├── sidebar.tsx              # Sidebar dinámico por rol
│   ├── user-menu.tsx            # Menú de usuario (avatar + logout)
│   ├── stats-card.tsx           # Card de estadística
│   ├── quick-action.tsx         # Botón de acción rápida
│   └── data-table.tsx           # Tabla genérica con paginación
│
├── properties/
│   ├── property-card.tsx        # Card de propiedad (horizontal/vertical)
│   ├── property-form.tsx        # Formulario crear/editar
│   ├── image-uploader.tsx       # Upload de imágenes
│   └── property-filters.tsx     # Filtros de búsqueda
│
├── appointments/
│   ├── appointment-card.tsx     # Card de cita
│   ├── appointment-actions.tsx  # Confirmar/cancelar
│   └── calendar-picker.tsx      # Selector de fecha/hora
│
└── users/
    ├── user-avatar.tsx          # Avatar con badge de rol
    ├── user-card.tsx            # Card de usuario
    └── role-badge.tsx           # Badge de rol (Cliente/Agente/Admin)
```

### Page Components (Específicos por rol)

```
components/
├── client/
│   ├── favorites-list.tsx       # Lista de favoritos del cliente
│   └── client-appointments.tsx  # Citas como cliente
│
├── agent/
│   ├── agent-stats.tsx          # Stats específicos de agente
│   ├── agent-appointments.tsx   # Citas de sus propiedades
│   └── property-management.tsx  # Gestión de propiedades
│
└── admin/
    ├── admin-stats.tsx          # Stats globales
    ├── users-management.tsx     # Gestión de usuarios
    ├── moderation-panel.tsx     # Moderación de contenido
    └── platform-analytics.tsx   # Analytics de plataforma
```

---

## Server Actions por Rol

### Matriz de Permisos

| Action | CLIENT | AGENT | ADMIN | Notas |
|--------|--------|-------|-------|-------|
| **Properties** |
| `createPropertyAction` | - | owner | any | Asigna agentId automático |
| `updatePropertyAction` | - | owner | any | Verifica ownership |
| `deletePropertyAction` | - | owner | any | Soft delete |
| `getPropertiesAction` | public | own | all | Filtro por agentId |
| **Appointments** |
| `createAppointmentAction` | yes | - | yes* | Solo clientes agendan |
| `updateAppointmentStatusAction` | - | own | any | Confirmar/cancelar |
| `getAgentAppointmentsAction` | - | own | all | Citas de propiedades |
| `getUserAppointmentsAction` | own | own | all | Citas propias |
| **Favorites** |
| `toggleFavoriteAction` | yes | yes | yes | Todos autenticados |
| `getUserFavoritesAction` | own | own | all | Favoritos propios |
| **Users (Admin)** |
| `getUsersAction` | - | - | all | Solo admin |
| `updateUserRoleAction` | - | - | any | Cambiar roles |
| `suspendUserAction` | - | - | any | Suspender cuenta |

*ADMIN puede agendar citas pero no es el flujo típico

---

## Queries de Datos

### CLIENT - Datos Propios

```typescript
// Favoritos del usuario
const favorites = await db.favorite.findMany({
  where: { userId: user.id },
  include: { property: true },
});

// Citas del usuario como cliente
const appointments = await db.appointment.findMany({
  where: { clientId: user.id },
  include: { property: true, agent: true },
});
```

### AGENT - Datos Propios + Relacionados

```typescript
// Propiedades del agente
const properties = await db.property.findMany({
  where: { agentId: user.id },
  include: { images: true, _count: { select: { favorites: true } } },
});

// Citas de sus propiedades
const appointments = await db.appointment.findMany({
  where: { property: { agentId: user.id } },
  include: { client: true, property: true },
});

// Stats del agente
const stats = {
  totalProperties: await db.property.count({ where: { agentId: user.id } }),
  pendingAppointments: await db.appointment.count({
    where: { property: { agentId: user.id }, status: "PENDING" },
  }),
};
```

### ADMIN - Datos Globales

```typescript
// Todos los usuarios
const users = await db.user.findMany({
  include: { _count: { select: { properties: true } } },
});

// Todas las propiedades
const properties = await db.property.findMany({
  include: { agent: true, images: true },
});

// Stats globales
const stats = {
  totalUsers: await db.user.count(),
  totalProperties: await db.property.count(),
  totalAppointments: await db.appointment.count(),
  usersByRole: await db.user.groupBy({
    by: ["role"],
    _count: { role: true },
  }),
};
```

---

## Roadmap de Implementación

### Fase 1: Estructura Base (2-3 días)

**Objetivo**: Crear la estructura de carpetas y protección básica

- [ ] Crear carpetas para rutas faltantes
  - [ ] `/perfil/favoritos/page.tsx`
  - [ ] `/perfil/citas/page.tsx`
  - [ ] `/admin/usuarios/page.tsx`
  - [ ] `/admin/propiedades/page.tsx`
- [ ] Actualizar `proxy.ts` con nuevas rutas
- [ ] Crear layouts base para cada área
- [ ] Configurar navegación por rol en sidebar

**Archivos a crear:**
```
apps/web/app/perfil/favoritos/page.tsx
apps/web/app/perfil/citas/page.tsx
apps/web/app/perfil/configuracion/page.tsx
apps/web/app/admin/usuarios/page.tsx
apps/web/app/admin/propiedades/page.tsx
apps/web/app/admin/citas/page.tsx
apps/web/app/admin/analytics/page.tsx
```

---

### Fase 2: Área de Cliente (2-3 días)

**Objetivo**: Completar funcionalidad para CLIENT

- [ ] Implementar `/perfil/favoritos`
  - [ ] Lista de favoritos con PropertyCard
  - [ ] Acción para eliminar favorito
- [ ] Implementar `/perfil/citas`
  - [ ] Lista de citas agendadas
  - [ ] Estado de cada cita
  - [ ] Acción para cancelar cita pendiente
- [ ] Mejorar `/perfil` principal
  - [ ] Formulario de edición de perfil
  - [ ] Upload de avatar
  - [ ] Stats básicos (favoritos, citas)

**Server Actions necesarias:**
- `cancelAppointmentAction` - Cancelar cita propia
- `updateProfileAction` - Actualizar perfil
- `updateAvatarAction` - Subir avatar

---

### Fase 3: Panel Admin (4-5 días)

**Objetivo**: Implementar funcionalidades de administración

- [ ] Implementar `/admin/usuarios`
  - [ ] Tabla con todos los usuarios
  - [ ] Filtros por rol, estado
  - [ ] Acciones: ver, editar rol, suspender
- [ ] Implementar `/admin/propiedades`
  - [ ] Tabla con todas las propiedades
  - [ ] Filtros por agente, estado
  - [ ] Acciones: ver, editar, eliminar
- [ ] Implementar `/admin/analytics`
  - [ ] Gráficas de crecimiento
  - [ ] Métricas por período
  - [ ] KPIs principales
- [ ] Mejorar `/admin` dashboard
  - [ ] Stats globales en tiempo real
  - [ ] Alertas del sistema
  - [ ] Actividad reciente

**Server Actions necesarias:**
- `getUsersAction` - Listar usuarios (paginado)
- `updateUserRoleAction` - Cambiar rol
- `suspendUserAction` - Suspender cuenta
- `getAdminStatsAction` - Métricas globales
- `getAllPropertiesAction` - Todas las propiedades

---

### Fase 4: Mejoras Agente (2-3 días)

**Objetivo**: Completar funcionalidades de agente

- [ ] Implementar `/dashboard/clientes`
  - [ ] Lista de clientes interesados
  - [ ] Historial de interacciones
- [ ] Implementar `/dashboard/analytics`
  - [ ] Vistas por propiedad
  - [ ] Favoritos por propiedad
  - [ ] Tasa de conversión
- [ ] Mejorar `/dashboard` principal
  - [ ] Gráficas interactivas
  - [ ] Notificaciones pendientes

---

### Fase 5: Refinamiento (2-3 días)

**Objetivo**: Pulir UX y añadir features avanzadas

- [ ] Notificaciones en tiempo real
- [ ] Búsqueda global en admin
- [ ] Export de datos (CSV/PDF)
- [ ] Historial de actividad
- [ ] Tests de integración

---

## Consideraciones de Seguridad

### Checklist de Seguridad por Ruta

Para cada nueva ruta, verificar:

- [ ] Proxy protection en `proxy.ts`
- [ ] `requireRole()` en page.tsx
- [ ] Validación de permisos en Server Action
- [ ] Ownership check en Repository (si aplica)
- [ ] Logging de acceso denegado

### Ejemplo Completo de Protección

```typescript
// 1. proxy.ts - Primera capa (Edge)
"/admin/usuarios": ["ADMIN"]

// 2. page.tsx - Segunda capa (Server)
export default async function UsersPage() {
  const user = await requireRole(["ADMIN"]);
  const users = await getUsersAction();
  return <UsersTable users={users} />;
}

// 3. action.ts - Tercera capa (Server)
export async function getUsersAction() {
  const user = await requireRole(["ADMIN"]);
  return userRepository.findAll();
}

// 4. repository.ts - Cuarta capa (DB)
async findAll() {
  // Aquí el permiso ya está verificado
  // pero se pueden añadir filtros adicionales
  return db.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    // Excluir campos sensibles
  });
}
```

---

## Migración desde Estado Actual

### Estado Actual vs Propuesta

| Área | Estado Actual | Propuesta | Prioridad |
|------|---------------|-----------|-----------|
| `/perfil` | ✅ Básico | Expandir (favoritos, citas) | Alta |
| `/dashboard` | ✅ Funcional | Añadir analytics, clientes | Media |
| `/admin` | ⚠️ Placeholder | Implementar completo | Alta |
| Sidebar | ⚠️ Estático | Dinámico por rol | Alta |
| Stats | ⚠️ Parcial | Dashboards completos | Media |

### Pasos de Migración

1. **No romper lo existente**: Todas las rutas actuales siguen funcionando
2. **Añadir incrementalmente**: Nuevas rutas se añaden sin modificar las existentes
3. **Actualizar navegación**: Sidebar se actualiza para mostrar nuevas rutas
4. **Tests**: Añadir tests para cada nueva ruta

---

## Referencias

### Documentación Relacionada

- `docs/analysis/USER_ROLES_ANALYSIS.md` - Análisis detallado del sistema de roles
- `docs/authorization/PERMISSIONS_MATRIX.md` - Matriz de permisos
- `docs/architecture/AUTHENTICATION_SYSTEM.md` - Sistema de autenticación

### Archivos Clave

- `apps/web/proxy.ts` - Protección de rutas
- `apps/web/lib/auth.ts` - Helpers de autenticación
- `apps/web/components/dashboard/sidebar.tsx` - Navegación
- `packages/database/src/repositories/` - Acceso a datos

---

## Conclusión

La arquitectura de rutas separadas (`/perfil`, `/dashboard`, `/admin`) proporciona:

1. **Seguridad**: Protección clara por ruta en múltiples capas
2. **Mantenibilidad**: Código organizado por dominio
3. **Escalabilidad**: Fácil añadir nuevas funcionalidades por rol
4. **Performance**: Solo se carga el código necesario por rol
5. **UX**: URLs claras y navegación intuitiva

La implementación puede realizarse de forma incremental, priorizando las áreas con mayor impacto para los usuarios.

---

**Última actualización**: 19 de noviembre, 2025
**Próxima revisión**: Al completar Fase 1
