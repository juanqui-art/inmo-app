# 🐛 BUG REPORT: Subscription Tier Not Set on Signup

**Issue ID:** BUG-001
**Reported:** December 9, 2025
**Priority:** 🔴 **CRITICAL** (Blocks freemium launch)
**Status:** 🟡 OPEN - Ready for fix
**Estimated Fix Time:** 1 hour

---

## 📋 Summary

Users who signup with a selected plan (`plan=BASIC` or `plan=PRO`) are **not assigned the correct subscription tier** in the database. All users default to `subscriptionTier=FREE` regardless of their plan selection during signup.

---

## 🎯 Impact

### User Experience Impact
- ❌ Users who select BASIC or PRO during signup get FREE tier limits
- ❌ Users cannot create the expected number of properties
- ❌ Payment intent is recorded in metadata but not enforced
- ❌ Users must manually "upgrade" after signup (confusing UX)

### Business Impact
- 🚫 **Blocks freemium launch** - cannot test paid tiers
- 💰 Revenue impact: Users expecting paid features get FREE tier
- 📊 Analytics corrupted: All new users appear as FREE tier
- 🤝 Trust issue: "I paid but got FREE tier"

### Severity Score: **9/10** (Critical)

---

## 🔍 Root Cause Analysis

### The Problem

The Supabase Database Trigger (`sync_user_from_auth()`) that creates users in `public.users` **does not map the subscription tier** from auth metadata.

### Current Trigger Implementation

**File:** `packages/database/migrations/sync-google-avatar.sql`

```sql
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,                    -- ✅ Correctly mapped from metadata
    created_at,
    updated_at
    -- ❌ MISSING: subscription_tier
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENT')::"UserRole",  -- ✅ Works
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**Issue:** The trigger inserts into `public.users` but **does not include `subscription_tier`**, so it defaults to `FREE` (defined in Prisma schema).

### Expected Behavior

When a user signs up with a plan:

```typescript
// Frontend → Server Action
signupAction({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  plan: "BASIC"  // ← User selected BASIC plan
})

// Server Action → Supabase Auth
supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name: "John Doe",
      role: "AGENT",
      plan: "BASIC"  // ← Stored in raw_user_meta_data
    }
  }
})

// Expected Result in Database
{
  id: "user-123",
  email: "user@example.com",
  name: "John Doe",
  role: "AGENT",           // ✅ Correctly set
  subscriptionTier: "BASIC" // ❌ Currently defaults to "FREE"
}
```

### Actual Behavior

The trigger creates the user but **ignores the `plan` field** from metadata:

```sql
-- Result in public.users
{
  subscription_tier: "FREE"  -- ❌ Wrong! Should be "BASIC"
}
```

---

## 🧪 How to Reproduce

### Step 1: Visit /vender page
```
Navigate to: http://localhost:3000/vender
```

### Step 2: Click "Comenzar prueba" (BASIC plan)
```
Button redirects to: /signup?plan=basic&redirect=/dashboard
```

### Step 3: Complete signup form
```
Name: Test User
Email: test@example.com
Password: testpass123
```

### Step 4: Verify database
```sql
-- Check auth.users metadata
SELECT
  id,
  email,
  raw_user_meta_data->>'plan' as metadata_plan
FROM auth.users
WHERE email = 'test@example.com';

-- Result:
-- metadata_plan: "basic"  ✅ Correct

-- Check public.users tier
SELECT
  id,
  email,
  subscription_tier
FROM public.users
WHERE email = 'test@example.com';

-- Result:
-- subscription_tier: "FREE"  ❌ WRONG! Should be "BASIC"
```

### Expected vs Actual

| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| `raw_user_meta_data->>'plan'` | `"basic"` | `"basic"` | ✅ Correct |
| `public.users.role` | `AGENT` | `AGENT` | ✅ Correct |
| `public.users.subscription_tier` | `BASIC` | `FREE` | ❌ **BUG** |

---

## ✅ Proposed Solution

### Option 1: Update Database Trigger (Recommended)

**File to modify:** `packages/database/migrations/sync-google-avatar.sql`

**Add subscription tier mapping:**

```sql
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    subscription_tier,  -- ← ADD THIS
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENT')::"UserRole",
    COALESCE(
      UPPER(new.raw_user_meta_data->>'plan'),  -- ← ADD THIS: Convert to uppercase
      'FREE'
    )::"SubscriptionTier",  -- ← Cast to enum type
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    -- Also update tier on conflict (user re-authenticates)
    subscription_tier = COALESCE(
      UPPER(new.raw_user_meta_data->>'plan'),
      public.users.subscription_tier
    )::"SubscriptionTier",
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**Key changes:**
1. ✅ Added `subscription_tier` to INSERT columns
2. ✅ Map from `raw_user_meta_data->>'plan'`
3. ✅ Convert to UPPERCASE (`BASIC`, not `basic`)
4. ✅ Cast to `"SubscriptionTier"` enum
5. ✅ Default to `'FREE'` if not present
6. ✅ Update tier on conflict (re-auth scenario)

