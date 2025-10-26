-- =========================================
-- SIMPLE RLS POLICIES (No optimization needed yet)
-- =========================================
--
-- This creates basic RLS policies without the SELECT optimization
-- The warnings about performance will remain, but security works fine
--
-- Note: Your app uses Prisma which bypasses RLS anyway,
-- so these policies are mostly for direct SDK access protection

-- ===== USERS TABLE =====

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = id
  );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    auth.uid()::uuid = id
  );

-- ===== PROPERTIES TABLE =====

DROP POLICY IF EXISTS "Agents can insert properties" ON properties;
CREATE POLICY "Agents can insert properties" ON properties
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = agent_id
  );

DROP POLICY IF EXISTS "Agents can update own properties" ON properties;
CREATE POLICY "Agents can update own properties" ON properties
  FOR UPDATE USING (
    auth.uid()::uuid = agent_id
  );

DROP POLICY IF EXISTS "Agents can delete own properties" ON properties;
CREATE POLICY "Agents can delete own properties" ON properties
  FOR DELETE USING (
    auth.uid()::uuid = agent_id
  );

-- ===== PROPERTY_IMAGES TABLE =====

DROP POLICY IF EXISTS "Property owners can insert images" ON property_images;
CREATE POLICY "Property owners can insert images" ON property_images
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = (
      SELECT agent_id FROM properties WHERE id = property_id
    )
  );

DROP POLICY IF EXISTS "Property owners can delete images" ON property_images;
CREATE POLICY "Property owners can delete images" ON property_images
  FOR DELETE USING (
    auth.uid()::uuid = (
      SELECT agent_id FROM properties WHERE id = property_id
    )
  );

-- ===== FAVORITES TABLE =====

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (
    auth.uid()::uuid = user_id
  );

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = user_id
  );

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (
    auth.uid()::uuid = user_id
  );

-- ===== APPOINTMENTS TABLE =====

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    auth.uid()::uuid IN (user_id, agent_id)
  );

DROP POLICY IF EXISTS "Clients can insert appointments" ON appointments;
CREATE POLICY "Clients can insert appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = user_id
  );

DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    auth.uid()::uuid IN (user_id, agent_id)
  );

DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (
    auth.uid()::uuid IN (user_id, agent_id)
  );

-- ===== PROPERTY_SHARES TABLE =====

DROP POLICY IF EXISTS "Anyone can track shares" ON property_shares;
CREATE POLICY "Anyone can track shares" ON property_shares
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins read shares" ON property_shares;
CREATE POLICY "Only admins read shares" ON property_shares
  FOR SELECT USING (
    auth.role() = 'service_role'
  );

-- ===== PROPERTY_VIEWS TABLE =====

DROP POLICY IF EXISTS "Anyone can track views" ON property_views;
CREATE POLICY "Anyone can track views" ON property_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins read views" ON property_views;
CREATE POLICY "Only admins read views" ON property_views
  FOR SELECT USING (
    auth.role() = 'service_role'
  );
