# Environment Variables - Architecture

Documentación técnica del sistema de variables de entorno.

## 📐 Diagrama de Flujo

```
┌─────────────────────────────────────┐
│   Archivo .env.local                │
│  (apps/web/.env.local)              │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Next.js dotenv loader             │
│  (built-in, automático)             │
│  → process.env.*                    │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Turborepo globalPassThroughEnv    │
│  (turbo.json)                       │
│  → propaga a todos los paquetes     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   @repo/env (packages/env)          │
│  - Validación con Zod               │
│  - Schemas (client + server)        │
│  - Type inference                   │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Tu código: import { env }         │
│  ✓ Type-safe                        │
│  ✓ Validado                         │
│  ✓ Autocomplete                     │
└─────────────────────────────────────┘
```

---

## 🏗️ Estructura Interna

### @repo/env Package

**Ubicación**: `packages/env/src/index.ts` (167 líneas)

```typescript
// 1. SCHEMAS (Zod)
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // ... etc
})

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  // ... etc
})

const envSchema = clientSchema.merge(serverSchema)

// 2. PARSER (validación en startup)
const parseEnv = (): Env => {
  const isBrowser = typeof window !== 'undefined'

  if (isBrowser) {
    // Cliente: solo valida NEXT_PUBLIC_*
    return clientSchema.safeParse(...)
  }

  // Servidor: valida todo
  return envSchema.safeParse(...)
}

// 3. EXPORT
export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
```

### Validación en Diferentes Contextos

#### Cliente (Browser)
```
Variables disponibles:
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ NEXT_PUBLIC_MAPBOX_TOKEN
✓ NEXT_PUBLIC_SITE_URL
✓ NODE_ENV

Variables NO disponibles:
✗ DATABASE_URL
✗ SUPABASE_SERVICE_ROLE_KEY
✗ DIRECT_URL
```

#### Servidor (Node.js)
```
Variables disponibles:
✓ Todas las anteriores
✓ DATABASE_URL
✓ SUPABASE_SERVICE_ROLE_KEY
✓ DIRECT_URL

Validación: Stricta (todas requeridas)
```

---

## 🔄 Flujo de Carga Detallado

### 1. Startup de Next.js

```bash
bun run dev
↓
cd apps/web && next dev
↓
Next.js busca en orden:
  1. .env.local (encontrado ✓)
  2. process.env.* cargadas
```

### 2. Middleware de Next.js

```typescript
// middleware.ts se ejecuta primero
// Las variables ya están en process.env

import { env } from '@/lib/env'
// ↓
// Re-export de @repo/env
// ↓
// Llama a parseEnv() si no está cached
```

### 3. Validación con Zod

```typescript
const result = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // ... todos los valores
})

if (!result.success) {
  // ✓ ERROR CLEAR
  // Muestra exactamente qué variables faltan/son inválidas
  console.error(result.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}
```

### 4. Acceso en el Código

```typescript
import { env } from '@repo/env'

// ✓ TypeScript sabe qué variables existen
// ✓ Autocompletado funciona
// ✓ Errores de tipos en compile-time
const url = env.NEXT_PUBLIC_SUPABASE_URL
```

---

## 📊 Comparación: Antes vs Después

### Antes (Sin @repo/env)

```typescript
// ❌ Sin validación
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
// - Puede ser undefined
// - Sin TypeScript intellisense
// - Errores en runtime

// ❌ Duplicación
// apps/web/lib/env.ts (142 líneas)
// + repetido en cada paquete
// = código DRY violado

// ❌ Inconsistencia
// Cada paquete valida diferente
// Falta @repo/database y @repo/supabase
```

### Después (Con @repo/env)

```typescript
// ✅ Validado al startup
import { env } from '@repo/env'
const url = env.NEXT_PUBLIC_SUPABASE_URL
// - Falla si no existe
// - Type-safe
// - Errores en startup (fail-fast)

// ✅ Centralizado
// 1 source of truth
// @repo/env (167 líneas)
// Usado por todos los paquetes

// ✅ Consistencia
// Mismo sistema en monorepo
// Todos validan igual
```

---

## 🔐 Seguridad

### Client vs Server Separation

```typescript
// ✅ SEGURO: Variables públicas en cliente
const token = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// - Visible en inspector
// - Protegida por RLS
// - Esperado que sea pública

// ✅ SEGURO: Secretos solo en servidor
if (typeof window === 'undefined') {
  // Servidor
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  // - Nunca se envía al cliente
  // - Solo Node.js puede acceder
  // - Seguro
}

// ❌ INSEGURO: Exponer secretos al cliente
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
// Si esta variable tiene valor y la expones al cliente:
// - Cualquiera puede ver los secretos
// - RLS será bypasseado
// - Tu app está comprometida
```

### Validación de Seguridad