### Option 2: Post-Signup Update (Workaround)

**File to modify:** `apps/web/app/actions/auth.ts`

Add post-signup tier update:

```typescript
export async function signupAction(_prevState: unknown, formData: FormData) {
  // ... existing signup logic ...

  // After Supabase signup succeeds
  if (data.user && rawData.plan) {
    // Immediately update subscription tier in database
    const planUpper = rawData.plan.toUpperCase();
    if (['FREE', 'BASIC', 'PRO'].includes(planUpper)) {
      await db.user.update({
        where: { id: data.user.id },
        data: {
          subscriptionTier: planUpper as SubscriptionTier
        },
      });
    }
  }

  // ... rest of action ...
}
```

**Trade-offs:**
- ✅ Works immediately without database migration
- ❌ Adds latency to signup (extra DB query)
- ❌ Race condition risk (trigger vs manual update)
- ❌ Not a clean architectural solution

**Recommendation:** Use **Option 1** (trigger fix) - cleaner, no race conditions, works for OAuth too.

---

## 🔧 Implementation Steps

### Step 1: Create Migration File

Create new file: `packages/database/migrations/fix-subscription-tier-sync.sql`

```sql
-- Migration: Add subscription tier sync to user trigger
-- Description: Maps the 'plan' field from auth metadata to subscription_tier in public.users
--
-- ISSUE: BUG-001 - Users signup with plan=BASIC but get tier=FREE
-- SOLUTION: Update trigger to map plan → subscription_tier

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- Update function with subscription_tier mapping
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENT')::"UserRole",
    COALESCE(
      UPPER(new.raw_user_meta_data->>'plan'),
      'FREE'
    )::"SubscriptionTier",
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    subscription_tier = COALESCE(
      UPPER(new.raw_user_meta_data->>'plan'),
      public.users.subscription_tier
    )::"SubscriptionTier",
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();

-- Verify the fix works
-- Test case: Create user with plan metadata
-- Expected: subscription_tier should match the plan
```

### Step 2: Apply Migration to Supabase

```bash
# Option A: Via Supabase SQL Editor (Recommended for now)
1. Navigate to Supabase Dashboard → SQL Editor
2. Copy contents of fix-subscription-tier-sync.sql
3. Execute the SQL
4. Verify "Success" message

# Option B: Via Supabase CLI (Future)
supabase db push
```

### Step 3: Migrate Existing Users (if any)

If you have existing test users with wrong tiers:

```sql
-- Sync existing users' tiers from auth metadata
UPDATE public.users
SET subscription_tier = (
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
```

### Step 4: Verify Fix

