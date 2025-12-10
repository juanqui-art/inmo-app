-- Migration: Add subscription tier sync to user trigger
-- Description: Maps the 'plan' field from auth metadata to subscription_tier in public.users
--
-- ISSUE: BUG-001 - Users signup with plan=BASIC but get tier=FREE
-- SOLUTION: Update trigger to map plan → subscription_tier
--
-- Reference: docs/bugs/SUBSCRIPTION_TIER_SIGNUP_BUG.md
--
-- IMPORTANT: Execute this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Drop existing trigger
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- ============================================================================
-- STEP 2: Update function with subscription_tier mapping
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    subscription_tier,  -- ← NEW: Added subscription tier mapping
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    -- Name: Use full_name or name from metadata, fallback to email
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    -- Role: Use role from metadata, fallback to CLIENT
    COALESCE(
      new.raw_user_meta_data->>'role',
      'CLIENT'
    )::"UserRole",
    -- Subscription Tier: Use plan from metadata, fallback to FREE
    -- Convert to uppercase (basic → BASIC) to match enum
    COALESCE(
      UPPER(new.raw_user_meta_data->>'plan'),
      'FREE'
    )::"SubscriptionTier",
    now(),
    now()
  )
  -- If user already exists (re-authentication), update name and tier
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(
      EXCLUDED.name,
      public.users.name
    ),
    -- Update subscription tier if present in metadata
    subscription_tier = COALESCE(
      UPPER(new.raw_user_meta_data->>'plan')::"SubscriptionTier",
      public.users.subscription_tier
    ),
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- STEP 3: Re-create trigger
-- ============================================================================

CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();

-- ============================================================================
-- STEP 4: Migrate existing users (Optional - only if you have test users)
-- ============================================================================

-- Uncomment this section if you need to fix existing users with wrong tiers
/*
UPDATE public.users
SET
  subscription_tier = (
    SELECT UPPER(a.raw_user_meta_data->>'plan')::"SubscriptionTier"
    FROM auth.users a
    WHERE a.id = public.users.id
    AND a.raw_user_meta_data->>'plan' IS NOT NULL
  ),
  updated_at = now()
WHERE id IN (
  SELECT a.id
  FROM auth.users a
  WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
  AND UPPER(a.raw_user_meta_data->>'plan') != public.users.subscription_tier::text
);
*/

-- ============================================================================
-- STEP 5: Verification Queries
-- ============================================================================

-- Query 1: Verify trigger function exists and is updated
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'sync_user_from_auth';

-- Query 2: Check for tier mismatches (should return 0 rows after fix)
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  'MISMATCH' as status
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
AND UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text;

-- Query 3: Show current tier distribution
SELECT
  subscription_tier,
  COUNT(*) as user_count
FROM public.users
GROUP BY subscription_tier
ORDER BY user_count DESC;

-- ============================================================================
-- TESTING INSTRUCTIONS
-- ============================================================================

-- After running this migration, test by creating a new user via the app:
--
-- 1. Visit: http://localhost:3000/vender
-- 2. Click "Comenzar prueba" (BASIC plan)
-- 3. Complete signup form
-- 4. Run this query to verify:
--
-- SELECT
--   u.id,
--   u.email,
--   u.subscription_tier,
--   a.raw_user_meta_data->>'plan' as metadata_plan
-- FROM public.users u
-- JOIN auth.users a ON a.id = u.id
-- WHERE u.email = 'your-test-email@example.com';
--
-- Expected: subscription_tier = 'BASIC'

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- If this migration causes issues, run the following to rollback:
/*
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
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
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENT')::"UserRole",
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
*/
