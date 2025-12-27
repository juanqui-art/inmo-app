# Technical Specification - Freemium Implementation

> **Fecha**: Noviembre 20, 2025
> **Actualizado**: Diciembre 27, 2025
> **Status**: 📋 Especificación Técnica para Sprint 1-6
> **Propósito**: Referencia rápida para implementación

---

## 🎯 Objetivo

Implementar sistema de suscripciones Freemium (4 tiers) con límites por tier y integración **Lemon Squeezy**.

> **NOTA (Dic 27, 2025):** Stripe no está disponible en Ecuador directamente.
> Usamos Lemon Squeezy como Merchant of Record.
> Ver: `docs/payments/LEMON_SQUEEZY_INTEGRATION.md` para guía completa.

---

## 📊 Tiers y Límites (Actualizado Dic 2025)

| Feature | FREE | PLUS | BUSINESS | PRO |
|---------|------|------|----------|-----|
| Precio | $0/mes | $9.99/mes | $29.99/mes | EN ESPERA |
| Propiedades activas | 1 | 3 | 10 | 20 |
| Imágenes/propiedad | 6 | 10 | 15 | 20 |
| Videos | 0 | 1 | 3 | 5 |
| Destacados | 0 | 1 | 5 | ∞ |
| CRM Lite | ❌ | ❌ | ✅ | ✅ |
| AI Description | ❌ | ❌ | ✅ | ✅ |
| Soporte | Email | Email | Email 24h | WhatsApp |

> **NOTA:** PRO tier está "EN ESPERA" hasta validar demanda de BUSINESS.

---

## 🗄️ Database Schema

> **IMPORTANTE:** Ver `docs/architecture/SUBSCRIPTION_ARCHITECTURE_REFACTOR.md` para el nuevo schema con tabla `Subscription` separada.

### Schema Actual (En refactor)

```prisma
// packages/database/prisma/schema.prisma

enum SubscriptionTier {
  FREE
  PLUS
  BUSINESS  // Antes era AGENT (renombrado para evitar colisión)
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  PAST_DUE
  CANCELLED
  EXPIRED
  TRIALING
}

// Nueva tabla Subscription (separada de User)
model Subscription {
  id        String             @id @default(uuid())
  userId    String             @unique @map("user_id")
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  tier      SubscriptionTier   @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)

  // Payment Provider (agnóstico: Lemon Squeezy, Stripe, etc.)
  provider              String?   @map("provider")  // "lemonsqueezy" | "stripe"
  providerCustomerId    String?   @unique @map("provider_customer_id")
  providerSubscriptionId String?  @unique @map("provider_subscription_id")
  providerProductId     String?   @map("provider_product_id")
  providerVariantId     String?   @map("provider_variant_id")

  // Billing Dates
  currentPeriodStart DateTime?   @map("current_period_start")
  currentPeriodEnd   DateTime?   @map("current_period_end")
  trialEndsAt        DateTime?   @map("trial_ends_at")
  cancelledAt        DateTime?   @map("cancelled_at")

  // Payment Method
  cardBrand     String?   @map("card_brand")
  cardLastFour  String?   @map("card_last_four")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("subscriptions")
}

// User model (solo role, sin subscription tier)
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String?
  role         UserRole  @default(CLIENT)  // Authorization only
  subscription Subscription?               // Only for AGENTs

  // ... other fields
  @@map("users")
}
```

### Migración

Ver SQL completo en: `docs/architecture/SUBSCRIPTION_ARCHITECTURE_REFACTOR.md`

---

## 🔒 Permission Helpers

```typescript
// apps/web/lib/permissions/property-limits.ts

import type { SubscriptionTier, User } from '@repo/database'

/**
 * Get maximum properties allowed for a subscription tier
 */
export function getPropertyLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE':
      return 1
    case 'BASIC':
      return 3
    case 'PRO':
      return 10
    default:
      return 1 // Fallback
  }
}

/**
 * Get maximum images per property for a subscription tier
 */
export function getImageLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'FREE':
      return 5
    case 'BASIC':
      return 10
    case 'PRO':
      return 20
    default:
      return 5
  }
}

/**
 * Get featured properties limit per month
 */
export function getFeaturedLimit(tier: SubscriptionTier): number | null {
  switch (tier) {
    case 'FREE':
      return 0 // No featured
    case 'BASIC':
      return 3
    case 'PRO':
      return null // Unlimited
    default:
      return 0
  }
}

/**
 * Check if user can create a new property
 */
export async function canCreateProperty(
  userId: string
): Promise<{ allowed: boolean; reason?: string; limit?: number }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  })

  if (!user) {
    return { allowed: false, reason: 'User not found' }
  }

  const limit = getPropertyLimit(user.subscriptionTier)

  const currentCount = await db.property.count({
    where: { agentId: userId }
  })

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Limit reached. Upgrade to publish more properties.`,
      limit
    }
  }

  return { allowed: true, limit }
}

