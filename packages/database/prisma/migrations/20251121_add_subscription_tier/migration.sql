-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "stripe_customer_id" TEXT UNIQUE,
  ADD COLUMN "stripe_subscription_id" TEXT UNIQUE,
  ADD COLUMN "stripe_price_id" TEXT,
  ADD COLUMN "stripe_current_period_end" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_subscription_tier_idx" ON "users"("subscription_tier");
