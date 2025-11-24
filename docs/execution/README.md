# 📋 Análisis de Funcionalidades Pendientes - Admin & Dashboard

> **Fecha**: Noviembre 24, 2025
> **Status**: 🔍 Investigación Profunda Completada
> **Objetivo**: Identificar gaps entre implementación actual y roadmap planeado

---

## 🎯 Resumen Ejecutivo

**Estado actual**: ~65% implementado
**Foco principal pendiente**: Sistema Freemium + Stripe Integration
**Funcionalidades core**: ✅ Completas
**Urgencia**: 🔴 Alta - Bloqueadores críticos identificados

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 🛡️ ADMIN PANEL (100% funcional - Fase actual)

#### Rutas Implementadas
```
/admin                      ✅ Dashboard principal con stats
/admin/usuarios             ✅ Gestión completa de usuarios
/admin/propiedades          ✅ Gestión completa de propiedades
/admin/analytics            ✅ Métricas y analytics globales
```

#### Features Implementadas

**1. Dashboard Principal** (`/admin/page.tsx`)
- ✅ Estadísticas globales (usuarios, propiedades, citas, favoritos)
- ✅ Breakdown por roles (CLIENT/AGENT/ADMIN)
- ✅ Breakdown por estados de propiedades (AVAILABLE/PENDING/SOLD/RENTED)
- ✅ Breakdown por estados de citas (PENDING/CONFIRMED/CANCELLED/COMPLETED)
- ✅ Usuarios recientes (últimos 30 días)
- ✅ Propiedades recientes (últimos 30 días)
- ✅ Quick actions (accesos rápidos a secciones)

**2. Gestión de Usuarios** (`/admin/usuarios/page.tsx`)
- ✅ Lista paginada de usuarios (20 por página)
- ✅ Filtros por rol (CLIENT/AGENT/ADMIN)
- ✅ Búsqueda por nombre/email
- ✅ Ver conteos (propiedades, favoritos, citas por usuario)
- ✅ Componentes:
  - `UsersTable` - Tabla con datos
  - `UsersFilters` - Filtros y búsqueda

**3. Gestión de Propiedades** (`/admin/propiedades/page.tsx`)
- ✅ Lista paginada de propiedades (20 por página)
- ✅ Filtros por estado (AVAILABLE/PENDING/SOLD/RENTED)
- ✅ Búsqueda por título
- ✅ Ver información del agente
- ✅ Ver conteos (favoritos, citas por propiedad)
- ✅ Componentes:
  - `PropertiesTable` - Tabla con datos
  - `PropertiesFilters` - Filtros y búsqueda

**4. Analytics** (`/admin/analytics/page.tsx`)
- ✅ Métricas generales (totales + últimos 30 días)
- ✅ Usuarios por rol (gráficos de barras)
- ✅ Propiedades por estado (gráficos de barras)
- ✅ Citas por estado (gráficos de barras)
- ✅ Actividad diaria (registro de usuarios por día)
- ✅ Resumen de actividad (nuevos usuarios/propiedades/citas)

**5. Server Actions Admin** (`/app/actions/admin.ts`)
- ✅ `getAdminStatsAction()` - Obtener estadísticas globales
- ✅ `getUsersAction()` - Listar usuarios con filtros
- ✅ `getAllPropertiesAction()` - Listar propiedades con filtros
- ✅ `getAdminMetricsByPeriodAction()` - Métricas por período
- ✅ `updateUserRoleAction()` - Cambiar rol de usuario
- ✅ `deleteUserAction()` - Eliminar usuario
- ✅ `updatePropertyStatusAction()` - Cambiar estado de propiedad
- ✅ `deletePropertyAction()` - Eliminar propiedad

**6. Componentes Admin**
- ✅ `admin-sidebar.tsx` - Navegación lateral
- ✅ `users-table.tsx` - Tabla de usuarios
- ✅ `users-filters.tsx` - Filtros de usuarios
- ✅ `properties-table.tsx` - Tabla de propiedades
- ✅ `properties-filters.tsx` - Filtros de propiedades

---

### 👨‍💼 AGENT/ADMIN DASHBOARD (100% funcional - Fase actual)

#### Rutas Implementadas
```
/dashboard                           ✅ Dashboard principal con stats
/dashboard/propiedades               ✅ Lista de propiedades del agente
/dashboard/propiedades/nueva         ✅ Crear nueva propiedad
/dashboard/propiedades/[id]/editar   ✅ Editar propiedad existente
/dashboard/citas                     ✅ Gestión de citas
```

