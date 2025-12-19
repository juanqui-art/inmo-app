# 🔧 Implementación: Trigger Solo INSERT (Solución Permanente)

**Issue:** BUG-001 - Subscription Tier se revierte después de login
**Fix:** Trigger solo en INSERT (NO en UPDATE)
**Status:** ✅ Listo para implementar
**Tiempo estimado:** 10 minutos
**Riesgo:** 🟢 Bajo (con rollback disponible)

---

## 📋 ¿Qué Hace Este Fix?

### Antes (Problema)
```
Usuario registrado → Trigger INSERT ejecuta → Tier = AGENT ✅
Usuario hace login → Trigger UPDATE ejecuta → Tier = FREE ❌ (sobrescribe desde metadata)
```

### Después (Solución)
```
Usuario registrado → Trigger INSERT ejecuta → Tier = AGENT ✅
Usuario hace login → Trigger NO ejecuta → Tier = AGENT ✅ (permanente)
```

**Ventajas:**
- ✅ Signup sigue funcionando igual
- ✅ Cambios manuales en tier son PERMANENTES
- ✅ Login NO sobrescribe el tier
- ✅ Server Actions siguen funcionando
- ✅ Simple y predecible

---

## 🚀 Implementación Paso a Paso

### Pre-requisitos

- [ ] Acceso a Supabase Dashboard (SQL Editor)
- [ ] Usuario de test con tier sincronizado (de la solución rápida anterior)
- [ ] Dev server apagado (para evitar errores durante migración)

---

### Paso 1: Backup del Trigger Actual (Seguridad)

Antes de hacer cambios, guarda el trigger actual por si necesitas rollback:

```sql
-- Ejecuta esto en Supabase SQL Editor
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%'
  AND event_object_table = 'users'
  AND event_object_schema = 'auth';
```

**Guarda el resultado** en un archivo de texto local.

Resultado esperado (ANTES del fix):
```
trigger_name                      | event_manipulation | action_statement
----------------------------------|--------------------|-----------------
on_auth_user_created_or_updated   | INSERT             | EXECUTE FUNCTION...
on_auth_user_created_or_updated   | UPDATE             | EXECUTE FUNCTION...
```

---

### Paso 2: Ejecutar la Migración

1. **Abre el archivo:**
   `packages/database/migrations/fix-trigger-insert-only.sql`

2. **Copia las líneas 21-30** (el script principal):

```sql
-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- Create NEW trigger (INSERT ONLY)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
```

3. **Pega en Supabase SQL Editor**

4. **Click "Run"** (botón verde)

5. **Verifica resultado:**
   - ✅ Debe decir: "Success. No rows returned"
   - ❌ Si hay error, VER sección Troubleshooting abajo

---

### Paso 3: Verificar el Trigger

```sql
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%'
  AND event_object_table = 'users'
  AND event_object_schema = 'auth';
```

**Resultado esperado (DESPUÉS del fix):**
```
trigger_name         | event_manipulation | action_statement
---------------------|--------------------|-----------------
on_auth_user_created | INSERT             | EXECUTE FUNCTION public.sync_user_from_auth()
```

**Verificaciones críticas:**
- ✅ Nombre del trigger cambió a `on_auth_user_created` (sin "_or_updated")
- ✅ Solo 1 fila retornada (antes eran 2: INSERT + UPDATE)
- ✅ `event_manipulation` dice **solo INSERT** (sin UPDATE)

---

### Paso 4: Testing Completo

#### Test 1: Login NO Sobrescribe Tier

1. **Estado inicial (verificar en Supabase):**
```sql
SELECT subscription_tier FROM public.users WHERE email = 'juancarlosquizhpipintado@gmail.com';
```
Debe retornar: `AGENT`

2. **Simular login (actualizar auth.users):**
```sql
UPDATE auth.users SET updated_at = now() WHERE email = 'juancarlosquizhpipintado@gmail.com';
```

3. **Verificar que NO cambió:**
```sql
SELECT subscription_tier FROM public.users WHERE email = 'juancarlosquizhpipintado@gmail.com';
```
✅ **Debe seguir siendo:** `AGENT` (NO revirtió a FREE)

---

#### Test 2: Signup Sigue Funcionando

**⚠️ IMPORTANTE:** Este test crea un usuario real. Usa un email temporal.

1. **Ir a la app:**
   ```bash
   bun run dev
   ```

2. **Navega a:** http://localhost:3000/vender

3. **Click en:** "Comenzar con Agente" (plan AGENT)

4. **Completa signup:**
   - Email: `test-trigger-signup@example.com`
   - Password: `testpass123`
   - Nombre: Test Trigger User

5. **Verificar en Supabase:**
```sql
SELECT
  u.email,
  u.subscription_tier,
  u.role,
  a.raw_user_meta_data->>'plan' as metadata
FROM public.users u
JOIN auth.users a ON a.id::text = u.id::text
WHERE u.email = 'test-trigger-signup@example.com';
```

**Resultado esperado:**
```
email                          | subscription_tier | role  | metadata
-------------------------------|-------------------|-------|----------
test-trigger-signup@...        | AGENT             | AGENT | agent
```

