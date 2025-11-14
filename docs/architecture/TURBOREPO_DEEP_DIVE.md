# Turborepo en InmoApp - Guía Completa

> Documentación exhaustiva sobre cómo Turborepo orquesta el monorepo de InmoApp

**Última actualización:** Noviembre 2025
**Versión Turborepo:** 2.6.1
**Stack:** Turborepo + Bun + Next.js 16 + Turbopack

---

## Tabla de Contenidos

1. [¿Qué es Turborepo?](#qué-es-turborepo)
2. [Arquitectura del Monorepo](#arquitectura-del-monorepo)
3. [Configuración (`turbo.json`)](#configuración-turbojson)
4. [Pipeline de Tareas](#pipeline-de-tareas)
5. [Sistema de Caché](#sistema-de-caché)
6. [Flujos de Ejecución](#flujos-de-ejecución)
7. [Variables de Entorno](#variables-de-entorno)
8. [Optimizaciones Implementadas](#optimizaciones-implementadas)
9. [Troubleshooting](#troubleshooting)
10. [Mejores Prácticas](#mejores-prácticas)

---

## ¿Qué es Turborepo?

**Turborepo** es un sistema de compilación de alto rendimiento para monorepos JavaScript/TypeScript construido en **Go** y mantenido por **Vercel**.

### Objetivo Principal

Hacer que los builds y tareas en monorepos sean **más rápidos** mediante:
- **Caché inteligente** basado en contenido (no timestamps)
- **Ejecución paralela** aprovechando múltiples cores
- **Configuración declarativa** simple

### Conceptos Clave

#### 1. Smart Caching (Caché Inteligente)
- Turborepo calcula un **hash** del contenido de tus archivos
- Si los inputs no cambiaron → **recupera resultado del caché** (instantáneo)
- Si cambiaron → ejecuta la tarea y cachea el resultado

**Ejemplo:**
```bash
# Primera ejecución
turbo run build  # 45 segundos

# Sin cambios, segunda ejecución
turbo run build  # 0.5 segundos >>> FULL TURBO ⚡
```

#### 2. Parallel Execution (Ejecución Paralela)
- Analiza el **grafo de dependencias** entre tareas
- Ejecuta tareas independientes **en paralelo**
- Respeta el orden cuando hay dependencias

**Ejemplo:**
```
Task Graph:
  @repo/ui#build ────┐
                     ├──> Ejecutan en paralelo
  @repo/env#build ───┘
           ↓
  @repo/web#build ──> Espera a que terminen dependencies
```

#### 3. Configuration as Code
- Archivo `turbo.json` define todo el pipeline
- Declarativo, versionado en Git
- Fácil de auditar y modificar

---

## Arquitectura del Monorepo

### Estructura de InmoApp

```
inmo-app/
├── apps/
│   └── web/                    # Next.js 16 application (@repo/web)
│       ├── app/               # App Router
│       ├── components/        # React components
│       ├── lib/              # Utils, validations
│       └── package.json      # Scripts: dev, build, lint, type-check
│
├── packages/
│   ├── database/             # Prisma + Repositories (@repo/database)
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   ├── src/
│   │   │   ├── repositories/ # Data access layer
│   │   │   └── index.ts
│   │   └── package.json      # Scripts: db:generate, db:push, db:migrate
│   │
│   ├── env/                  # Environment variables validation (@repo/env)
│   │   ├── src/index.ts      # Zod schemas
│   │   └── package.json
│   │
│   ├── supabase/             # Supabase clients (@repo/supabase)
│   │   ├── src/
│   │   │   ├── client.ts     # Browser client
│   │   │   └── server.ts     # Server client
│   │   └── package.json
│   │
│   ├── ui/                   # Shared UI components (@repo/ui)
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── typescript-config/    # TypeScript configurations (@repo/typescript-config)
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
│
├── package.json              # Root orchestrator (Bun workspaces)
└── turbo.json               # Turborepo configuration
```

### Grafo de Dependencias

```
@repo/web (apps/web)
├─> @repo/database (Prisma + repositories)
├─> @repo/supabase (Supabase clients)
├─> @repo/ui (Shared components)
├─> @repo/env (Environment validation)
└─> @repo/typescript-config (TS configs)

@repo/database
└─> @repo/env

@repo/supabase
└─> @repo/env

@repo/ui
└─> @repo/typescript-config
```

### Workspaces Configuration

En `package.json` raíz:
```json
{
  "packageManager": "bun@1.2.23",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Significado:**
- Bun maneja la instalación de dependencias
- Todos los paquetes en `apps/` y `packages/` son parte del monorepo
- Pueden referenciarse entre sí con `workspace:*`

**Ejemplo de uso:**
```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/database": "workspace:*"  // Usa versión local
  }
}
```

---

## Configuración (`turbo.json`)

### Archivo Completo Analizado

```json
{
  "$schema": "https://turbo.build/schema.json",

  // Variables globales disponibles para todas las tareas
  "globalPassThroughEnv": [
    "FORCE_COLOR",          // Colorización de terminal
    "TERM",                 // Tipo de terminal
    "NODE_ENV",             // Entorno (development/production)
    "DATABASE_URL",         // Supabase pooler (puerto 6543)
    "DIRECT_URL",           // Supabase directo (puerto 5432)
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_MAPBOX_TOKEN",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_TELEMETRY_DISABLED",
    "CI",                   // Detección de CI/CD
    "VERCEL",               // Detección de Vercel
    "VERCEL_ENV",           // Entorno Vercel
    "TURBO_FORCE",          // Forzar re-ejecución
    "TURBO_TEAM",           // Remote cache team
    "TURBO_TOKEN"           // Remote cache token
  ],

  "tasks": {
    // Desarrollo local
    "dev": {
      "cache": false,       // No cachear (proceso interactivo)
      "persistent": true,   // Proceso de larga duración (dev server)
      "dependsOn": ["@repo/database#db:generate"]  // Genera Prisma primero
    },

    // Build de producción
    "build": {
      "dependsOn": [
        "^build",           // Construir dependencies primero (símbolo ^)
        "@repo/database#db:generate"  // Generar Prisma
      ],
      "env": ["NODE_ENV"],  // Hash incluye NODE_ENV
      "outputs": [
        ".next/**",         // Next.js output
        "dist/**"           // Build genérico
      ]
    },

    // Generación de cliente Prisma
    "@repo/database#db:generate": {
      "cache": true,        // Cachear resultados
      "inputs": [
        "prisma/schema.prisma"  // Solo regenerar si schema cambia
      ],
      "outputs": [
        "../../node_modules/.prisma/**",  // Cliente generado
        "src/generated/**"                // Types generados
      ]
    },

    // Linting (Biome)
    "lint": {
      "cache": true,
      "outputs": []         // No genera archivos
    },

    // Validación TypeScript
    "type-check": {
      "cache": true,
      "dependsOn": ["@repo/database#db:generate"],  // Necesita tipos Prisma
      "outputs": []
    },

    // Formateo (Biome)
    "format": {
      "cache": false,       // No cachear (modifica archivos)
      "outputs": []
    }
  }
}
```

### Propiedades Clave

#### `globalPassThroughEnv`
Variables de entorno que se pasan automáticamente a TODAS las tareas.

**Por qué es importante:**
- Sin esto, Turborepo no ve las variables de entorno
- Cada tarea necesita acceso a DB, Supabase, etc.
- Evita repetir `"env": [...]` en cada tarea

#### `tasks`
Define el pipeline completo de tareas disponibles.

#### `dependsOn`
Especifica dependencias entre tareas.

**Símbolos especiales:**
- `"^build"` → Ejecutar `build` en todas las **dependencies** primero
- `"build"` → Ejecutar `build` de este mismo paquete (si existe)
- `"@repo/database#db:generate"` → Tarea específica de un paquete

#### `inputs`
Archivos que afectan el resultado de la tarea.

**Ejemplo:**
```json
"inputs": ["src/**", "package.json", "tsconfig.json"]
```

**Efecto:**
- Turborepo calcula hash solo de estos archivos
- Si cambias `README.md` → NO invalida caché
- Si cambias `src/index.ts` → SÍ invalida caché

#### `outputs`
Archivos/directorios que la tarea genera y que deben cachearse.

**Ejemplo:**
```json
"outputs": [".next/**", "dist/**"]
```

**Efecto:**
- Turborepo guarda estos archivos en caché
- En cache hit → restaura estos archivos instantáneamente

#### `cache`
Habilita/deshabilita caché para una tarea.

**Cuándo usar `false`:**
- Tareas interactivas (`dev`, `studio`)
- Tareas que modifican archivos de forma no determinista (`format`)
- Tareas que imprimen información en tiempo real

#### `persistent`
Marca tareas de larga duración (servidores, watchers).

**Efecto:**
- Turborepo no espera a que termine
- Otros paquetes pueden iniciar mientras corre
- Útil para `dev`, `start`, `watch`

---

## Pipeline de Tareas

### 1. `dev` - Desarrollo Local

**Script ejecutado:**
```bash
bun run dev  # root
  ↓
turbo run dev
```

**Flujo:**
```
1. Lee turbo.json
2. Busca todos los packages con script "dev"
3. Ve que "dev" depende de "@repo/database#db:generate"
4. Ejecuta:
   a) cd packages/database && bun run db:generate
   b) cd apps/web && bun run dev (en paralelo con otros si existen)
5. Next.js inicia con Turbopack
```

**Logs típicos:**
```
$ turbo run dev
• Packages in scope: @repo/database, @repo/web
• Running dev in 2 packages
• Remote caching disabled

@repo/database:db:generate: cache hit, replaying logs
@repo/database:db:generate: Environment variables loaded from .env
@repo/database:db:generate: Prisma schema loaded from prisma/schema.prisma
@repo/database:db:generate:
@repo/database:db:generate: ✔ Generated Prisma Client

@repo/web:dev: $ next dev
@repo/web:dev:   ▲ Next.js 16.0.1
@repo/web:dev:   - Local:        http://localhost:3000
@repo/web:dev:   - Turbopack:    enabled
```

**Características:**
- **No cachea:** El servidor dev es interactivo
- **Persistent:** No bloquea otros procesos
- **Hot Reload:** Turbopack detecta cambios y recarga

---

### 2. `build` - Compilación Producción

**Script ejecutado:**
```bash
bun run build  # root
  ↓
turbo run build
```

**Flujo completo:**
```
1. Turborepo construye grafo de dependencias:

   @repo/env#build
   @repo/ui#build
   @repo/database#db:generate
        ↓
   @repo/database#build
   @repo/supabase#build
        ↓
   @repo/web#build

2. Ejecuta tareas en orden topológico:
   - NIVEL 1 (en paralelo):
     • @repo/env#build
     • @repo/ui#build
     • @repo/database#db:generate

   - NIVEL 2 (cuando NIVEL 1 termina):
     • @repo/database#build
     • @repo/supabase#build

   - NIVEL 3 (cuando NIVEL 2 termina):
     • @repo/web#build

3. Para cada tarea:
   a) Calcula hash de inputs
   b) Busca en caché local
   c) Si hay hit → restaura outputs del caché
   d) Si no → ejecuta comando y guarda resultado
```

**Ejemplo con caché:**
```bash
# Primera ejecución (todo cache miss)
$ turbo run build

@repo/env:build: cache miss, executing 8a3f2b1c
@repo/ui:build: cache miss, executing 9d4e1a7f
@repo/database:db:generate: cache miss, executing 474a5cc6
@repo/database:build: cache miss, executing 2c5f8e3a
@repo/supabase:build: cache miss, executing 7b9d2f1e
@repo/web:build: cache miss, executing 5e8a3c9b

 Tasks:    6 successful, 6 total
Cached:    0 cached, 6 total
  Time:    48.3s

# Segunda ejecución (sin cambios)
$ turbo run build

@repo/env:build: cache hit, suppressing logs
@repo/ui:build: cache hit, suppressing logs
@repo/database:db:generate: cache hit, replaying logs
@repo/database:build: cache hit, suppressing logs
@repo/supabase:build: cache hit, suppressing logs
@repo/web:build: cache hit, replaying logs

 Tasks:    6 successful, 6 total
Cached:    6 cached, 6 total
  Time:    0.428s >>> FULL TURBO ⚡
```

**Outputs cacheados:**
- `@repo/web`: `.next/` (Next.js build)
- Otros packages: `dist/` (TypeScript compiled)

---

### 3. `@repo/database#db:generate` - Prisma

**Script ejecutado:**
```bash
cd packages/database
bun run db:generate
  ↓
prisma generate --schema=./prisma/schema.prisma
```

**Qué hace:**
1. Lee `prisma/schema.prisma`
2. Descarga binarios de Prisma (si no existen)
3. Genera cliente TypeScript en `node_modules/.prisma/`
4. Genera tipos en `node_modules/@prisma/client/`

**Caché inteligente:**
```json
"inputs": ["prisma/schema.prisma"]
```

**Escenarios:**

| Cambio | Hash | Resultado |
|--------|------|-----------|
| Agregar campo a modelo | Cambia | Cache miss → regenera |
| Modificar comentario en schema | Cambia | Cache miss → regenera |
| Cambiar archivo fuera de `prisma/` | No cambia | Cache hit ⚡ |
| `schema.prisma` idéntico | No cambia | Cache hit ⚡ |

**Performance:**
- Cache miss: ~5-8 segundos
- Cache hit: ~0.1 segundos
- **Ganancia: 98% más rápido**

---

### 4. `type-check` - Validación TypeScript

**Script ejecutado:**
```bash
bun run type-check  # root
  ↓
turbo run type-check
```

**Qué hace:**
- Ejecuta `tsc --noEmit` en cada workspace
- Valida tipos sin generar archivos
- Depende de `@repo/database#db:generate` (necesita tipos Prisma)

**Flujo:**
```
1. @repo/database#db:generate (genera tipos Prisma)
2. En paralelo:
   - @repo/env#type-check
   - @repo/ui#type-check
   - @repo/database#type-check
   - @repo/supabase#type-check
   - @repo/web#type-check
```

**Uso típico:**
```bash
# Antes de commit
bun run type-check

# Si pasa → commit safe
# Si falla → fix tipos primero
```

---

### 5. `lint` - Linting con Biome

**Script ejecutado:**
```bash
bun run lint  # root
  ↓
turbo run lint
```

**Qué hace:**
- Ejecuta `biome check .` en cada workspace
- Valida código con reglas de Biome
- Cachea resultados

**Caché:**
```json
"lint": {
  "cache": true,
  "outputs": []
}
```

**Beneficio del caché:**
- Si no cambió código → skip lint (instantáneo)
- Si cambió → ejecuta lint solo en paquetes afectados

---

### 6. `format` - Formateo con Biome

**Script ejecutado:**
```bash
bun run format  # root
  ↓
turbo run format
```

**Qué hace:**
- Ejecuta `biome format --write .`
- **Modifica archivos** en lugar

**Por qué NO cachea:**
```json
"format": {
  "cache": false  // Modifica archivos, no es idempotente
}
```

**Alternativa con caché:**
```bash
# Solo validar (no modificar)
biome format .  # Sin --write

# Cacheable:
"format:check": {
  "cache": true
}
```

---

## Sistema de Caché

### Cómo Funciona el Caché

#### 1. Cálculo de Hash

Turborepo calcula un hash SHA-256 basado en:
- **Contenido de archivos** especificados en `inputs`
- **Variables de entorno** especificadas en `env`
- **Dependencias** (`dependsOn`)
- **Configuración** de la tarea (`turbo.json`)

**Ejemplo:**
```javascript
// Pseudocódigo
hash = SHA256(
  contenido_de_inputs +
  valor_de_env_vars +
  hashes_de_dependencies +
  turbo_json_task_config
)

// Resultado: "474a5cc6bc156c25"
```

#### 2. Lookup en Caché

```
1. Calcula hash
2. Busca en caché local: node_modules/.cache/turbo/<hash>/
3. Si existe:
   - Restaura outputs (ej: .next/)
   - Reproduce logs (si se guardaron)
   - Marca como "cache hit"
4. Si no existe:
   - Ejecuta comando
   - Guarda outputs en caché
   - Guarda logs
```

#### 3. Estructura del Caché Local

```
node_modules/.cache/turbo/
├── 474a5cc6bc156c25/           # Hash de la tarea
│   ├── .turbo/
│   │   ├── turbo-build.log     # Logs guardados
│   │   └── turbo-build.json    # Metadata
│   └── dist/                   # Outputs copiados
│       └── index.js
├── 8a3f2b1c9e4d5f6a/
│   └── ...
└── turbo-lock.json             # Lock del caché
```

### Tipos de Caché

#### Local Cache (Habilitado por defecto)

**Ubicación:** `node_modules/.cache/turbo/`

**Características:**
- Automático, no requiere configuración
- Compartido entre ramas Git del mismo repo
- Persiste después de `rm -rf node_modules` (si usas Bun/npm/pnpm)
- Limitable con `--cache-max-size`

**Comandos:**
```bash
# Ver caché
ls -lh node_modules/.cache/turbo/

# Limpiar caché
rm -rf node_modules/.cache/turbo/

# O usar comando oficial
turbo clean
```

#### Remote Cache (Deshabilitado actualmente)

**Estado en InmoApp:**
```
• Remote caching disabled
```

**Qué es:**
- Caché compartido en la nube (Vercel, S3, Redis, custom)
- Comparte resultados entre:
  - Diferentes máquinas del equipo
  - CI/CD
  - Deploys

**Habilitar con Vercel (gratis):**
```bash
# 1. Login
npx turbo login

# 2. Vincular proyecto
npx turbo link

# 3. Variables de entorno
export TURBO_TOKEN="tu_token_aqui"
export TURBO_TEAM="tu_team_aqui"

# 4. Ya funcionando
turbo run build
# • Remote caching enabled ✓
```

**Beneficios:**
```
Developer A:
  turbo run build  # 45s → sube a remote cache

Developer B (mismo código):
  turbo run build  # 0.5s → descarga de remote cache ⚡

CI/CD:
  turbo run build  # 0.5s → descarga de remote cache ⚡
```

### Invalidación de Caché

Turborepo invalida caché cuando:

1. **Contenido de inputs cambió**
```bash
# Cambias src/index.ts
turbo run build
# → cache miss (código cambió)
```

2. **Variables de entorno cambiaron**
```bash
# Cambias NODE_ENV=production
turbo run build
# → cache miss (env var cambió)
```

3. **Dependencias se actualizaron**
```bash
# Actualizas package en package.json
turbo run build
# → cache miss (dependencies cambiaron)
```

4. **Configuración de tarea cambió**
```bash
# Modificas turbo.json
turbo run build
# → cache miss (config cambió)
```

5. **Forzar re-ejecución**
```bash
turbo run build --force
# → Ignora caché, siempre ejecuta
```

### Cache Hits vs Misses

**Cache Hit (⚡):**
```
@repo/web:build: cache hit, replaying logs
@repo/web:build: $ next build
@repo/web:build: Creating an optimized production build...
@repo/web:build: ✓ Compiled successfully
@repo/web:build:
@repo/web:build:  ✓ Linting and checking validity of types
@repo/web:build:  ✓ Collecting page data
```

**Características:**
- Logs se "reproducen" (no se ejecuta nada real)
- Outputs se restauran del caché
- Tiempo: ~0.1-0.5 segundos

**Cache Miss:**
```
@repo/web:build: cache miss, executing 5e8a3c9b
@repo/web:build: $ next build
@repo/web:build: Creating an optimized production build...
# ... ejecución real, toma tiempo ...
@repo/web:build: ✓ Compiled successfully
```

**Características:**
- Comando se ejecuta realmente
- Resultado se guarda en caché
- Tiempo: depende de la tarea (5-60 segundos)

---

## Flujos de Ejecución

### Flujo 1: Desarrollo Típico

```bash
# Día 1: Clonar repo
git clone <repo>
cd inmo-app
bun install  # Hook postinstall ejecuta db:generate

# Desarrollo
bun run dev
# @repo/database:db:generate → cache hit (postinstall ya lo hizo)
# @repo/web:dev → inicia servidor
# http://localhost:3000 listo

# Hacer cambios en apps/web/app/page.tsx
# → Hot reload automático (Turbopack)

# Agregar campo a Prisma
code packages/database/prisma/schema.prisma
# Reiniciar dev:
Ctrl+C
bun run dev
# @repo/database:db:generate → cache miss (schema cambió)
# @repo/web:dev → inicia con nuevos tipos
```

### Flujo 2: Pre-Commit

```bash
# Antes de commit
bun run type-check
# @repo/database:db:generate → cache hit
# @repo/web:type-check → ejecuta tsc
# ✓ Todos los paquetes pasan

bun run lint
# @repo/web:lint → biome check
# ✓ Sin errores

# Commit seguro
git add .
git commit -m "feat: add new feature"
```

### Flujo 3: Build para Deploy

```bash
# En Vercel/CI
bun install
# → postinstall ejecuta db:generate

bun run build
# Turborepo construye todo el grafo:
# 1. @repo/env, @repo/ui, @repo/database (paralelo)
# 2. @repo/supabase
# 3. @repo/web

# Si remote cache habilitado:
# - Descarga builds de remote cache
# - Solo rebuilds lo que cambió
# - Deploy en < 1 minuto
```

### Flujo 4: Cambio en Package Compartido

```bash
# Modificar @repo/ui/src/button.tsx
code packages/ui/src/button.tsx

bun run build
# @repo/ui:build → cache miss (código cambió)
# @repo/web:build → cache miss (depende de @repo/ui)
# @repo/database:build → cache hit (no depende de @repo/ui)

# Solo rebuilds afectados ✓
```

---

## Variables de Entorno

### Configuración en `turbo.json`

```json
"globalPassThroughEnv": [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  // ... 21 variables
]
```

### Por Qué es Necesario

**Problema sin `globalPassThroughEnv`:**
```bash
turbo run build
# → Turborepo ejecuta comando sin variables de entorno
# → Error: DATABASE_URL is not defined
```

**Solución:**
- Turborepo pasa estas variables a TODAS las tareas
- Se leen de `.env.local`, `.env`, o environment

### Variables Críticas para InmoApp

#### 1. Database
```bash
DATABASE_URL="postgresql://user:pass@host:6543/db"  # Pooler (Prisma)
DIRECT_URL="postgresql://user:pass@host:5432/db"    # Directo (migraciones)
```

#### 2. Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."  # Solo servidor
```

#### 3. APIs
```bash
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
```

#### 4. Configuración
```bash
NODE_ENV="development" | "production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_TELEMETRY_DISABLED="1"
```

#### 5. Turborepo
```bash
TURBO_TOKEN="tu_token"        # Remote cache
TURBO_TEAM="tu_team"          # Remote cache
TURBO_FORCE="true"            # Forzar re-ejecución
```

### Dónde se Cargan las Variables

```
InmoApp tiene DOS archivos .env.local:

1. root/.env.local
   - Leído por: Turborepo, herramientas build
   - Usado en: tareas del monorepo

2. apps/web/.env.local
   - Leído por: Next.js
   - Usado en: runtime de la aplicación

⚠️ IMPORTANTE: Mantener ambos sincronizados
```

**Validación centralizada:**
```typescript
// packages/env/src/index.ts
import { z } from 'zod'

export const env = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  // ... validación completa
}).parse(process.env)