#### Features Implementadas

**1. Dashboard Principal** (`/dashboard/page.tsx`)
- ✅ Estadísticas personales del agente
- ✅ Conteo de propiedades (total, activas, borradores, vendidas)
- ✅ Conteo de citas (total, pendientes)
- ✅ Conteo de clientes únicos
- ✅ Visitas del mes (con promedio por propiedad)
- ✅ Actividad reciente (placeholder)
- ✅ Quick actions (crear propiedad, ver propiedades)

**2. Gestión de Propiedades** (`/dashboard/propiedades/`)
- ✅ Lista de propiedades del agente
- ✅ PropertyCard con imagen, info, acciones
- ✅ Crear nueva propiedad (formulario completo)
- ✅ Editar propiedad existente
- ✅ Upload de imágenes (Supabase Storage)
- ✅ Validación con Zod
- ✅ Permisos verificados (ownership)

**3. Gestión de Citas** (`/dashboard/citas/page.tsx`)
- ✅ Ver todas las citas del agente
- ✅ Separación por estado (pendientes, confirmadas, completadas)
- ✅ Stats de citas (conteos por estado)
- ✅ Acciones: confirmar, cancelar, completar
- ✅ Componentes:
  - `AppointmentCard` - Tarjeta de cita
  - `AppointmentActions` - Botones de acción

**4. Server Actions Properties** (`/app/actions/properties.ts`)
- ✅ `createPropertyAction()` - Crear propiedad (con validación de límites)
- ✅ `updatePropertyAction()` - Actualizar propiedad
- ✅ `deletePropertyAction()` - Eliminar propiedad
- ✅ `uploadImageAction()` - Subir imagen
- ✅ `deleteImageAction()` - Eliminar imagen
- ✅ `reorderImagesAction()` - Reordenar imágenes

**5. Server Actions Appointments** (`/app/actions/appointments.ts`)
- ✅ `createAppointmentAction()` - Crear cita
- ✅ `confirmAppointmentAction()` - Confirmar cita
- ✅ `cancelAppointmentAction()` - Cancelar cita
- ✅ `completeAppointmentAction()` - Completar cita
- ✅ Envío de emails (con error handling)

---

### 🗄️ DATABASE & REPOSITORIES (100% implementado)

#### Modelos Prisma
```prisma
✅ User (con subscriptionTier y Stripe fields)
✅ Property (completo)
✅ PropertyImage (completo)
✅ Favorite (completo)
✅ Appointment (completo)
✅ PropertyShare (social features)
✅ PropertyView (analytics)
```

#### Enums
```prisma
✅ UserRole (CLIENT, AGENT, ADMIN)
✅ SubscriptionTier (FREE, BASIC, PRO) - ⚠️ SCHEMA LISTO, FUNCIONALIDAD 50%
✅ TransactionType (SALE, RENT)
✅ PropertyCategory (12 categorías)
✅ PropertyStatus (AVAILABLE, PENDING, SOLD, RENTED)
✅ AppointmentStatus (PENDING, CONFIRMED, CANCELLED, COMPLETED)
✅ SharePlatform (FACEBOOK, TWITTER, WHATSAPP, etc.)
```

#### Repositories
```typescript
✅ UserRepository - CRUD completo
✅ PropertyRepository - CRUD + filtros + búsqueda
✅ PropertyImageRepository - CRUD + ordenamiento
✅ FavoriteRepository - Toggle + lista
✅ AppointmentRepository - CRUD + gestión de estados
```

---

## ❌ FUNCIONALIDADES PENDIENTES

### 🔴 CRÍTICAS (Bloqueantes - Sprint 1-6)

#### 1. Sistema Freemium - Schema + Permissions (Sprint 1-2)

**Status**: 🟡 50% completo (schema listo, lógica pendiente)

**Pendiente**:
- [ ] **Helpers de límites** (`apps/web/lib/permissions/property-limits.ts`)
  - [ ] `canCreateProperty(userId)` - Verificar límite de propiedades
  - [ ] `canUploadImage(propertyId, userId)` - Verificar límite de imágenes
  - [ ] `canFeatureProperty(userId)` - Verificar límite de destacados
  - [ ] `getPropertyLimit(tier)` - Retornar límite por tier
  - [ ] `getImageLimit(tier)` - Retornar límite de imágenes
  - [ ] `getFeaturedLimit(tier)` - Retornar límite de destacados

