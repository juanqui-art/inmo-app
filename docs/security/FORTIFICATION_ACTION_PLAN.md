# 🛡️ System Fortification - Action Plan (Next 2 Weeks)

**Created:** Diciembre 16, 2025
**Context:** Post BUG-001, system fragility audit completado
**Goal:** Fortalecer áreas críticas ANTES de beta pública

---

## 🎯 Filosofía: "No Perfection, Smart Protection"

> No necesitas un sistema perfecto. Necesitas un sistema que:
> 1. **Detecte problemas rápido** (monitoring)
> 2. **Falle de forma segura** (fail-safe defaults)
> 3. **Se recupere rápido** (rollback, idempotency)

---

## 📋 Plan de 2 Semanas (Realista y Ejecutable)

### Semana 1: Testing + Database Fortification

#### 🎯 Lunes-Martes: E2E Tests Críticos (16h)

**Objetivo:** Testear los 3 flows más críticos end-to-end

**Tasks:**
```bash
# Instalar Playwright
bun add -D @playwright/test

# Crear tests
mkdir -p apps/web/__tests__/e2e
```

**Tests a crear:**

1. **Test 1: Signup → Login → Create Property** (bloqueador de beta)
```typescript
// apps/web/__tests__/e2e/critical-flow-property.spec.ts
test('User can signup, login, and create property', async ({ page }) => {
  // 1. Signup con plan AGENT
  // 2. Login
  // 3. Navegar a /dashboard/propiedades/nueva
  // 4. Llenar form
  // 5. Subir imagen
  // 6. Submit
  // 7. Verificar property creada en DB
});
```

2. **Test 2: Tier Limits Enforcement** (prevenir abuse)
```typescript
test('FREE tier cannot create more than 1 property', async ({ page }) => {
  // 1. Login con FREE tier
  // 2. Crear 1 propiedad (should succeed)
  // 3. Intentar crear 2da propiedad (should fail)
  // 4. Verificar error message
});
```

3. **Test 3: Upgrade Flow** (revenue critical)
```typescript
test('User can upgrade subscription', async ({ page }) => {
  // 1. Login con FREE
  // 2. Click "Upgrade"
  // 3. Select AGENT plan
  // 4. Submit (simulated payment)
  // 5. Verificar tier updated en DB
  // 6. Verificar nuevos límites aplicados
});
```

**Entregable:**
- [ ] 3 E2E tests passing
- [ ] CI/CD ejecuta E2E en cada PR
- [ ] Documentación de cómo agregar más tests

**Tiempo estimado:** 16h (2 días, 8h/día)

---

#### 🎯 Miércoles-Jueves: Database Constraints (8h)

**Objetivo:** La DB previene violaciones de límites automáticamente

**Task 1: Property Count Constraint**

```sql
-- packages/database/migrations/add-property-count-constraint.sql

-- Función para verificar límites
CREATE OR REPLACE FUNCTION check_property_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier "SubscriptionTier";
  property_count INT;
  max_allowed INT;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO user_tier
  FROM users
  WHERE id = NEW.agent_id;

  -- Count existing properties
  SELECT COUNT(*) INTO property_count
  FROM properties
  WHERE agent_id = NEW.agent_id;

  -- Determine limit
  max_allowed := CASE user_tier
    WHEN 'FREE' THEN 1
    WHEN 'PLUS' THEN 3
    WHEN 'AGENT' THEN 10
    WHEN 'PRO' THEN 20
  END;

  -- Enforce limit
  IF property_count >= max_allowed THEN
    RAISE EXCEPTION 'Property limit exceeded for tier %: % of % properties',
      user_tier, property_count, max_allowed
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta el check
CREATE TRIGGER enforce_property_limit
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION check_property_limit();
```

**Task 2: Test del Constraint**

```typescript
// Test en apps/web/__tests__/database-constraints.test.ts
test('DB rejects property creation over tier limit', async () => {
  // 1. Crear usuario FREE con 1 propiedad
  // 2. Intentar crear 2da propiedad DIRECTO en DB
  // 3. Debe fallar con error específico
  await expect(
    db.property.create({ data: { agentId: freeUser.id, ... } })
  ).rejects.toThrow('Property limit exceeded');
});
```

