-- ============================================================================
-- DEBUG: Trigger Plan Mapping
-- ============================================================================
--
-- Este script agrega logging al trigger para ver qué está pasando
-- con el mapeo de plan → subscription_tier
--
-- EJECUTAR EN: Supabase SQL Editor
--
-- ============================================================================

-- Paso 1: Crear tabla de logs (si no existe)
CREATE TABLE IF NOT EXISTS public.trigger_debug_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  email TEXT,
  plan_value TEXT,
  tier_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Paso 2: Modificar función del trigger para agregar logging
CREATE OR REPLACE FUNCTION public.sync_user_from_auth()
RETURNS trigger AS $$
  DECLARE
    plan_value TEXT;
    tier_value "SubscriptionTier";
  BEGIN
    -- Get plan from metadata (can be null)
    plan_value := UPPER(COALESCE(new.raw_user_meta_data->>'plan', ''));

    -- Map plan to tier with legacy support (BASIC → PLUS)
    tier_value := CASE
      WHEN plan_value = '' OR plan_value IS NULL THEN 'FREE'::"SubscriptionTier"
      WHEN plan_value = 'FREE' THEN 'FREE'::"SubscriptionTier"
      WHEN plan_value = 'BASIC' THEN 'PLUS'::"SubscriptionTier"  -- Legacy mapping
      WHEN plan_value = 'PLUS' THEN 'PLUS'::"SubscriptionTier"
      WHEN plan_value = 'AGENT' THEN 'AGENT'::"SubscriptionTier"
      WHEN plan_value = 'PRO' THEN 'PRO'::"SubscriptionTier"
      ELSE 'FREE'::"SubscriptionTier"  -- Fallback for unknown values
    END;

    -- 🐛 DEBUG: Log el plan_value y tier_value
    INSERT INTO public.trigger_debug_logs (user_id, email, plan_value, tier_value, metadata)
    VALUES (
      new.id,
      new.email,
      plan_value,
      tier_value::text,
      new.raw_user_meta_data
    );

    INSERT INTO public.users (
      id,
      email,
      name,
      role,
      subscription_tier,
      created_at,
      updated_at
    )
    VALUES (
      new.id,
      new.email,
      -- Name: Use full_name or name from metadata, fallback to email
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        new.email
      ),
      -- Role: Use role from metadata, fallback to CLIENT
      COALESCE(
        new.raw_user_meta_data->>'role',
        'CLIENT'
      )::"UserRole",
      -- Subscription Tier: Use mapped tier value
      tier_value,
      now(),
      now()
    )
    -- If user already exists (re-authentication), update name and tier
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(
        EXCLUDED.name,
        public.users.name
      ),
      -- Only update subscription_tier if a new plan is provided
      subscription_tier = CASE
        WHEN new.raw_user_meta_data->>'plan' IS NOT NULL
        THEN tier_value
        ELSE public.users.subscription_tier
      END,
      updated_at = now();

    RETURN new;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Query para ver los logs después de crear un usuario
-- SELECT * FROM public.trigger_debug_logs ORDER BY created_at DESC LIMIT 10;