/**
 * Check if user can upload more images to property
 */
export function canUploadImage(
  tier: SubscriptionTier,
  currentImageCount: number
): { allowed: boolean; reason?: string; limit: number } {
  const limit = getImageLimit(tier)

  if (currentImageCount >= limit) {
    return {
      allowed: false,
      reason: `Image limit reached. Upgrade to add more images.`,
      limit
    }
  }

  return { allowed: true, limit }
}

/**
 * Get tier display name (for UI)
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'FREE':
      return 'Gratuito'
    case 'BASIC':
      return 'Básico'
    case 'PRO':
      return 'Pro'
    default:
      return 'Gratuito'
  }
}

/**
 * Get tier features for display
 */
export function getTierFeatures(tier: SubscriptionTier) {
  return {
    tier,
    displayName: getTierDisplayName(tier),
    propertyLimit: getPropertyLimit(tier),
    imageLimit: getImageLimit(tier),
    featuredLimit: getFeaturedLimit(tier),
    analytics: tier !== 'FREE',
    support: tier === 'PRO' ? 'WhatsApp (12h)' : tier === 'BASIC' ? 'Email (24h)' : 'Email (72h)'
  }
}
```

---

## 🛡️ Server Actions Validation

```typescript
// apps/web/app/actions/properties.ts

import { canCreateProperty, canUploadImage } from '@/lib/permissions/property-limits'

export async function createPropertyAction(formData: FormData) {
  // 1. Get current user
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Check property limit
  const { allowed, reason, limit } = await canCreateProperty(user.id)
  if (!allowed) {
    return {
      success: false,
      error: reason,
      upgradeRequired: true,
      currentLimit: limit
    }
  }

  // 3. Validate image count
  const images = formData.getAll('images')
  const imageCheck = canUploadImage(user.subscriptionTier, images.length)
  if (!imageCheck.allowed) {
    return {
      success: false,
      error: imageCheck.reason,
      upgradeRequired: true
    }
  }

  // 4. Proceed with creation
  // ... rest of property creation logic
}
```

---

## 💳 Lemon Squeezy Configuration

> **NOTA:** Usamos Lemon Squeezy en lugar de Stripe porque Ecuador no está soportado directamente por Stripe.
> Ver: `docs/payments/LEMON_SQUEEZY_INTEGRATION.md` para guía completa.

### Products (crear en Lemon Squeezy Dashboard):

```javascript
// Lemon Squeezy Variant IDs (guardar en env después de crear)

PLUS Tier:
  Variant ID: 123456 (monthly, $9.99 USD)

BUSINESS Tier:
  Variant ID: 123457 (monthly, $29.99 USD)

PRO Tier:
  Variant ID: 123458 (monthly, $59.99 USD) - EN ESPERA
```

### Environment Variables:

```bash
# apps/web/.env.local

# Existing vars...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# NEW: Lemon Squeezy keys
LEMONSQUEEZY_API_KEY=lmsq_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# NEW: Lemon Squeezy Variant IDs
LEMONSQUEEZY_PLUS_VARIANT_ID=123456
LEMONSQUEEZY_BUSINESS_VARIANT_ID=123457
LEMONSQUEEZY_PRO_VARIANT_ID=123458
```

**También agregar a**: `packages/env/src/index.ts`

---

## 📄 Pricing Page Structure

```typescript
// apps/web/app/(public)/pricing/page.tsx
// Ver también: apps/web/lib/pricing/tiers.ts

export default function PricingPage() {
  const tiers = [
    {
      name: 'Gratuito',
      tier: 'FREE',
      price: 0,
      features: [
        '1 propiedad activa',
        '6 imágenes por propiedad',
        'Sin videos',
        'Publicación ilimitada',
        'Búsqueda y mapas'
      ]
    },
    {
      name: 'Plus',
      tier: 'PLUS',
      price: 9.99,
      variantId: env.LEMONSQUEEZY_PLUS_VARIANT_ID,
      features: [
        '3 propiedades activas',
        '10 imágenes por propiedad',
        '1 video por propiedad',
        '1 propiedad destacada',
        'Ideal para dueños particulares'
      ]
    },
    {
      name: 'Business',
      tier: 'BUSINESS',
      price: 29.99,
      variantId: env.LEMONSQUEEZY_BUSINESS_VARIANT_ID,
      popular: true,
      features: [
        '10 propiedades activas',
        '15 imágenes por propiedad',
        '3 videos por propiedad',
        '5 propiedades destacadas',
        'CRM Lite (gestión de leads)',
        'Generador de descripciones IA',
        'Soporte prioritario (24h)'
      ]
    },
    {
      name: 'Pro',
      tier: 'PRO',
      price: 59.99,
      variantId: env.LEMONSQUEEZY_PRO_VARIANT_ID,
      comingSoon: true,  // EN ESPERA
      features: [
        '20 propiedades activas',
        '20 imágenes por propiedad',
        '5 videos por propiedad',
        'Destacados ilimitados',
        'Todo de Business',
        'Soporte WhatsApp'
      ]
    }
  ]

  return (
    <div className="pricing-grid">
      {tiers.map(tier => (
        <PricingCard key={tier.name} tier={tier} />
      ))}
    </div>
  )
}
```

---

## 🔔 Lemon Squeezy Webhooks

> **Ver implementación completa en:** `docs/payments/LEMON_SQUEEZY_INTEGRATION.md`

```typescript
// apps/web/app/api/webhook/lemonsqueezy/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@repo/database';
import { env } from '@repo/env';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature');

  // Verify signature
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { event_name, custom_data } = payload.meta;
  const userId = custom_data?.user_id;

  switch (event_name) {
    case 'subscription_created':
    case 'subscription_updated':
      await handleSubscriptionActive(userId, payload.data);
      break;

    case 'subscription_cancelled':
    case 'subscription_expired':
      await handleSubscriptionInactive(userId, payload.data);
      break;
  }

  return NextResponse.json({ received: true });
}