✅ **Si todo coincide:** El trigger INSERT funcionó correctamente.

6. **Cleanup (eliminar usuario de test):**
```sql
DELETE FROM auth.users WHERE email = 'test-trigger-signup@example.com';
DELETE FROM public.users WHERE email = 'test-trigger-signup@example.com';
```

---

#### Test 3: Cambios Manuales son Permanentes

1. **Cambiar tier manualmente:**
```sql
UPDATE public.users
SET subscription_tier = 'PRO'
WHERE email = 'juancarlosquizhpipintado@gmail.com';
```

2. **Hacer login/logout varias veces** en la app

3. **Verificar que NO revirtió:**
```sql
SELECT subscription_tier FROM public.users WHERE email = 'juancarlosquizhpipintado@gmail.com';
```
✅ **Debe seguir siendo:** `PRO`

---

### Paso 5: Resincronizar Metadata (Opcional)

Si tienes usuarios con tier correcto en DB pero metadata desactualizado:

```sql
-- Actualizar metadata para que coincida con DB
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
```

**Esto sincroniza todos los usuarios automáticamente.**

---

## ✅ Checklist Final

Después de la implementación, verifica:

- [ ] Trigger existe con nombre `on_auth_user_created`
- [ ] Trigger solo tiene evento INSERT (no UPDATE)
- [ ] Test 1 pasó: Login NO sobrescribe tier
- [ ] Test 2 pasó: Signup funciona correctamente
- [ ] Test 3 pasó: Cambios manuales son permanentes
- [ ] Usuario `juancarlosquizhpipintado@gmail.com` sigue con tier AGENT
- [ ] Metadata y DB están sincronizados (✅ SYNCED)

---

## 🚨 Troubleshooting

### Error: "trigger does not exist"

**Problema:** El trigger ya fue eliminado o nunca existió.

**Solución:** Verifica que la función existe:
```sql
SELECT proname FROM pg_proc WHERE proname = 'sync_user_from_auth';
```

Si NO existe, necesitas crear la función primero (ver `fix-subscription-tier-sync.sql`).

---

### Error: "permission denied"

**Problema:** Tu usuario de Supabase no tiene permisos para modificar triggers.

**Solución:** Ejecuta el SQL como **superuser** (postgres role en Supabase Dashboard).

---

### Signup falla después del fix

**Síntomas:** Error 500 al registrarse, usuario no se crea en public.users.

**Diagnóstico:**
```sql
-- Ver logs de errores de PostgreSQL
SELECT * FROM pg_stat_statements WHERE query LIKE '%sync_user_from_auth%' LIMIT 10;
```

**Solución común:** La función `sync_user_from_auth()` tiene errores. Verifica que existe:
```sql
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'sync_user_from_auth';
```

---

### Tier sigue revirtiéndose después del fix

**Diagnóstico:**
```sql
-- Verificar que el trigger NO está en UPDATE
SELECT event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Debe retornar solo:** `INSERT`

**Si retorna INSERT y UPDATE:** Re-ejecuta el DROP TRIGGER y CREATE TRIGGER.

---

## 🔄 Rollback Plan

Si algo sale mal y necesitas volver al comportamiento anterior:

```sql
-- Eliminar trigger INSERT-only
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Restaurar trigger INSERT OR UPDATE
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
```

**Verificar rollback:**
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%';
```

Debe mostrar 2 filas: INSERT + UPDATE

---

## 📊 Métricas de Éxito

Después de 24-48 horas en producción:

```sql
-- Verificar que NO hay desincronizaciones
SELECT COUNT(*) as mismatch_count
FROM public.users u
JOIN auth.users a ON a.id::text = u.id::text
WHERE a.raw_user_meta_data->>'plan' IS NOT NULL
  AND UPPER(a.raw_user_meta_data->>'plan') != u.subscription_tier::text;
```

**Meta:** `mismatch_count = 0`

---

## 🎯 Siguientes Pasos

Una vez que este fix esté funcionando en producción:

1. **Actualizar documentación:**
   - Marcar BUG-001 como ✅ RESUELTO
   - Actualizar `CLAUDE.md` con el nuevo comportamiento

2. **Comunicar al equipo:**
   - Los updates de tier deben hacerse via Server Actions
   - NO via updates directos en auth.users metadata

3. **Monitorear:**
   - Verificar logs de signup (sin errores)
   - Verificar que tiers permanecen estables

---

## 📎 Archivos Relacionados

- **Migración:** `packages/database/migrations/fix-trigger-insert-only.sql`
- **Bug Report:** `docs/bugs/SUBSCRIPTION_TIER_SIGNUP_BUG.md`
- **Solución Rápida:** `docs/bugs/SUBSCRIPTION_TIER_MANUAL_FIX.md`
- **Verificación:** `packages/database/migrations/verify-tier-sync.sql`

---

**Creado:** Diciembre 16, 2025
**Status:** ✅ Listo para implementar
**Estimación:** 10 minutos
**Riesgo:** 🟢 Bajo