- [ ] **Integración en Server Actions**
  - [ ] `createPropertyAction` - Validar límite antes de crear
  - [ ] `uploadImageAction` - Validar límite antes de subir
  - [ ] Error responses con `upgradeRequired: true`

- [ ] **Testing**
  - [ ] Unit tests para helpers (20+ tests)
  - [ ] Integration tests para Server Actions

**Archivos afectados**:
```
apps/web/lib/permissions/property-limits.ts  (CREAR)
apps/web/app/actions/properties.ts           (MODIFICAR línea 34-44)
apps/web/app/actions/admin.ts                (AGREGAR updateUserTierAction)
```

**Tiempo estimado**: 18 horas

---

#### 2. Stripe Integration (Sprint 3-4)

**Status**: ❌ 0% - No iniciado

**Pendiente**:
- [ ] **Stripe Account Setup**
  - [ ] Crear cuenta Stripe (Ecuador - USD)
  - [ ] Verificar cuenta (puede tomar 1-3 días)
  - [ ] Obtener API keys (test + production)

- [ ] **Products & Prices Creation**
  - [ ] Crear producto BASIC ($4.99/mes)
  - [ ] Crear producto PRO ($14.99/mes)
  - [ ] Guardar price IDs en env vars

- [ ] **Checkout Flow**
  - [ ] Componente `<CheckoutButton tier={tier} />`
  - [ ] Server Action `createCheckoutSessionAction()`
  - [ ] Página `/pricing` con 3 tiers
  - [ ] Página `/checkout/success`
  - [ ] Página `/checkout/cancel`

- [ ] **Webhooks**
  - [ ] Endpoint `/api/webhooks/stripe`
  - [ ] Handler para `checkout.session.completed`
  - [ ] Handler para `invoice.paid`
  - [ ] Handler para `invoice.payment_failed`
  - [ ] Handler para `customer.subscription.deleted`
  - [ ] Actualizar User en DB (subscriptionTier, Stripe fields)

- [ ] **Subscription Management**
  - [ ] Página `/dashboard/subscription`
  - [ ] Ver plan actual
  - [ ] Botón upgrade/downgrade
  - [ ] Botón cancelar suscripción
  - [ ] Ver historial de pagos
  - [ ] Server Actions:
    - `upgradePlanAction()`
    - `downgradePlanAction()`
    - `cancelSubscriptionAction()`

- [ ] **Testing**
  - [ ] Test mode completo
  - [ ] Test con tarjetas de prueba
  - [ ] Test de webhooks (Stripe CLI)

**Archivos a crear**:
```
apps/web/app/api/webhooks/stripe/route.ts
apps/web/app/pricing/page.tsx
apps/web/app/dashboard/subscription/page.tsx
apps/web/components/pricing/checkout-button.tsx
apps/web/components/pricing/pricing-card.tsx
apps/web/lib/stripe/client.ts
apps/web/lib/stripe/webhooks.ts
apps/web/app/actions/subscription.ts
```

**Tiempo estimado**: 26 horas

---

#### 3. UI Pricing & Upgrade Modals (Sprint 5-6)

**Status**: ❌ 0% - No iniciado

**Pendiente**:
- [ ] **Página Pricing** (`/pricing`)
  - [ ] 3 columnas (FREE, BASIC, PRO)
  - [ ] Feature comparison table
  - [ ] CTAs con CheckoutButton
  - [ ] Testimonials (opcional)
  - [ ] FAQs

- [ ] **Upgrade Modals**
  - [ ] `<LimitReachedModal />` - Cuando alcanza límite
  - [ ] Mostrar tier actual vs. necesario
  - [ ] CTA para upgrade
  - [ ] Trigger en Server Actions cuando `upgradeRequired: true`

- [ ] **Dashboard Subscription**
  - [ ] Ver plan actual (FREE/BASIC/PRO)
  - [ ] Uso actual vs. límites
    - Propiedades: 2/3
    - Imágenes: 45/60 (total)
  - [ ] Progress bars visuales
  - [ ] Upgrade CTA
  - [ ] Historial de pagos

- [ ] **Email Templates**
  - [ ] Confirmación de suscripción
  - [ ] Pago exitoso
  - [ ] Pago fallido
  - [ ] Suscripción cancelada

- [ ] **Analytics Setup**
  - [ ] Tracking conversiones (Vercel Analytics)
  - [ ] Eventos custom:
    - `pricing_page_view`
    - `upgrade_button_click`
    - `checkout_started`
    - `checkout_completed`

