# Plan de Implementación: Dashboard por Roles

> **Fecha**: 19 de noviembre, 2025
> **Estado**: Análisis Completado
> **Complementa**: `DASHBOARD_ROLES_ARCHITECTURE.md`

---

## 1. Auditoría del Estado Actual

### Rutas Existentes

| Ruta | Estado | Notas |
|------|--------|-------|
| `(auth)/login` | ✅ Completo | Route group funcionando |
| `(auth)/signup` | ✅ Completo | Route group funcionando |
| `(public)/*` | ✅ Completo | 12 páginas públicas |
| `/admin` | ⚠️ Placeholder | Solo cards estáticas, sin funcionalidad |
| `/dashboard` | ✅ Funcional | Stats básicos |
| `/dashboard/propiedades` | ✅ Completo | CRUD completo |
| `/dashboard/citas` | ✅ Funcional | Lista de citas |
| `/perfil` | ⚠️ Básico | Sin formulario de edición |
| `/perfil/citas` | ⚠️ Deshabilitado | Link comentado "to fix Turbopack build" |

### Rutas Faltantes (Gap Analysis)

| Ruta Propuesta | Prioridad | Dependencias |
|----------------|-----------|--------------|
| `/perfil/favoritos` | **CRÍTICO** | ⚠️ Link existe en UI pero página NO existe (404) |
| `/perfil/configuracion` | Media | Formulario de preferencias |
| `/admin/usuarios` | Alta | Data table, Server Actions |
| `/admin/propiedades` | Alta | Data table con filtros |
| `/admin/citas` | Media | Data table |
| `/admin/analytics` | Media | Librería de charts |
| `/admin/configuracion` | Baja | Feature flags |
| `/dashboard/clientes` | Media | Relación con appointments |
| `/dashboard/analytics` | Media | Librería de charts |

### Bugs Identificados

1. **404 en Favoritos**: `/perfil` tiene link a `/perfil/favoritos` (línea 72) pero la página no existe
2. **Citas Deshabilitado**: Link a `/perfil/citas` comentado con TODO "fix Turbopack build"

---

## 2. Dependencias de Librerías

### Actualmente Instaladas

```
✅ Radix UI (avatar, dropdown, select, checkbox, slider)
✅ Lucide React (iconos)
✅ date-fns (formateo de fechas)
✅ react-day-picker (selector de fechas)
✅ sonner (notificaciones toast)
✅ zustand (estado global)
```

### Necesarias para Implementación

| Librería | Uso | Alternativas | Recomendación |
|----------|-----|--------------|---------------|
| **Data Tables** | Admin usuarios/propiedades | TanStack Table, AG Grid | **@tanstack/react-table** (headless, flexible) |
| **Charts** | Analytics dashboards | Recharts, Chart.js, Tremor | **Recharts** (simple, React-native) |
| **Export** | CSV/PDF | react-csv, jspdf | **Fase posterior** |

### Instalación Recomendada

```bash
# Data Tables (headless, permite custom styling con Tailwind)
bun add @tanstack/react-table

# Charts (React-friendly, composable)
bun add recharts

# Opcional: Export
bun add react-csv
```

**Nota**: TanStack Table es headless, se integra bien con Radix UI y Tailwind existentes.

---

## 3. Componentes Dashboard Existentes

```
apps/web/components/dashboard/
├── sidebar.tsx      # Navegación lateral
└── user-menu.tsx    # Menú de usuario (avatar + logout)
```

### Componentes a Crear

```
components/
├── dashboard/
│   ├── stats-card.tsx          # Card de estadística reutilizable
│   ├── data-table/
│   │   ├── data-table.tsx      # Wrapper TanStack Table
│   │   ├── columns.tsx         # Definición de columnas
│   │   └── pagination.tsx      # Controles de paginación
│   └── charts/
│       ├── bar-chart.tsx       # Gráfica de barras
│       └── line-chart.tsx      # Gráfica de líneas
│
├── admin/
│   ├── users-table.tsx         # Tabla de usuarios
│   └── role-editor.tsx         # Editor de roles
│
└── client/
    └── favorites-list.tsx      # Lista de favoritos
```

---

## 4. Estimación de Esfuerzo

### Por Fase (con buffer del 30%)

| Fase | Tareas | Estimación Base | Con Buffer | Acumulado |
|------|--------|-----------------|------------|-----------|
| **0. Setup** | Instalar dependencias, crear componentes base | 1 día | 1.5 días | 1.5 días |
| **1. Estructura** | Crear rutas faltantes, actualizar proxy.ts | 2-3 días | 3-4 días | 5.5 días |
| **2. Cliente** | Favoritos, citas, perfil | 2-3 días | 3-4 días | 9.5 días |
| **3. Admin** | Usuarios, propiedades, analytics | 4-5 días | 5-7 días | 16.5 días |
| **4. Agente** | Clientes, analytics | 2-3 días | 3-4 días | 20.5 días |
| **5. Refinamiento** | Tests, export, notificaciones | 2-3 días | 3-4 días | 24.5 días |

