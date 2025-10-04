# Prisma + Supabase Pooler Setup

## Problema
Error: `prepared statement "s1" does not exist`

**Causa:** Prisma no está configurado correctamente para usar el pooler de Supabase.

## Solución

### 1. Obtener URLs correctas desde Supabase Dashboard

Ir a: **Supabase Dashboard** → **Project Settings** → **Database** → **Connection String**

Necesitas **2 URLs diferentes**:

#### A) **Transaction pooler** (para queries en runtime)
- Selecciona: `Connection pooling` → `Transaction mode`
- Copia la URL (puerto 6543)
- Ejemplo: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres`

#### B) **Direct connection** (para migrations)
- Selecciona: `Direct connection` (no pooler)
- Copia la URL (puerto 5432, host diferente)
- Ejemplo: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

### 2. Configurar `.env`

```bash
# Transaction Pooler - Para runtime queries (agregar ?pgbouncer=true)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection - Para migrations (SIN pooler)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### 3. Schema Prisma (ya configurado)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooler con ?pgbouncer=true
  directUrl = env("DIRECT_URL")        // Direct sin pooler
}
```

### 4. Regenerar Prisma Client

```bash
cd packages/database
bunx prisma generate
```

### 5. Reiniciar dev server

```bash
bun run dev
```

## ¿Por qué esto funciona?

- **`?pgbouncer=true`**: Le dice a Prisma que está usando PgBouncer (pooler)
- **`connection_limit=1`**: Evita múltiples conexiones simultáneas
- **`directUrl`**: Prisma usa esta URL para migrations (no soportan pooler)
- **URL directa**: Debe ser `db.[PROJECT_REF].supabase.co:5432` (NO pooler)

## Troubleshooting

Si sigues teniendo el error:

1. **Verifica las URLs** en Supabase Dashboard
2. **Asegúrate** que DIRECT_URL NO tenga "pooler" en el host
3. **Regenera** Prisma Client: `bunx prisma generate`
4. **Reinicia** el dev server

## URLs Actuales (ACTUALIZAR ESTAS)

```bash
# ❌ INCORRECTO - DIRECT_URL apunta a pooler
DIRECT_URL="postgresql://...@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ✅ CORRECTO - DIRECT_URL apunta directo a DB
DIRECT_URL="postgresql://...@db.pexsmszavuffgdamwrlj.supabase.co:5432/postgres"
```

**ACCIÓN REQUERIDA:**
1. Ve a Supabase Dashboard
2. Copia la "Direct connection" URL
3. Actualiza DIRECT_URL en .env
4. Regenera Prisma Client
5. Reinicia servidor
