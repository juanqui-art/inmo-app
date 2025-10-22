# Environment Variables Guide

Guía completa sobre el sistema de variables de entorno en InmoApp.

## 📋 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Arquitectura](#arquitectura)
3. [Variables Disponibles](#variables-disponibles)
4. [Configuración](#configuración)
5. [Uso en el Código](#uso-en-el-código)
6. [Agregar Nuevas Variables](#agregar-nuevas-variables)
7. [Troubleshooting](#troubleshooting)

---

## Conceptos Fundamentales

### ¿Qué son variables de entorno?

Las variables de entorno son valores de configuración que se inyectan en tu aplicación en tiempo de ejecución, permitiendo:

- **Seguridad**: Mantener credenciales fuera del código fuente
- **Flexibilidad**: Diferentes configuraciones por entorno (dev/prod/test)
- **Colaboración**: Cada desarrollador tiene sus propios valores
- **CI/CD**: Inyectarlas automáticamente en pipelines

### Principios de InmoApp

- **Type-Safe**: TypeScript sabe qué variables existen
- **Validated**: Zod valida TODOS los valores al startup
- **Fail-Fast**: La app no inicia si falta una variable requerida
- **Centralized**: Un único source of truth en `@repo/env`

---

## Arquitectura

### Flujo de Carga

```
Sistema Operativo / CI/CD (variables reales)
            ↓
    Archivos .env.local
            ↓
    Turborepo globalPassThroughEnv
            ↓
    @repo/env (validación con Zod)
            ↓
    Tu código (env.VARIABLE)
```

### Estructura de Paquetes

```
packages/env/
├── package.json              # Configuración del paquete
├── tsconfig.json             # TypeScript config
├── README.md                 # Documentación del paquete
└── src/
    └── index.ts              # Schemas + validación
                              # 167 líneas, ~5kb
```

### Tipos de Variables

**Client-side** (`NEXT_PUBLIC_*`):
- Expuestas al navegador
- Visibles en el inspector de desarrollo
- Para datos públicos y no-sensibles

**Server-side** (sin prefijo):
- Solo disponibles en servidor
- Nunca se envían al cliente
- Para credenciales y secretos

---

## Variables Disponibles

### Supabase

#### NEXT_PUBLIC_SUPABASE_URL
```bash
# Descripción: URL de tu proyecto Supabase
# Tipo: URL
# Requerido: Sí (client)
# Ejemplo: https://pexsmszavuffgdamwrlj.supabase.co

# Dónde obtener:
# 1. Dashboard de Supabase
# 2. Proyecto > Settings > API
# 3. Copiar "Project URL"
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```bash
# Descripción: Clave anónima de Supabase (segura para cliente)
# Tipo: JWT Token
# Requerido: Sí (client)
# Nota: Protegida por RLS (Row Level Security)

# Dónde obtener:
# 1. Dashboard de Supabase
# 2. Proyecto > Settings > API
# 3. Copiar "anon public" key (no la service_role)
```

#### SUPABASE_SERVICE_ROLE_KEY
```bash
# Descripción: Clave de admin (bypasea RLS)
# Tipo: JWT Token
# Requerido: No (pero algunos server actions la necesitan)
# ⚠️ PELIGRO: Nunca expongas esto al cliente

# Dónde obtener:
# 1. Dashboard de Supabase
# 2. Proyecto > Settings > API
# 3. Copiar "service_role" key
```

### Base de Datos

#### DATABASE_URL
```bash
# Descripción: Conexión a Supabase (Transaction Mode)
# Tipo: PostgreSQL connection string
# Requerido: Sí (server)
# Modo: Transaction Mode (mejor para Prisma + Serverless)
# Puerto: 6543

# Formato:
# postgresql://user.project:password@host:6543/postgres?pgbouncer=true

# Dónde obtener:
# 1. Dashboard de Supabase
# 2. Proyecto > Settings > Database
# 3. Connection String > URI (Transaction Mode)
```

**Parámetros importantes**:
```bash
?pgbouncer=true              # Usa PgBouncer (requerido para pooler)
&connection_limit=1          # Límite de conexiones
&pool_timeout=20             # Timeout del pool (20 segundos)
```

#### DIRECT_URL
```bash
# Descripción: Conexión directa a la base de datos (para migraciones)
# Tipo: PostgreSQL connection string
# Requerido: Sí (Prisma, solo para migrations)
# Modo: Session Mode (sin pooler)
# Puerto: 5432
# Host: db.*.supabase.co (NO el pooler)

# Formato:
# postgresql://user@db.project.supabase.co:5432/postgres

# ⚠️ CRÍTICO:
# - NO usar .pooler.supabase.com
# - Debe ser db.*.supabase.co
# - Sin parámetros pgbouncer
```

### Mapbox (Opcional)

#### NEXT_PUBLIC_MAPBOX_TOKEN
```bash
# Descripción: Token para renderizar mapas
# Tipo: Mapbox access token
# Requerido: No (solo si usas página /mapa)
# Formato: pk.xxxxx (comienza con "pk.")

# Dónde obtener:
# 1. https://account.mapbox.com/access-tokens/
# 2. Crear un nuevo token público
# 3. Copiar el token (debe comenzar con "pk.")
```

### Configuración del Sitio

#### NEXT_PUBLIC_SITE_URL
```bash
# Descripción: URL pública del sitio
# Tipo: URL
# Requerido: No (default: http://localhost:3000)
# Uso: Open Graph images, redirects después de auth

# Ejemplos:
# Development: http://localhost:3000
# Production: https://tudominio.com
```

### Node.js

#### NODE_ENV
```bash
# Descripción: Entorno de ejecución
# Tipo: Enum [development | production | test]
# Requerido: No (auto-detectado por Next.js)
# Default: development

# Auto-set por Next.js:
# - "development" cuando: bun run dev
# - "production" cuando: bun run build && bun run start
# - "test" cuando: bun run test

# ¡NO lo establzcas manualmente!
```

#### NEXT_TELEMETRY_DISABLED
```bash
# Descripción: Desactiva telemetría de Next.js
# Tipo: 0 o 1
# Requerido: No
# Value: 1

# Por qué desactivar:
# - Privacidad
# - Menos requests de red
# - Desarrollo más silencioso
```

---

## Configuración

### Estructura de Archivos

```
root/
├── .env.example                    ✅ Template público
│                                      (sin secretos, en Git)
│
├── .env.local                      ✅ Tus secretos reales
│                                      (en .gitignore, NO en Git)
│
├── .env.development.example        ✅ Template desarrollo
│                                      (referencia, en Git)
│
├── .env.production.example         ✅ Template producción
│                                      (referencia, en Git)
│
└── apps/web/
    ├── .env.local                  ✅ Secretos para Next.js
    │
    └── .env.example                ✅ Template específico app
```

### Orden de Carga (Next.js)

```
1. .env.local                    (máxima prioridad)
2. .env.development.local        (si NODE_ENV=development)
3. .env.development              (si NODE_ENV=development)
4. .env.production.local         (si NODE_ENV=production)
5. .env.production               (si NODE_ENV=production)
6. .env                          (mínima prioridad)
```

**Importante**: Next.js busca estos archivos en `apps/web/`, no en la raíz.

### Setup Inicial

1. **Copia el template**:
```bash
cp apps/web/.env.example apps/web/.env.local
```

2. **Edita con tus valores**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://tuproyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Database
DATABASE_URL="postgresql://postgres.tuproyecto:password@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres@db.tuproyecto.supabase.co:5432/postgres"

# Mapbox (opcional)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijoi..."
```

3. **Reinicia el dev server**:
```bash
bun run dev
```

4. **Verifica que funciona**:
```bash
bun run type-check   # Debe pasar sin errores
```

---

## Uso en el Código

### ✅ Forma Correcta (Validada)

```typescript
// Importa el módulo centralizado
import { env } from '@repo/env'

// Acceso type-safe
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const dbUrl = env.DATABASE_URL

// TypeScript sabe qué variables existen
// El autocompletado funciona perfectamente
```

### ❌ Forma Incorrecta (Sin validación)

```typescript
// Nunca hagas esto:
const url = process.env.NEXT_PUBLIC_SUPABASE_URL

// Problemas:
// - Sin validación en startup
// - Sin TypeScript autocomplete
// - Errores en runtime, no en startup
// - Puede ser undefined
```

### En Diferentes Contextos

#### Server Components
```typescript
// app/page.tsx
import { env } from '@repo/env'

export default async function HomePage() {
  // ✅ Puedes acceder a variables servidor
  const data = await fetch(`${env.DATABASE_URL}/api/data`, {
    // ...
  })

  return <div>{/* ... */}</div>
}
```

#### Server Actions
```typescript
// app/actions/create-property.ts
'use server'

import { env } from '@repo/env'

export async function createProperty(data: PropertyData) {
  // ✅ Acceso a todas las variables
  const response = await fetch(`${env.SUPABASE_URL}/api/...`, {
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  })

  return response.json()
}
```

#### Client Components
```typescript
// 'use client'
// components/map.tsx

import { env } from '@repo/env'

export function MapComponent() {
  // ✅ Solo puedes acceder a NEXT_PUBLIC_* variables
  return (
    <MapGL
      accessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
      // ...
    />
  )
}
```

#### Paquetes (@repo/supabase)
```typescript
// packages/supabase/src/client.ts

import { env } from '@repo/env'

export function createClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

---

## Agregar Nuevas Variables

### Paso 1: Actualizar el Schema

Edita `packages/env/src/index.ts`:

```typescript
const clientSchema = z.object({
  // ... existentes
  NEXT_PUBLIC_MI_NUEVA_VAR: z
    .string()
    .min(1, 'NEXT_PUBLIC_MI_NUEVA_VAR is required')
    .url('debe ser una URL válida'),  // validaciones personalizadas
})

const serverSchema = z.object({
  // ... existentes
  MI_VARIABLE_SERVIDOR: z
    .string()
    .min(1, 'MI_VARIABLE_SERVIDOR is required'),
})
```

### Paso 2: Documentar en .env.example

```bash
# ==================== MI SECCIÓN ====================

# Mi nueva variable
# Get from: https://miservicio.com/api-keys
NEXT_PUBLIC_MI_NUEVA_VAR="valor-default-si-existe"

# Mi variable servidor
# PELIGRO: Nunca expongas esto al cliente
MI_VARIABLE_SERVIDOR="valor-secreto"
```

### Paso 3: Agregar a .env.local

```bash
NEXT_PUBLIC_MI_NUEVA_VAR="https://miurl.com"
MI_VARIABLE_SERVIDOR="mi-clave-secreta-12345"
```

### Paso 4: Actualizar Turborepo (si es necesaria en paquetes)

Edita `turbo.json`:

```json
{
  "globalPassThroughEnv": [
    // ... existentes
    "NEXT_PUBLIC_MI_NUEVA_VAR",
    "MI_VARIABLE_SERVIDOR"
  ]
}
```

### Paso 5: Reiniciar el Dev Server

```bash
# Mata el servidor viejo
pkill -f "next dev"

# Inicia uno nuevo
bun run dev
```

### Paso 6: Usar en tu Código

```typescript
import { env } from '@repo/env'

console.log(env.NEXT_PUBLIC_MI_NUEVA_VAR)  // ✅ TypeScript lo valida
```

---

## Troubleshooting

### Error: "Invalid environment variables"

**Síntomas**:
```
Error: Invalid environment variables
  at parseEnv (../../packages/env/src/index.ts:149:11)
```

**Causas posibles**:

1. **Falta una variable requerida**
```bash
# Solución: Agrega la variable a .env.local
NEXT_PUBLIC_SUPABASE_URL="https://..."
```

2. **Formato incorrecto**
```bash
# ❌ Incorrecto (falta https://)
NEXT_PUBLIC_SUPABASE_URL="supabase.co"

# ✅ Correcto
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
```

3. **Variable vacía**
```bash
# ❌ Incorrecto
NEXT_PUBLIC_MAPBOX_TOKEN=""

# ✅ Correcto (o quitarla si es opcional)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijoi..."
```

**Solución**:
```bash
# Verifica que todas las REQUIRED están en .env.local
grep "REQUIRED" packages/env/src/index.ts

# Reinicia el dev server
bun run dev
```

---

### Error: "Cannot find module '@repo/env'"

**Síntomas**:
```
Cannot find module '@repo/env'
Did you mean to install a package?
```

**Causas**:
1. Nuevo paquete no está en `transpilePackages`
2. Dev server caché viejo

**Solución**:
```bash
# 1. Verifica next.config.ts
grep "transpilePackages" apps/web/next.config.ts

# Debe incluir "@repo/env"

# 2. Limpia el cache
rm -rf apps/web/.next

# 3. Reinicia
bun run dev
```

---

### Error: "DATABASE_URL must be a valid URL"

**Síntomas**:
```
DATABASE_URL must be a valid URL
```

**Causa**: URL malformada o con saltos de línea

**Solución**:
```bash
# ❌ Incorrecto (newlines)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?
  pgbouncer=true"

# ✅ Correcto (todo en una línea)
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
```

---

### Las variables no se cargan en la app

**Síntomas**:
- `env.NEXT_PUBLIC_SUPABASE_URL` es undefined
- Los valores no cambian aunque edites `.env.local`

**Causas**:
1. Archivo `.env.local` en lugar incorrecto
2. Dev server caché viejo
3. Múltiples instancias de dev server

**Solución**:
```bash
# 1. Asegúrate que el archivo está en apps/web/
ls -la apps/web/.env.local

# 2. Mata ALL instancias de dev server
pkill -9 -f "next dev"
pkill -9 -f "node.*next"

# 3. Limpia cache
rm -rf apps/web/.next

# 4. Reinicia
bun run dev
```

---

### "Este puerto está en uso"

**Síntomas**:
```
Port 3000 is in use, using port 3001 instead
```

**Solución**:
```bash
# 1. Encuentra qué procesa usa el puerto
lsof -i :3000

# 2. Mata el proceso viejo
kill -9 <PID>

# 3. Reinicia
bun run dev
```

---

## Referencia Rápida

### Checklist de Setup

- [ ] Copié `.env.example` a `apps/web/.env.local`
- [ ] Agregué `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Agregué `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Agregué `DATABASE_URL` (Transaction Mode, puerto 6543)
- [ ] Agregué `DIRECT_URL` (Connection directa, puerto 5432)
- [ ] Agregué `SUPABASE_SERVICE_ROLE_KEY` (si lo necesito)
- [ ] Agregué `NEXT_PUBLIC_MAPBOX_TOKEN` (si uso mapas)
- [ ] Reinicié el dev server (`bun run dev`)
- [ ] `bun run type-check` pasa sin errores

### Imports Frecuentes

```typescript
// La única forma correcta
import { env } from '@repo/env'

// Luego:
env.NEXT_PUBLIC_SUPABASE_URL
env.DATABASE_URL
env.NODE_ENV
// ... etc
```

### Variables Más Usadas

```typescript
// Supabase en cliente
env.NEXT_PUBLIC_SUPABASE_URL
env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Supabase en servidor
env.SUPABASE_SERVICE_ROLE_KEY

// Base de datos
env.DATABASE_URL
env.DIRECT_URL

// Entorno
env.NODE_ENV
```

---

## Recursos Adicionales

- **@repo/env**: `packages/env/README.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Env Vars**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Zod Validation**: https://zod.dev
- **Prisma Connection**: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

---

**Última actualización**: Oct 22, 2025
**Versión**: 1.0 (con @repo/env)
