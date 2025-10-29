# Environment Variables - Quick Start

Setup rápido de variables de entorno en 5 minutos ⚡

## 1️⃣ Copia el Template

```bash
cp apps/web/.env.example apps/web/.env.local
```

## 2️⃣ Obtén tus Credenciales de Supabase

1. Ve a https://app.supabase.com/
2. Selecciona tu proyecto
3. Settings > API
4. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

5. Settings > Database > Connection String
   - Copia **URI** (Transaction Mode) → `DATABASE_URL`
   - Copia **URI** (Session pooler) y cambia host a `db.*.supabase.co` → `DIRECT_URL`

## 3️⃣ Edita .env.local

```bash
nano apps/web/.env.local  # o tu editor favorito
```

Pega los valores:

```bash
# ==================== SUPABASE ====================
NEXT_PUBLIC_SUPABASE_URL="https://pexsmszavuffgdamwrlj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi..."

# ==================== DATABASE ====================
DATABASE_URL="postgresql://postgres.pexsmszavuffgdamwrlj:PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.pexsmszavuffgdamwrlj:PASSWORD@db.pexsmszavuffgdamwrlj.supabase.co:5432/postgres"

# ==================== MAPS (Opcional) ====================
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijoi..."
```

## 4️⃣ Reinicia el Dev Server

```bash
# Mata el servidor actual
pkill -f "next dev"

# Inicia uno nuevo
bun run dev
```

## 5️⃣ Verifica que Funciona

```bash
# TypeScript debe pasar sin errores
bun run type-check

# La app debe cargar en http://localhost:3000 sin errores 500
```

---

## ✅ Checklist Rápido

- [ ] `.env.local` está en `apps/web/` (NO en raíz)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está completo (incluye https://)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` es un JWT válido
- [ ] `DATABASE_URL` usa puerto **6543** (Transaction Mode)
- [ ] `DIRECT_URL` usa puerto **5432** (Connection directa a db.)
- [ ] `DIRECT_URL` tiene host `db.*.supabase.co` (NO `.pooler.supabase.com`)
- [ ] Dev server reiniciado después de crear `.env.local`
- [ ] Sin errores "Invalid environment variables"

---

## 🚨 Errores Comunes

### "Invalid environment variables"
→ Una variable está mal o falta. Verifica que todas estén presentes y sin espacios.

### "Cannot connect to database"
→ `DATABASE_URL` está incorrecto. Verifica puerto 6543 y parámetro `pgbouncer=true`

### "DIRECT_URL" errors en migraciones
→ `DIRECT_URL` debe ser `db.*.supabase.co`, no `.pooler.supabase.com`

### Las variables no se cargan
→ Asegúrate que `.env.local` está en `apps/web/`, no en la raíz.

---

## 📚 Documentación Completa

Para más detalles, ver:
- `docs/ENVIRONMENT_VARIABLES.md` - Guía completa
- `CLAUDE.md` - Contexto del proyecto
- `packages/env/README.md` - Documentación del paquete
