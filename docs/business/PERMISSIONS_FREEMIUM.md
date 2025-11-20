# Matriz de Permisos - Modelo Freemium (Fase 1)

> **Última actualización**: Noviembre 20, 2025
> **Status**: 📋 Planificado (no implementado)
> **Modelo**: Freemium Clásico
> **Referencia**: Ver `BUSINESS_STRATEGY.md` para contexto completo

---

## 📊 Resumen del Modelo

InmoApp implementará un **modelo Freemium** donde:

- ✅ **Todos pueden publicar propiedades** (sin distinción inicial de "agente")
- ✅ Plan **FREE** con límites para probar la plataforma
- ✅ Plan **PREMIUM** y **PRO** para desbloquear funciones avanzadas
- ✅ Pago por destacados (add-on)

---

## 🔐 Roles Fase 1

### Simplificación de Roles

```typescript
enum UserRole {
  FREE     // Usuario gratuito (todos empiezan aquí)
  PREMIUM  // Usuario de pago (plan premium)
  ADMIN    // Administrador
}

enum SubscriptionTier {
  FREE     // 1 publicación, sin destacados
  PREMIUM  // 5 publicaciones, 3 destacados/mes
  PRO      // Ilimitado + analytics avanzados
}
```

**Cambio principal**: Se elimina la distinción `CLIENT` vs `AGENT`. Todos son simplemente usuarios con diferentes niveles de suscripción.

---

## 📋 Matriz de Permisos Completa

### Navegación de Páginas

| Ruta | FREE | PREMIUM | PRO | ADMIN | Protección |
|------|------|---------|-----|-------|------------|
| `/` (Home) | ✅ | ✅ | ✅ | ✅ | Pública |
| `/propiedades` | ✅ | ✅ | ✅ | ✅ | Pública |
| `/propiedades/[id]` | ✅ | ✅ | ✅ | ✅ | Pública |
| `/buscar` | ✅ | ✅ | ✅ | ✅ | Pública |
| `/mapa` | ✅ | ✅ | ✅ | ✅ | Pública |
| `/vender` | ✅ | ✅ | ✅ | ✅ | Pública (landing) |
| `/pricing` | ✅ | ✅ | ✅ | ✅ | Pública |
| `/login` | ✅ (no auth) | - | - | - | Pública |
| `/signup` | ✅ (no auth) | - | - | - | Pública |
| `/perfil` | ✅ | ✅ | ✅ | ✅ | Proxy + `requireAuth()` |
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | **Proxy + `requireAuth()`** |
| `/dashboard/propiedades` | ✅ | ✅ | ✅ | ✅ | Proxy |
| `/dashboard/propiedades/nueva` | ✅* | ✅ | ✅ | ✅ | **Proxy + límite check** |
| `/dashboard/propiedades/[id]/editar` | ✅ (owner) | ✅ (owner) | ✅ (owner) | ✅ | Proxy + Ownership |
| `/dashboard/analytics` | ❌ | ✅ | ✅ | ✅ | **Proxy + tier check** |
| `/admin` | ❌ | ❌ | ❌ | ✅ | **Proxy + `requireRole(['ADMIN'])`** |

**Notas**:
- ✅* = Permitido pero con validación de límite (ver sección de Límites)
- Ownership = Solo el dueño del recurso

---

### Operaciones sobre Propiedades

| Acción | FREE | PREMIUM | PRO | ADMIN | Validación |
|--------|------|---------|-----|-------|------------|
| **Ver propiedades públicas** | ✅ | ✅ | ✅ | ✅ | - |
| **Buscar/Filtrar** | ✅ | ✅ | ✅ | ✅ | `searchPropertiesAction` |
| **Crear propiedad** | ✅ (1 max) | ✅ (5 max) | ✅ (ilimitado) | ✅ | `canCreateProperty()` |
| **Editar propia propiedad** | ✅ | ✅ | ✅ | ✅ | `requireOwnership()` |
| **Editar propiedad de otro** | ❌ | ❌ | ❌ | ✅ | `requireOwnership()` |
| **Eliminar propia propiedad** | ✅ | ✅ | ✅ | ✅ | `requireOwnership()` |
| **Eliminar propiedad de otro** | ❌ | ❌ | ❌ | ✅ | `requireOwnership()` |
| **Subir imágenes (propia)** | ✅ (3 max) | ✅ (10 max) | ✅ (20 max) | ✅ | `canUploadImages()` |
| **Eliminar imágenes (propia)** | ✅ | ✅ | ✅ | ✅ | `requireOwnership()` |
| **Reordenar imágenes (propia)** | ✅ | ✅ | ✅ | ✅ | `requireOwnership()` |
| **Destacar propiedad** | $4.99 c/u | 3/mes incluidos | Ilimitado | Ilimitado | `canHighlight()` |
| **Ver analytics de propiedad** | ❌ | Básico | Avanzado | Total | `hasAnalyticsAccess()` |

