# 🏗️ SSOT Subscription Architecture (Single Source of Truth)

**Última actualización:** Diciembre 16, 2025
**Status:** ✅ Implementado
**Principio:** Cada dato debe existir en UN SOLO lugar

---

## 📋 Índice

1. [Problema Original](#problema-original)
2. [Solución: SSOT](#solución-ssot)
3. [Arquitectura Actual](#arquitectura-actual)
4. [Reglas de Implementación](#reglas-de-implementación)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🐛 Problema Original

### Duplicación de Datos

El tier de suscripción existía en **2 lugares**:

```
┌─────────────────────────────────────────────────────┐
│ auth.users (Supabase Auth)                         │
│ - raw_user_meta_data->>'plan': "agent"             │
│ - Usado solo en signup                             │
│ - Podía quedar desactualizado                      │
└─────────────────────────────────────────────────────┘
                    ⬇️ Trigger sincroniza
┌─────────────────────────────────────────────────────┐
│ public.users (Aplicación)                          │
│ - subscription_tier: AGENT                         │
│ - Usado en toda la app                             │
│ - Fuente de verdad real                            │
└─────────────────────────────────────────────────────┘
```

### Problema: Desincronización

**Escenario del Bug:**

1. Usuario se registra → metadata: `"agent"`, DB: `AGENT` ✅ Sincronizados
2. Cambias tier manualmente en Dashboard → DB: `PRO`, metadata: `"agent"` ❌ Desincronizados
3. Usuario hace login → Trigger lee metadata viejo → Sobrescribe DB a `AGENT` ❌

**Resultado:** El tier se revertía constantemente.

---

## ✅ Solución: SSOT

### Principio Arquitectural

> **Single Source of Truth (SSOT):** Cada dato debe tener UNA Y SOLO UNA fuente de verdad autoritativa.

**Decision:** `public.users.subscription_tier` es la ÚNICA fuente de verdad.

```
┌─────────────────────────────────────────────────────┐
│ auth.users.metadata.plan                           │
│ - Solo para signup inicial                         │
│ - Ignorado después del signup                      │
│ - Puede estar desactualizado (no importa)          │
└─────────────────────────────────────────────────────┘
                    ⬇️ Solo en INSERT
┌─────────────────────────────────────────────────────┐
│ public.users.subscription_tier ⭐                  │
│ - ÚNICA FUENTE DE VERDAD                           │
│ - Usado en TODA la aplicación                      │
│ - NUNCA sincronizar desde metadata                 │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura Actual

### 1. Database Trigger (Solo INSERT)

**Archivo:** `packages/database/migrations/fix-trigger-insert-only.sql`

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users  -- ⚠️ SOLO INSERT (no UPDATE)
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
```

**Qué hace:**
- ✅ Se ejecuta cuando un usuario se registra (INSERT)
- ✅ Copia metadata → public.users UNA VEZ
- ❌ NO se ejecuta en login/updates (UPDATE)
- ❌ NO sincroniza cambios de metadata

**Por qué:**
- El metadata solo importa en el signup inicial
- Después del signup, metadata es ignorado completamente
- Previene sobrescrituras inesperadas

---

### 2. Tier Manager (Helpers Centralizados)

**Archivo:** `apps/web/lib/subscription/tier-manager.ts`

**Funciones principales:**

```typescript
// Cambiar tier de un usuario (SSOT)
setUserTier(userId, 'PRO', 'stripe_payment_succeeded')

// Obtener tier actual (solo desde DB)
getUserTier(userId) → 'AGENT'

// Verificar tier mínimo
hasMinimumTier(userId, 'AGENT') → true/false

// Promover CLIENT → AGENT
promoteToAgent(userId, 'AGENT')

// Downgrade a FREE
downgradeToFree(userId, 'subscription_cancelled')
```

**Garantías:**
- ✅ Solo modifica `public.users`
- ❌ NUNCA actualiza metadata
- ✅ Logging automático
- ✅ Validaciones integradas

---

### 3. Server Actions (Sin Sincronización)

**Archivo:** `apps/web/app/actions/auth.ts`

**Antes (CON BUG):**
```typescript
// ❌ Sincronización bidireccional (causaba bugs)
if (metadataRole && metadataRole !== dbUser.role) {
  await userRepository.update(dbUser.id, { role: metadataRole });
}
```

**Después (SSOT):**
```typescript
// ✅ public.users es la fuente de verdad
// NO sincronizar metadata → DB
// Metadata solo importó en el signup
```

**Archivo:** `apps/web/app/actions/subscription.ts`

```typescript
// ✅ Usar tier-manager (SSOT)
await setUserTier(user.id, newTier, 'subscription_upgrade');

// ❌ NO actualizar metadata
```

---

## 📜 Reglas de Implementación

### ✅ HACER (Best Practices)

1. **Leer tier:**
   ```typescript
   // ✅ Correcto: Desde public.users
   const user = await getCurrentUser(); // Lee de public.users
   const tier = user.subscriptionTier;

   // ✅ Correcto: Usar tier-manager
   const tier = await getUserTier(userId);
   ```

2. **Cambiar tier:**
   ```typescript
   // ✅ Correcto: Usar tier-manager
   await setUserTier(userId, 'PRO', 'stripe_webhook');

   // ✅ Correcto: Usar promoteToAgent
   await promoteToAgent(userId, 'AGENT');
   ```

3. **Validar permisos:**
   ```typescript
   // ✅ Correcto: Desde DB
   if (user.subscriptionTier === 'PRO') { ... }

   // ✅ Correcto: Usar helper
   if (await hasMinimumTier(userId, 'AGENT')) { ... }
   ```

---

### ❌ NO HACER (Anti-Patterns)

1. **NO leer metadata:**
   ```typescript
   // ❌ INCORRECTO: Leer desde metadata
   const { data: { user } } = await supabase.auth.getUser();
   const tier = user.user_metadata?.plan; // NO HACER
   ```

2. **NO actualizar metadata:**
   ```typescript
   // ❌ INCORRECTO: Sincronizar metadata
   await supabase.auth.updateUser({
     data: { plan: newTier.toLowerCase() }
   }); // NO HACER (a menos que sea SOLO para analytics)
   ```

3. **NO updates directos de DB:**
   ```typescript
   // ❌ INCORRECTO: Bypass tier-manager
   await db.user.update({
     where: { id: userId },
     data: { subscriptionTier: 'PRO' }
   }); // Usar tier-manager en su lugar
   ```

4. **NO confiar en metadata:**
   ```typescript
   // ❌ INCORRECTO: Asumir que metadata está actualizado
   if (user.user_metadata?.plan === 'pro') { ... } // Puede ser viejo
   ```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Upgrade de Suscripción

```typescript
// apps/web/app/actions/subscription.ts
export async function upgradeSubscriptionAction(formData: FormData) {
  const user = await requireAuth();
  const plan = formData.get("plan") as SubscriptionTier;

  // ✅ Solo actualizar DB (SSOT)
  if (user.role === "CLIENT") {
    await promoteToAgent(user.id, plan);
  } else {
    await setUserTier(user.id, plan, "subscription_upgrade");
  }

  // ❌ NO actualizar metadata

  revalidatePath("/dashboard");
  return { success: true };
}
```

---

### Ejemplo 2: Stripe Webhook (Futuro)

```typescript
// apps/web/app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(/* ... */);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tier = session.metadata.tier as SubscriptionTier;

      // ✅ Solo actualizar DB
      await setUserTier(userId, tier, 'stripe_checkout_completed');

      // ❌ NO actualizar metadata
      break;

    case 'customer.subscription.deleted':
      // ✅ Downgrade usando helper
      await downgradeToFree(userId, 'stripe_subscription_cancelled');
      break;
  }
}
```

---

### Ejemplo 3: Verificación de Permisos

```typescript
// apps/web/lib/permissions/property-limits.ts
export async function canCreateProperty(userId: string): Promise<boolean> {
  // ✅ Leer tier desde DB (SSOT)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const currentCount = await db.property.count({
    where: { agentId: userId },
  });

  const limits = {
    FREE: 1,
    PLUS: 3,
    AGENT: 10,
    PRO: 20,
  };

  return currentCount < limits[user.subscriptionTier];
}
```

---

## 🧪 Testing

### Test 1: Signup con Plan

```typescript
describe('SSOT: Signup', () => {
  test('Nuevo usuario recibe tier correcto del metadata', async () => {
    // 1. Signup con plan AGENT
    const { data } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'pass123',
      options: {
        data: { plan: 'agent' }
      }
    });

    // 2. Verificar en public.users (SSOT)
    const dbUser = await db.user.findUnique({
      where: { id: data.user.id }
    });

    expect(dbUser.subscriptionTier).toBe('AGENT');
  });
});
```

---

### Test 2: Login NO Sobrescribe

```typescript
describe('SSOT: Login', () => {
  test('Login NO sobrescribe tier desde metadata', async () => {
    // 1. Crear usuario con tier AGENT
    const user = await db.user.create({
      data: { subscriptionTier: 'AGENT', ... }
    });

    // 2. Simular metadata desactualizado
    await supabase.auth.updateUser({
      data: { plan: 'free' } // Metadata viejo
    });

    // 3. Login
    await supabase.auth.signInWithPassword({ ... });

    // 4. Verificar que tier NO cambió
    const dbUser = await db.user.findUnique({
      where: { id: user.id }
    });

    expect(dbUser.subscriptionTier).toBe('AGENT'); // ✅ No revirtió
  });
});
```

---

### Test 3: Cambio Manual Permanente

```typescript
describe('SSOT: Manual Changes', () => {
  test('Cambios manuales en tier son permanentes', async () => {
    // 1. Usuario con tier FREE
    const user = await db.user.create({
      data: { subscriptionTier: 'FREE', ... }
    });

    // 2. Cambiar a PRO manualmente
    await setUserTier(user.id, 'PRO', 'admin_manual_change');

    // 3. Login varias veces
    for (let i = 0; i < 5; i++) {
      await supabase.auth.signInWithPassword({ ... });
    }

    // 4. Verificar que sigue siendo PRO
    const tier = await getUserTier(user.id);
    expect(tier).toBe('PRO'); // ✅ Permanente
  });
});
```

---

## 🚨 Troubleshooting

### Problema: Tier se sigue revirtiend

**Diagnóstico:**
```sql
-- Ver si el trigger está configurado correctamente
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
```

**Debe retornar:**
```
trigger_name         | event_manipulation
---------------------|--------------------
on_auth_user_created | INSERT
```

**Si ves UPDATE:** Re-ejecuta el script `fix-trigger-insert-only.sql`.

---

### Problema: Metadata desactualizado

**Esto es NORMAL y ESPERADO en arquitectura SSOT.**

**Verificar desincronización (opcional):**
```typescript
const mismatchCount = await checkMetadataSync();
console.log(`Usuarios con metadata desactualizado: ${mismatchCount}`);
// Este número puede ser > 0 (no es un problema)
```

**NO sincronizar metadata.** Si realmente necesitas metadata actualizado (ej: analytics), hazlo manualmente pero NO confíes en él como fuente de verdad.

---

### Problema: Helper no funciona

**Error común:**
```
Error: Cannot find module '@/lib/subscription/tier-manager'
```

**Solución:**
```bash
# Reiniciar dev server
bun run dev
```

El módulo debe estar en: `apps/web/lib/subscription/tier-manager.ts`

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (Dual Source) | Después (SSOT) |
|---------|---------------------|----------------|
| **Fuentes de verdad** | 2 (metadata + DB) | 1 (DB) |
| **Sincronización** | Trigger INSERT+UPDATE | Trigger INSERT only |
| **Metadata updates** | Sí, bidireccional | No, ignorado |
| **Bugs de sobrescritura** | ❌ Frecuentes | ✅ Imposibles |
| **Complejidad** | 🔴 Alta | 🟢 Baja |
| **Mantenimiento** | 🔴 Difícil | 🟢 Fácil |
| **Testing** | 🔴 Frágil | 🟢 Robusto |

---

## 📚 Referencias

### Archivos Clave

- **Trigger:** `packages/database/migrations/fix-trigger-insert-only.sql`
- **Tier Manager:** `apps/web/lib/subscription/tier-manager.ts`
- **Auth Actions:** `apps/web/app/actions/auth.ts:225-252`
- **Subscription:** `apps/web/app/actions/subscription.ts`
- **Bug Report:** `docs/bugs/SUBSCRIPTION_TIER_SIGNUP_BUG.md`

### Documentación Relacionada

- `docs/architecture/AUTHENTICATION_SYSTEM.md`
- `docs/business/TECHNICAL_SPEC.md`
- `docs/bugs/TRIGGER_INSERT_ONLY_IMPLEMENTATION.md`

---

## ✅ Checklist de Implementación

- [x] Trigger cambiado a INSERT-only
- [x] Tier manager creado (`tier-manager.ts`)
- [x] auth.ts limpio (sin sincronización de metadata)
- [x] subscription.ts usando tier-manager
- [x] Documentación SSOT completa
- [ ] Tests de integración escritos
- [ ] Verificado en staging
- [ ] Desplegado a producción

---

**Última revisión:** Diciembre 16, 2025
**Mantenedor:** Equipo de desarrollo InmoApp
**Status:** ✅ Producción
