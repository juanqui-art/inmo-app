# Technical Specification - Freemium Implementation

> **Fecha**: Noviembre 20, 2025
> **Status**: 📋 Especificación Técnica para Sprint 1-6
> **Propósito**: Referencia rápida para implementación

---

## 🎯 Objetivo

Implementar sistema de suscripciones Freemium (3 tiers) con límites por tier y integración Stripe.

---

## 📊 Tiers y Límites

| Feature | FREE | BASIC | PRO |
|---------|------|-------|-----|
| Precio | $0/mes | $4.99/mes | $14.99/mes |
| Propiedades activas | 1 | 3 | 10 |
| Imágenes/propiedad | 5 | 10 | 20 |
| Duración | ∞ | ∞ | ∞ |
| Destacados | ❌ | 3/mes | ∞ |
| Analytics | ❌ | ✅ Básico | ✅ Avanzado |
| Soporte | Email 72h | Email 24h | WhatsApp 12h |

---

## 🗄️ Database Schema

### Cambios requeridos:

```prisma
// packages/database/prisma/schema.prisma

// 1. Agregar enum
enum SubscriptionTier {
  FREE
  BASIC
  PRO
}

// 2. Modificar modelo User
model User {
  id               String           @id @default(uuid())
  email            String           @unique
  name             String?
  role             UserRole         @default(CLIENT)
  subscriptionTier SubscriptionTier @default(FREE) @map("subscription_tier")

  // Stripe fields (para Sprint 3-4)
  stripeCustomerId       String? @unique @map("stripe_customer_id")
  stripeSubscriptionId   String? @unique @map("stripe_subscription_id")
  stripePriceId          String? @map("stripe_price_id")
  stripeCurrentPeriodEnd DateTime? @map("stripe_current_period_end")

  phone     String?
  avatar    String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  properties         Property[]
  favorites          Favorite[]
  appointments       Appointment[]
  agentAppointments  Appointment[] @relation("AgentAppointments")

  @@map("users")
}

// 3. NO modificar Property (sin expiración)
// Property queda como está
```

### Migración:

```sql
-- Migration file: add_subscription_tier.sql

-- Add enum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO');

-- Add column to users
ALTER TABLE "users"
  ADD COLUMN "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';

-- Add Stripe fields (optional for Sprint 1-2, required for Sprint 3-4)
ALTER TABLE "users"
  ADD COLUMN "stripe_customer_id" TEXT UNIQUE,
  ADD COLUMN "stripe_subscription_id" TEXT UNIQUE,
  ADD COLUMN "stripe_price_id" TEXT,
  ADD COLUMN "stripe_current_period_end" TIMESTAMP(3);

-- Create index
CREATE INDEX "users_subscription_tier_idx" ON "users"("subscription_tier");
```

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

## 💳 Stripe Configuration

### Products & Prices (crear en Stripe Dashboard):

```javascript
// Stripe Product IDs (guardar en env después de crear)

BASIC Tier:
  Product ID: prod_xxxxx
  Price ID: price_xxxxx (monthly, $4.99 USD)

PRO Tier:
  Product ID: prod_yyyyy
  Price ID: price_yyyyy (monthly, $14.99 USD)
```

### Environment Variables:

```bash
# apps/web/.env.local

# Existing vars...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# NEW: Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# NEW: Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_yyyyy
```

**También agregar a**: `packages/env/src/index.ts`

---

## 📄 Pricing Page Structure

```typescript
// apps/web/app/(public)/pricing/page.tsx

export default function PricingPage() {
  const tiers = [
    {
      name: 'Gratuito',
      price: 0,
      stripePriceId: null,
      features: [
        '1 propiedad activa',
        '5 imágenes por propiedad',
        'Publicación ilimitada en tiempo',
        'Búsqueda y mapas',
        'Soporte por email (72h)'
      ]
    },
    {
      name: 'Básico',
      price: 4.99,
      stripePriceId: env.STRIPE_BASIC_PRICE_ID,
      popular: true,
      features: [
        '3 propiedades activas',
        '10 imágenes por propiedad',
        '3 destacados por mes',
        'Analytics básico',
        'Soporte por email (24h)'
      ]
    },
    {
      name: 'Pro',
      price: 14.99,
      stripePriceId: env.STRIPE_PRO_PRICE_ID,
      features: [
        '10 propiedades activas',
        '20 imágenes por propiedad',
        'Destacados ilimitados',
        'Analytics avanzado',
        'Badge "Agente Verificado"',
        'Soporte WhatsApp (12h)'
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

## 🔔 Stripe Webhooks

```typescript
// apps/web/app/api/webhooks/stripe/route.ts

import { stripe } from '@/lib/stripe'
import { db } from '@repo/database'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    env.STRIPE_WEBHOOK_SECRET
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object

      // Update user subscription
      await db.user.update({
        where: { stripeCustomerId: session.customer as string },
        data: {
          subscriptionTier: getPriceIdTier(session.subscription as string),
          stripeSubscriptionId: session.subscription as string
        }
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object

      await db.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionTier: getPriceIdTier(subscription.items.data[0].price.id),
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object

      // Downgrade to FREE
      await db.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionTier: 'FREE',
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null
        }
      })
      break
    }
  }

  return new Response(JSON.stringify({ received: true }))
}

function getPriceIdTier(priceId: string): SubscriptionTier {
  if (priceId === env.STRIPE_BASIC_PRICE_ID) return 'BASIC'
  if (priceId === env.STRIPE_PRO_PRICE_ID) return 'PRO'
  return 'FREE'
}
```

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

### Sprint 3: Stripe Setup (Week 3)
- [ ] Create Stripe products/prices
- [ ] Add env vars
- [ ] Implement checkout flow
- [ ] Test with Stripe test mode

### Sprint 4: Webhooks (Week 4)
- [ ] Webhook endpoint
- [ ] Handle subscription events
- [ ] Test locally with Stripe CLI
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
- [ ] Stripe products created in LIVE mode
- [ ] Webhook endpoint configured in Stripe
- [ ] Environment variables updated (production)
- [ ] Database migration applied
- [ ] All tests passing
- [ ] Pricing page reviewed
- [ ] Error messages in Spanish
- [ ] Analytics configured
- [ ] Beta user list ready

---

## 📚 References

- **Business**: `DECISIONS_APPROVED.md`
- **Market**: `ECUADOR_STRATEGY.md`
- **Git**: `IMPLEMENTATION_STRATEGY.md`
- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions/build-subscriptions

---

**Created**: Noviembre 20, 2025
**Last Updated**: Noviembre 20, 2025
**Status**: Ready for Sprint 1