**Archivos a crear**:
```
apps/web/app/pricing/page.tsx
apps/web/components/pricing/pricing-card.tsx
apps/web/components/pricing/feature-list.tsx
apps/web/components/modals/limit-reached-modal.tsx
apps/web/components/subscription/plan-card.tsx
apps/web/components/subscription/usage-meter.tsx
apps/web/lib/email/subscription-emails.ts
```

**Tiempo estimado**: 36 horas

---

### 🟡 IMPORTANTES (No bloqueantes - Mejoras)

#### 4. Admin - Features Adicionales

**Pendiente**:
- [ ] **Moderación de contenido**
  - [ ] Aprobar/rechazar propiedades pendientes
  - [ ] Flag propiedades sospechosas
  - [ ] Comentarios de moderación

- [ ] **Gestión de suscripciones**
  - [ ] Ver usuarios pagos vs. free
  - [ ] Cancelar suscripciones manualmente
  - [ ] Dar upgrade gratis (promo)
  - [ ] Ver métricas MRR, churn rate

- [ ] **Logs de actividad**
  - [ ] Ver acciones de usuarios
  - [ ] Ver cambios en propiedades
  - [ ] Audit log completo

- [ ] **Reportes exportables**
  - [ ] Export CSV de usuarios
  - [ ] Export CSV de propiedades
  - [ ] Export CSV de transacciones

**Tiempo estimado**: 16 horas

---

#### 5. Dashboard - Features Adicionales

**Pendiente**:
- [ ] **Featured Properties**
  - [ ] Botón "Destacar" en PropertyCard
  - [ ] Límite por tier (0 FREE, 3 BASIC, ∞ PRO)
  - [ ] Badge "Destacado" en propiedades
  - [ ] Server Action `featurePropertyAction()`

- [ ] **Analytics Avanzado**
  - [ ] Gráficos de visitas por propiedad
  - [ ] Mapa de calor de visitas
  - [ ] Conversión de visitas → citas
  - [ ] Fuentes de tráfico

- [ ] **Notificaciones**
  - [ ] Badge de nuevas citas
  - [ ] Notificaciones en tiempo real
  - [ ] Centro de notificaciones

- [ ] **Actividad Reciente**
  - [ ] Timeline de actividad
  - [ ] Últimas visitas
  - [ ] Últimas citas
  - [ ] Últimos favoritos

**Tiempo estimado**: 20 horas

---

#### 6. Email System - Mejoras

**Status**: ⚠️ TESTING MODE (usando test@resend.dev)

**Pendiente**:
- [ ] **Production Email**
  - [ ] Comprar/configurar dominio
  - [ ] Verificar dominio en Resend
  - [ ] Cambiar `from: noreply@inmoapp.com`
  - [ ] Templates profesionales (con HTML)

- [ ] **Email Templates**
  - [ ] Welcome email (nuevo usuario)
  - [ ] Property published (propiedad publicada)
  - [ ] New appointment (nueva cita)
  - [ ] Appointment confirmed (cita confirmada)
  - [ ] Appointment reminder (recordatorio 24h antes)
  - [ ] Subscription emails (ver arriba)

**Tiempo estimado**: 6 horas

---

### 🟢 MEJORAS (Nice-to-have)

#### 7. Performance & Optimización

**Pendiente**:
- [ ] **React.cache() Implementation**
  - [ ] Deduplicar llamadas a DB en componentes
  - [ ] Gain: 36% performance improvement
  - [ ] Archivos: todos los componentes Server

- [ ] **Image Optimization**
  - [ ] Compress images on upload
  - [ ] Generate thumbnails
  - [ ] Use Next.js Image component everywhere

- [ ] **Database Optimization**
  - [ ] Add missing indexes
  - [ ] Optimize slow queries
  - [ ] Connection pooling tuning

**Tiempo estimado**: 8 horas

---

#### 8. Testing & CI/CD

**Status**: 🟡 87.6% tests passing (113/129)

**Pendiente**:
- [ ] **Repository Tests**
  - [ ] FavoriteRepository tests
  - [ ] AppointmentRepository tests
  - [ ] PropertyImageRepository tests
  - [ ] UserRepository tests

- [ ] **E2E Tests**
  - [ ] Playwright setup
  - [ ] Login flow E2E
  - [ ] Property creation E2E
  - [ ] Appointment flow E2E
  - [ ] Upgrade subscription E2E

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions setup
  - [ ] Run tests on PR
  - [ ] Block merge if tests fail
  - [ ] Coverage threshold (>25%)

**Tiempo estimado**: 30 horas

---

## 📊 MATRIZ DE PRIORIDADES

