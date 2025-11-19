# Fix: Sincronización de Roles (Auth Metadata ↔ DB)

> **Fecha:** 2025-11-19
> **Commit:** `2756ced`
> **Severidad:** Crítica
> **Estado:** Resuelto

---

## Problema

Los usuarios no podían acceder al dashboard a pesar de estar logueados correctamente.

### Síntomas

- Usuario AGENT redirigido constantemente a `/login` o `/perfil`
- Logs mostraban: `[SECURITY] missing_role` o `[SECURITY] role_mismatch`
- El usuario podía hacer login pero no acceder a rutas protegidas

---

## Causa Raíz

Desincronización entre las dos fuentes de verdad para roles:

| Ubicación | Descripción | Estado |
|-----------|-------------|--------|
| `auth.users.user_metadata.role` | Metadata de Supabase Auth | NULL o incorrecto |
| `public.users.role` | Tabla en PostgreSQL | Correcto |

### Por qué ocurría

1. **Trigger incompleto**: `sync_user_from_auth()` no incluía el campo `role` al crear usuarios
2. **Usuarios legacy**: Creados antes de implementar el guardado de rol en metadata
3. **Fix inverso**: El commit `d0e4a6b` sincronizaba en dirección incorrecta (DB → metadata)

### Flujo del bug

```
Usuario se registra como AGENT
  ├─ user_metadata.role = "AGENT" ✅ (del signup)
  └─ Trigger crea en DB sin rol
     └─ public.users.role = "CLIENT" ❌ (default)

Usuario hace login
  └─ Fix inverso sincroniza DB → metadata
     └─ user_metadata.role = "CLIENT" ❌

Usuario intenta acceder a /dashboard
  ├─ Proxy: metadata.role = "CLIENT" → Redirige a /perfil ❌
  └─ O: requireRole() → DB.role = "CLIENT" → Redirige ❌
```

---

## Solución Implementada

### 1. Trigger actualizado

**Archivo:** `packages/database/migrations/sync-google-avatar.sql`

```sql
INSERT INTO public.users (
  id, email, name, role, created_at, updated_at
)
VALUES (
  new.id,
  new.email,
  COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
  COALESCE(new.raw_user_meta_data->>'role', 'CLIENT')::"UserRole",
  now(),
  now()
)
```

### 2. Sincronización bidireccional en login

**Archivo:** `apps/web/app/actions/auth.ts`

```typescript
// Si metadata tiene rol pero DB no coincide → metadata gana
if (metadataRole && metadataRole !== dbUser.role) {
  await userRepository.update(dbUser.id, { role: metadataRole });
  dbUser.role = metadataRole;
}

// Si DB tiene rol pero metadata está vacío → DB gana (usuarios legacy)
else if (!metadataRole && dbUser.role) {
  await supabase.auth.updateUser({
    data: { role: dbUser.role }
  });
}
```

### 3. Script de corrección para usuarios existentes

**Archivo:** `packages/database/migrations/fix-user-roles-sync.sql`

---

## Diagnóstico

### Query para verificar estado de usuarios

```sql
SELECT
  a.id,
  a.email,
  a.raw_user_meta_data->>'role' as metadata_role,
  u.role as db_role,
  CASE
    WHEN a.raw_user_meta_data->>'role' IS NULL THEN 'SIN METADATA'
    WHEN a.raw_user_meta_data->>'role' = u.role::text THEN 'SINCRONIZADO'
    ELSE 'DESINCRONIZADO'
  END as status
FROM auth.users a
LEFT JOIN public.users u ON a.id::text = u.id::text
ORDER BY a.created_at DESC;
```

### Fix manual para usuarios legacy

```sql
-- Sincronizar metadata desde DB
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'AGENT')
WHERE id = 'USER_UUID_HERE';
```

---

## Arquitectura de Seguridad

El sistema usa **Defense in Depth** con 3 capas:

| Capa | Ubicación | Fuente de verdad | Propósito |
|------|-----------|------------------|-----------|
| 1 | `proxy.ts` | `user_metadata.role` | Primera línea - bloquea antes de cargar página |
| 2 | `requireRole()` | `public.users.role` | Segunda línea - valida en Server Component |
| 3 | `requireOwnership()` | DB | Tercera línea - valida en Server Actions |

**Importante:** Ambas fuentes deben estar sincronizadas para que el flujo funcione.

---

## Prevención

1. **Nuevos usuarios**: El trigger actualizado garantiza sincronización desde el inicio
2. **Login**: `loginAction` sincroniza automáticamente si detecta desincronización
3. **Monitoreo**: Los logs `[AUTH] Synced role...` indican correcciones automáticas

---

## Archivos Relacionados

- `apps/web/proxy.ts` - Primera capa de autorización
- `apps/web/lib/auth.ts` - Helpers de autenticación
- `apps/web/app/actions/auth.ts` - Server Actions de auth
- `packages/database/migrations/sync-google-avatar.sql` - Trigger de sincronización
- `docs/authorization/PERMISSIONS_MATRIX.md` - Matriz de permisos completa

---

## Referencias

- Commit del fix: `2756ced`
- Commit de seguridad centralizada: `283bc73`
- Issue original: Loop de redirección para agentes