// Uso en cualquier package:
import { env } from '@repo/env'
console.log(env.DATABASE_URL)  // Type-safe ✓
```

---

## Optimizaciones Implementadas

### 1. Hook `postinstall`

**Configuración:**
```json
// root/package.json
{
  "scripts": {
    "postinstall": "turbo run @repo/database#db:generate"
  }
}
```

**Beneficio:**
- Después de `bun install` → cliente Prisma listo automáticamente
- Previene error: "Cannot find module '@prisma/client'"
- Equipo nuevo: `git clone` + `bun install` → ya funciona

**Flujo:**
```bash
bun install
# 1. Instala dependencias
# 2. Hook postinstall ejecuta
# 3. Turborepo genera cliente Prisma
# 4. Apps pueden importar @prisma/client
```

### 2. Transpilación de Packages Internos

**Configuración:**
```typescript
// apps/web/next.config.ts
export default {
  transpilePackages: [
    "@repo/env",
    "@repo/database",
    "@repo/ui",
    "@repo/supabase",
  ]
}
```

**Por qué es necesario:**
- Packages internos están en TypeScript puro
- Next.js necesita JavaScript en runtime
- `transpilePackages` le dice a Next.js (Turbopack): "compila estos paquetes"

**Sin esto:**
```
Error: Cannot find module '@repo/database'
  or ESM/CJS incompatibility
