# ✅ SSOT Implementation - Verification Guide

**Última actualización:** Diciembre 16, 2025
**Propósito:** Verificar que la arquitectura SSOT está funcionando correctamente

---

## 🎯 Qué Vamos a Verificar

1. ✅ Trigger solo ejecuta en INSERT (no UPDATE)
2. ✅ Login NO sobrescribe tier
3. ✅ Cambios manuales son permanentes
4. ✅ tier-manager funciona correctamente
5. ✅ Código limpio (sin sincronización de metadata)

---

## 📋 Verificación Paso a Paso

### ✅ Paso 1: Verificar Trigger en Supabase

```sql
SELECT
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';
```

**Resultado esperado:**
```
trigger_name         | event_manipulation
---------------------|--------------------
on_auth_user_created | INSERT
```

**✅ Si ves solo INSERT:** Correcto
**❌ Si ves INSERT y UPDATE:** Ejecuta fix-trigger-insert-only.sql otra vez

---

### ✅ Paso 2: Verificar Tu Usuario de Test

```sql
SELECT
  u.id,
  u.email,
  u.subscription_tier as db_tier,
  u.role,
  a.raw_user_meta_data->>'plan' as metadata_plan,
  CASE
    WHEN UPPER(a.raw_user_meta_data->>'plan') = u.subscription_tier::text
      THEN '✅ SYNCED'
    ELSE '⚠️ DESYNC (esperado en SSOT)'
  END as status
FROM public.users u
JOIN auth.users a ON a.id::text = u.id::text
WHERE u.email = 'juancarlosquizhpipintado@gmail.com';
```

**Resultado esperado:**
```
db_tier | role  | metadata_plan | status
--------|-------|---------------|---------------------------
AGENT   | AGENT | agent         | ✅ SYNCED (o ⚠️ DESYNC)
```

**Nota:** Si ves `⚠️ DESYNC (esperado en SSOT)`, esto es NORMAL. El metadata puede estar desactualizado, pero NO importa porque solo leemos de `public.users`.

---

### ✅ Paso 3: Test de Login (NO Sobrescribe)

**SQL:**
```sql
-- 1. Ver tier actual
SELECT subscription_tier
FROM public.users
WHERE email = 'juancarlosquizhpipintado@gmail.com';
-- Resultado: AGENT

-- 2. Simular UPDATE en auth.users (lo que pasa en login)
UPDATE auth.users
SET updated_at = now()
WHERE email = 'juancarlosquizhpipintado@gmail.com';

-- 3. Verificar que NO cambió
SELECT subscription_tier
FROM public.users
WHERE email = 'juancarlosquizhpipintado@gmail.com';
-- Resultado esperado: AGENT (NO cambió)
```

**✅ PASS:** Si el tier sigue siendo AGENT
**❌ FAIL:** Si el tier cambió a FREE (trigger UPDATE sigue activo)

---

### ✅ Paso 4: Test de Cambio Manual (Permanente)

**SQL:**
```sql
-- 1. Cambiar a PRO
UPDATE public.users
SET subscription_tier = 'PRO'
WHERE email = 'juancarlosquizhpipintado@gmail.com';

-- 2. Simular 3 logins (UPDATE en auth.users)
UPDATE auth.users SET updated_at = now() WHERE email = 'juancarlosquizhpipintado@gmail.com';
UPDATE auth.users SET updated_at = now() WHERE email = 'juancarlosquizhpipintado@gmail.com';
UPDATE auth.users SET updated_at = now() WHERE email = 'juancarlosquizhpipintado@gmail.com';

-- 3. Verificar que sigue siendo PRO
SELECT subscription_tier
FROM public.users
WHERE email = 'juancarlosquizhpipintado@gmail.com';
-- Resultado esperado: PRO
```

**✅ PASS:** Si el tier sigue siendo PRO después de los 3 updates
**❌ FAIL:** Si revirtió a FREE o AGENT

**Cleanup (volver a AGENT):**
```sql
UPDATE public.users
SET subscription_tier = 'AGENT'
WHERE email = 'juancarlosquizhpipintado@gmail.com';
```

---

### ✅ Paso 5: Test en la Aplicación

**Navegador:**

1. **Inicia dev server:**
   ```bash
   bun run dev
   ```

2. **Ve a:** http://localhost:3000

3. **Login/Logout varias veces:**
   - Email: `juancarlosquizhpipintado@gmail.com`
   - Haz logout
   - Vuelve a hacer login
   - Repite 3 veces

4. **Verificar tier en Dashboard:**
   - Ve a: http://localhost:3000/dashboard
   - Verifica el badge en navbar (debe decir "Agente" o "Pro")