---

### Límites por Tier

| Feature | FREE | PREMIUM | PRO | ADMIN |
|---------|------|---------|-----|-------|
| **Propiedades activas** | 1 | 5 | Ilimitado | Ilimitado |
| **Imágenes por propiedad** | 3 | 10 | 20 | Ilimitado |
| **Destacados/mes** | $4.99 c/u | 3 incluidos | Ilimitado | Ilimitado |
| **Duración publicación** | 30 días | 60 días | Ilimitado | Ilimitado |
| **Analytics** | ❌ | Básico | Avanzado | Total |
| **Verificación perfil** | ❌ | ❌ | ✅ | ✅ |
| **Soporte** | Email | Email | Chat prioritario | Total |
| **Edición masiva** | ❌ | ❌ | ✅ | ✅ |

---

### Operaciones sobre Favoritos

| Acción | FREE | PREMIUM | PRO | ADMIN | Server Action |
|--------|------|---------|-----|-------|---------------|
| Ver favoritos propios | ✅ | ✅ | ✅ | ✅ | `getUserFavoritesAction` |
| Agregar favorito | ✅ | ✅ | ✅ | ✅ | `toggleFavoriteAction` |
| Eliminar favorito | ✅ | ✅ | ✅ | ✅ | `toggleFavoriteAction` |
| Límite de favoritos | 10 | 50 | Ilimitado | Ilimitado | `canAddFavorite()` |

---

### Operaciones sobre Citas (Appointments)

| Acción | FREE | PREMIUM | PRO | ADMIN | Server Action |
|--------|------|---------|-----|-------|---------------|
| **Agendar cita** | ✅ | ✅ | ✅ | ✅ | `createAppointmentAction` |
| Ver citas propias (como cliente) | ✅ | ✅ | ✅ | ✅ | `getUserAppointmentsAction` |
| Ver citas de sus propiedades | ✅ | ✅ | ✅ | ✅ | `getPropertyAppointmentsAction` |
| **Confirmar/Cancelar cita** | ✅ (owner) | ✅ (owner) | ✅ (owner) | ✅ | `updateAppointmentStatusAction` |
| Ver slots disponibles | ✅ | ✅ | ✅ | ✅ | `getAvailableSlotsAction` |

**Nota**: Ya no hay restricción de "solo CLIENT puede agendar" - todos pueden tanto publicar como buscar.

---

## 🛠️ Helpers de Validación (Nuevos)

### 1. `canCreateProperty()`

```typescript
// apps/web/lib/permissions.ts

export async function canCreateProperty(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        where: { status: { notIn: ['SOLD', 'RENTED'] } }
      }
    }
  })

  if (!user) return false

  const activeProperties = user.properties.length

  // Límites por tier
  const limits = {
    FREE: 1,
    PREMIUM: 5,
    PRO: Infinity
  }

  const limit = limits[user.subscriptionTier] || 0

  return activeProperties < limit
}
```

### 2. `getFeaturesByTier()`

```typescript
export function getFeaturesByTier(tier: SubscriptionTier) {
  return {
    maxProperties: tier === 'FREE' ? 1 : tier === 'PREMIUM' ? 5 : Infinity,
    maxImages: tier === 'FREE' ? 3 : tier === 'PREMIUM' ? 10 : 20,
    maxFavorites: tier === 'FREE' ? 10 : tier === 'PREMIUM' ? 50 : Infinity,
    canHighlight: tier !== 'FREE',
    highlightsPerMonth: tier === 'PREMIUM' ? 3 : tier === 'PRO' ? Infinity : 0,
    hasAnalytics: tier !== 'FREE',
    analyticsLevel: tier === 'PRO' ? 'advanced' : tier === 'PREMIUM' ? 'basic' : null,
    hasVerification: tier === 'PRO',
    hasPrioritySupport: tier === 'PRO',
    publicationDuration: tier === 'FREE' ? 30 : tier === 'PREMIUM' ? 60 : Infinity
  }
}
```

### 3. `canUploadImages()`

```typescript
export async function canUploadImages(
  propertyId: string,
  newImagesCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      images: true,
      agent: {
        select: { subscriptionTier: true }
      }
    }
  })

  if (!property) {
    return { allowed: false, reason: 'Property not found' }
  }

  const currentImages = property.images.length
  const totalAfterUpload = currentImages + newImagesCount
  const features = getFeaturesByTier(property.agent.subscriptionTier)

  if (totalAfterUpload > features.maxImages) {
    return {
      allowed: false,
      reason: `Límite alcanzado. Plan ${property.agent.subscriptionTier} permite ${features.maxImages} imágenes.`
    }
  }

  return { allowed: true }
}
```

