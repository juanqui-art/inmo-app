-- ============================================================================
-- MIGRATION: Subscription Architecture Refactor
-- ============================================================================
-- Date: December 18, 2025
-- Description: Separate subscription from user table, rename AGENT tier to BUSINESS
--
-- IMPORTANT: Execute each step one at a time in Supabase SQL Editor
-- Verify each step before proceeding to the next
--
-- Rollback instructions included at the end
-- ============================================================================

-- ============================================================================
-- STEP 1: Backup verification (READ ONLY - just verify)
-- ============================================================================
-- Run this first to see current state:

SELECT
  role,
  subscription_tier,
  COUNT(*) as count
FROM public.users
GROUP BY role, subscription_tier
ORDER BY role, subscription_tier;

-- Expected: Shows distribution of users by role and tier
-- Note the counts for rollback verification


-- ============================================================================
-- STEP 2: Rename enum value AGENT → BUSINESS
-- ============================================================================
-- This renames the tier to avoid collision with UserRole.AGENT

ALTER TYPE "SubscriptionTier" RENAME VALUE 'AGENT' TO 'BUSINESS';

-- Verify:
SELECT enumlabel FROM pg_enum
WHERE enumtypid = '"SubscriptionTier"'::regtype
ORDER BY enumsortorder;
-- Expected: FREE, PLUS, BUSINESS, PRO


-- ============================================================================
-- STEP 3: Create SubscriptionStatus enum
-- ============================================================================

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE',
  'PAUSED',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED',
  'TRIALING'
);

-- Verify:
SELECT enumlabel FROM pg_enum
WHERE enumtypid = '"SubscriptionStatus"'::regtype;


-- ============================================================================
-- STEP 4: Create subscriptions table
-- ============================================================================

CREATE TABLE public.subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Plan
  tier "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  status "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',

  -- Payment Provider (agnostic: Lemon Squeezy, Stripe, etc.)
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

  -- Payment Method (for UI display)
  card_brand TEXT,
  card_last_four TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verify:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;


-- ============================================================================
-- STEP 5: Create indexes for subscriptions table
-- ============================================================================

CREATE INDEX idx_subscriptions_provider_customer ON public.subscriptions(provider_customer_id);
CREATE INDEX idx_subscriptions_provider_subscription ON public.subscriptions(provider_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON public.subscriptions(tier);

-- Verify:
SELECT indexname FROM pg_indexes WHERE tablename = 'subscriptions';


-- ============================================================================
-- STEP 6: Migrate existing AGENT users to subscriptions table
-- ============================================================================
-- Only users with role='AGENT' get a subscription record

INSERT INTO public.subscriptions (user_id, tier, status, created_at, updated_at)
SELECT
  id as user_id,
  subscription_tier as tier,
  'ACTIVE'::"SubscriptionStatus" as status,
  created_at,
  now() as updated_at
FROM public.users
WHERE role = 'AGENT'
ON CONFLICT (user_id) DO NOTHING;

-- Verify:
SELECT
  s.tier,
  s.status,
  COUNT(*) as count
FROM public.subscriptions s
GROUP BY s.tier, s.status;

-- Should match the AGENT users from Step 1


-- ============================================================================
-- STEP 7: Migrate Stripe fields (if any exist)
-- ============================================================================
-- Move existing Stripe data to subscriptions table

UPDATE public.subscriptions s
SET
  provider = 'stripe',
  provider_customer_id = u.stripe_customer_id,
  provider_subscription_id = u.stripe_subscription_id,
  provider_product_id = u.stripe_price_id,
  current_period_end = u.stripe_current_period_end
FROM public.users u
WHERE s.user_id = u.id
  AND u.stripe_customer_id IS NOT NULL;

-- Verify:
SELECT COUNT(*) as users_with_stripe
FROM public.subscriptions
WHERE provider = 'stripe';


-- ============================================================================
-- STEP 8: Update trigger function for new architecture
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
DECLARE
  user_role "UserRole";
  has_plan BOOLEAN;
BEGIN
  -- Determine if user selected a plan (from /vender flow)
  has_plan := new.raw_user_meta_data->>'plan' IS NOT NULL
              AND new.raw_user_meta_data->>'plan' != '';

  -- Determine role: if has plan → AGENT, else → CLIENT
  user_role := CASE
    WHEN has_plan THEN 'AGENT'::"UserRole"
    WHEN new.raw_user_meta_data->>'role' = 'AGENT' THEN 'AGENT'::"UserRole"
    WHEN new.raw_user_meta_data->>'role' = 'ADMIN' THEN 'ADMIN'::"UserRole"
    ELSE 'CLIENT'::"UserRole"
  END;

  -- Insert/Update user (without subscription_tier - that goes to subscriptions table)
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
    -- Only upgrade role, never downgrade
    role = CASE
      WHEN EXCLUDED.role = 'AGENT' AND public.users.role = 'CLIENT' THEN 'AGENT'::"UserRole"
      ELSE public.users.role
    END,
    updated_at = now();

  -- If AGENT, create subscription with FREE tier (default)
  -- Users upgrade tier through payment flow, not signup
  IF user_role = 'AGENT' THEN
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (new.id, 'FREE'::"SubscriptionTier", 'ACTIVE'::"SubscriptionStatus")
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verify:
SELECT prosrc FROM pg_proc WHERE proname = 'sync_user_from_auth';


-- ============================================================================
-- STEP 9: Enable RLS on subscriptions table
-- ============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service role can insert/update (via triggers/actions)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Verify:
SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions';


-- ============================================================================
-- STEP 10: Verification queries
-- ============================================================================

-- Count subscriptions by tier
SELECT tier, COUNT(*) FROM public.subscriptions GROUP BY tier;

-- Verify all AGENTs have subscriptions
SELECT
  u.id,
  u.email,
  u.role,
  s.tier as subscription_tier
FROM public.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE u.role = 'AGENT';

-- Check for AGENTs without subscription (should be 0)
SELECT COUNT(*) as agents_without_subscription
FROM public.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE u.role = 'AGENT' AND s.id IS NULL;


-- ============================================================================
-- OPTIONAL: Remove old columns from users table
-- ============================================================================
-- ONLY run this AFTER verifying migration is successful
-- and AFTER updating all application code
--
-- DO NOT RUN YET - wait until code is updated in future session
--
-- ALTER TABLE public.users DROP COLUMN subscription_tier;
-- ALTER TABLE public.users DROP COLUMN stripe_customer_id;
-- ALTER TABLE public.users DROP COLUMN stripe_subscription_id;
-- ALTER TABLE public.users DROP COLUMN stripe_price_id;
-- ALTER TABLE public.users DROP COLUMN stripe_current_period_end;


-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If something goes wrong, run these in reverse order:
--
-- 1. Drop policies
-- DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
-- DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
--
-- 2. Drop subscriptions table
-- DROP TABLE IF EXISTS public.subscriptions;
--
-- 3. Drop SubscriptionStatus enum
-- DROP TYPE IF EXISTS "SubscriptionStatus";
--
-- 4. Rename BUSINESS back to AGENT
-- ALTER TYPE "SubscriptionTier" RENAME VALUE 'BUSINESS' TO 'AGENT';
--
-- 5. Restore original trigger (from backup)
-- ============================================================================