// Ver implementación completa en docs/payments/LEMON_SQUEEZY_INTEGRATION.md
```

**Eventos a configurar en Lemon Squeezy Dashboard:**
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_resumed`
- `subscription_expired`
- `subscription_payment_success`
- `subscription_payment_failed`

---

## 🧪 Testing Checklist

### Unit Tests:
- [ ] `getPropertyLimit()` returns correct limits
- [ ] `canCreateProperty()` respects tier limits
- [ ] `canUploadImage()` validates image count
- [ ] `getTierFeatures()` returns correct data

### Integration Tests:
- [ ] FREE user can create 1 property
- [ ] FREE user blocked at 2nd property
- [ ] BASIC user can create 3 properties
- [ ] PRO user can create 10 properties
- [ ] Upgrade flow works (FREE → BASIC)
- [ ] Downgrade flow works (BASIC → FREE, deletes excess properties?)

### E2E Tests (Playwright):
- [ ] User visits /pricing
- [ ] User clicks "Upgrade to BASIC"
- [ ] Stripe checkout completes
- [ ] User redirected to dashboard
- [ ] User can now create 3 properties

---

## 📅 Implementation Timeline

### Sprint 1: Schema + Helpers (Week 1)
- [ ] Update Prisma schema
- [ ] Create migration
- [ ] Implement permission helpers
- [ ] Unit tests

### Sprint 2: Server Actions (Week 2)
- [ ] Update createPropertyAction
- [ ] Update uploadImageAction
- [ ] Integration tests
- [ ] Error messages in Spanish

### Sprint 3: Lemon Squeezy Setup (Week 3)
- [ ] Create Lemon Squeezy account and products
- [ ] Add env vars (API key, store ID, variant IDs)
- [ ] Install SDK: `bun add @lemonsqueezy/lemonsqueezy.js`
- [ ] Implement checkout flow
- [ ] Test with Lemon Squeezy test mode

### Sprint 4: Webhooks (Week 4)
- [ ] Webhook endpoint (`/api/webhook/lemonsqueezy`)
- [ ] Handle subscription events
- [ ] Test locally with ngrok
- [ ] Deploy and test in production

### Sprint 5: Pricing Page (Week 5)
- [ ] Build /pricing UI
- [ ] Upgrade modals in dashboard
- [ ] Tier badges on listings
- [ ] Analytics page (basic)

### Sprint 6: Beta Testing (Week 6)
- [ ] Deploy to production
- [ ] Invite 20-50 beta users
- [ ] Monitor errors
- [ ] Collect feedback
- [ ] Iterate

---

## 🚀 Deploy Checklist

Before going live:
- [ ] Lemon Squeezy switched to LIVE mode
- [ ] New API key generated for production
- [ ] Webhook endpoint configured in Lemon Squeezy
- [ ] Webhook secret updated
- [ ] Environment variables updated in Vercel
- [ ] Database migration applied
- [ ] All tests passing
- [ ] Pricing page reviewed
- [ ] Error messages in Spanish
- [ ] Beta user list ready
- [ ] Payout settings configured (Ecuador bank account)

---

## 📚 References

- **Payment Integration**: `docs/payments/LEMON_SQUEEZY_INTEGRATION.md`
- **Subscription Architecture**: `docs/architecture/SUBSCRIPTION_ARCHITECTURE_REFACTOR.md`
- **Business Decisions**: `DECISIONS_APPROVED.md`
- **Market Strategy**: `ECUADOR_STRATEGY.md`
- **Git Workflow**: `IMPLEMENTATION_STRATEGY.md`
- **Lemon Squeezy Docs**: https://docs.lemonsqueezy.com

---

**Created**: Noviembre 20, 2025
**Last Updated**: Diciembre 27, 2025
**Status**: Ready for Sprint 1 (Lemon Squeezy integration planned)
