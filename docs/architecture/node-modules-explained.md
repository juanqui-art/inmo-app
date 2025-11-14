# 🧩 Node Modules y Workspaces Explicado

> Guía completa para entender el sistema de módulos, workspaces y por qué tienes múltiples `node_modules` y `package.json`

**Última actualización:** Octubre 2025
**Versión:** 1.0
**Audiencia:** Developers, DevOps, Code Reviewers

---

## 📑 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué son los Workspaces?](#qué-son-los-workspaces)
3. [Estado Actual de tu Proyecto](#estado-actual-de-tu-proyecto)
4. [Cómo Funcionan los Symlinks](#cómo-funcionan-los-symlinks)
5. [Resolución de Módulos en Node.js](#resolución-de-módulos-en-nodejs)
6. [Hoisting y Deduplicación](#hoisting-y-deduplicación)
7. [Ejemplos Prácticos](#ejemplos-prácticos)
8. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
9. [Comandos Útiles](#comandos-útiles)

---

## 🎯 Resumen Ejecutivo

Tu proyecto usa **Bun Workspaces**, que es un sistema moderno para gestionar **múltiples paquetes en un solo repositorio** (monorepo).

### ¿Tienes estas carpetas?

```bash
./node_modules/              # 866 MB
./apps/web/node_modules/     # 932 KB
./package.json               # Raíz
./apps/web/package.json      # Web app
./packages/database/package.json
./packages/supabase/package.json
# ... etc
```

### ✅ Esto es CORRECTO y NO interfieren

**Por qué:**
- Las dependencias se **instalan una sola vez** en `./node_modules/`
- Los workspaces están conectados mediante **symlinks** (enlaces simbólicos)
- Cada workspace tiene su **namespace único** (`@repo/`)
- Node.js **no se confunde** al resolver módulos

---

## 🧠 ¿Qué son los Workspaces?

### Definición Simple

Un **workspace** es una carpeta que contiene un `package.json` con sus propias dependencias. En un monorepo, múltiples workspaces comparten las mismas dependencias sin duplicación.

### Analogía: Biblioteca

```
ANTES (Sin workspaces - Multi-repo)
┌─────────────────────────────────┐
│ Repo 1: apps/web/               │
│ ├── node_modules/  (100 MB)     │
│ └── package.json                │
├─────────────────────────────────┤
│ Repo 2: packages/database/       │
│ ├── node_modules/  (100 MB)     │
│ └── package.json                │
├─────────────────────────────────┤
│ Repo 3: packages/ui/            │
│ ├── node_modules/  (100 MB)     │
│ └── package.json                │
├─────────────────────────────────┤
│ TOTAL STORAGE: 300 MB ❌        │
└─────────────────────────────────┘

AHORA (Con workspaces - Monorepo)
┌─────────────────────────────────┐
│ Root: node_modules/             │
│ ├── react@19/ (COMPARTIDO)      │
│ ├── next@15/ (COMPARTIDO)       │
│ └── ...                         │
│ Subtotal: 100 MB ✅            │
├─────────────────────────────────┤
│ apps/web/node_modules/          │
│ └── tailwind-merge@3/ (OVERRIDE)│
│ Subtotal: 932 KB                │
├─────────────────────────────────┤
│ TOTAL STORAGE: ~101 MB ✅       │
│ AHORRO: 66% 🎉                  │
└─────────────────────────────────┘
```

---

## 📊 Estado Actual de tu Proyecto

### Archivos de Configuración Encontrados

```
./package.json                              # ← WORKSPACE ROOT
./apps/web/package.json                     # ← Web app
./apps/web/.next/package.json               # ← Generado (ignorar)
./packages/database/package.json            # ← Database package
./packages/supabase/package.json            # ← Supabase package
./packages/ui/package.json                  # ← UI components
./packages/typescript-config/package.json   # ← TS configs
```

### Archivos Raíz de Configuración

**`./package.json` (Workspace Root):**
```json
{
  "name": "inmo-app",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "cd apps/web && bun run dev",
    "build": "turbo run build",
    "type-check": "turbo run type-check"
  }
}
```

**Esto significa:**
- Toda carpeta en `apps/` es un workspace ✅
- Toda carpeta en `packages/` es un workspace ✅
- Bun gestiona todos juntos ✅

### Node Modules en tu Proyecto

```bash
./node_modules/              # 866 MB  ← TODO instalado aquí
├── react/
├── next/
├── prisma/
├── @repo/                   # ← Symlinks a packages/
│   ├── database -> ../../packages/database
│   ├── ui -> ../../packages/ui
│   ├── supabase -> ../../packages/supabase
│   └── typescript-config -> ../../packages/typescript-config
└── ... (todas las deps)

./apps/web/node_modules/     # 932 KB  ← Solo tailwind-merge
└── tailwind-merge/
```

---

## 🔗 Cómo Funcionan los Symlinks

### ¿Qué es un Symlink?

Un **symlink** (enlace simbólico) es un **acceso directo** a una carpeta:

```bash
# Verificar en tu proyecto
ls -la node_modules/@repo/

# Resultado:
lrwxrwxrwx  database -> ../../packages/database
lrwxrwxrwx  ui -> ../../packages/ui
lrwxrwxrwx  supabase -> ../../packages/supabase
```

**Explicación:**
- `lrwxrwxrwx` = Es un symlink (la `l` al inicio indica "link")
- `database -> ../../packages/database` = Apunta a `packages/database/`
- **No es una copia**, es un acceso directo
- Los cambios se reflejan instantáneamente

### Visualización

```
./node_modules/@repo/database
    ↓ (symlink)
    ↓
../../packages/database/
    ↓
src/
├── repositories/
├── client.ts
└── index.ts
```

### Ejemplo Real

Cuando escribes en `apps/web`:

```typescript
// apps/web/app/actions/properties.ts
import { propertyRepository } from '@repo/database'
```

**Paso a paso:**
1. Node.js busca módulo `@repo/database`
2. Encuentra `./node_modules/@repo/database` (symlink)
3. Sigue el symlink a `../../packages/database/`
4. Lee `packages/database/src/index.ts`
5. **Obtiene el módulo** ✅

**No hay copia**, es un acceso directo en tiempo real.

---

## 🔍 Resolución de Módulos en Node.js

### El Algoritmo de Búsqueda

Cuando Node.js necesita `import { foo } from 'bar'`:

```
┌─────────────────────────────────────────────────────────┐
│  Node.js recibe: import { foo } from 'bar'              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
        ┌───────────────────────────────────┐
        │ ¿Es un path relativo? (./)        │
        └─────────────┬──────────────────┬──┘
                      │ SÍ               │ NO
                      ▼                  ▼
            Buscar en ./bar      Buscar en node_modules/bar
                      │                  │
                      ▼                  ▼
        ┌─────────────────────┐  ┌──────────────────────────┐
        │ ./bar               │  │ Algoritmo de búsqueda:   │
        │ ./bar.ts            │  │                          │
        │ ./bar.js            │  │ 1. ./node_modules/bar/   │
        └─────────────────────┘  │ 2. ../node_modules/bar/  │
                                 │ 3. ../../node_modules/   │
                                 │ ...                      │
                                 │ n. /node_modules/bar/    │
                                 └──────────────────────────┘
```

### En tu Proyecto

**Caso 1: Módulo externo (React)**

```typescript
// apps/web/app/layout.tsx
import { ReactNode } from 'react'

// Búsqueda:
1. ./apps/web/node_modules/react/     ❌ No existe
2. ./node_modules/react/               ✅ ¡ENCUENTRA!
3. (importa desde aquí)
```

**Caso 2: Módulo externo con override local**

```typescript
// apps/web/components/ui/card.tsx
import { twMerge } from 'tailwind-merge'

// Búsqueda:
1. ./apps/web/node_modules/tailwind-merge/    ✅ ¡ENCUENTRA!
   (versión local: 3.3.1)
2. (PARA AQUÍ, no busca más)

// vs

// packages/ui/src/button.tsx
import { twMerge } from 'tailwind-merge'

// Búsqueda:
1. ./packages/ui/node_modules/tailwind-merge/     ❌ No existe
2. ./node_modules/tailwind-merge/                 ✅ ¡ENCUENTRA!
   (versión global: 2.6.0)
```

**Caso 3: Módulo de workspace (interno)**

```typescript
// apps/web/app/actions/properties.ts
import { propertyRepository } from '@repo/database'

// Búsqueda:
1. ./apps/web/node_modules/@repo/database/     ❌ No existe
2. ./node_modules/@repo/database/               ✅ ¡ENCUENTRA!
   (es un symlink)
3. Sigue symlink a ../../packages/database/
4. Lee packages/database/src/index.ts
5. (importa desde aquí)
```

### Diagrama de Resolución

```
Import en apps/web/
│
├─ 'react' ──────────────→ ./node_modules/react/       (externo)
├─ 'tailwind-merge' ─────→ ./apps/web/node_modules/... (override local)
├─ '@repo/database' ─────→ ./node_modules/@repo/database
│                            ↓ (symlink)
│                            ↓
│                        ../../packages/database/
└─ './utils/cn' ────────→ ./apps/web/lib/utils/cn.ts  (relativo)
```

---

## 📦 Hoisting y Deduplicación

### ¿Qué es Hoisting?

**Hoisting** es el proceso de "elevar" dependencias comunes a un nivel superior para evitar duplicación.

### Ejemplo sin Hoisting (❌ Ineficiente)

```
node_modules/
├── apps/web/node_modules/
│   ├── react@19/              (100 MB)
│   ├── next@15/               (50 MB)
│   └── typescript@5/           (30 MB)
├── packages/ui/node_modules/
│   ├── react@19/              (100 MB) ← DUPLICADO ❌
│   ├── typescript@5/           (30 MB)  ← DUPLICADO ❌
│   └── class-variance-authority/
├── packages/database/node_modules/
│   ├── typescript@5/           (30 MB)  ← DUPLICADO ❌
│   └── @prisma/client/
└── TOTAL: ~520 MB ❌ (mucho espacio)
```

### Ejemplo con Hoisting (✅ Eficiente)

```
node_modules/                  # Raíz (hoisted)
├── react@19/                  (100 MB)
├── next@15/                   (50 MB)
├── typescript@5/              (30 MB)
├── @prisma/client/            (20 MB)
├── class-variance-authority/  (5 MB)
└── @repo/                     (symlinks)
    ├── database -> ../../packages/database
    ├── ui -> ../../packages/ui
    └── supabase -> ../../packages/supabase

apps/web/node_modules/        # Override local
├── tailwind-merge@3.3.1/      (2 MB)

TOTAL: ~207 MB ✅ (66% ahorro)
```

### Cómo Funciona el Hoisting

```
┌──────────────────────────────────────────┐
│ Paso 1: Bun lee todos los package.json   │
├──────────────────────────────────────────┤
│ apps/web/package.json                    │
│ └── react@19, next@15, typescript@5      │
│ packages/ui/package.json                 │
│ └── react@19, typescript@5               │
│ packages/database/package.json           │
│ └── prisma@6, typescript@5               │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│ Paso 2: Crea grafo de dependencias       │
├──────────────────────────────────────────┤
│ react@19     ← Used by web + ui          │
│ next@15      ← Used by web               │
│ typescript@5 ← Used by web + ui + db    │
│ prisma@6     ← Used by database          │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│ Paso 3: Deduplica y resuelve versiones   │
├──────────────────────────────────────────┤
│ react@19    ✅ 1 copia (usado por todos) │
│ typescript@5 ✅ 1 copia (usado por todos)│
│ prisma@6    ✅ 1 copia                   │
│ next@15     ✅ 1 copia                   │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│ Paso 4: Instala en ./node_modules/       │
├──────────────────────────────────────────┤
│ ./node_modules/                          │
│ ├── react/                               │
│ ├── next/                                │
│ ├── typescript/                          │
│ ├── prisma/                              │
│ └── @repo/ (symlinks)                    │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│ Paso 5: Override local si es necesario   │
├──────────────────────────────────────────┤
│ ./apps/web/node_modules/                 │
│ └── tailwind-merge@3.3.1/ (override)     │
└──────────────────────────────────────────┘
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Importar paquete externo

**Código:**
```typescript
// apps/web/app/layout.tsx
import { Metadata } from 'next'
```

**¿Qué pasa internamente?**

```
1. Node.js: "¿Dónde está el módulo 'next'?"
2. Búsqueda en ./apps/web/node_modules/next ❌
3. Búsqueda en ./node_modules/next ✅
4. Encuentra: ./node_modules/next/
5. Lee: ./node_modules/next/dist/lib/metadata.ts
6. Importa Metadata ✅
```

### Ejemplo 2: Importar workspace interno

**Código:**
```typescript
// apps/web/app/actions/properties.ts
import { propertyRepository } from '@repo/database'
```

**¿Qué pasa internamente?**

```
1. Node.js: "¿Dónde está '@repo/database'?"
2. Búsqueda en ./apps/web/node_modules/@repo/database ❌
3. Búsqueda en ./node_modules/@repo/database ✅
4. Encuentra symlink: database -> ../../packages/database
5. Sigue symlink ✅
6. Lee: ./packages/database/src/index.ts
7. Importa propertyRepository ✅
```

### Ejemplo 3: Override local (tailwind-merge)

**Configuración:**

```json
// apps/web/package.json
{
  "dependencies": {
    "tailwind-merge": "3.3.1"  ← Versión específica
  }
}

// packages/ui/package.json
{
  "dependencies": {
    "tailwind-merge": "2.6.0"  ← Versión diferente
  }
}
```

**¿Qué pasa internamente?**

```
En apps/web:
1. import { twMerge } from 'tailwind-merge'
2. Busca en ./apps/web/node_modules/tailwind-merge ✅
3. Encuentra: version 3.3.1 (local)
4. Importa desde ./apps/web/node_modules/

En packages/ui:
1. import { twMerge } from 'tailwind-merge'
2. Busca en ./packages/ui/node_modules/tailwind-merge ❌
3. Busca en ./node_modules/tailwind-merge ✅
4. Encuentra: version 2.6.0 (global)
5. Importa desde ./node_modules/
```

**Resultado:**
- `apps/web` usa tailwind-merge v3.3.1 ✅
- `packages/ui` usa tailwind-merge v2.6.0 ✅
- Sin conflictos ✅

### Ejemplo 4: Cambios en tiempo real

**Escenario:** Editas `packages/database/src/repositories/properties.ts`

```typescript
// packages/database/src/repositories/properties.ts (EDITADO)
export const propertyRepository = {
  // Cambio: nuevo método
  getLatest: async () => { ... }
}
```

**¿Qué pasa?**

```
1. Guardas el archivo
2. apps/web tiene un symlink a packages/database
3. apps/web ve el cambio INMEDIATAMENTE
4. No necesitas rebuild, publish o restart
5. Hot reload funciona ✅
```

**Por qué:**
- Es un symlink, no una copia
- Node.js lee el archivo original en tiempo real
- Los cambios se propagan al instante

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: "Module not found"

**Síntoma:**
```
Error: Cannot find module '@repo/database'
```

**Causa probable:**
- Olvidaste `transpilePackages` en Next.js

**Solución:**
```typescript
// apps/web/next.config.ts
const nextConfig = {
  transpilePackages: [
    '@repo/database',
    '@repo/ui',
    '@repo/supabase'
  ]
}
```

**Explicación:**
- Next.js **no transpila node_modules por defecto**
- `@repo/database` está en `node_modules/@repo/database` (symlink)
- Necesitas decirle a Next.js que transpile estos paquetes

### Error 2: Versiones incompatibles

**Síntoma:**
```
Error: React version mismatch
Element is using React 18 but this component uses React 19
```

**Causa probable:**
```json
// apps/web/package.json
{ "dependencies": { "react": "19.1.0" } }

// packages/ui/package.json
{ "dependencies": { "react": "18.0.0" } }  ← ¡Versión diferente!
```

**Solución:**
```json
// Usar la MISMA versión en todos los workspaces
// apps/web/package.json
{ "dependencies": { "react": "19.1.0" } }

// packages/ui/package.json
{ "dependencies": { "react": "19.1.0" } }  ← Misma versión
```

**O usar peerDependencies:**
```json
// packages/ui/package.json
{
  "peerDependencies": {
    "react": "^19.0.0"  // Requiere React 19+
  }
}
```

### Error 3: Circular dependencies

**Síntoma:**
```
Error: Circular dependency detected
```

**Ejemplo problemático:**
```
@repo/database → @repo/ui → @repo/database (❌ Circular)
```

**Solución:**
```
Reordenar dependencias:
@repo/database (sin deps internas)
    ↓
@repo/ui (depende de database)
    ↓
@repo/web (depende de ui y database)
```

### Error 4: Cache no actualizado

**Síntoma:**
```
Cambio archivo en packages/database/
Pero apps/web sigue usando la versión antigua
```

**Causas:**
1. TypeScript no recompilado
2. Next.js cache no limpiado
3. Dev server no reiniciado

**Soluciones:**
```bash
# 1. Limpiar .next
rm -rf apps/web/.next

# 2. Reiniciar dev server
bun run dev

# 3. Forzar recompilación
cd packages/database && bunx prisma generate
```

---

## 🛠️ Comandos Útiles

### Ver estructura de workspaces

```bash
# Ver todos los workspaces
bun workspaces list

# Listar packages instalados
bun pm ls

# Ver qué versión tiene cada workspace
bun pm ls react
```

### Gestionar dependencias

```bash
# Instalar una dep en un workspace específico
bun add --workspace=@repo/database prisma

# Instalar una dev dep
bun add --workspace=@repo/database --dev @types/node

# Actualizar todas las deps
bun update

# Instalar desde cero (limpia caché)
rm -rf node_modules && bun install
```

### Debug de módulos

```bash
# Ver dónde Node.js busca un módulo
node -e "console.log(require.resolve('@repo/database'))"

# Ver estructura de node_modules
ls -la node_modules/@repo/

# Verificar symlinks
ls -la node_modules/@repo/database

# Ver tamaño de node_modules
du -sh node_modules
du -sh apps/web/node_modules
```

### Limpiar proyecto

```bash
# Limpiar TODO
rm -rf node_modules apps/web/node_modules packages/*/node_modules

# Reinstalar
bun install

# Limpiar cache
bun cache gc

# Verificar integridad
bun install --check
```

### Ejecutar comandos en todos los workspaces

```bash
# Usar Turbo para ejecutar en paralelo
turbo run build        # Build en web + todos los packages
turbo run type-check   # Type check en todos
turbo run lint         # Lint en todos

# Ejecutar en workspace específico
bun --workspace=@repo/database db:generate
bun --workspace=@repo/web dev
```

---

## 📊 Comparación: Workspaces vs Sin Workspaces

### CON Workspaces (✅ Tu proyecto actual)

```bash
# 1 repo
inmo-app/
├── apps/web/
├── packages/database/
├── packages/ui/
└── node_modules/  (compartido)

Ventajas:
✅ Una sola instalación
✅ Cambios compartidos al instante
✅ Type-safe entre paquetes
✅ Builds paralelos (Turbo)
✅ 60% menos espacio

Desventajas:
❌ Menos flexible (todo en un repo)
❌ CI/CD más complejo
```

### SIN Workspaces (❌ No recomendado para tu caso)

```bash
# 4 repos separados
inmo-app-web/
├── node_modules/  (100 MB)

inmo-app-database/
├── node_modules/  (50 MB)

inmo-app-ui/
├── node_modules/  (50 MB)

inmo-app-supabase/
├── node_modules/  (20 MB)

Desventajas:
❌ 220 MB (vs 100 MB con workspaces)
❌ Cambios tardan en propagarse (publish/install)
❌ Versionado manual
❌ CI/CD más simple pero lento

Ventajas:
✅ Más flexible (repos independientes)
✅ Equipo independiente por paquete
```

---

## 🎓 Cómo Instalar tus Workspaces (Primera Vez)

Si necesitas reinstalar desde cero:

```bash
# 1. Posicionarse en la raíz
cd inmo-app

# 2. Limpiar (si es necesario)
rm -rf node_modules apps/web/node_modules packages/*/node_modules

# 3. Instalar (Bun detecta workspaces automáticamente)
bun install

# 4. Verificar que se instaló correctamente
ls -la node_modules/@repo/
# Deberías ver symlinks a packages/

# 5. Type-check para asegurarte que está todo bien
bun run type-check

# 6. Build para verificar que no hay errores
bun run build
```

---

## 📚 Conceptos Clave

### Dependencias por Nivel

```
GLOBAL (root package.json):
├── turbo         # Para ejecutar tasks en todos los workspaces
├── biome         # Para linting global
└── @gsap/react   # Compartido entre web + ui

WEB (apps/web/package.json):
├── next          # Solo web la necesita
├── react         # Compartida pero listed aquí también
├── mapbox-gl     # Solo web la necesita
└── tailwind-merge (v3.3.1)  # Override local

DATABASE (packages/database/package.json):
├── @prisma/client   # Solo database la necesita
└── typescript       # Compartida

UI (packages/ui/package.json):
├── react           # Compartida
├── tailwind-merge  (v2.6.0)  # Versión diferente
└── class-variance-authority
```

### Namespaces

```
Namespace "node_modules" = paquetes npm públicos
├── react              (npm)
├── next               (npm)
├── prisma             (npm)
└── mapbox-gl          (npm)

Namespace "@repo" = workspaces privados (tu monorepo)
├── database -> packages/database
├── ui -> packages/ui
├── supabase -> packages/supabase
└── typescript-config -> packages/typescript-config
```

---

## 🔗 Referencias

### Documentación Oficial
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [npm Workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Node.js Module Resolution](https://nodejs.org/api/modules.html#modules_all_together)

### Documentos Relacionados
- [`docs/project-structure.md`](./project-structure.md) - Estructura completa del proyecto
- [`docs/development-tasks-guide.md`](./development-tasks-guide.md) - Tareas de desarrollo
- [`CLAUDE.md`](../CLAUDE.md) - Guía para Claude Code

---

## ✅ Checklist: Verificar que Todo Está Correcto

- [ ] Tienes `./node_modules/` con todas las deps
- [ ] Tienes symlinks en `./node_modules/@repo/`
- [ ] `apps/web` tiene `transpilePackages` en `next.config.ts`
- [ ] Todos los `package.json` usan workspaces correctos
- [ ] `bun install` funciona sin errores
- [ ] `bun run type-check` pasa
- [ ] `bun run build` compila exitosamente
- [ ] Cambios en `packages/` se reflejan en `apps/web` al instante

---

**Última actualización:** 2025-11-14
**Próxima revisión:** 2025-12-14