```

### 3. Caché de Prisma con Inputs Específicos

**Configuración:**
```json
"@repo/database#db:generate": {
  "cache": true,
  "inputs": ["prisma/schema.prisma"]
}
```

**Beneficio:**
- Solo regenera si `schema.prisma` cambia
- Cambios en otros archivos → usa caché
- 98% más rápido cuando no hay cambios

**Ejemplo:**
```bash
# Cambiar packages/database/README.md
turbo run @repo/database#db:generate
# → cache hit (README no está en inputs)

# Cambiar packages/database/prisma/schema.prisma
turbo run @repo/database#db:generate
# → cache miss (schema SÍ está en inputs)
```

### 4. Ejecución Paralela de Builds

**Configuración:**
```json
"build": {
  "dependsOn": ["^build"]
}
```

**Efecto:**
- `@repo/ui`, `@repo/env`, `@repo/database` → en paralelo
- Aprovecha múltiples CPU cores
- Build total 40% más rápido

**Ejemplo en quad-core:**
```
Sin Turborepo (secuencial):
  @repo/env:build     → 5s
  @repo/ui:build      → 8s
  @repo/database:build → 6s
  @repo/web:build     → 30s
  TOTAL: 49s

Con Turborepo (paralelo):
  @repo/env + @repo/ui + @repo/database → 8s (el más lento)
  @repo/web:build                       → 30s
  TOTAL: 38s (22% más rápido)