### Estimación Total

| Escenario | Días |
|-----------|------|
| Optimista | 18 días |
| **Realista** | **22-25 días** |
| Pesimista | 30 días |

### Recursos Necesarios

- 1 desarrollador full-stack
- Acceso a Supabase dashboard (para queries)
- Diseños/mockups (opcional, puede usar shadcn/ui patterns)

---

## 5. Plan de Ejecución Recomendado

### Sprint 0: Setup y Quick Wins (1-2 días)

**Objetivo**: Eliminar bugs críticos y preparar infraestructura

- [ ] **FIX CRÍTICO**: Crear `/perfil/favoritos/page.tsx` (eliminar 404)
- [ ] **FIX**: Revisar y habilitar `/perfil/citas` (investigar issue Turbopack)
- [ ] Instalar `@tanstack/react-table` y `recharts`
- [ ] Crear componente base `data-table.tsx`
- [ ] Crear componente base `stats-card.tsx`

### Sprint 1: Área Cliente Completa (3-4 días)

**Objetivo**: CLIENT puede usar todas sus funcionalidades

- [ ] `/perfil/favoritos` - Lista con PropertyCard, eliminar favorito
- [ ] `/perfil/citas` - Lista de citas, cancelar pendientes
- [ ] `/perfil/configuracion` - Preferencias básicas
- [ ] Mejorar `/perfil` - Formulario de edición de nombre

**Server Actions:**
- `getUserFavoritesAction` (ya existe)
- `cancelAppointmentAction` (nueva)
- `updateProfileAction` (nueva)

### Sprint 2: Panel Admin Base (5-6 días)

**Objetivo**: ADMIN puede gestionar usuarios y propiedades

- [ ] Layout admin con navegación
- [ ] `/admin/usuarios` - Data table con filtros
- [ ] `/admin/usuarios/[id]` - Detalle y editar rol
- [ ] `/admin/propiedades` - Todas las propiedades
- [ ] `/admin/propiedades/[id]` - Moderar/eliminar

**Server Actions:**
- `getUsersAction` - Lista paginada
- `updateUserRoleAction` - Cambiar rol
- `suspendUserAction` - Suspender cuenta
- `getAllPropertiesAction` - Todas las propiedades

### Sprint 3: Analytics (4-5 días)

**Objetivo**: Dashboards con métricas visuales

- [ ] `/admin/analytics` - Métricas globales
- [ ] `/dashboard/analytics` - Métricas del agente
- [ ] Mejorar `/admin` y `/dashboard` con stats reales
- [ ] Gráficas de crecimiento, conversión

**Server Actions:**
- `getAdminStatsAction` - Métricas agregadas
- `getAgentStatsAction` - Métricas del agente

### Sprint 4: Refinamiento (3-4 días)

**Objetivo**: Pulir UX y añadir features avanzados

- [ ] `/dashboard/clientes` - Lista de interesados
- [ ] Tests de integración para nuevas rutas
- [ ] Export CSV (opcional)
- [ ] Documentación de uso

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Issue Turbopack con citas | Alta | Medio | Investigar en Sprint 0 antes de continuar |
| Complejidad TanStack Table | Media | Bajo | Documentación excelente, muchos ejemplos |
| Performance queries Admin | Media | Alto | Paginación server-side desde el inicio |
| Cambios en requisitos | Media | Alto | Revisión al final de cada sprint |

---

## 7. Criterios de Éxito

### Por Rol

**CLIENT**:
- [ ] Puede ver y eliminar favoritos
- [ ] Puede ver y cancelar citas
- [ ] Puede editar su perfil

**AGENT**:
- [ ] Dashboard con stats reales
- [ ] Analytics de sus propiedades
- [ ] Lista de clientes interesados

**ADMIN**:
- [ ] Puede listar/filtrar usuarios
- [ ] Puede cambiar roles
- [ ] Puede moderar propiedades
- [ ] Ve métricas globales

### Técnicos

- [ ] 0 errores TypeScript
- [ ] Tests para Server Actions nuevas
- [ ] Tiempo de carga < 2s en todas las páginas
- [ ] Mobile responsive

---

## 8. Próximos Pasos Inmediatos

1. **Hoy**: Aprobar plan y estimación
2. **Mañana**: Sprint 0 - Fixes críticos + setup
3. **Semana 1**: Sprints 1-2
4. **Semana 2-3**: Sprints 3-4

---

## Referencias

- `docs/architecture/DASHBOARD_ROLES_ARCHITECTURE.md` - Arquitectura detallada
- `docs/analysis/USER_ROLES_ANALYSIS.md` - Análisis de roles
- `apps/web/proxy.ts` - Protección de rutas

---

**Última actualización**: 19 de noviembre, 2025
**Autor**: Claude Code Analysis
