# Subscription Architecture Refactor

> **Status:** PLANNED
> **Created:** December 18, 2025
> **Priority:** HIGH (do before more users)
> **Estimated Effort:** 2-3 sessions

---

## Table of Contents

1. [Problem Analysis](#problem-analysis)
2. [Research & Best Practices](#research--best-practices)
3. [Proposed Solution](#proposed-solution)
4. [Database Schema](#database-schema)
5. [Migration Plan](#migration-plan)
6. [Files to Update](#files-to-update)
7. [Implementation Checklist](#implementation-checklist)
8. [Testing Strategy](#testing-strategy)

---

## Problem Analysis

### Current Architecture (Flawed)

```
User
├── role: CLIENT | AGENT | ADMIN          ← Authorization
└── subscriptionTier: FREE | PLUS | AGENT | PRO  ← Limits
```

### Issues Identified

| Issue | Description | Impact |
|-------|-------------|--------|
| **Naming Collision** | "AGENT" exists as both `role` AND `subscriptionTier` | Confusion in code, tests, and UI |
| **Semantic Mismatch** | CLIENTs have `subscriptionTier` but shouldn't | Meaningless data, confusing logic |
| **Mixed Concerns** | Authorization (role) and billing (tier) in same table | Hard to extend, violates SRP |
| **Stripe-Coupled** | Stripe fields on User table, but not using Stripe | Wasted columns, wrong provider |
| **Test Failures** | Tests expect tier="AGENT" but business logic says tier="FREE" | Broken E2E tests |

### Real-World Example

When a user signs up from `/vender` with `plan=AGENT`:
- **Current behavior:** Creates user with `role=AGENT`, `subscriptionTier=AGENT`
- **Expected behavior:** Creates user with `role=AGENT`, `subscriptionTier=FREE` (default, upgrade later)

The `plan` parameter in signup should indicate **intent to become an AGENT**, not the subscription tier.

---

## Research & Best Practices

### Sources Consulted

1. [GeeksforGeeks - Database Design for SaaS](https://www.geeksforgeeks.org/dbms/design-database-for-saas-applications/)
2. [Enterprise Ready - RBAC Guide](https://www.enterpriseready.io/features/role-based-access-control/)
3. [Cerbos - 3 Authorization Designs for SaaS](https://www.cerbos.dev/blog/3-most-common-authorization-designs-for-saas-products)
4. [Lemon Squeezy - Subscription Object](https://docs.lemonsqueezy.com/api/subscriptions/the-subscription-object)

### Key Findings

**1. RBAC and Billing are Separate Pillars**

> "Essential architectural patterns for modern SaaS products focus on three foundational pillars: Billing, Role-Based Access Control (RBAC), and User Onboarding" - Appfoster

**2. Separation of Concerns**

| Concept | Purpose | Example |
|---------|---------|---------|
| **Role (RBAC)** | What actions can they perform? | CLIENT can favorite, AGENT can publish |
| **Subscription** | What resource limits do they have? | FREE = 1 property, PRO = 20 properties |

**3. Subscription at Tenant Level**

- **User Table**: Contains `role` (permissions within app)
- **Tenant/Subscription Table**: Contains `plan` (usage limits)

**4. For Startups: Keep Simple but Correct**

> "Start simple with basic role differentiation" - Enterprise Ready

Start with correct separation now, scale complexity later.

---

## Proposed Solution

### New Architecture

```
User
├── role: CLIENT | AGENT | ADMIN          ← Authorization only
└── subscription?: Subscription           ← Only for AGENTs

Subscription (new table)
├── userId (unique, FK → User)
├── tier: FREE | PLUS | BUSINESS | PRO    ← Renamed from AGENT
├── provider: "lemonsqueezy" | "stripe"   ← Payment processor
├── providerCustomerId, etc.              ← Provider-specific IDs
└── status, currentPeriodEnd, etc.        ← Subscription state
```

### Key Changes

1. **Rename tier `AGENT` → `BUSINESS`** (eliminate naming collision)
2. **Create `Subscription` table** (separate billing from authorization)
3. **Move Stripe fields** from User to Subscription
4. **Make schema payment-agnostic** (support Lemon Squeezy, Stripe, etc.)
5. **Only AGENTs have Subscription** (CLIENTs don't need it)

### Signup Flows (Corrected)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIGNUP NORMAL (/registro)                                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Create User with role: CLIENT                               │
│  2. DO NOT create Subscription                                  │
│  3. Redirect: /perfil                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SIGNUP FROM /VENDER                                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Create User with role: AGENT                                │
│  2. Create Subscription with tier: FREE                         │
│  3. Redirect: /dashboard                                        │
│     (If paid plan selected → show upgrade modal)                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CLIENT → AGENT (conversion from /vender)                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Update User.role: CLIENT → AGENT                            │
│  2. Create Subscription with tier: FREE                         │
│  3. Redirect: /dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Prisma Schema Changes

```prisma
// ==================== ENUMS ====================

enum UserRole {
  CLIENT    // Browse, favorites, appointments
  AGENT     // Publish properties, CRM
  ADMIN     // Administration
}

// RENAMED: AGENT → BUSINESS to avoid collision with UserRole
enum SubscriptionTier {
  FREE      // Gratuito: 1 property, 6 photos, 0 videos
  PLUS      // Plus: 3 properties, 10 photos, 1 video
  BUSINESS  // Business: 10 properties, 15 photos, 3 videos (was AGENT)
  PRO       // Pro: ON HOLD (20 properties, 20 photos, 5 videos)
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  PAST_DUE
  CANCELLED
  EXPIRED
  TRIALING
}

// ==================== MODELS ====================

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String?
  role      UserRole  @default(CLIENT)  // ← Authorization only

  // Profile fields (keep these)
  phone     String?
  avatar    String?
  bio       String?   @db.Text
  licenseId String?   @map("license_id")
  website   String?
  brandColor String?  @map("brand_color")
  logoUrl   String?   @map("logo_url")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  // Relations
  subscription      Subscription?      // ← Only exists if role = AGENT
  properties        Property[]         @relation("AgentProperties")
  favorites         Favorite[]
  appointments      Appointment[]      @relation("ClientAppointments")
  agentAppointments Appointment[]      @relation("AgentAppointments")
  agentClients      AgentClient[]      @relation("AgentClients")
  clientOfAgents    AgentClient[]      @relation("ClientOfAgents")

  // REMOVED: subscriptionTier, stripeCustomerId, stripeSubscriptionId,
  //          stripePriceId, stripeCurrentPeriodEnd (moved to Subscription)

  @@map("users")
}

model Subscription {
  id        String             @id @default(uuid())
  userId    String             @unique @map("user_id")
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ═══════════════════════════════════════════════════════════
  // PLAN
  // ═══════════════════════════════════════════════════════════
  tier      SubscriptionTier   @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)

  // ═══════════════════════════════════════════════════════════
  // PAYMENT PROVIDER (agnostic: Lemon Squeezy, Stripe, PayPal)
  // ═══════════════════════════════════════════════════════════
  provider              String?   @map("provider")                // "lemonsqueezy" | "stripe"
  providerCustomerId    String?   @unique @map("provider_customer_id")
  providerSubscriptionId String?  @unique @map("provider_subscription_id")
  providerProductId     String?   @map("provider_product_id")
  providerVariantId     String?   @map("provider_variant_id")     // Lemon Squeezy uses variants

  // ═══════════════════════════════════════════════════════════
  // BILLING DATES
  // ═══════════════════════════════════════════════════════════
  currentPeriodStart DateTime?   @map("current_period_start")
  currentPeriodEnd   DateTime?   @map("current_period_end")
  trialEndsAt        DateTime?   @map("trial_ends_at")
  cancelledAt        DateTime?   @map("cancelled_at")

  // ═══════════════════════════════════════════════════════════
  // PAYMENT METHOD (for UI display)
  // ═══════════════════════════════════════════════════════════
  cardBrand     String?   @map("card_brand")      // visa, mastercard, etc.
  cardLastFour  String?   @map("card_last_four")

  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([providerCustomerId])
  @@index([providerSubscriptionId])
  @@index([status])
  @@index([tier])
  @@map("subscriptions")
}
```

### SQL Migration (Supabase)

```sql
-- ============================================================================
-- MIGRATION: Subscription Architecture Refactor
-- ============================================================================
-- Run in Supabase SQL Editor
-- BACKUP YOUR DATA FIRST!
-- ============================================================================

-- Step 1: Rename enum value AGENT → BUSINESS
ALTER TYPE "SubscriptionTier" RENAME VALUE 'AGENT' TO 'BUSINESS';

-- Step 2: Create SubscriptionStatus enum
CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE',
  'PAUSED',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED',
  'TRIALING'
);

-- Step 3: Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Plan
  tier "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  status "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',

  -- Payment Provider (agnostic)
  provider TEXT,
  provider_customer_id TEXT UNIQUE,
  provider_subscription_id TEXT UNIQUE,
  provider_product_id TEXT,
  provider_variant_id TEXT,

  -- Billing Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Payment Method
  card_brand TEXT,
  card_last_four TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 4: Create indexes
CREATE INDEX idx_subscriptions_provider_customer ON public.subscriptions(provider_customer_id);
CREATE INDEX idx_subscriptions_provider_subscription ON public.subscriptions(provider_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON public.subscriptions(tier);

-- Step 5: Migrate existing data (AGENT users get FREE subscription)
INSERT INTO public.subscriptions (user_id, tier, status)
SELECT
  id,
  CASE
    WHEN subscription_tier = 'FREE' THEN 'FREE'::"SubscriptionTier"
    WHEN subscription_tier = 'PLUS' THEN 'PLUS'::"SubscriptionTier"
    WHEN subscription_tier = 'BUSINESS' THEN 'BUSINESS'::"SubscriptionTier"
    WHEN subscription_tier = 'PRO' THEN 'PRO'::"SubscriptionTier"
    ELSE 'FREE'::"SubscriptionTier"
  END,
  'ACTIVE'::"SubscriptionStatus"
FROM public.users
WHERE role = 'AGENT';

-- Step 6: Remove old columns from users table (after verifying migration)
-- WARNING: Run this ONLY after confirming data migration is correct
-- ALTER TABLE public.users DROP COLUMN subscription_tier;
-- ALTER TABLE public.users DROP COLUMN stripe_customer_id;
-- ALTER TABLE public.users DROP COLUMN stripe_subscription_id;
-- ALTER TABLE public.users DROP COLUMN stripe_price_id;
-- ALTER TABLE public.users DROP COLUMN stripe_current_period_end;

-- Step 7: Update trigger function
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
DECLARE
  user_role "UserRole";
  has_plan BOOLEAN;
BEGIN
  -- Determine role based on plan parameter
  has_plan := new.raw_user_meta_data->>'plan' IS NOT NULL
              AND new.raw_user_meta_data->>'plan' != '';

  user_role := CASE
    WHEN has_plan THEN 'AGENT'::"UserRole"
    ELSE 'CLIENT'::"UserRole"
  END;

  -- Insert user (role only, no subscription_tier)
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    user_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = now();

  -- If AGENT, create subscription with FREE tier
  IF user_role = 'AGENT' THEN
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (new.id, 'FREE', 'ACTIVE')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

## Migration Plan

### Phase 1: Preparation (Session 1)

1. [ ] Create documentation (this file) ✅
2. [ ] Create Prisma schema changes (don't apply yet)
3. [ ] Write SQL migration script
4. [ ] Create backup strategy

### Phase 2: Database Migration (Session 2)

1. [ ] Backup database
2. [ ] Run SQL migration in Supabase
3. [ ] Verify data migration
4. [ ] Update Prisma schema
5. [ ] Generate Prisma client

### Phase 3: Code Updates (Session 2-3)

1. [ ] Update `property-limits.ts` (tier helpers)
2. [ ] Update `auth.ts` (signup/login actions)
3. [ ] Create `subscription.repository.ts`
4. [ ] Update components (TierBadge, PlanUsage, etc.)
5. [ ] Update dashboard pages

### Phase 4: Testing & Cleanup (Session 3)

1. [ ] Fix E2E tests
2. [ ] Run full test suite
3. [ ] Remove deprecated columns from DB
4. [ ] Update CLAUDE.md documentation

---

## Files to Update

### Critical Files

| File | Changes |
|------|---------|
| `packages/database/prisma/schema.prisma` | Add Subscription model, remove tier from User |
| `packages/database/src/repositories/subscription.repository.ts` | NEW: CRUD for subscriptions |
| `apps/web/lib/permissions/property-limits.ts` | Update to use Subscription table |
| `apps/web/app/actions/auth.ts` | Create subscription on AGENT signup |
| `apps/web/components/dashboard/plan-usage.tsx` | Fetch from subscription relation |
| `apps/web/components/dashboard/user-menu.tsx` | Fetch from subscription relation |

### Secondary Files

| File | Changes |
|------|---------|
| `apps/web/lib/pricing/tiers.ts` | Rename AGENT → BUSINESS |
| `apps/web/components/pricing/pricing-card.tsx` | Update tier names |
| `apps/web/app/dashboard/suscripcion/page.tsx` | Fetch from subscription |
| `apps/web/__tests__/e2e/*.spec.ts` | Update expected values |
| `packages/database/migrations/*.sql` | New migration file |

### Trigger Updates (Supabase)

| Trigger | Changes |
|---------|---------|
| `sync_user_from_auth()` | Create subscription for AGENTs, not tier on user |

---

## Implementation Checklist

### Session 1: Documentation & Planning ✅

- [x] Analyze current architecture problems
- [x] Research industry best practices
- [x] Design new Subscription schema
- [x] Document migration plan
- [x] Create this documentation file

### Session 2: Database Migration

- [ ] Export database backup from Supabase
- [ ] Create new enum `SubscriptionStatus`
- [ ] Rename enum value `AGENT` → `BUSINESS`
- [ ] Create `subscriptions` table
- [ ] Migrate existing AGENT users to subscriptions table
- [ ] Update database trigger
- [ ] Update Prisma schema
- [ ] Run `bunx prisma generate`
- [ ] Verify with `bunx prisma studio`

### Session 3: Code Updates

- [ ] Create `subscription.repository.ts`
- [ ] Update `property-limits.ts` helper functions
- [ ] Update `auth.ts` signup action
- [ ] Update `auth.ts` login action (CLIENT→AGENT upgrade)
- [ ] Update `plan-usage.tsx` component
- [ ] Update `user-menu.tsx` component
- [ ] Update pricing page
- [ ] Update dashboard subscription page

### Session 4: Testing & Cleanup

- [ ] Update E2E test helpers
- [ ] Update E2E test assertions
- [ ] Run full E2E test suite
- [ ] Run unit tests
- [ ] Remove deprecated columns from User table
- [ ] Update CLAUDE.md with new architecture
- [ ] Final review and cleanup

---

## Testing Strategy

### Unit Tests

```typescript
// Test: Subscription is created for AGENT signup
test("creates subscription when signing up as AGENT", async () => {
  const user = await signupAction(formDataWithPlan);
  expect(user.role).toBe("AGENT");

  const subscription = await subscriptionRepository.findByUserId(user.id);
  expect(subscription).not.toBeNull();
  expect(subscription.tier).toBe("FREE");
});

// Test: No subscription for CLIENT signup
test("does not create subscription for CLIENT signup", async () => {
  const user = await signupAction(formDataWithoutPlan);
  expect(user.role).toBe("CLIENT");

  const subscription = await subscriptionRepository.findByUserId(user.id);
  expect(subscription).toBeNull();
});
```

### E2E Tests

```typescript
// Test: AGENT sees tier badge with "Gratuito" (FREE tier)
test("agent dashboard shows FREE tier by default", async () => {
  await helpers.signupAsAgent(page);
  await page.goto("/dashboard");

  const tierBadge = page.locator('[data-testid="tier-badge"]');
  await expect(tierBadge).toContainText("Gratuito"); // Not "Agente"!
});
```

---

## Lemon Squeezy Integration Notes

### Why Lemon Squeezy (not Stripe)

- Stripe requires Atlas ($500) for Ecuador
- Lemon Squeezy works directly in Latin America
- Acts as Merchant of Record (handles taxes)
- API similar to Stripe (easy migration if needed)

### Variant to Tier Mapping

```typescript
// lib/payments/lemon-squeezy.ts
const VARIANT_TO_TIER: Record<string, SubscriptionTier> = {
  "variant_id_free": "FREE",
  "variant_id_plus": "PLUS",
  "variant_id_business": "BUSINESS",
  "variant_id_pro": "PRO",
};
```

### Webhook Handler (Future)

```typescript
// app/api/webhooks/lemonsqueezy/route.ts
export async function POST(req: Request) {
  const event = await verifyWebhook(req);

  switch (event.event_name) {
    case "subscription_created":
    case "subscription_updated":
      await syncSubscription(event.data);
      break;
    case "subscription_cancelled":
      await cancelSubscription(event.data);
      break;
  }
}
```

---

## References

- [Lemon Squeezy API Docs](https://docs.lemonsqueezy.com/api)
- [Lemon Squeezy Subscription Object](https://docs.lemonsqueezy.com/api/subscriptions/the-subscription-object)
- [Next.js + Lemon Squeezy Guide](https://felixvemmer.com/en/blog/lemon-squeezy-nextjs-payment-integration-guide)
- [GeeksforGeeks - SaaS Database Design](https://www.geeksforgeeks.org/dbms/design-database-for-saas-applications/)
- [Enterprise Ready - RBAC](https://www.enterpriseready.io/features/role-based-access-control/)

---

## Quick Start for Next Session

```bash
# 1. Read this document
cat docs/architecture/SUBSCRIPTION_ARCHITECTURE_REFACTOR.md

# 2. Check current database state
cd packages/database && bunx prisma studio

# 3. Continue from Session 2 checklist above
```