```

### 5. Type-Check Dependiente de Prisma

**Configuración:**
```json
"type-check": {
  "dependsOn": ["@repo/database#db:generate"]
}
```

**Beneficio:**
- TypeScript necesita tipos de `@prisma/client`
- Turborepo garantiza que Prisma se genere primero
- Previene errores: "Cannot find module '@prisma/client'"

---

## Troubleshooting

### Problema 1: Cliente Prisma No Encontrado

**Error:**
```
Cannot find module '@prisma/client'
or
PrismaClient is unable to run in this environment
```

**Causa:**
- Cliente Prisma no generado
- `node_modules/.prisma/` vacío

**Solución:**
```bash
# Forzar regeneración
turbo run @repo/database#db:generate --force

# O directamente
cd packages/database
bunx prisma generate

# Verificar
ls -la ../../node_modules/.prisma/client/
# Debe contener index.js, index.d.ts, etc.
```

### Problema 2: Cambios No Reflejados

**Síntoma:**
- Modificas código
- Build usa versión antigua

**Causa:**
- Caché corrupto
- Cambios fuera de `inputs` definidos

**Solución:**
```bash
# 1. Limpiar caché
rm -rf node_modules/.cache/turbo/

# 2. Forzar rebuild
turbo run build --force

# 3. Verificar inputs en turbo.json
# Asegúrate de incluir archivos relevantes
```

### Problema 3: Tareas No Se Ejecutan

**Síntoma:**
```bash
turbo run build
# No ejecuta nada
```

**Causa:**
- No hay script "build" en `package.json` del workspace
- Turborepo busca `"build"` en todos los packages

**Solución:**
```bash
# Agregar script en package.json
{
  "scripts": {
    "build": "tsc"  // o "exit 0" si no necesita build
  }
}

