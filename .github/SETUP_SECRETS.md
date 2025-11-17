# GitHub Actions - Configuración de Secretos

Este documento contiene las instrucciones paso a paso para configurar los secretos necesarios para que el workflow de CI/CD funcione correctamente.

---

## Ubicación de los Secretos

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret** para cada secreto

---

## Secretos Requeridos

### 1. Supabase (REQUERIDO para builds)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Descripción:** URL de tu proyecto de Supabase
- **Formato:** `https://xxxxxxxxxxxx.supabase.co`
- **Dónde encontrarlo:** Supabase Dashboard → Settings → API → Project URL

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Descripción:** API Key pública de Supabase
- **Formato:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (muy largo)
- **Dónde encontrarlo:** Supabase Dashboard → Settings → API → Project API Keys → `anon` `public`

---

### 2. Base de Datos (REQUERIDO para builds)

#### `DATABASE_URL`
- **Descripción:** Connection string del pooler de Supabase (Transaction Mode)
- **Formato:** `postgresql://postgres.xxxx:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Dónde encontrarlo:** Supabase Dashboard → Settings → Database → Connection String → Transaction Mode

⚠️ **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con tu contraseña real de la base de datos.

#### `DIRECT_URL`
- **Descripción:** Connection string directo de Supabase (para migraciones)
- **Formato:** `postgresql://postgres.xxxx:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres`
- **Dónde encontrarlo:** Supabase Dashboard → Settings → Database → Connection String → Direct Connection

⚠️ **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con tu contraseña real de la base de datos.

---

### 3. Mapbox (REQUERIDO para builds)

#### `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Descripción:** Token de acceso público de Mapbox
- **Formato:** `pk.eyJ1Ijoic...` (empieza con `pk.`)
- **Dónde encontrarlo:**
  1. Ve a https://account.mapbox.com/
  2. Click en **Tokens**
  3. Usa tu token existente o crea uno nuevo

---

### 4. Turborepo Remote Cache (OPCIONAL - mejora velocidad)

#### `TURBO_TOKEN`
- **Descripción:** Token para Turborepo Remote Caching
- **Dónde obtenerlo:**
  1. Ve a https://vercel.com
  2. Settings → Tokens
  3. Create new token

#### `TURBO_TEAM`
- **Descripción:** ID de tu equipo en Vercel/Turbo
- **Dónde obtenerlo:**
  1. En Vercel Dashboard
  2. Settings → General → Team ID
  3. O ejecuta: `npx turbo login` → `npx turbo link`

**Nota:** Estos secretos son opcionales. Sin ellos, el CI funcionará pero será más lento porque no usará cache compartido.

---

### 5. Codecov (OPCIONAL - para coverage reports)

#### `CODECOV_TOKEN`
- **Descripción:** Token para subir reportes de cobertura
- **Dónde obtenerlo:**
  1. Ve a https://codecov.io
  2. Conecta tu repositorio
  3. Settings → Codecov Token

**Nota:** Este secreto es opcional. Solo necesario si quieres trackear coverage en Codecov.

---

## Verificación de Secretos

Una vez agregados todos los secretos requeridos, deberías tener:

**Mínimos (REQUERIDOS):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `DATABASE_URL`
- ✅ `DIRECT_URL`
- ✅ `NEXT_PUBLIC_MAPBOX_TOKEN`

**Opcionales (para optimización):**
- 🔲 `TURBO_TOKEN`
- 🔲 `TURBO_TEAM`
- 🔲 `CODECOV_TOKEN`

---

## Probar la Configuración

1. **Push a cualquier branch:**
   ```bash
   git add .
   git commit -m "test: configure GitHub Actions"
   git push
   ```

2. **Verifica el workflow:**
   - Ve a tu repositorio en GitHub
   - Click en la pestaña **Actions**
   - Deberías ver el workflow "CI - Quality Checks" ejecutándose

3. **Si falla:**
   - Click en el workflow que falló
   - Click en el job "Code Quality Checks"
   - Revisa el step que falló
   - Verifica que los secretos estén correctamente configurados

---

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Causa:** Secreto no configurado o nombre incorrecto

**Solución:**
1. Ve a Settings → Secrets and variables → Actions
2. Verifica que el secreto existe y el nombre es **exactamente** `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)
3. Verifica que el valor comience con `https://`

### Error: "Invalid DATABASE_URL"

**Causa:** Connection string malformado o contraseña incorrecta

**Solución:**
1. Verifica que incluiste la contraseña en el connection string
2. Verifica que el formato sea: `postgresql://postgres.xxxx:[PASSWORD]@...`
3. Asegúrate de usar el pooler URL (puerto 6543) para `DATABASE_URL`

### Error: "Prisma Client not found"

**Causa:** Step de `prisma generate` no se ejecutó

**Solución:**
- El workflow ya incluye el step "Generate Prisma Client"
- Verifica que el workflow esté actualizado con la última versión de `ci.yml`

---

## Seguridad

⚠️ **NUNCA:**
- Commitees secretos en el código
- Compartas secretos en issues públicos
- Uses secretos de producción en desarrollo local

✅ **SIEMPRE:**
- Usa GitHub Secrets para valores sensibles
- Rota secretos periódicamente
- Usa diferentes credenciales para CI vs producción (cuando sea posible)

---

## Recursos Adicionales

- **GitHub Secrets Docs:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Supabase Connection Strings:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Turborepo Remote Cache:** https://turbo.build/repo/docs/core-concepts/remote-caching

---

**Última actualización:** 17 de noviembre, 2025