### 4. `canHighlight()`

```typescript
export async function canHighlight(userId: string): Promise<{
  allowed: boolean
  requiresPayment: boolean
  cost?: number
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          properties: {
            where: {
              isHighlighted: true,
              highlightedUntil: { gte: new Date() }
            }
          }
        }
      }
    }
  })

  if (!user) return { allowed: false, requiresPayment: false }

  const features = getFeaturesByTier(user.subscriptionTier)

  // FREE tier: puede destacar pagando $4.99
  if (user.subscriptionTier === 'FREE') {
    return {
      allowed: true,
      requiresPayment: true,
      cost: 4.99
    }
  }

  // PREMIUM: 3/mes incluidos
  if (user.subscriptionTier === 'PREMIUM') {
    const currentHighlights = user._count.properties
    if (currentHighlights < 3) {
      return { allowed: true, requiresPayment: false }
    }
    return {
      allowed: true,
      requiresPayment: true,
      cost: 4.99
    }
  }

  // PRO: ilimitado
  return { allowed: true, requiresPayment: false }
}
```

---

## 🔄 Flujo de Usuario: `/vender`

### Flujo Actual (Problemático)

```
1. Usuario llega a /vender
   ↓
2. Clic "Publicar propiedad"
   ↓
3. Redirect a /signup?redirect=/dashboard/propiedades/nueva
   ↓
4. Usuario elige rol "CLIENT" (error común)
   ↓
5. ❌ No puede publicar (requiere AGENT)
```

### Flujo Propuesto (Freemium)

```
1. Usuario llega a /vender (landing page pública)
   ↓
2. ¿Está autenticado?

   NO → /signup (todos empiezan como FREE)
   SÍ → Continuar al paso 3
   ↓
3. ¿Tiene espacio para publicar?

   if (canCreateProperty(user.id)) {
     → /dashboard/propiedades/nueva ✅
   } else {
     → /pricing (upgrade required) 💳
   }
   ↓
4. Publica propiedad exitosamente
   ↓
5. (Opcional) Popup: "¿Quieres destacar tu propiedad?"

   FREE: "Destaca por 7 días → $4.99"
   PREMIUM: "Te quedan 2 destacados este mes"
   PRO: "Destacar gratis (ilimitado)"
```

---

## 🔐 Capas de Protección Actualizadas

### Capa 1: Proxy (proxy.ts)

```typescript
// apps/web/proxy.ts

const routePermissions = {
  "/dashboard": ["FREE", "PREMIUM", "PRO", "ADMIN"], // Todos autenticados
  "/dashboard/analytics": ["PREMIUM", "PRO", "ADMIN"], // Solo planes pagos
  "/admin": ["ADMIN"],
  "/perfil": ["FREE", "PREMIUM", "PRO", "ADMIN"]
}
```

**Cambio**: Ya no bloquea `/dashboard` a usuarios FREE.

### Capa 2: Server Components

```typescript
// apps/web/app/dashboard/propiedades/nueva/page.tsx

export default async function NewPropertyPage() {
  const user = await requireAuth() // Solo verificar autenticación

  // Verificar si puede crear (límite de tier)
  const canCreate = await canCreateProperty(user.id)

  if (!canCreate) {
    return <UpgradePrompt currentTier={user.subscriptionTier} />
  }

  return <PropertyForm />
}
```

### Capa 3: Server Actions

```typescript
// apps/web/app/actions/properties.ts

export async function createPropertyAction(formData: FormData) {
  "use server"

  const user = await getCurrentUser()
  if (!user) return { error: "No autenticado" }

  // Verificar límite
  const canCreate = await canCreateProperty(user.id)
  if (!canCreate) {
    return {
      error: "Límite de propiedades alcanzado",
      upgradeRequired: true,
      currentTier: user.subscriptionTier
    }
  }

  // Continuar con creación...
}
```

---

## 📈 Eventos de Seguridad (Logging)

Nuevos eventos a registrar:

```typescript
console.warn("[LIMIT] Property creation blocked", {
  userId: string,
  currentTier: string,
  currentProperties: number,
  limit: number,
  timestamp: ISO string
})

console.warn("[LIMIT] Image upload blocked", {
  userId: string,
  propertyId: string,
  currentImages: number,
  attemptedUpload: number,
  limit: number
})

console.warn("[UPGRADE] Upgrade prompt shown", {
  userId: string,
  fromTier: string,
  toTier: string,
  reason: "property_limit" | "analytics" | "highlight"
})
```

---

## ⚡ Migraciones Requeridas

### 1. Schema Prisma

**Cambios en User model**:

