-- ============================================================================
-- SECURITY FIX: Prevent privilege escalation to ADMIN via signup metadata
-- ============================================================================
--
-- PROBLEM:
--   public.sync_user_from_auth() derives public.users.role from
--   auth.users.raw_user_meta_data->>'role'. That metadata is controlled by the
--   client: anyone can call supabase.auth.signUp() with the public anon key and
--   `options.data.role = 'ADMIN'`, and the trigger inserts them as ADMIN.
--   Both versions in this repo are affected:
--     - 20251218_subscription_architecture_refactor.sql (explicit ADMIN branch)
--     - debug-trigger-plan-mapping.sql (casts any metadata role directly)
--
-- FIX (independent of which sync_user_from_auth version is deployed):
--   A BEFORE INSERT guard on public.users that never lets a new row be created
--   as ADMIN. Admins are only granted through an UPDATE (admin panel /
--   updateUserRoleAction or SQL by hand), which this guard does not touch.
--   The sync function's subscription/tier logic is intentionally left as-is.
--
-- EJECUTAR EN: Supabase SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_admin_on_user_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'ADMIN'::"UserRole" THEN
    RAISE WARNING '[SECURITY] Blocked ADMIN role on insert for user %, downgraded to CLIENT', NEW.id;
    NEW.role := 'CLIENT'::"UserRole";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS prevent_admin_on_user_insert ON public.users;

CREATE TRIGGER prevent_admin_on_user_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_on_user_insert();

-- ============================================================================
-- AUDIT: review existing ADMIN accounts (run manually, check each one is known)
-- ============================================================================
-- SELECT u.id, u.email, u.created_at, a.raw_user_meta_data->>'role' AS metadata_role
-- FROM public.users u
-- JOIN auth.users a ON a.id::text = u.id::text
-- WHERE u.role = 'ADMIN'
-- ORDER BY u.created_at;
