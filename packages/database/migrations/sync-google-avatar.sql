-- Migration: Sincronizar avatar de Google con tabla users
-- Descripción: Crea un trigger que automáticamente sincroniza el avatar_url
-- de auth.users.raw_user_meta_data con la tabla public.users
--
-- Esto permite que cuando un usuario inicia sesión con Google OAuth,
-- su foto de perfil se guarde automáticamente en la DB

-- 1. Crear función que sincroniza avatar y otros datos del usuario
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    avatar,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  -- Si el usuario ya existe, actualizar avatar y nombre
  ON CONFLICT (id) DO UPDATE SET
    avatar = COALESCE(
      EXCLUDED.avatar,
      public.users.avatar
    ),
    name = COALESCE(
      EXCLUDED.name,
      public.users.name
    ),
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Crear trigger que ejecuta la función cuando un usuario se crea o actualiza en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();

-- 3. Sincronizar usuarios existentes que ya tienen google auth
-- (este script solo sincroniza aquellos que aún no tienen avatar en la DB)
UPDATE public.users AS u
SET avatar = a.raw_user_meta_data->>'avatar_url'
FROM auth.users AS a
WHERE u.id = a.id
  AND a.raw_user_meta_data->>'avatar_url' IS NOT NULL
  AND u.avatar IS NULL;
