-- ============================================================================
-- HOTFIX: Sincronizar subscription_tier entre DB y metadata
-- ============================================================================
--
-- PROBLEMA: Cambios manuales en public.users.subscription_tier se revierten
--           porque auth.users.raw_user_meta_data->>'plan' no está sincronizado
--
-- SOLUCIÓN: Actualizar AMBOS (DB tier + metadata) cuando cambies tiers manualmente
--
-- USO: Ejecutar en Supabase SQL Editor
--
-- ============================================================================

-- ============================================================================
-- PASO 1: Actualizar tier en public.users (ya lo hiciste probablemente)
-- ============================================================================

-- Cambiar esto por el email de tu usuario de test
UPDATE public.users
SET subscription_tier = 'AGENT'  -- ← Cambiar al tier que necesites (FREE, PLUS, AGENT, PRO)
WHERE email = 'tu-usuario-test@example.com';  -- ← CAMBIAR POR TU EMAIL

-- ============================================================================
-- PASO 2: IMPORTANTE - También actualizar metadata en auth.users
-- ============================================================================

-- Esto previene que el trigger sobrescriba el tier de vuelta a FREE
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),  -- Maneja el caso de metadata NULL
  '{plan}',
  '"agent"'  -- ← IMPORTANTE: lowercase y entre comillas dobles ("agent", "plus", "pro", "free")
)
WHERE id = (
  SELECT id
  FROM public.users
  WHERE email = 'tu-usuario-test@example.com'  -- ← CAMBIAR POR TU EMAIL
);

-- ============================================================================
-- PASO 3: Verificar sincronización
-- ============================================================================

-- Esta query te muestra si están sincronizados
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  CASE
    WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text
      THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as status
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE u.email = 'tu-usuario-test@example.com';  -- ← CAMBIAR POR TU EMAIL

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
--
-- db_tier | metadata_plan | status
-- --------|---------------|----------
-- AGENT   | agent         | ✅ SYNCED
--
-- Si ves ✅ SYNCED, el bug está arreglado para este usuario.
-- El tier NO se revertirá en el siguiente login.

-- ============================================================================
-- MAPEO DE TIERS (REFERENCIA)
-- ============================================================================
--
-- Para actualizar a diferentes tiers, usa estos valores:
--
-- FREE:
--   public.users.subscription_tier = 'FREE'
--   auth.users metadata = '"free"'
--
-- PLUS:
--   public.users.subscription_tier = 'PLUS'
--   auth.users metadata = '"plus"'
--
-- AGENT:
--   public.users.subscription_tier = 'AGENT'
--   auth.users metadata = '"agent"'
--
-- PRO:
--   public.users.subscription_tier = 'PRO'
--   auth.users metadata = '"pro"'
--
-- ⚠️ IMPORTANTE:
--   - DB tier: UPPERCASE sin comillas (FREE, AGENT, etc.)
--   - Metadata: lowercase con comillas dobles ("free", "agent", etc.)

-- ============================================================================
-- EJEMPLO COMPLETO: Actualizar usuario a PRO
-- ============================================================================
/*
-- 1. Update DB tier
UPDATE public.users
SET subscription_tier = 'PRO'
WHERE email = 'premium-user@example.com';

-- 2. Update metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{plan}',
  '"pro"'
)
WHERE id = (SELECT id FROM public.users WHERE email = 'premium-user@example.com');

-- 3. Verify
SELECT
  u.subscription_tier,
  a.raw_user_meta_data->>'plan',
  CASE WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text THEN '✅' ELSE '❌' END
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE u.email = 'premium-user@example.com';
*/