**Entregable:**
- [ ] Constraint SQL aplicado en Supabase
- [ ] Test de constraint passing
- [ ] Error handling en Server Actions actualizado

**Tiempo estimado:** 8h (2 días, 4h/día)

---

#### 🎯 Viernes: Image Upload Hardening (8h)

**Objetivo:** File uploads seguros y optimizados

**Task 1: File Size & Type Validation (Server-Side)**

```typescript
// apps/web/lib/validations/upload.ts

import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 10MB')
    .refine(
      (file) => ALLOWED_TYPES.includes(file.type),
      'Only JPEG, PNG, and WebP are allowed'
    ),
});

// Verificación adicional: Magic bytes (prevent MIME spoofing)
export async function verifyImageMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG magic bytes: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;

  // PNG magic bytes: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return true;

  // WebP magic bytes: 52 49 46 46 ... 57 45 42 50
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return true;

  return false;
}
```

**Task 2: Storage Limits por Tier**

```typescript
// apps/web/lib/permissions/storage-limits.ts

const STORAGE_LIMITS_MB = {
  FREE: 50, // 50MB
  PLUS: 200, // 200MB
  AGENT: 500, // 500MB
  PRO: 2000, // 2GB
};

export async function canUploadFile(
  userId: string,
  fileSizeBytes: number
): Promise<{ allowed: boolean; reason?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const limitMB = STORAGE_LIMITS_MB[user.subscriptionTier];
  const limitBytes = limitMB * 1024 * 1024;

  // Calculate current usage
  const totalUsage = await db.propertyImage.aggregate({
    where: {
      property: { agentId: userId },
    },
    _sum: { fileSize: true }, // Agregar fileSize column a schema
  });

  const currentUsageBytes = totalUsage._sum.fileSize || 0;

  if (currentUsageBytes + fileSizeBytes > limitBytes) {
    return {
      allowed: false,
      reason: `Storage limit exceeded: ${(currentUsageBytes / 1024 / 1024).toFixed(1)}MB / ${limitMB}MB`,
    };
  }

  return { allowed: true };
}
```

**Task 3: Actualizar Schema (agregar fileSize tracking)**

```prisma
// packages/database/prisma/schema.prisma

model PropertyImage {
  id         String   @id @default(uuid())
  url        String
  alt        String?
  order      Int      @default(0)
  fileSize   Int?     @default(0) @map("file_size") // ← NUEVO (bytes)
  mimeType   String?  @map("mime_type") // ← NUEVO
  propertyId String   @map("property_id")
  createdAt  DateTime @default(now()) @map("created_at")

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@map("property_images")
}
```

**Entregable:**
- [ ] Server-side validation implementada
- [ ] Magic bytes verification
- [ ] Storage limits por tier
- [ ] Schema actualizado (fileSize, mimeType)
- [ ] Tests de validación

**Tiempo estimado:** 8h (1 día)

---

### Semana 2: Monitoring + Stripe Prep

#### 🎯 Lunes: Alertas Proactivas (Sentry) (4h)

**Objetivo:** Detectar problemas antes de que usuarios se quejen

```typescript
// apps/web/lib/monitoring/alerts.ts

import * as Sentry from '@sentry/nextjs';

// Alert configs
const CRITICAL_ERRORS = [
  'StripeWebhookVerificationFailed',
  'PaymentProcessingFailed',
  'DatabaseConstraintViolation',
  'AuthenticationFailed',
];

export function captureWithAlert(
  error: Error,
  context: Record<string, any>
) {
  Sentry.captureException(error, {
    contexts: { custom: context },
    level: CRITICAL_ERRORS.some((e) => error.message.includes(e))
      ? 'fatal'
      : 'error',
  });

  // Send to Slack webhook (optional)
  if (process.env.SLACK_WEBHOOK_URL) {
    fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Critical Error: ${error.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:* ${error.message}\n*Context:* ${JSON.stringify(context)}`,
            },
          },
        ],
      }),
    });
  }
}
```

**Configurar en Sentry Dashboard:**
1. Alert rule: "Any error with level=fatal"
2. Notification: Email + Slack
3. Threshold: 1 event (immediate alert)

**Entregable:**
- [ ] Alertas configuradas en Sentry
- [ ] Slack webhook (opcional)
- [ ] Test de alerta (simular error crítico)

**Tiempo estimado:** 4h

---

#### 🎯 Martes-Miércoles: Stripe Webhook Prep (12h)

**Objetivo:** Código listo para Stripe integration (sin integrar aún)

**Task 1: Webhook Handler Skeleton**

```typescript
// apps/web/app/api/webhooks/stripe/route.ts

