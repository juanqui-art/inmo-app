-- Change default role from CLIENT to AGENT
-- This migration simplifies the user experience by making all users AGENT by default
-- AGENTs can browse properties AND publish (aligned with freemium model)

-- Step 1: Update existing CLIENT users to AGENT
UPDATE "users"
SET "role" = 'AGENT'
WHERE "role" = 'CLIENT';

-- Step 2: Change the default value for new users
ALTER TABLE "users"
ALTER COLUMN "role" SET DEFAULT 'AGENT';

-- Note: This is a one-way migration. All existing CLIENTs become AGENTs.
-- Their favorites, appointments, and other data remain intact.
