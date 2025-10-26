# RLS Policies Documentation

> Row Level Security (RLS) policies for the InmoApp database

## Overview

RLS policies enforce data access at the database level, protecting sensitive information even if someone bypasses application logic.

**Key Principle:** All auth function calls use `(SELECT auth.uid())` instead of `auth.uid()` for optimal performance. This prevents re-evaluation of auth functions for each row.

---

## Table: `users`

### Policy: "Users can insert own profile"
- **Type:** INSERT
- **Logic:** Users can only create their own user records
- **Condition:** `(SELECT auth.uid()) = id`
- **Use Case:** Profile creation during signup

### Policy: "Users can update own profile"
- **Type:** UPDATE
- **Logic:** Users can only modify their own profiles
- **Condition:** `(SELECT auth.uid()) = id`
- **Use Case:** Edit name, avatar, phone, etc.

---

## Table: `properties`

### Policy: "Agents can insert properties"
- **Type:** INSERT
- **Logic:** Only agents can create property listings
- **Condition:** `(SELECT auth.uid()) = agent_id`
- **Use Case:** Agent creates a new property listing
- **Security:** Prevents clients from creating properties

### Policy: "Agents can update own properties"
- **Type:** UPDATE
- **Logic:** Agents can only update their own properties
- **Condition:** `(SELECT auth.uid()) = agent_id`
- **Use Case:** Agent edits a property they listed

### Policy: "Agents can delete own properties"
- **Type:** DELETE
- **Logic:** Agents can only delete their own properties
- **Condition:** `(SELECT auth.uid()) = agent_id`
- **Use Case:** Agent removes a property listing

---

## Table: `property_images`

### Policy: "Property owners can insert images"
- **Type:** INSERT
- **Logic:** Only the property owner (agent) can add images
- **Condition:** `(SELECT auth.uid()) = (SELECT agent_id FROM properties WHERE id = property_id)`
- **Use Case:** Agent uploads images for their property

### Policy: "Property owners can delete images"
- **Type:** DELETE
- **Logic:** Only the property owner can delete their images
- **Condition:** `(SELECT auth.uid()) = (SELECT agent_id FROM properties WHERE id = property_id)`
- **Use Case:** Agent removes an image from their property

---

## Table: `favorites`

### Policy: "Users can view own favorites"
- **Type:** SELECT
- **Logic:** Users can only see their own favorites
- **Condition:** `(SELECT auth.uid()) = user_id`
- **Use Case:** Display user's favorite properties

### Policy: "Users can insert own favorites"
- **Type:** INSERT
- **Logic:** Users can only add their own favorites
- **Condition:** `(SELECT auth.uid()) = user_id`
- **Use Case:** User marks a property as favorite

### Policy: "Users can delete own favorites"
- **Type:** DELETE
- **Logic:** Users can only remove their own favorites
- **Condition:** `(SELECT auth.uid()) = user_id`
- **Use Case:** User removes a favorite

---

## Table: `appointments`

### Policy: "Users can view own appointments"
- **Type:** SELECT
- **Logic:** Users can see appointments they're involved in (as client or agent)
- **Condition:** `(SELECT auth.uid()) IN (user_id, agent_id)`
- **Use Case:** Display user's appointments or their property viewings

### Policy: "Clients can insert appointments"
- **Type:** INSERT
- **Logic:** Only clients can create appointment requests
- **Condition:** `(SELECT auth.uid()) = user_id`
- **Use Case:** Client books a property viewing

### Policy: "Users can update own appointments"
- **Type:** UPDATE
- **Logic:** Users involved in the appointment can modify it
- **Condition:** `(SELECT auth.uid()) IN (user_id, agent_id)`
- **Use Case:** Reschedule or confirm an appointment

### Policy: "Users can delete own appointments"
- **Type:** DELETE
- **Logic:** Users involved in the appointment can cancel it
- **Condition:** `(SELECT auth.uid()) IN (user_id, agent_id)`
- **Use Case:** Cancel an appointment

---

## Table: `property_shares`

### Policy: "Only admins read shares"
- **Type:** SELECT
- **Logic:** Only service role (admin) can read share analytics
- **Condition:** `(SELECT auth.role()) = 'service_role'`
- **Use Case:** Analytics dashboard for admin (future feature)

---

## Table: `property_views`

### Policy: "Only admins read views"
- **Type:** SELECT
- **Logic:** Only service role (admin) can read view analytics
- **Condition:** `(SELECT auth.role()) = 'service_role'`
- **Use Case:** Analytics dashboard for admin (future feature)

---

## Important Notes

### 1. Prisma Bypasses RLS
Prisma uses `DATABASE_URL` with connection pooling, which connects as `postgres` user. This means:
- Prisma queries **do not evaluate RLS policies**
- RLS is primarily for direct Supabase SDK access
- Application-level security is implemented in repositories and server actions

### 2. Service Role Policies
Policies checking `auth.role() = 'service_role'` allow admin operations from:
- Server-side Supabase SDK calls with service role key
- Future admin dashboards (if built with Supabase SDK)

### 3. Performance Optimization
All policies use `(SELECT auth.uid())` instead of `auth.uid()` because:
- Without SELECT: PostgreSQL calls `auth.uid()` for every row checked
- With SELECT: PostgreSQL calls `auth.uid()` once and reuses the result
- Impact: Significant performance improvement on large tables

### 4. Public Read Access
Properties are readable by anyone (no SELECT policy restricts them) because:
- Properties should be visible to all users (public listings)
- Visibility control is handled at the application level
- RLS policies only restrict sensitive operations (INSERT, UPDATE, DELETE)

---

## Testing RLS Policies

### Using Supabase SQL Editor

Test that a user can only access their own data:

```sql
-- Test 1: User can view own favorite
SELECT * FROM favorites
WHERE user_id = (SELECT auth.uid());
-- ✅ Should return user's favorites

-- Test 2: User cannot view other's favorite
SELECT * FROM favorites
WHERE user_id != (SELECT auth.uid());
-- ❌ Should return 0 rows (blocked by RLS)

-- Test 3: Agent can view own property
SELECT * FROM properties
WHERE agent_id = (SELECT auth.uid());
-- ✅ Should return agent's properties

-- Test 4: Agent cannot update other's property
UPDATE properties
SET title = 'Hacked'
WHERE agent_id != (SELECT auth.uid());
-- ❌ Should fail (RLS blocks update)
```

---

## Future Improvements

1. **Tenant Isolation:** If multi-tenant is added, add `tenant_id` checks to all policies
2. **Admin Override:** Implement proper admin policies instead of using service role
3. **Audit Logging:** Add triggers to log RLS policy violations
4. **Time-based Access:** Add `created_at` checks for temporary access control

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS Reference](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Performance Optimization Tips](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
