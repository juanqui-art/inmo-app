-- =========================================
-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- =========================================
--
-- This migration optimizes all RLS policies by wrapping auth.*() calls
-- in SELECT statements. This prevents re-evaluation of auth functions
-- for each row, improving query performance at scale.
--
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ===== USERS TABLE =====

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = id
  );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    (SELECT auth.uid()) = id
  );

-- ===== PROPERTIES TABLE =====

DROP POLICY IF EXISTS "Agents can insert properties" ON properties;
CREATE POLICY "Agents can insert properties" ON properties
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = agent_id
  );

DROP POLICY IF EXISTS "Agents can update own properties" ON properties;
CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (
    (SELECT auth.uid()) = agent_id
  );

DROP POLICY IF EXISTS "Agents can delete own properties" ON properties;
CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (
    (SELECT auth.uid()) = agent_id
  );

-- ===== PROPERTY_IMAGES TABLE =====

DROP POLICY IF EXISTS "Property owners can insert images" ON property_images;
CREATE POLICY "Property owners can insert images" ON property_images
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = (
      SELECT agent_id FROM properties WHERE id = property_id LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Property owners can delete images" ON property_images;
CREATE POLICY "Property owners can delete images" ON property_images
  FOR DELETE USING (
    (SELECT auth.uid()) = (
      SELECT agent_id FROM properties WHERE id = property_id LIMIT 1
    )
  );

-- ===== FAVORITES TABLE =====

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (
    (SELECT auth.uid()) = user_id
  );

-- ===== APPOINTMENTS TABLE =====

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    (SELECT auth.uid()) IN (user_id, agent_id)
  );

DROP POLICY IF EXISTS "Clients can insert appointments" ON appointments;
CREATE POLICY "Clients can insert appointments" ON appointments
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = user_id
  );

DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    (SELECT auth.uid()) IN (user_id, agent_id)
  );

DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (
    (SELECT auth.uid()) IN (user_id, agent_id)
  );

-- ===== PROPERTY_SHARES TABLE =====

DROP POLICY IF EXISTS "Anyone can track shares" ON property_shares;
CREATE POLICY "Anyone can track shares" ON property_shares
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins read shares" ON property_shares;
CREATE POLICY "Only admins read shares" ON property_shares
  FOR SELECT USING (
    (SELECT auth.role()) = 'service_role'
  );

-- ===== PROPERTY_VIEWS TABLE =====

DROP POLICY IF EXISTS "Anyone can track views" ON property_views;
CREATE POLICY "Anyone can track views" ON property_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins read views" ON property_views;
CREATE POLICY "Only admins read views" ON property_views
  FOR SELECT USING (
    (SELECT auth.role()) = 'service_role'
  );
