-- Migration: Sincronizar usuario desde auth.users
-- Descripción: Crea un trigger que automáticamente sincroniza datos del usuario
-- de auth.users hacia public.users (email, name, role)
--
-- Esto permite que cuando un usuario se registra, sus datos se sincronicen
-- automáticamente con la tabla public.users

-- 1. Crear función que sincroniza rol y otros datos del usuario
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
  -- Si el usuario ya existe, actualizar nombre (NO el rol para evitar sobrescrituras accidentales)
  ON CONFLICT (id) DO UPDATE SET
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

-- 3. Nota: La sincronización de avatares fue removida intencionalmente
-- Si necesitas sincronizar avatares, hazlo manualmente en Supabase
