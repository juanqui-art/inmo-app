-- Migration: Update SubscriptionTier enum from 3 tiers to 4 tiers
-- Date: December 5, 2025
-- Changes:
--   - Remove: BASIC
--   - Add: PLUS (replaces BASIC, B2C focused)
--   - Add: AGENT (new B2B tier for small agents)
--   - Keep: FREE, PRO (updated limits)

-- Step 1: Create new enum type with updated values
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'PLUS', 'AGENT', 'PRO');

-- Step 2: Add temporary column with new enum type
ALTER TABLE "users"
ADD COLUMN "subscription_tier_new" "SubscriptionTier_new";

-- Step 3: Migrate existing data
-- Strategy: Migrate all BASIC users to PLUS
-- Rationale: PLUS is the closest equivalent ($9.99 vs $4.99, but better value)
UPDATE "users"
SET "subscription_tier_new" =
  CASE
    WHEN "subscription_tier" = 'FREE' THEN 'FREE'::"SubscriptionTier_new"
    WHEN "subscription_tier" = 'BASIC' THEN 'PLUS'::"SubscriptionTier_new"
    WHEN "subscription_tier" = 'PRO' THEN 'PRO'::"SubscriptionTier_new"
    ELSE 'FREE'::"SubscriptionTier_new"  -- Fallback to FREE for safety
  END;

-- Step 4: Drop old column and enum
ALTER TABLE "users" DROP COLUMN "subscription_tier";
DROP TYPE "SubscriptionTier";

-- Step 5: Rename new enum and column
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
ALTER TABLE "users" RENAME COLUMN "subscription_tier_new" TO "subscription_tier";

-- Step 6: Set NOT NULL constraint (all users should have a tier)
ALTER TABLE "users"
ALTER COLUMN "subscription_tier" SET NOT NULL;

-- Step 7: Set default value to FREE
ALTER TABLE "users"
ALTER COLUMN "subscription_tier" SET DEFAULT 'FREE'::"SubscriptionTier";

-- Verification query (run after migration):
-- SELECT subscription_tier, COUNT(*) as count
-- FROM users
-- GROUP BY subscription_tier
-- ORDER BY subscription_tier;

-- Expected result:
-- FREE:  X users (unchanged)
-- PLUS:  Y users (previously BASIC)
-- AGENT: 0 users (new tier, no users yet)
-- PRO:   Z users (unchanged)
