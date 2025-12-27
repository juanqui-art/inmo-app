# Lemon Squeezy Integration Guide

> **Status:** PLANNED
> **Created:** December 27, 2025
> **Decision:** Lemon Squeezy over Stripe (Ecuador not supported by Stripe directly)

---

## Table of Contents

1. [Why Lemon Squeezy](#why-lemon-squeezy)
2. [Account Setup](#account-setup)
3. [Environment Variables](#environment-variables)
4. [SDK Installation](#sdk-installation)
5. [Implementation](#implementation)
6. [Webhook Handler](#webhook-handler)
7. [Testing](#testing)
8. [Production Checklist](#production-checklist)

---

## Why Lemon Squeezy

### The Problem with Stripe in Ecuador

| Option | Cost | Complexity | Ecuador Support |
|--------|------|------------|-----------------|
| Stripe Direct | N/A | N/A | **NOT AVAILABLE** |
| Stripe Atlas | $500 + $1.5k/year | High (LLC USA, dual taxes) | Indirect |
| PayPhone | $0 | Medium | Local only |
| **Lemon Squeezy** | **$0** | **Low** | **Direct** |

### Lemon Squeezy Advantages

- **Merchant of Record (MoR)**: Handles taxes, compliance, fraud
- **Ecuador Supported**: Explicitly listed, bank payouts available
- **$0 Payout Fees**: Absorbed by platform (post-Stripe acquisition)
- **2x Monthly Payouts**: 1st and 15th of each month
- **Stripe Backing**: Acquired July 2024, enterprise stability
- **Simple API**: Stripe-like developer experience

### Fee Structure

```
Base Fee:           5% + $0.50 per transaction
Non-domestic:       +3% currency fee (for non-USD transactions)
Payout Fees:        $0 (absorbed)
Minimum Payout:     $50

Example (Ecuador customer pays $29.99 BUSINESS tier):
├── Transaction fee: $1.50 + $0.50 = $2.00
├── Currency fee (if applicable): ~$0.90
├── Total fees: ~$2.90 (9.7%)
└── You receive: ~$27.09
```

---

## Account Setup

### Step 1: Create Account

1. Go to [lemonsqueezy.com](https://www.lemonsqueezy.com)
2. Sign up with email
3. Verify email address

### Step 2: Create Store

1. Dashboard → Stores → Create Store
2. Name: "InmoApp" or "VANT"
3. Currency: USD (recommended for Ecuador)
4. Save Store ID for later

### Step 3: Create Products

Create 3 products matching our tiers:

| Product | Price | Billing | Variant ID |
|---------|-------|---------|------------|
| **Plus** | $9.99/mo | Recurring | `variant_xxx` |
| **Business** | $29.99/mo | Recurring | `variant_yyy` |
| **Pro** | $59.99/mo | Recurring | `variant_zzz` |

**Settings per product:**
- Enable "Subscription"
- Set billing interval: Monthly
- Enable trial: Optional (7 days recommended for BUSINESS)

### Step 4: Get API Credentials

1. Settings → API → Create API Key
2. Copy API Key (starts with `lmsq_`)
3. Note your Store ID (visible in URL)

### Step 5: Configure Webhook

1. Settings → Webhooks → Add Webhook
2. URL: `https://your-domain.com/api/webhook/lemonsqueezy`
3. Secret: Generate and save
4. Events to select:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_resumed`
   - `subscription_expired`
   - `subscription_payment_success`
   - `subscription_payment_failed`

---

## Environment Variables

### Add to `apps/web/.env.local`

```bash
# Lemon Squeezy
LEMONSQUEEZY_API_KEY=lmsq_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Product Variant IDs
LEMONSQUEEZY_PLUS_VARIANT_ID=123456
LEMONSQUEEZY_BUSINESS_VARIANT_ID=123457
LEMONSQUEEZY_PRO_VARIANT_ID=123458
```

### Update `packages/env/src/index.ts`

```typescript
// Add to server schema
export const serverSchema = z.object({
  // ... existing vars

  // Lemon Squeezy
  LEMONSQUEEZY_API_KEY: z.string().min(1),
  LEMONSQUEEZY_STORE_ID: z.string().min(1),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1),
  LEMONSQUEEZY_PLUS_VARIANT_ID: z.string().min(1),
  LEMONSQUEEZY_BUSINESS_VARIANT_ID: z.string().min(1),
  LEMONSQUEEZY_PRO_VARIANT_ID: z.string().optional(), // ON HOLD
});
```

---

## SDK Installation

```bash
# Install official SDK
bun add @lemonsqueezy/lemonsqueezy.js
```

---

## Implementation

### 1. SDK Configuration

```typescript
// apps/web/lib/payments/lemonsqueezy.ts
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { env } from '@repo/env';

let isConfigured = false;

export function configureLemonSqueezy() {
  if (isConfigured) return;

  lemonSqueezySetup({
    apiKey: env.LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      console.error('[LemonSqueezy] Error:', error);
      throw error;
    },
  });

  isConfigured = true;
}

// Variant ID to Tier mapping
export const VARIANT_TO_TIER = {
  [env.LEMONSQUEEZY_PLUS_VARIANT_ID]: 'PLUS',
  [env.LEMONSQUEEZY_BUSINESS_VARIANT_ID]: 'BUSINESS',
  [env.LEMONSQUEEZY_PRO_VARIANT_ID || '']: 'PRO',
} as const;

export const TIER_TO_VARIANT = {
  PLUS: env.LEMONSQUEEZY_PLUS_VARIANT_ID,
  BUSINESS: env.LEMONSQUEEZY_BUSINESS_VARIANT_ID,
  PRO: env.LEMONSQUEEZY_PRO_VARIANT_ID,
} as const;
```

### 2. Create Checkout Server Action

```typescript
// apps/web/app/actions/subscription.ts
'use server';

import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { configureLemonSqueezy, TIER_TO_VARIANT } from '@/lib/payments/lemonsqueezy';
import { env } from '@repo/env';

type SubscriptionTier = 'PLUS' | 'BUSINESS' | 'PRO';

export async function createSubscriptionCheckout(tier: SubscriptionTier) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/pricing');
  }

  if (user.role !== 'AGENT') {
    throw new Error('Only agents can subscribe');
  }

  configureLemonSqueezy();

  const variantId = TIER_TO_VARIANT[tier];

  if (!variantId) {
    throw new Error(`Tier ${tier} not available`);
  }

  const checkout = await createCheckout(env.LEMONSQUEEZY_STORE_ID, variantId, {
    checkoutData: {
      email: user.email,
      name: user.name || undefined,
      custom: {
        user_id: user.id,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion?success=true`,
    },
  });

  const checkoutUrl = checkout.data?.data.attributes.url;

  if (!checkoutUrl) {
    throw new Error('Failed to create checkout session');
  }

  redirect(checkoutUrl);
}
```

### 3. Customer Portal Action

```typescript
// apps/web/app/actions/subscription.ts (continued)

import { getCustomer } from '@lemonsqueezy/lemonsqueezy.js';

export async function getCustomerPortalUrl(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get subscription with customer ID
  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription?.providerCustomerId) {
    return null;
  }

  configureLemonSqueezy();

  const customer = await getCustomer(subscription.providerCustomerId);

  return customer.data?.data.attributes.urls.customer_portal || null;
}
```

---

## Webhook Handler

```typescript
// apps/web/app/api/webhook/lemonsqueezy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@repo/database';
import { env } from '@repo/env';
import { VARIANT_TO_TIER } from '@/lib/payments/lemonsqueezy';

// Webhook event types
type WebhookEventName =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_payment_success'
  | 'subscription_payment_failed';

interface WebhookPayload {
  meta: {
    event_name: WebhookEventName;
    custom_data?: {
      user_id: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
      card_brand: string | null;
      card_last_four: string | null;
      renews_at: string | null;
      ends_at: string | null;
      trial_ends_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-Signature');

    // 1. Verify signature
    if (!signature || !verifySignature(rawBody, signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    const { event_name, custom_data } = payload.meta;
    const { attributes, id: subscriptionId } = payload.data;

    console.log(`[Webhook] Event: ${event_name}, Subscription: ${subscriptionId}`);

    // 3. Get user_id from custom_data
    const userId = custom_data?.user_id;
    if (!userId) {
      console.error('[Webhook] Missing user_id in custom_data');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // 4. Process event
    switch (event_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(userId, subscriptionId, attributes);
        break;

      case 'subscription_updated':
      case 'subscription_resumed':
        await handleSubscriptionActive(userId, subscriptionId, attributes);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionInactive(userId, subscriptionId, attributes);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(userId, subscriptionId, attributes);
        break;

      case 'subscription_payment_success':
        console.log(`[Webhook] Payment success for user ${userId}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event: ${event_name}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

function verifySignature(rawBody: string, signature: string): boolean {
  const hmac = crypto
    .createHmac('sha256', env.LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

async function handleSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  attributes: WebhookPayload['data']['attributes']
) {
  const tier = VARIANT_TO_TIER[String(attributes.variant_id)] || 'FREE';

  // Create or update subscription record
  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier: tier as any,
      status: mapStatus(attributes.status),
      provider: 'lemonsqueezy',
      providerCustomerId: String(attributes.customer_id),
      providerSubscriptionId: subscriptionId,
      providerProductId: String(attributes.product_id),
      providerVariantId: String(attributes.variant_id),
      currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
      trialEndsAt: attributes.trial_ends_at ? new Date(attributes.trial_ends_at) : null,
      cardBrand: attributes.card_brand,
      cardLastFour: attributes.card_last_four,
    },
    update: {
      tier: tier as any,
      status: mapStatus(attributes.status),
      providerSubscriptionId: subscriptionId,
      currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
      cardBrand: attributes.card_brand,
      cardLastFour: attributes.card_last_four,
    },
  });

  console.log(`[Webhook] Subscription created for user ${userId}: ${tier}`);
}

async function handleSubscriptionActive(
  userId: string,
  subscriptionId: string,
  attributes: WebhookPayload['data']['attributes']
) {
  const tier = VARIANT_TO_TIER[String(attributes.variant_id)] || 'FREE';

  await db.subscription.update({
    where: { userId },
    data: {
      tier: tier as any,
      status: mapStatus(attributes.status),
      currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
      cardBrand: attributes.card_brand,
      cardLastFour: attributes.card_last_four,
      cancelledAt: null, // Clear if resumed
    },
  });

  console.log(`[Webhook] Subscription active for user ${userId}: ${tier}`);
}

async function handleSubscriptionInactive(
  userId: string,
  subscriptionId: string,
  attributes: WebhookPayload['data']['attributes']
) {
  await db.subscription.update({
    where: { userId },
    data: {
      tier: 'FREE',
      status: mapStatus(attributes.status),
      currentPeriodEnd: attributes.ends_at ? new Date(attributes.ends_at) : null,
      cancelledAt: new Date(),
    },
  });

  console.log(`[Webhook] Subscription inactive for user ${userId}`);
}

async function handlePaymentFailed(
  userId: string,
  subscriptionId: string,
  attributes: WebhookPayload['data']['attributes']
) {
  await db.subscription.update({
    where: { userId },
    data: {
      status: 'PAST_DUE',
    },
  });

  console.warn(`[Webhook] Payment failed for user ${userId}`);

  // TODO: Send email notification
}

function mapStatus(lsStatus: string): string {
  const statusMap: Record<string, string> = {
    on_trial: 'TRIALING',
    active: 'ACTIVE',
    paused: 'PAUSED',
    past_due: 'PAST_DUE',
    unpaid: 'PAST_DUE',
    cancelled: 'CANCELLED',
    expired: 'EXPIRED',
  };
  return statusMap[lsStatus] || 'ACTIVE';
}
```

---

## Testing

### Local Development with ngrok

```bash
# Install ngrok
brew install ngrok

# Start your dev server
bun run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Configure in Lemon Squeezy: https://abc123.ngrok.io/api/webhook/lemonsqueezy
```

### Test Mode

Lemon Squeezy provides test mode by default:
- Test cards work automatically
- No real charges
- Webhooks fire normally

**Test Card:** `4242 4242 4242 4242` (any expiry, any CVC)

### Testing Checklist

```
[ ] Create checkout for PLUS tier
[ ] Complete payment with test card
[ ] Verify webhook received
[ ] Verify subscription created in database
[ ] Verify user can access premium features
[ ] Test subscription cancellation
[ ] Test subscription resumption
[ ] Test payment failure scenario
```

---

## Production Checklist

### Before Launch

```
[ ] Switch Lemon Squeezy from Test to Live mode
[ ] Generate new API key for production
[ ] Update environment variables in Vercel
[ ] Update webhook URL to production domain
[ ] Generate new webhook secret
[ ] Test one real transaction (refund immediately)
[ ] Verify payout settings (bank account for Ecuador)
[ ] Set up email notifications in Lemon Squeezy
```

### Vercel Environment Variables

Add to Vercel project settings:
- `LEMONSQUEEZY_API_KEY` (production key)
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `LEMONSQUEEZY_PLUS_VARIANT_ID`
- `LEMONSQUEEZY_BUSINESS_VARIANT_ID`
- `LEMONSQUEEZY_PRO_VARIANT_ID`

---

## Troubleshooting

### Common Issues

**Webhook not receiving events:**
1. Check webhook URL is correct and accessible
2. Verify webhook secret matches
3. Check Lemon Squeezy webhook logs

**Signature verification failing:**
1. Ensure raw body is used (not parsed JSON)
2. Check `LEMONSQUEEZY_WEBHOOK_SECRET` is correct
3. Verify no middleware is modifying the request body

**Checkout not redirecting:**
1. Check variant ID exists and is active
2. Verify API key has correct permissions
3. Check browser console for errors

---

## References

- [Lemon Squeezy Documentation](https://docs.lemonsqueezy.com)
- [Official Next.js Billing Template](https://github.com/lmsqueezy/nextjs-billing)
- [Webhook Events Reference](https://docs.lemonsqueezy.com/api/webhooks)
- [Subscription Object](https://docs.lemonsqueezy.com/api/subscriptions/the-subscription-object)
- [Create Checkout API](https://docs.lemonsqueezy.com/api/checkouts/create-checkout)

---

## Version History

- **v1.0** (Dec 27, 2025): Initial documentation
  - Decision: Lemon Squeezy over Stripe for Ecuador
  - Complete implementation guide
  - Webhook handler with all events
  - Testing and production checklists