```sql
-- Test 1: Check trigger function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'sync_user_from_auth';
-- Should show updated function with subscription_tier

-- Test 2: Create test user via Supabase Auth API
-- Then verify public.users has correct subscription_tier

-- Test 3: Signup via app and verify in database
SELECT
  u.id,
  u.email,
  u.subscription_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE u.email = 'test-signup@example.com';
-- Expected: subscription_tier matches metadata_plan
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **Test 1: Signup with FREE plan**
  ```
  URL: /signup?plan=free
  Expected: subscription_tier = "FREE"
  ```

- [ ] **Test 2: Signup with BASIC plan**
  ```
  URL: /signup?plan=basic
  Expected: subscription_tier = "BASIC"
  ```

- [ ] **Test 3: Signup with PRO plan**
  ```
  URL: /signup?plan=pro
  Expected: subscription_tier = "PRO"
  ```

- [ ] **Test 4: Signup without plan**
  ```
  URL: /signup
  Expected: subscription_tier = "FREE" (default)
  ```

- [ ] **Test 5: Google OAuth signup**
  ```
  OAuth flow with plan=basic in redirect URL
  Expected: subscription_tier = "BASIC"
  ```

### Database Verification

```sql
-- Verify all new signups have correct tiers
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  CASE
    WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text
      THEN '✅ CORRECT'
    ELSE '❌ MISMATCH'
  END as status
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE u.created_at > NOW() - INTERVAL '1 day'
ORDER BY u.created_at DESC;
```

### Automated Testing

Add integration test:

```typescript
// apps/web/__tests__/e2e/signup-with-plan.spec.ts
describe("Signup with subscription tier", () => {
  test("BASIC plan is correctly assigned", async () => {
    // 1. Signup with plan=basic
    const result = await signupAction({
      email: "test-basic@example.com",
      password: "testpass123",
      name: "Test Basic User",
      plan: "basic",
    });

    // 2. Query database
    const user = await db.user.findUnique({
      where: { email: "test-basic@example.com" },
    });

    // 3. Verify tier
    expect(user?.subscriptionTier).toBe("BASIC");
    expect(user?.role).toBe("AGENT");
  });
});
```

---

## 📊 Metrics & Validation

### Success Criteria

- ✅ 100% of signups with plan=BASIC get tier=BASIC
- ✅ 100% of signups with plan=PRO get tier=PRO
- ✅ Default tier remains FREE for signups without plan
- ✅ No regression in role assignment (role still works)
- ✅ OAuth signups work correctly

### Monitoring Queries

```sql
-- Daily signup tier distribution
SELECT
  subscription_tier,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.users
WHERE created_at >= CURRENT_DATE
GROUP BY subscription_tier
ORDER BY count DESC;

-- Tier mismatch detection (should be 0)
SELECT COUNT(*) as mismatch_count
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
AND UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text;
```

---

## 🚨 Rollback Plan

If the fix causes issues:

### Rollback SQL

```sql
-- Restore previous trigger (without subscription_tier mapping)
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
```

Execute in Supabase SQL Editor to revert.

---

## 🔗 Related Issues

### Similar Bugs Fixed Previously

- **BUG-000:** Role not syncing from auth metadata (Fixed Nov 2025)
  - File: `packages/database/migrations/fix-user-roles-sync.sql`
  - Solution: Added `role` mapping to trigger
  - This bug uses the same pattern

### Dependencies

- ✅ Prisma schema has `subscriptionTier` field
- ✅ SubscriptionTier enum exists (FREE, BASIC, PRO)
- ✅ Signup flow saves plan to metadata
- ⏳ Trigger does not map subscription_tier (THIS BUG)

### Blocks

- 🚫 Freemium beta launch
- 🚫 Subscription upgrade testing
- 🚫 Payment gateway integration testing

---

## 📎 References

### Code Files

- **Trigger:** `packages/database/migrations/sync-google-avatar.sql`
- **Signup Action:** `apps/web/app/actions/auth.ts:39-118`
- **Schema:** `packages/database/prisma/schema.prisma` (User model)
- **Pricing Tiers:** `apps/web/lib/pricing/tiers.ts`

### Documentation

- **Auth System:** `docs/architecture/AUTHENTICATION_SYSTEM.md`
- **Freemium Analysis:** `docs/analysis/FREEMIUM_ULTRATHINK_ANALYSIS.md`
- **Business Decisions:** `docs/business/DECISIONS_APPROVED.md`

### External Resources

- [Supabase Triggers Documentation](https://supabase.com/docs/guides/database/postgres/triggers)
- [PostgreSQL JSON Operators](https://www.postgresql.org/docs/current/functions-json.html)

---

## 👥 Stakeholders

- **Developer:** Immediate fix required for testing
- **Product:** Blocks freemium feature validation
- **Business:** Revenue impact if launched with bug
- **QA:** Testing blocked until fixed

---

## ✅ Sign-off

- [ ] **Bug documented** (this file)
- [ ] **Migration SQL created** (`fix-subscription-tier-sync.sql`)
- [ ] **Migration applied** to Supabase
- [ ] **Manual testing completed** (all 5 test cases)
- [ ] **Database verified** (no mismatches)
- [ ] **Automated test added** (E2E test)
- [ ] **Deployed to staging**
- [ ] **Verified in production**

---

**Bug Report Created:** December 9, 2025
**Last Updated:** December 9, 2025
**Next Review:** After fix deployment