import { headers } from 'next/headers';
import Stripe from 'stripe';
import { setUserTier } from '@/lib/subscription/tier-manager';
import { logger } from '@/lib/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  // 1. CRITICAL: Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error({ err }, 'Stripe webhook signature verification failed');
    return new Response('Webhook signature verification failed', {
      status: 400,
    });
  }

  // 2. Idempotency check (prevent duplicate processing)
  const eventId = event.id;
  const existingEvent = await db.stripeEvent.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    logger.info({ eventId }, 'Duplicate webhook event, skipping');
    return new Response('Event already processed', { status: 200 });
  }

  // 3. Process event
  try {
    await db.$transaction(async (tx) => {
      // Record event
      await tx.stripeEvent.create({
        data: {
          id: eventId,
          type: event.type,
          data: event.data.object as any,
          createdAt: new Date(event.created * 1000),
        },
      });

      // Handle event type
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object, tx);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object, tx);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object, tx);
          break;

        // Add more cases as needed
        default:
          logger.warn({ type: event.type }, 'Unhandled webhook event');
      }
    });

    return new Response('Event processed', { status: 200 });
  } catch (err) {
    logger.error({ err, eventId }, 'Webhook processing failed');

    // Return 500 so Stripe retries
    return new Response('Processing failed', { status: 500 });
  }
}

// Handlers (implement cuando integres Stripe)
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  tx: any
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as SubscriptionTier;

  if (!userId || !tier) {
    throw new Error('Missing userId or tier in session metadata');
  }

  // Update tier using tier-manager
  await setUserTier(userId, tier, 'stripe_checkout_completed');

  logger.info({ userId, tier }, 'Subscription activated via checkout');
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  tx: any
) {
  // TODO: Implement when Stripe integrated
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  tx: any
) {
  // TODO: Implement when Stripe integrated
}
```

**Task 2: StripeEvent Model (Idempotency)**

```prisma
// packages/database/prisma/schema.prisma

model StripeEvent {
  id        String   @id // Stripe event ID
  type      String   // Event type (checkout.session.completed, etc.)
  data      Json     // Full event data
  processed Boolean  @default(true)
  createdAt DateTime @map("created_at")

  @@index([type])
  @@index([createdAt])
  @@map("stripe_events")
}
```

**Task 3: Tests**

```typescript
// apps/web/__tests__/webhooks/stripe.test.ts

test('Webhook rejects invalid signature', async () => {
  const response = await fetch('/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'stripe-signature': 'invalid',
    },
    body: JSON.stringify({ type: 'test' }),
  });

  expect(response.status).toBe(400);
});