# O filtrar explícitamente
turbo run build --filter=@repo/web
```

### Problema 4: Variables de Entorno No Disponibles

**Síntoma:**
```
Error: DATABASE_URL is not defined
```

**Causa:**
- Variable no está en `globalPassThroughEnv`
- Archivo `.env.local` no existe

**Solución:**
```bash
# 1. Verificar que .env.local existe
ls -la apps/web/.env.local
ls -la .env.local

# 2. Agregar variable a turbo.json
{
  "globalPassThroughEnv": [
    "DATABASE_URL",  // ← Asegúrate de incluirla
    // ...
  ]
}

# 3. Reiniciar servidor
# Variables se leen al inicio, no en hot reload
```

### Problema 5: Errores de Red en Prisma

**Síntoma:**
```
Error: request to https://binaries.prisma.sh failed (EAI_AGAIN)
```

**Causa:**
- No hay conexión a internet
- Firewall bloquea descarga de binarios

**Solución:**
```bash
# 1. Verificar conexión
curl -I https://binaries.prisma.sh

# 2. Descargar binarios manualmente
cd packages/database
bunx prisma generate --download

# 3. O usar binarios locales (avanzado)
export PRISMA_QUERY_ENGINE_BINARY="/path/to/binary"
```

### Problema 6: Caché Stale (Desactualizado)

**Síntoma:**
- Build usa versión vieja
- Cambios en dependencias no detectados

**Solución:**
```bash
# Limpiar todo
rm -rf node_modules/.cache/turbo/
rm -rf apps/web/.next/
rm -rf node_modules/