5. **Verificar en DB:**
   ```sql
   SELECT subscription_tier
   FROM public.users
   WHERE email = 'juancarlosquizhpipintado@gmail.com';
   ```

**✅ PASS:** El tier NO cambió después de múltiples login/logout
**❌ FAIL:** El tier se revirtió a FREE

---

### ✅ Paso 6: Verificar Código (tier-manager)

**Comprobar que existe:**
```bash
ls -l apps/web/lib/subscription/tier-manager.ts
```

**Debe retornar:**
```
-rw-r--r--  1 user  staff  XXXX Dec 16 XX:XX tier-manager.ts
```

**✅ PASS:** Archivo existe
**❌ FAIL:** Archivo no encontrado → crear el archivo

---

### ✅ Paso 7: Type Check

```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app
bun run type-check
```

**Resultado esperado:**
```
✓ Type checking passed
```

**✅ PASS:** Sin errores de TypeScript
**❌ FAIL:** Errores de tipo → revisar imports en subscription.ts

---

## 📊 Checklist Completo

Marca cada item después de verificarlo:

### Database
- [ ] Trigger `on_auth_user_created` existe
- [ ] Trigger solo tiene evento INSERT (no UPDATE)
- [ ] Usuario test tiene tier AGENT en DB

### Funcionalidad
- [ ] Test de login NO sobrescribe (Paso 3)
- [ ] Test de cambio manual es permanente (Paso 4)
- [ ] Login/logout en app NO revierte tier (Paso 5)

### Código
- [ ] Archivo `tier-manager.ts` existe
- [ ] Imports de tier-manager en `subscription.ts` correctos
- [ ] Type check pasa sin errores
- [ ] auth.ts SIN sincronización de metadata (líneas 225-252)

### Documentación
- [ ] `SSOT_SUBSCRIPTION_ARCHITECTURE.md` leído
- [ ] Equipo informado del cambio arquitectural
- [ ] README actualizado (si es necesario)

---

## 🎉 Si Todos los Tests Pasan

**¡Felicidades!** La arquitectura SSOT está implementada correctamente.

**Beneficios que ahora tienes:**
- ✅ Sin bugs de sobrescritura de tier
- ✅ Cambios manuales permanentes
- ✅ Código más simple y predecible
- ✅ Single Source of Truth en `public.users`
- ✅ Metadata ignorado (como debe ser)

---

## 🚨 Si Algún Test Falla

### Test 1-2 Fallan (Trigger)

**Problema:** Trigger no está configurado correctamente

**Solución:**
```bash
# Re-ejecutar migración
# En Supabase SQL Editor:
# Copiar contenido de: packages/database/migrations/fix-trigger-insert-only.sql
# Ejecutar líneas 21-30
```

---

### Test 3-5 Fallan (Login Sobrescribe)

**Problema:** Trigger sigue ejecutándose en UPDATE

**Diagnóstico:**
```sql
SELECT event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Si ves UPDATE:** El trigger no se actualizó correctamente.

**Solución:**
```sql
DROP TRIGGER on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_auth();
```

---

### Test 6-7 Fallan (Código)

**Problema:** tier-manager no está importado correctamente

**Solución:**
```bash
# Verificar que el archivo existe
ls apps/web/lib/subscription/tier-manager.ts

# Reiniciar dev server
bun run dev
```

**Si sigue fallando:**
- Verifica que `subscription.ts` tenga: `import { setUserTier, promoteToAgent } from '@/lib/subscription/tier-manager';`
- Verifica que Next.js vio el archivo nuevo (restart dev server)

---

## 📈 Monitoreo Continuo

### Query para Dashboard (Opcional)

Crear vista en Supabase Dashboard:

```sql
CREATE OR REPLACE VIEW user_tier_health AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'FREE') as free_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'PLUS') as plus_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'AGENT') as agent_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'PRO') as pro_users,
  -- Metadata mismatch (esperado en SSOT, solo para info)
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM auth.users a
      WHERE a.id::text = users.id::text
      AND UPPER(a.raw_user_meta_data->>'plan') != users.subscription_tier::text
    )
  ) as metadata_desync_count
FROM public.users;
```

Consultar:
```sql
SELECT * FROM user_tier_health;
```

---

## 🔄 Siguiente Paso: Producción

Una vez que TODOS los tests pasen en desarrollo:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat(auth): implement SSOT architecture for subscription tiers"
   ```

2. **Deploy a staging** (si tienes)
3. **Re-verificar** en staging
4. **Deploy a producción**
5. **Monitorear** por 24-48h

---

**Creado:** Diciembre 16, 2025
**Última verificación:** [FECHA]
**Status:** ⏳ Pendiente de verificación