| Feature | Importancia | Urgencia | Esfuerzo | Prioridad |
|---------|-------------|----------|----------|-----------|
| **Freemium Permissions** | 🔴 Crítica | 🔴 Alta | 18h | **P0** |
| **Stripe Integration** | 🔴 Crítica | 🔴 Alta | 26h | **P0** |
| **UI Pricing** | 🔴 Crítica | 🟡 Media | 36h | **P0** |
| **Email Production** | 🟡 Alta | 🔴 Alta | 6h | **P1** |
| **Featured Properties** | 🟡 Alta | 🟢 Baja | 8h | **P2** |
| **Admin Moderation** | 🟡 Alta | 🟢 Baja | 16h | **P2** |
| **Dashboard Analytics** | 🟢 Media | 🟢 Baja | 20h | **P3** |
| **React.cache()** | 🟢 Media | 🟡 Media | 8h | **P3** |
| **E2E Tests** | 🟡 Alta | 🟢 Baja | 30h | **P3** |

---

## 🎯 RECOMENDACIONES

### Próximos 3 Sprints (Enfoque)

#### **Sprint 1-2: Freemium Permissions** (2 semanas)
```
Semana 1:
- Día 1-2: Crear helpers de límites
- Día 3-4: Integrar en Server Actions
- Día 5: Testing (20+ tests)

Semana 2:
- Día 1-2: Admin: updateUserTierAction
- Día 3-4: UI feedback cuando alcanza límite
- Día 5: Testing integration + review
```

#### **Sprint 3-4: Stripe Integration** (2 semanas)
```
Semana 3:
- Día 1: Stripe account setup
- Día 2-3: Checkout flow + componentes
- Día 4-5: Webhooks backend

Semana 4:
- Día 1-2: Subscription management
- Día 3-4: Testing (test mode completo)
- Día 5: Production setup + review
```

#### **Sprint 5-6: UI + Beta** (2 semanas)
```
Semana 5:
- Día 1-2: Pricing page
- Día 3-4: Upgrade modals + dashboard subscription
- Día 5: Email templates

Semana 6:
- Día 1-2: Analytics setup
- Día 3: Beta cerrada (50 usuarios)
- Día 4-5: Feedback + fixes
```

---

### Decisiones Críticas Requeridas

Antes de empezar Sprint 1, necesitas decidir:

1. **✅ Pricing confirmado**:
   - FREE: $0/mes (1 propiedad, 5 imágenes)
   - BASIC: $4.99/mes (3 propiedades, 10 imágenes, 3 destacados)
   - PRO: $14.99/mes (10 propiedades, 20 imágenes, destacados ilimitados)

2. **✅ Expiración de publicaciones**: Auto-renovación ilimitada (sin expiración)

3. **⏳ Email domain**: ¿Qué dominio usar? (ej: inmoapp.com, inmoapp.ec)

4. **⏳ Stripe account**: ¿Quién será el owner de la cuenta Stripe?

---

## 📈 MÉTRICAS DE ÉXITO

### Sprint 1-2 (Permissions)
- ✅ 20+ tests passing
- ✅ Límites validados en createProperty
- ✅ Límites validados en uploadImage
- ✅ Error messages claros cuando alcanza límite

### Sprint 3-4 (Stripe)
- ✅ Checkout funcional (test mode)
- ✅ Webhooks procesando correctamente
- ✅ Usuarios pueden subscribirse
- ✅ Subscription fields actualizados en DB

### Sprint 5-6 (UI + Beta)
- ✅ Pricing page pública
- ✅ 50 usuarios beta invitados
- ✅ 5-10% conversión Free→Paid
- ✅ 0 errores críticos en payments

---

## 🔗 REFERENCIAS

**Documentación técnica**:
- `docs/ROADMAP.md` - Plan completo 18 semanas
- `docs/business/TECHNICAL_SPEC.md` - Especificación Freemium
- `docs/business/DECISIONS_APPROVED.md` - Decisiones finales
- `docs/technical-debt/00-DEEP-ANALYSIS.md` - Análisis técnico

**Archivos clave**:
- `packages/database/prisma/schema.prisma` - Schema completo
- `apps/web/app/actions/properties.ts` - Server Actions propiedades
- `apps/web/app/actions/admin.ts` - Server Actions admin
- `apps/web/lib/auth.ts` - Helpers de autenticación

---

**Última actualización**: Noviembre 24, 2025
**Próxima revisión**: Al completar Sprint 1 (Diciembre 6, 2025)
