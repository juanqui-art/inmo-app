-- ============================================================================
-- PERMANENT FIX: Trigger Solo INSERT (Previene Sobrescrituras)
-- ============================================================================
--
-- PROBLEMA: El trigger on_auth_user_created_or_updated se ejecuta en INSERT Y UPDATE
--           Esto causa que cambios manuales en public.users.subscription_tier
--           se sobrescriban cuando auth.users se actualiza (login, metadata changes)
--
-- SOLUCIÓN: Cambiar el trigger para que SOLO se ejecute en INSERT (creación de usuarios)
--           Los updates a public.users deben hacerse SOLO via Server Actions
--
-- VENTAJAS:
--   ✅ Signup funciona correctamente (tier asignado del metadata)
--   ✅ Cambios manuales en DB NO se sobrescriben
--   ✅ Updates via Server Actions funcionan normalmente
--   ✅ Simple y predecible
--
-- IMPORTANTE: Ejecutar en Supabase SQL Editor
--
-- ============================================================================

-- ============================================================================
-- PASO 1: Drop existing trigger (INSERT OR UPDATE)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- ============================================================================
-- PASO 2: Create NEW trigger (INSERT ONLY)
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users  -- ← SOLO INSERT (sin "OR UPDATE")
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();

-- ============================================================================
-- NOTA: La función sync_user_from_auth() NO necesita cambios
-- ============================================================================
--
-- La función sigue siendo la misma:
-- - Crea usuario en public.users cuando se registra en auth.users
-- - Mapea metadata (name, role, plan) a campos de DB
-- - ON CONFLICT DO UPDATE sigue funcionando (si se re-inserta manualmente)
--
-- PERO AHORA:
-- - El trigger SOLO se dispara en INSERT (nuevos usuarios)
-- - NO se dispara en UPDATE (login, metadata changes)
-- - Cambios manuales en public.users.subscription_tier son PERMANENTES

-- ============================================================================
-- PASO 3: Verificar que el trigger fue creado correctamente
-- ============================================================================

-- Query 1: Verificar nombre del trigger (debe ser "on_auth_user_created")
SELECT
  trigger_name,
  event_manipulation,  -- Debe decir "INSERT" (sin "UPDATE")
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%'
  AND event_object_table = 'users'
  AND event_object_schema = 'auth';

-- Resultado esperado:
-- trigger_name         | event_manipulation | action_statement
-- ---------------------|--------------------|-----------------
-- on_auth_user_created | INSERT             | EXECUTE FUNCTION public.sync_user_from_auth()

-- Query 2: Verificar que la función sigue existiendo
SELECT
  proname as function_name,
  prosrc as source_code
FROM pg_proc
WHERE proname = 'sync_user_from_auth';

-- Debe retornar 1 fila con el código de la función

-- ============================================================================
-- PASO 4: Testing - Crear usuario de prueba
-- ============================================================================

-- IMPORTANTE: NO ejecutar esto si ya tienes usuarios de producción
-- Solo para testing en desarrollo

/*
-- Test 1: Signup con plan PLUS
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'test-trigger@example.com',
  crypt('testpass123', gen_salt('bf')),
  now(),
  '{"name": "Test User", "role": "AGENT", "plan": "plus"}'::jsonb,
  now(),
  now()
);

-- Verificar que se creó en public.users con tier PLUS
SELECT
  u.email,
  u.subscription_tier,
  u.role
FROM public.users u
WHERE u.email = 'test-trigger@example.com';

-- Resultado esperado:
-- email                    | subscription_tier | role
-- -------------------------|-------------------|------
-- test-trigger@example.com | PLUS              | AGENT

-- Test 2: Cambiar tier manualmente
UPDATE public.users
SET subscription_tier = 'PRO'
WHERE email = 'test-trigger@example.com';

-- Test 3: Simular UPDATE en auth.users (ej: login, metadata change)
UPDATE auth.users
SET updated_at = now()
WHERE email = 'test-trigger@example.com';

-- Test 4: Verificar que el tier NO se revirtió
SELECT
  u.subscription_tier
FROM public.users u
WHERE u.email = 'test-trigger@example.com';

-- Resultado esperado:
-- subscription_tier
-- -----------------
-- PRO  ← ✅ Sigue siendo PRO (NO se revirtió a PLUS)

-- Cleanup: Eliminar usuario de prueba
DELETE FROM auth.users WHERE email = 'test-trigger@example.com';
DELETE FROM public.users WHERE email = 'test-trigger@example.com';
*/

-- ============================================================================
-- PASO 5: Resincronizar usuarios existentes (OPCIONAL)
-- ============================================================================

-- Si tienes usuarios que ya tienen el tier correcto en public.users
-- pero metadata desactualizado en auth.users, puedes sincronizarlos:

/*
UPDATE auth.users a
SET raw_user_meta_data = jsonb_set(
  COALESCE(a.raw_user_meta_data, '{}'::jsonb),
  '{plan}',
  to_jsonb(LOWER(u.subscription_tier::text))
)
FROM public.users u
WHERE a.id::text = u.id::text
  AND (
    a.raw_user_meta_data->>'plan' IS NULL
    OR UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text
  );
*/

-- ============================================================================
-- COMPORTAMIENTO DESPUÉS DEL FIX
-- ============================================================================

-- Scenario 1: NUEVO usuario se registra con plan AGENT
--   ✅ Trigger INSERT se ejecuta
--   ✅ public.users.subscription_tier = AGENT (del metadata)
--   ✅ Funciona perfectamente

-- Scenario 2: Usuario existente hace LOGIN
--   ✅ Trigger NO se ejecuta (solo INSERT, no UPDATE)
--   ✅ public.users.subscription_tier NO cambia
--   ✅ Cambios manuales son permanentes

-- Scenario 3: Cambias tier manualmente en Supabase Dashboard
--   ✅ UPDATE public.users SET subscription_tier = 'PRO'
--   ✅ Trigger NO se ejecuta (solo INSERT)
--   ✅ Tier permanece PRO indefinidamente

-- Scenario 4: Server Action actualiza tier (upgrade subscription)
--   ✅ userRepository.update() actualiza public.users
--   ✅ Trigger NO interfiere
--   ✅ Funciona como esperado

-- ============================================================================
-- ROLLBACK (si es necesario)
-- ============================================================================

-- Si necesitas volver al comportamiento anterior (INSERT OR UPDATE):

/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. ✅ La función sync_user_from_auth() NO cambia, solo el trigger
-- 2. ✅ Signup flow sigue funcionando igual (INSERT ejecuta el trigger)
-- 3. ✅ OAuth signup también funciona (Google, etc.)
-- 4. ✅ Cambios manuales en DB son PERMANENTES (no se sobrescriben)
-- 5. ⚠️ Si actualizas metadata en auth.users, NO se sincroniza a public.users
--       (esto es INTENCIONAL - los updates deben hacerse via Server Actions)

-- ============================================================================
-- TESTING CHECKLIST
-- ============================================================================

-- Después de aplicar esta migración, verifica:
--
-- [ ] Trigger existe con nombre "on_auth_user_created"
-- [ ] Trigger solo tiene evento "INSERT" (sin UPDATE)
-- [ ] Signup funciona (crear nuevo usuario desde /vender)
-- [ ] Tier del nuevo usuario es el correcto (del plan seleccionado)
-- [ ] Login NO sobrescribe tier (logout/login varias veces)
-- [ ] Cambio manual de tier en Dashboard es permanente
-- [ ] Server Actions de upgrade funcionan correctamente

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