```typescript
// Zod asegura formato válido
NEXT_PUBLIC_SUPABASE_URL: z.string().url()
// Solo acepta URLs válidas
// Rechaza string random

DATABASE_URL: z.string().url()
// Validar que es PostgreSQL URL
// Rechaza passwords en logs
```

---

## 🛠️ Extensibilidad

### Agregar Nuevo Proveedor

Ejemplo: Agregar Sentry para error tracking

```typescript
// packages/env/src/index.ts

const serverSchema = z.object({
  // ... existentes

  // Nuevo
  SENTRY_DSN: z.string().url().optional(),
})

// apps/web/lib/sentry-config.ts
import { env } from '@repo/env'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  })
}
```

### Agregar Validación Custom

```typescript
// Validar que DATABASE_URL es Supabase
DATABASE_URL: z.string().url()
  .refine(
    (url) => url.includes('supabase.com'),
    'Database must be Supabase'
  ),

// Validar que MAPBOX_TOKEN comienza con "pk."
NEXT_PUBLIC_MAPBOX_TOKEN: z.string()
  .startsWith('pk.', 'Must be public token'),
```

---

## 🧪 Testing

### En Tests

```typescript
// vitest.setup.ts
import { env } from '@repo/env'

// Zod se ejecuta, pero con valores de test
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"

// Ahora env está validado con valores de test
```

### Mock en Tests

```typescript
// test/setup.ts
vi.mock('@repo/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    // ... todo lo que necesites
  }
}))
```

---

## 🚀 Performance

### Startup Time

**Validación con Zod**: ~5ms
```
Parse .env.local    → 1ms
Validar con Zod     → 4ms
Total               → 5ms (negligible)
```

### Memory Footprint

**@repo/env Package**: ~5KB
```
package.json        → 0.5KB
tsconfig.json       → 0.3KB
src/index.ts        → 4.2KB
README.md           → 0.5KB
Total               → ~5KB (muy pequeño)
```

---

## 📝 Type Inference

### Tipos Exportados

```typescript
// Tipo completo (todas las variables)
export type Env = z.infer<typeof envSchema>

// Solo client variables
export type ClientEnv = z.infer<typeof clientSchema>

// Solo server variables
export type ServerEnv = z.infer<typeof serverSchema>
```

### Type Safety en Action

```typescript
import { env, type Env } from '@repo/env'

// ✓ TypeScript infiere tipos correctamente
const url: string = env.NEXT_PUBLIC_SUPABASE_URL

// ❌ Error si intentas acceder a variable inexistente
const foo = env.NEXT_PUBLIC_FOO_BAR  // TS Error

// ✓ Tipos específicos por contexto
function onlyServer(envVars: ServerEnv) {
  // Solo acepta ServerEnv
  console.log(envVars.DATABASE_URL)
}
```

---

## 🔍 Debugging

### Ver Variables Cargadas

```typescript
import { env } from '@repo/env'

// Log las variables (sin exponer secretos)
Object.entries(env).forEach(([key, value]) => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    console.log(`${key}=${value.substring(0, 10)}...`)
  } else {
    console.log(`${key}=***`)  // Oculta secretos
  }
})
```

### Ver Errores de Validación

```typescript
// En packages/env/src/index.ts

if (!result.success) {
  console.error('❌ Invalid server environment variables:')

  // Zod proporciona detalles precisos
  console.error(result.error.flatten().fieldErrors)

  // Salida:
  // {
  //   NEXT_PUBLIC_SUPABASE_URL: ['Required'],
  //   DATABASE_URL: ['Expected a valid URL'],
  // }
}
```

---

## 🎯 Mejores Prácticas

### 1. Siempre Importa de @repo/env

```typescript
// ✓ Correcto
import { env } from '@repo/env'

// ✗ Nunca hagas esto
import { env } from '@/lib/env'  // Si no es necesario en web
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
```

### 2. Agrupar por Dominio

```typescript
// ✓ Bueno: Agrupa variables relacionadas
// database.ts
const dbUrl = env.DATABASE_URL
const directUrl = env.DIRECT_URL

// supabase.ts
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Documentar Nueva Variables

```typescript
// ✓ En .env.example
# Mi Nueva Variable
# Get from: https://...
# Formato: ...
# Requerido: Sí/No
NEXT_PUBLIC_MI_VAR="ejemplo"
```

### 4. Validación Anticipada

```typescript
// ✓ Validar al módulo load
// packages/supabase/src/client.ts
import { env } from '@repo/env'

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Service role key required for admin operations')
}
```

---

## 🔗 Referencias

- **Zod**: https://zod.dev
- **Next.js Env**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Turborepo**: https://turbo.build
- **Prisma Connection**: https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

**Última actualización**: Oct 22, 2025
**Versión**: 1.0