```diff
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
- role      UserRole @default(CLIENT)
+ role      UserRole @default(FREE)
+ subscriptionTier SubscriptionTier @default(FREE)
+ stripeCustomerId String? @map("stripe_customer_id")
  ...
}

enum UserRole {
- CLIENT
- AGENT
+ FREE
+ PREMIUM
+ PRO
  ADMIN
}

+ enum SubscriptionTier {
+   FREE
+   PREMIUM
+   PRO
+ }
```

**Nueva tabla Subscription**:

```prisma
model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique @map("user_id")
  tier                 SubscriptionTier
  status               SubscriptionStatus
  stripeSubscriptionId String?            @map("stripe_subscription_id")
  currentPeriodStart   DateTime           @map("current_period_start")
  currentPeriodEnd     DateTime           @map("current_period_end")
  cancelAtPeriodEnd    Boolean            @default(false) @map("cancel_at_period_end")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
  INCOMPLETE
}
```

### 2. Migración de Datos Existentes

```sql
-- Migrar usuarios existentes
UPDATE users SET
  role = 'FREE',
  subscription_tier = CASE
    WHEN role = 'AGENT' THEN 'PREMIUM'  -- Agentes actuales → PREMIUM gratis
    WHEN role = 'CLIENT' THEN 'FREE'    -- Clientes → FREE
    WHEN role = 'ADMIN' THEN 'FREE'     -- Admin mantiene control
  END;

-- Crear suscripciones para usuarios con propiedades
INSERT INTO subscriptions (user_id, tier, status, current_period_start, current_period_end)
SELECT
  u.id,
  'PREMIUM',  -- Grandfathering: usuarios actuales con propiedades → PREMIUM gratis
  'ACTIVE',
  NOW(),
  NOW() + INTERVAL '1 year'  -- 1 año gratis para early adopters
FROM users u
WHERE EXISTS (
  SELECT 1 FROM properties p WHERE p.agent_id = u.id
);
```

---

## 📚 Archivos Afectados

### Por Crear

- [ ] `apps/web/lib/permissions.ts` - Nuevos helpers de validación
- [ ] `apps/web/app/(public)/pricing/page.tsx` - Página de pricing
- [ ] `apps/web/components/upgrade-prompt.tsx` - Modal de upgrade
- [ ] `apps/web/lib/stripe.ts` - Integración con Stripe

### Por Modificar

- [ ] `packages/database/prisma/schema.prisma` - Schema actualizado
- [ ] `apps/web/proxy.ts` - Permisos simplificados
- [ ] `apps/web/lib/auth.ts` - Actualizar `requireRole()`
- [ ] `apps/web/app/actions/properties.ts` - Agregar validaciones de límite
- [ ] `apps/web/app/(public)/vender/page.tsx` - Actualizar flujo de CTA
- [ ] `apps/web/components/auth/signup-form.tsx` - Eliminar selector de rol

---

## ✅ Checklist de Implementación

### Fase 1A: Schema y Backend (Semanas 1-2)

- [ ] Actualizar schema Prisma
- [ ] Crear migración SQL
- [ ] Implementar helpers de permisos (`canCreateProperty`, etc.)
- [ ] Actualizar Server Actions con validaciones
- [ ] Tests unitarios de helpers

### Fase 1B: Stripe Integration (Semanas 3-4)

- [ ] Crear cuenta Stripe
- [ ] Definir productos/precios
- [ ] Implementar checkout flow
- [ ] Webhooks para suscripciones
- [ ] Tests de flujo de pago

### Fase 1C: UI y UX (Semanas 5-6)

- [ ] Diseñar página `/pricing`
- [ ] Crear componente `UpgradePrompt`
- [ ] Actualizar dashboard (mostrar límites)
- [ ] Actualizar `/vender` con nuevo flujo
- [ ] Indicadores de tier en UI

### Fase 1D: Testing y Launch (Semanas 7-8)

- [ ] Tests E2E de flujos completos
- [ ] Beta testing con usuarios reales
- [ ] Documentación de usuario
- [ ] Ajustes según feedback
- [ ] Launch público

---

## 🎓 Mejores Prácticas

### ✅ DO

- Mostrar límites ANTES de que usuario intente crear
- Hacer upgrade path obvio y simple
- Grandfathering para early adopters (mantener beneficios)
- A/B testing de pricing page
- Trackear eventos de "upgrade prompt shown"

### ❌ DON'T

- No bloquear sin explicar (siempre mostrar "por qué")
- No hacer downgrade abrupto (avisar antes de fin de período)
- No hacer paywall agresivo (mostrar valor primero)
- No cambiar precios sin avisar a usuarios activos

---

**Última actualización**: Noviembre 20, 2025
**Próxima revisión**: Al iniciar implementación de Fase 1
**Referencia**: `docs/business/BUSINESS_STRATEGY.md`
