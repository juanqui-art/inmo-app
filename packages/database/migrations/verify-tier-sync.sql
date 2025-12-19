-- ============================================================================
-- VERIFICACIÓN RÁPIDA: Estado de sincronización de tiers
-- ============================================================================
--
-- USO: Ejecutar en Supabase SQL Editor para ver el estado de TODOS los usuarios
--
-- ============================================================================

-- Ver estado de sincronización de todos los usuarios
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  u.role,
  CASE
    WHEN a.raw_user_meta_data->>'plan' IS NULL THEN '⚠️ NO METADATA'
    WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as status,
  u.created_at
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
ORDER BY u.created_at DESC;

-- ============================================================================
-- Resumen: Conteo de usuarios por tier
-- ============================================================================

SELECT
  subscription_tier,
  COUNT(*) as total_users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM public.users
GROUP BY subscription_tier
ORDER BY total_users DESC;

-- ============================================================================
-- Alerta: Usuarios con mismatch (necesitan fix)
-- ============================================================================

SELECT
  u.email,
  u.subscription_tier as current_db_tier,
  a.raw_user_meta_data->>'plan' as current_metadata,
  '❌ NEEDS FIX' as action_required
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
  AND UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text;

-- Si esta query NO retorna filas = ✅ Todos los usuarios están sincronizados