test('Webhook handles duplicate events (idempotency)', async () => {
  // Enviar mismo event 2 veces
  // 2da vez debe retornar 200 sin procesar
});
```

**Entregable:**
- [ ] Webhook handler skeleton
- [ ] Signature verification
- [ ] Idempotency con StripeEvent model
- [ ] Tests de webhooks
- [ ] Documentación de cómo testear con Stripe CLI

**Tiempo estimado:** 12h (2 días, 6h/día)

---

#### 🎯 Jueves: Documentation Day (8h)

**Objetivo:** Documentar todo para futuro-tú y el equipo

**Tasks:**
1. **Actualizar CLAUDE.md:**
   - Agregar sección "Critical Areas"
   - Link a fragility audit
   - Link a action plan

2. **Crear SECURITY_CHECKLIST.md:**
   - Pre-commit checklist
   - Pre-deploy checklist
   - Post-deploy monitoring

3. **Crear RUNBOOK.md:**
   - Qué hacer si Stripe webhook falla
   - Qué hacer si DB está corrupta
   - Qué hacer si hay ataque de abuse

4. **Update README:**
   - Sección de testing
   - Sección de security

**Entregable:**
- [ ] CLAUDE.md actualizado
- [ ] SECURITY_CHECKLIST.md creado
- [ ] RUNBOOK.md creado
- [ ] README actualizado

**Tiempo estimado:** 8h

---

#### 🎯 Viernes: Review & Deploy (4h)

**Objetivo:** Code review completo y merge

**Tasks:**
1. **Self code review:**
   - Leer TODO el código agregado
   - Verificar tests pasan
   - Type check
   - Linter

2. **Deploy a staging:**
   - Run migrations
   - Test E2E en staging
   - Verify monitoring works

3. **Document lessons learned:**
   - Qué funcionó bien
   - Qué fue difícil
   - Qué mejorar la próxima

**Entregable:**
- [ ] PR creado con TODO el trabajo
- [ ] Code review completado
- [ ] Deployed a staging
- [ ] Lessons learned doc

**Tiempo estimado:** 4h

---

## 📊 Resumen del Plan (2 Semanas)

| Día | Task | Horas | Output |
|-----|------|-------|--------|
| **Lun-Mar** | E2E Tests | 16h | 3 critical tests |
| **Mié-Jue** | DB Constraints | 8h | Property limit enforced |
| **Vie** | Image Upload | 8h | Secure uploads |
| **Lun** | Alertas | 4h | Sentry configured |
| **Mar-Mié** | Stripe Prep | 12h | Webhook ready |
| **Jue** | Documentation | 8h | 4 docs created |
| **Vie** | Review & Deploy | 4h | Staging deployed |
| **TOTAL** | | **60h** | **System fortified** |

---

## ✅ Definition of Done

Al final de las 2 semanas, debes tener:

### Testing
- [ ] 3 E2E tests críticos passing
- [ ] DB constraint test passing
- [ ] Upload validation tests passing
- [ ] CI ejecuta E2E en cada PR

### Database
- [ ] Property limit constraint aplicado
- [ ] StripeEvent model creado
- [ ] Migrations documentadas

### Security
- [ ] Image uploads validados server-side
- [ ] Magic bytes verification
- [ ] Storage limits implementados
- [ ] Alertas configuradas

### Code
- [ ] Stripe webhook handler (skeleton)
- [ ] Signature verification
- [ ] Idempotency implemented
- [ ] All tests passing

### Documentation
- [ ] CLAUDE.md actualizado
- [ ] SECURITY_CHECKLIST.md
- [ ] RUNBOOK.md
- [ ] Lessons learned

---

## 🚨 Qué Dejar Para Después

**NO intentar hacer en estas 2 semanas:**
- ❌ 2FA implementation (P2, no blocker)
- ❌ Soft deletes (P2)
- ❌ Virus scanning (P1, pero necesita servicio externo)
- ❌ Load testing (P2)
- ❌ Audit logs completos (P2)

**Por qué:** Priorizar lo que **previene bugs críticos** sobre lo que **mejora security incremental**.

---

## 🎯 Success Metrics

| Métrica | Antes | Target (2 semanas) |
|---------|-------|---------------------|
| **E2E Tests** | 0 | 3+ |
| **DB Constraints** | 0 | 1 (property limit) |
| **Security Score** | 6.75/10 | 7.5/10 |
| **Test Coverage** | 46.53% | 50%+ |
| **Documented Runbooks** | 0 | 2+ |

---

## 💡 Tips para Ejecutar el Plan

### 1. **Time-box agresivamente**
No te pierdas en perfeccionismo. "Done is better than perfect".

### 2. **Prioriza tests sobre features**
Si tienes que elegir, tests > features.

### 3. **Pide ayuda**
Si algo te traba más de 2h, pide ayuda (Claude, Stack Overflow, Discord).

### 4. **Commit often**
No esperes a terminar todo. Commit cada task completada.

### 5. **Toma breaks**
60h en 2 semanas es intenso. Descansa.

---

## 📞 Punto de Contacto

**Si algo sale mal:**
1. Revisa `TROUBLESHOOTING.md` (por crear)
2. Revisa logs en Sentry
3. Rollback con `git revert`
4. Pide ayuda en Discord/Slack

**Si todo sale bien:**
🎉 ¡Celebra! Has fortificado las áreas críticas del sistema.

---

**Creado:** Diciembre 16, 2025
**Owner:** Development team
**Status:** 📋 Ready to execute
**Next review:** Diciembre 30, 2025