# Reinstalar
bun install

# Rebuild desde cero
turbo run build --force
```

### Problema 7: Turborepo No Detecta Cambios

**Causa:**
- Git no rastreando archivos
- Archivos en `.gitignore`

**Diagnóstico:**
```bash
# Ver qué archivos Turborepo considera
turbo run build --dry=json | jq '.tasks[].inputs'

# Ver hash de una tarea
turbo run build --dry=json | jq '.tasks[].hash'
```

**Solución:**
- Turborepo usa Git para detectar cambios
- Archivos sin commit pueden no invalidar caché
- Hacer commit o usar `--force`

---

## Mejores Prácticas

### 1. Definir Inputs Explícitos

**❌ Malo:**
```json
"build": {
  "outputs": [".next/**"]
  // Sin "inputs" → usa todos los archivos
}
```

**✅ Bueno:**
```json
"build": {
  "inputs": ["src/**", "package.json", "tsconfig.json"],
  "outputs": [".next/**"]
}
```

**Beneficio:**
- Caché más preciso
- No invalida por cambios en docs/README

### 2. Usar `^` para Dependencias

**❌ Malo:**
```json
"build": {
  "dependsOn": ["build"]  // Solo este paquete
}
```

**✅ Bueno:**
```json
"build": {
  "dependsOn": ["^build"]  // Todas las dependencies
}
```

**Beneficio:**
- Garantiza que packages usados estén construidos primero

### 3. No Cachear Tareas Interactivas

**❌ Malo:**
```json
"dev": {
  "cache": true  // ❌ Dev server no debe cachearse
}
```

**✅ Bueno:**
```json
"dev": {
  "cache": false,
  "persistent": true
}
```

### 4. Especificar Outputs Correctamente

**❌ Malo:**
```json
"build": {
  "outputs": []  // No cachea nada
}
```

**✅ Bueno:**
```json
"build": {
  "outputs": [".next/**", "dist/**", "build/**"]
}
```

### 5. Usar Remote Cache en Equipos

**Configuración:**
```bash
# Una sola vez por developer
npx turbo login
npx turbo link

