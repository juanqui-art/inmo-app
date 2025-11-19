-- Migration: Sincronizar roles de usuarios existentes
-- Descripción: Corrige la desincronización de roles entre auth.users metadata y public.users
--
-- PROBLEMA: El trigger sync_user_from_auth() no incluía el campo 'role' al crear usuarios,
-- causando que todos los usuarios quedaran con role='CLIENT' por defecto.
--
-- SOLUCIÓN: Este script sincroniza el rol correcto desde user_metadata hacia public.users
--
-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor ANTES de aplicar el trigger actualizado

-- 1. Primero, ver qué usuarios están desincronizados (diagnóstico)
-- Ejecutar esto primero para ver el estado actual:
/*
SELECT
  a.id,
  a.email,
  a.raw_user_meta_data->>'role' as metadata_role,
  u.role as db_role,
  CASE
    WHEN a.raw_user_meta_data->>'role' IS NULL THEN '⚠️ SIN METADATA'
    WHEN a.raw_user_meta_data->>'role' = u.role::text THEN '✅ SINCRONIZADO'
    ELSE '❌ DESINCRONIZADO'
  END as status
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
ORDER BY a.created_at DESC;
*/

-- 2. Sincronizar roles desde metadata hacia public.users
-- Solo actualiza usuarios que tienen un rol en metadata diferente al de la DB
UPDATE public.users
SET
  role = (
    SELECT (a.raw_user_meta_data->>'role')::"UserRole"
    FROM auth.users a
    WHERE a.id = public.users.id
    AND a.raw_user_meta_data->>'role' IS NOT NULL
  ),
  updated_at = now()
WHERE id IN (
  SELECT a.id
  FROM auth.users a
  JOIN public.users u ON a.id = u.id
  WHERE a.raw_user_meta_data->>'role' IS NOT NULL
  AND a.raw_user_meta_data->>'role' != u.role::text
);

-- 3. Verificar el resultado después de la sincronización
-- Ejecutar esto para confirmar que todo está sincronizado:
/*
SELECT
  a.id,
  a.email,
  a.raw_user_meta_data->>'role' as metadata_role,
  u.role as db_role,
  CASE
    WHEN a.raw_user_meta_data->>'role' IS NULL THEN '⚠️ SIN METADATA'
    WHEN a.raw_user_meta_data->>'role' = u.role::text THEN '✅ SINCRONIZADO'
    ELSE '❌ DESINCRONIZADO'
  END as status
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
ORDER BY a.created_at DESC;
*/

-- 4. OPCIONAL: También actualizar el trigger para futuros usuarios
-- El archivo sync-google-avatar.sql ya fue actualizado con el campo 'role'
-- Para aplicarlo, ejecuta el contenido de ese archivo en Supabase SQL Editor
