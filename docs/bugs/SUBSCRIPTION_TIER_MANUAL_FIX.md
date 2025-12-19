# 🔧 Solución Rápida: Sincronizar Subscription Tier Manualmente

**Issue:** BUG-001 (Tier se revierte a FREE después de cambios manuales)
**Status:** ✅ Solución rápida disponible
**Tiempo estimado:** 2 minutos

---

## 📋 Instrucciones Paso a Paso

### 1️⃣ Abrir Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto InmoApp
3. En el menú lateral, click en **SQL Editor**

---

### 2️⃣ Ejecutar el Hotfix SQL

1. Abre el archivo: `packages/database/migrations/hotfix-sync-tier-metadata.sql`

2. **Edita las siguientes líneas** con los datos de tu usuario de test:

   ```sql
   -- Línea 17: Reemplaza el email
   WHERE email = 'tu-usuario-test@example.com';  -- ← CAMBIAR AQUÍ

   -- Línea 15: Elige el tier que necesites
   SET subscription_tier = 'AGENT'  -- ← FREE, PLUS, AGENT, o PRO

   -- Línea 26: IMPORTANTE - Metadata debe estar en lowercase
   '"agent"'  -- ← "free", "plus", "agent", o "pro"

   -- Línea 30: Reemplaza el email (otra vez)
   WHERE email = 'tu-usuario-test@example.com';  -- ← CAMBIAR AQUÍ

   -- Línea 52: Reemplaza el email (verificación)
   WHERE u.email = 'tu-usuario-test@example.com';  -- ← CAMBIAR AQUÍ
   ```

3. **Copia todo el contenido** del archivo

4. **Pega en el SQL Editor** de Supabase

5. Click en **"Run"** (botón verde en la esquina inferior derecha)

---

### 3️⃣ Verificar Resultado

Después de ejecutar, deberías ver algo como:

```
✅ Query executed successfully

Results (última query - verificación):

id                                  | email                    | db_tier | metadata_plan | status
------------------------------------|--------------------------|---------|---------------|----------
a1b2c3d4-e5f6-7890-abcd-1234567890ab| tu-usuario-test@...     | AGENT   | agent         | ✅ SYNCED
```

**Si ves `✅ SYNCED`:** ¡Perfecto! El tier está sincronizado y NO se revertirá.

**Si ves `❌ MISMATCH`:** Revisa que el tier en metadata esté en **lowercase** con comillas dobles.

---

### 4️⃣ Probar el Fix

1. **Cierra sesión** en tu app: http://localhost:3000
2. **Inicia sesión** con el usuario que actualizaste
3. Ve al dashboard: http://localhost:3000/dashboard
4. **Verifica el tier:**
   - Navbar debería mostrar el badge del tier correcto (ej: "Agente")
   - Límites de propiedades deberían reflejar el tier (AGENT = 10 propiedades)

5. **Verifica en la DB otra vez:**
   ```sql
   SELECT subscription_tier FROM public.users WHERE email = 'tu-usuario-test@example.com';
   ```
   Debería seguir siendo `AGENT` (o el tier que configuraste)

---

## 🎯 Mapeo de Tiers (Referencia Rápida)

| Tier  | DB (`subscription_tier`) | Metadata (`plan`) | Límite Propiedades |
|-------|--------------------------|-------------------|---------------------|
| FREE  | `'FREE'`                 | `'"free"'`        | 1 propiedad         |
| PLUS  | `'PLUS'`                 | `'"plus"'`        | 3 propiedades       |
| AGENT | `'AGENT'`                | `'"agent"'`       | 10 propiedades      |
| PRO   | `'PRO'`                  | `'"pro"'`         | 20 propiedades      |

⚠️ **IMPORTANTE:**
- DB tier: **UPPERCASE** sin comillas externas (`'AGENT'`)
- Metadata: **lowercase** con comillas dobles (`'"agent"'`)

---

## 🔄 Cambiar Tier de Múltiples Usuarios

Si necesitas actualizar varios usuarios, usa este script:

```sql
-- Actualizar múltiples usuarios a PLUS
WITH users_to_update AS (
  SELECT id, email
  FROM public.users
  WHERE email IN (
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  )
)
-- Update DB tier
UPDATE public.users u
SET subscription_tier = 'PLUS'
FROM users_to_update utu
WHERE u.id = utu.id;

-- Update metadata
UPDATE auth.users a
SET raw_user_meta_data = jsonb_set(
  COALESCE(a.raw_user_meta_data, '{}'::jsonb),
  '{plan}',
  '"plus"'
)
FROM users_to_update utu
WHERE a.id = utu.id;

-- Verify all
SELECT
  u.email,
  u.subscription_tier,
  a.raw_user_meta_data->>'plan' as metadata,
  CASE WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text THEN '✅' ELSE '❌' END
FROM public.users u
JOIN auth.users a ON a.id = u.id
WHERE u.email IN ('user1@example.com', 'user2@example.com', 'user3@example.com');
```

---

## 🚨 Troubleshooting

### Problema: "relation 'auth.users' does not exist"
**Solución:** Estás ejecutando el SQL en el schema incorrecto. Asegúrate de estar en el SQL Editor de Supabase (no en Table Editor).

### Problema: Tier se sigue revirtiendo después del fix
**Diagnóstico:**
```sql
-- Ver el metadata completo
SELECT raw_user_meta_data
FROM auth.users
WHERE id = (SELECT id FROM public.users WHERE email = 'tu-email@example.com');
```

**Solución:** Verifica que el campo `plan` dentro de metadata esté exactamente como `"agent"` (con comillas dobles, lowercase).

### Problema: Usuario no puede crear más de 1 propiedad (sigue con límite FREE)
**Diagnóstico:**
```sql
SELECT id, email, subscription_tier FROM public.users WHERE email = 'tu-email@example.com';
```

**Solución:**
1. Si `subscription_tier` es `FREE`, re-ejecuta el UPDATE en `public.users`
2. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
3. Cierra sesión y vuelve a iniciar sesión

---

## 📊 Verificar Todos los Usuarios

Para ver el estado de sincronización de TODOS los usuarios:

```sql
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  CASE
    WHEN a.raw_user_meta_data->>'plan' IS NULL THEN '⚠️ NO METADATA'
    WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as status
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
ORDER BY u.created_at DESC
LIMIT 50;
```

---

## ⏭️ Siguiente Paso: Solución Permanente

Esta es una solución **temporal** para desbloquear tu testing.

**Para producción**, necesitarás implementar una de estas soluciones:

1. **Opción A (Recomendada):** Trigger solo en INSERT
   - Archivo: `packages/database/migrations/fix-trigger-insert-only.sql` (por crear)
   - Previene sobrescrituras automáticas

2. **Opción B:** Sincronización bidireccional en Server Actions
   - Modificar `upgradeSubscriptionAction` para actualizar metadata
   - Más complejo pero más robusto

**Consulta:** `docs/bugs/SUBSCRIPTION_TIER_SIGNUP_BUG.md` para detalles completos.

---

## 📝 Checklist

- [ ] Abrí Supabase SQL Editor
- [ ] Edité el archivo SQL con mi email y tier deseado
- [ ] Ejecuté el SQL (3 queries en total)
- [ ] Verifiqué que el status es `✅ SYNCED`
- [ ] Probé login/logout y el tier NO se revierte
- [ ] Verifiqué límites de propiedades en el dashboard

---

**Última actualización:** Diciembre 16, 2025
**Archivo SQL:** `packages/database/migrations/hotfix-sync-tier-metadata.sql`
**Issue relacionado:** BUG-001 - Subscription Tier Signup Bug