# En CI/CD (variables de entorno)
TURBO_TOKEN=xxx
TURBO_TEAM=xxx
```

**Beneficio:**
- Equipo comparte caché
- CI/CD ultra rápido
- Reduce costos de compute

### 6. Monitorear Performance

**Comando:**
```bash
# Ver estadísticas detalladas
turbo run build --summarize

# Ver qué se cacheó
turbo run build | grep "cache hit"

# Ver tiempos
turbo run build --profile=profile.json
```

### 7. Limpiar Caché Periódicamente

**Razón:**
- Caché crece con el tiempo
- Puede ocupar varios GB

**Comando:**
```bash
# Ver tamaño
du -sh node_modules/.cache/turbo/

# Limpiar si >1GB
rm -rf node_modules/.cache/turbo/
```

### 8. Documentar Variables de Entorno

**En `turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "//": "Variables requeridas: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL",
  "globalPassThroughEnv": [...]
}
```

### 9. Usar Filtros para Desarrollo

**Ejemplo:**
```bash
# Solo build de web
turbo run build --filter=@repo/web

# Build de web y sus dependencies
turbo run build --filter=@repo/web...

# Build de packages modificados
turbo run build --filter=[HEAD^1]
```

### 10. Integrar con CI/CD

**GitHub Actions:**
```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install
        run: bun install

      - name: Build
        run: turbo run build lint type-check
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

---

## Recursos Adicionales

### Documentación Oficial
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Configuration Reference](https://turbo.build/repo/docs/reference/configuration)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)

### InmoApp Docs Relacionados
- `CLAUDE.md` - Contexto general del proyecto
- `docs/architecture/ENVIRONMENT_VARIABLES.md` - Variables de entorno
- `docs/setup/QUICK_START.md` - Getting started
- `docs/caching/NEXT_16_CACHE_DEEP_DIVE.md` - Next.js caching (complementario)

### Debugging
```bash
# Ver ejecución detallada
turbo run build --verbosity=2

# Ver qué tareas ejecuta (sin ejecutar)
turbo run build --dry-run

# Ver JSON completo
turbo run build --dry-run=json

# Ver qué archivos afectan cada tarea
turbo run build --graph

# Ver profile de performance
turbo run build --profile=profile.json
# Abrir profile.json en Chrome DevTools Performance tab
```

---

## Changelog del Proyecto

### Versión Actual (Noviembre 2025)
- ✅ Turborepo 2.6.1
- ✅ Caché local habilitado
- ✅ Pipeline completo (dev, build, lint, type-check)
- ✅ Hook postinstall para Prisma
- ✅ 21 variables de entorno globales
- ⚠️ Remote cache deshabilitado (oportunidad de mejora)

### Próximos Pasos Sugeridos
1. Habilitar remote cache (Vercel)
2. Agregar `inputs` explícitos a todas las tareas
3. Agregar script `build` a packages que faltan
4. Configurar CI/CD con GitHub Actions
5. Monitorear métricas de caché

---

## Conclusión

Turborepo está **correctamente configurado** en InmoApp y proporciona:

✅ Builds 50-98% más rápidos con caché
✅ Ejecución paralela de tareas independientes
✅ Pipeline declarativo y mantenible
✅ Integración perfecta con Bun + Next.js 16
✅ Type-safety garantizado (Prisma antes de type-check)

**Oportunidades de mejora:**
- Habilitar remote cache
- Definir inputs más específicos
- Agregar scripts faltantes

**Recursos:**
- Docs oficiales: https://turbo.build/repo/docs
- Issues: https://github.com/vercel/turbo/issues
- Discord: https://turbo.build/discord

---

**Mantenido por:** Equipo InmoApp
**Última revisión:** Noviembre 2025
**Próxima revisión:** Cuando se actualice Turborepo a 3.x
