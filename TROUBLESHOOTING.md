# 🔧 Troubleshooting Guide - InmoApp

> Guía completa de solución de problemas comunes y prevención de errores en el proyecto InmoApp.

**Última actualización:** Noviembre 29, 2025

---

## 📚 Tabla de Contenidos

1. [Problemas Comunes](#problemas-comunes)
2. [Limpieza y Reinstalación](#limpieza-y-reinstalación)
3. [Prevención de Errores](#prevención-de-errores)
4. [Scripts Útiles](#scripts-útiles)
5. [Problemas Históricos Resueltos](#problemas-históricos-resueltos)

---

## 🚨 Problemas Comunes

### 1. Build Failures (TypeScript Errors)

**Síntomas:**
```bash
$ bun run build
error TS2688: Cannot find type definition file for 'react 2'
error TS2688: Cannot find type definition file for 'deep-eql 2'
```

**Causa:** Archivos duplicados con nombres corruptos en `node_modules/@types/`

**Solución Rápida:**
```bash
bun run fresh    # Limpieza completa + reinstalación
```

**Solución Manual:**
```bash
# 1. Buscar duplicados
find node_modules/@types -name "* [0-9]" -type d

# 2. Si encuentra algo, limpieza nuclear
rm -rf node_modules bun.lockb ~/.bun/install/cache
bun install
```

---

### 2. Prisma Client Generation Failures

**Síntomas:**
```bash
Error: Cannot find module 'jiti'
Error: Cannot find module './MergeStrategy.js'
Error: Cannot find module 'pathe'
Cannot find module 'pure-rand'
```

**Causa:** Dependencias transitivas de Prisma no instaladas completamente

**Solución:**
```bash
# 1. Agregar dependencias faltantes explícitamente
cd packages/database
bun add -D jiti c12 pathe

# 2. Si persiste, limpieza nuclear
rm -rf node_modules bun.lockb ~/.bun/install/cache
bun install

# 3. Verificar Prisma Client
ls node_modules/.prisma/client
# Debe existir y contener archivos

# 4. Regenerar manualmente si es necesario
cd packages/database
bunx prisma generate
```

---

### 3. Dev Server Won't Start

**Síntomas:**
```bash
$ bun run dev
Error: _interop_require_default._ is not a function
Module not found: Can't resolve '@repo/env'
```

**Causas Posibles:**

**A. Módulos de Next.js corruptos**
```bash
rm -rf apps/web/.next apps/web/.turbo
bun run dev
```

**B. Workspace symlinks rotos**
```bash
bun install    # Regenera symlinks
bun run dev
```

**C. Variables de entorno faltantes**
```bash
# Verifica que existan ambos archivos .env.local
ls apps/web/.env.local     # ✓ Debe existir
ls .env.local              # ✓ Debe existir (root)

# Si faltan, copia desde .env.example
cp apps/web/.env.example apps/web/.env.local
```

---

### 4. Prisma Version Conflicts

**Síntomas:**
```bash
error: The datasource property `url` is no longer supported
Prisma CLI Version: 7.0.1
```

**Causa:** Bun instaló automáticamente Prisma 7.x que tiene breaking changes

**Solución:**
```bash
# 1. Downgrade a Prisma 6.x
cd packages/database
bun add -D prisma@6.19.0
bun add @prisma/client@6.19.0

# 2. Pin versión en package.json (sin ^)
# "prisma": "6.19.0"          ← Sin caret
# "@prisma/client": "6.19.0"  ← Sin caret

# 3. Regenerar cliente
bunx prisma generate
```

---

### 5. Slow Build Times / Compilation Hangs

**Síntomas:**
- Build tarda más de 30 segundos
- Dev server tarda más de 5 segundos en arrancar
- `tsc --noEmit` se cuelga

**Solución:**
```bash
# 1. Limpiar cachés de compilación
rm -rf apps/web/.next
rm -rf apps/web/.turbo
rm -rf apps/web/tsconfig.tsbuildinfo

# 2. Verificar TypeScript
cd apps/web
bunx tsc --noEmit --diagnostics
# Revisa el output para ver qué archivos tardan más

# 3. Si persiste, reinstalar
bun run fresh
```

---

## 🧹 Limpieza y Reinstalación

### Limpieza Rápida (Dev Server Issues)

```bash
# Solo cachés de Next.js
rm -rf apps/web/.next apps/web/.turbo
bun run dev
```

### Limpieza Media (Dependency Issues)

```bash
# node_modules + lockfile
rm -rf node_modules bun.lockb
bun install
```

### Limpieza Nuclear (Problemas Persistentes)

```bash
# TODO: cachés en todos los niveles
rm -rf node_modules bun.lockb
rm -rf apps/web/.next apps/web/node_modules
rm -rf ~/.bun/install/cache

# Reinstalar desde cero
bun install

# Verificar integridad
find node_modules -name "* [0-9]" -type d
# Debe estar vacío (no encontrar nada)
```

### Script Automatizado (Recomendado)

Agrega estos scripts a `package.json` raíz:

```json
{
  "scripts": {
    "clean": "rm -rf node_modules bun.lockb apps/web/.next apps/web/node_modules && rm -rf ~/.bun/install/cache",
    "fresh": "bun run clean && bun install",
    "rebuild": "bun run fresh && bun run build",
    "verify": "find node_modules -name '* [0-9]' -type d"
  }
}
```

**Uso:**
```bash
bun run fresh    # Limpieza + reinstalación
bun run rebuild  # Fresh + build completo
bun run verify   # Verificar integridad
```

---

## 🛡️ Prevención de Errores

### 1. Al Cambiar de Gestor de Paquetes

**NUNCA hagas cambios incrementales entre npm/pnpm/yarn/bun:**

```bash
# ❌ MAL
npm install
bun install    # Sin limpiar primero

# ✅ BIEN
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml bun.lockb
rm -rf ~/.npm ~/.pnpm-store ~/.yarn ~/.bun/install/cache
bun install
```

### 2. Pin Versiones Críticas

Edita `package.json` para usar versiones exactas (sin `^` o `~`):

```json
{
  "dependencies": {
    // ❌ MAL (permite auto-upgrade)
    "@prisma/client": "^6.19.0",
    "zod": "^4.1.12",
    "next": "^16.0.1"

    // ✅ BIEN (versión exacta)
    "@prisma/client": "6.19.0",
    "zod": "4.1.12",
    "next": "16.0.1"
  }
}
```

**Dependencias críticas a pinnear:**
- `@prisma/client` y `prisma`
- `zod`
- `next`
- `react` y `react-dom`
- `typescript`

### 3. Verificación Post-Install

Después de cada `bun install`:

```bash
# 1. Buscar archivos corruptos (debe estar vacío)
find node_modules -name "* [0-9]" -type d

# 2. Verificar Prisma Client
ls node_modules/.prisma/client

# 3. Verificar dependencias críticas
ls node_modules/jiti
ls node_modules/c12
ls node_modules/pathe
ls node_modules/effect/dist/cjs/MergeStrategy.js
```

### 4. Commit del Lockfile

**SIEMPRE commitea `bun.lockb`:**

```bash
# .gitignore (verifica que NO esté esto)
# bun.lockb   ← NO ignores el lockfile

# Debe estar:
node_modules/
.next/
*.log
```

**Verificar:**
```bash
git status
# Debe mostrar bun.lockb como tracked file
```

### 5. Antes de Mergear a Main

**Checklist completo:**

```bash
# 1. Limpieza
✅ bun run fresh

# 2. Verificaciones
✅ bun run type-check    # 0 errores TypeScript
✅ bun run lint          # 0 warnings Biome
✅ bun run test          # Todos los tests pasan
✅ bun run build         # Build exitoso

# 3. Commit
✅ git add bun.lockb package.json
✅ git commit
```

---

## 🔧 Scripts Útiles

### Script de Verificación de Instalación

Crea `scripts/verify-install.sh`:

```bash
#!/bin/bash

echo "🔍 Verificando integridad de node_modules..."

# Check for corrupt files
CORRUPT=$(find node_modules -name "* [0-9]" -type d 2>/dev/null | wc -l)
if [ $CORRUPT -gt 0 ]; then
  echo "❌ Archivos corruptos detectados:"
  find node_modules -name "* [0-9]" -type d
  echo ""
  echo "Ejecuta: bun run fresh"
  exit 1
fi

# Check Prisma Client
if [ ! -f "node_modules/.prisma/client/index.js" ]; then
  echo "❌ Prisma Client no generado"
  echo "Ejecuta: cd packages/database && bunx prisma generate"
  exit 1
fi

# Check critical deps
DEPS=("jiti" "effect/dist/cjs/MergeStrategy.js" "c12")
for dep in "${DEPS[@]}"; do
  if [ ! -e "node_modules/$dep" ]; then
    echo "❌ Dependencia crítica faltante: $dep"
    echo "Ejecuta: bun run fresh"
    exit 1
  fi
done

echo "✅ node_modules verificado correctamente"
echo "✅ Prisma Client generado"
echo "✅ Dependencias críticas presentes"
```

**Uso:**
```bash
chmod +x scripts/verify-install.sh
./scripts/verify-install.sh
```

### Script de Diagnóstico

Crea `scripts/diagnose.sh`:

```bash
#!/bin/bash

echo "🔍 Diagnóstico del Sistema"
echo "=========================="
echo ""

# Versiones
echo "📦 Versiones:"
echo "  Node.js: $(node --version)"
echo "  Bun: $(bun --version)"
echo "  Git: $(git --version | head -1)"
echo ""

# Estado del repositorio
echo "📁 Estado del Repositorio:"
echo "  Branch: $(git branch --show-current)"
echo "  Último commit: $(git log -1 --oneline)"
echo ""

# Archivos de entorno
echo "🔐 Archivos de Entorno:"
[ -f ".env.local" ] && echo "  ✓ .env.local (root)" || echo "  ✗ .env.local (root) FALTANTE"
[ -f "apps/web/.env.local" ] && echo "  ✓ apps/web/.env.local" || echo "  ✗ apps/web/.env.local FALTANTE"
echo ""

# node_modules
echo "📦 node_modules:"
if [ -d "node_modules" ]; then
  PACKAGES=$(ls node_modules | wc -l)
  SIZE=$(du -sh node_modules | cut -f1)
  echo "  ✓ Instalado ($PACKAGES paquetes, $SIZE)"

  # Check corruptos
  CORRUPT=$(find node_modules -name "* [0-9]" -type d 2>/dev/null | wc -l)
  if [ $CORRUPT -gt 0 ]; then
    echo "  ✗ ADVERTENCIA: $CORRUPT archivos corruptos detectados"
  else
    echo "  ✓ Sin archivos corruptos"
  fi
else
  echo "  ✗ NO instalado"
fi
echo ""

# Prisma
echo "🗄️  Prisma:"
if [ -f "node_modules/.prisma/client/index.js" ]; then
  echo "  ✓ Cliente generado"
else
  echo "  ✗ Cliente NO generado"
fi
echo ""

# Cachés
echo "💾 Cachés:"
if [ -d "~/.bun/install/cache" ]; then
  CACHE_SIZE=$(du -sh ~/.bun/install/cache 2>/dev/null | cut -f1)
  echo "  Bun cache: $CACHE_SIZE"
else
  echo "  Bun cache: vacío"
fi
echo ""

echo "Ejecuta './scripts/verify-install.sh' para más detalles"
```

**Uso:**
```bash
chmod +x scripts/diagnose.sh
./scripts/diagnose.sh
```

---

## 📚 Problemas Históricos Resueltos

### Noviembre 29, 2025: Build Failure - Archivos Corruptos

**Problema:**
- Build fallaba con `error TS2688: Cannot find type definition file for 'react 2'`
- 18 directorios duplicados con sufijos numéricos en `@types/`
- Dependencias transitivas faltantes (jiti, pure-rand, MergeStrategy.js)

**Causa Raíz:**
1. Residuos de migración Turborepo → Bun workspaces
2. Cachés corruptos en 3 niveles (local + global + lockfile)
3. Bugs de Bun con dependencias profundamente anidadas

**Solución Aplicada:**
```bash
# Nuclear clean completo
rm -rf node_modules bun.lockb ~/.bun/install/cache
rm -rf apps/web/.next apps/web/node_modules

# Reinstalación fresca
bun install  # 303 paquetes en 24s

# Downgrade Prisma (auto-upgradeado a v7)
cd packages/database
bun add -D prisma@6.19.0
bun add @prisma/client@6.19.0
```

**Resultado:**
- ✅ Build exitoso en 7.0s
- ✅ Dev server en 815ms
- ✅ 0 archivos corruptos
- ✅ 303 paquetes completos

**Lección Aprendida:**
- **NUNCA** migrar herramientas sin limpieza nuclear previa
- **SIEMPRE** pin versiones de dependencias críticas
- **VERIFICAR** integridad post-install

---

### Noviembre 29, 2025: Dev Server - Next.js Module Corruption

**Problema:**
```bash
Error: _interop_require_default._ is not a function
```

**Causa:** Módulos de Next.js corruptos por instalación parcial

**Solución:**
```bash
rm -rf apps/web/.next apps/web/.turbo
bun install
bun run dev
```

---

### Noviembre 29, 2025: Missing Dependencies - jiti/c12

**Problema:**
```bash
Cannot find package 'jiti' imported from node_modules/c12/dist/index.mjs
```

**Causa:** Dependencia transitiva no instalada por Bun

**Solución:**
```bash
# Agregar explícitamente
bun add -D jiti c12
```

---

## 🔗 Referencias

### Documentación del Proyecto

- `README.md` - Guía de inicio rápido
- `QUICK_START.md` - Instrucciones detalladas de setup
- `docs/INDEX.md` - Hub de documentación
- `CLAUDE.md` - Context para AI assistants

### Documentación Externa

- [Bun Documentation](https://bun.sh/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma 6.x Docs](https://www.prisma.io/docs/orm)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Issues Conocidos

- [Bun #7924](https://github.com/oven-sh/bun/issues/7924) - Deep dependency resolution
- [Next.js #58953](https://github.com/vercel/next.js/issues/58953) - Turbopack cache issues

---

## 💡 Tips Generales

### Desarrollo Diario

```bash
# Al empezar el día
git pull
bun install           # Si package.json cambió
bun run dev

# Al terminar el día
bun run type-check   # Verificar antes de commit
bun run lint
git add .
git commit
```

### Antes de Deploy

```bash
# Verificación completa
bun run fresh        # Limpieza + reinstall
bun run ci           # type-check + lint + test + build

# Si todo pasa
git push origin main
```

### Debugging

```bash
# Ver qué está instalado
bun pm ls | grep paquete-nombre

# Ver estructura de node_modules
ls -R node_modules/@types | grep "react"

# Verificar symlinks de workspace
ls -la node_modules/@repo

# Limpiar todo y empezar de cero
bun run fresh
```

---

## 🆘 Cuando Todo Falla

Si ninguna solución funciona:

1. **Documenta el error exacto:**
   ```bash
   bun run build 2>&1 | tee error.log
   ```

2. **Verifica versiones:**
   ```bash
   node --version   # v22.20.0+
   bun --version    # 1.2.23+
   ```

3. **Limpieza nuclear + reinstall completo:**
   ```bash
   rm -rf node_modules bun.lockb ~/.bun/install/cache
   rm -rf apps/web/.next apps/web/node_modules
   bun install
   ```

4. **Si persiste, busca ayuda:**
   - Revisa `error.log`
   - Busca el error en GitHub Issues de Bun/Next.js
   - Consulta con el equipo

---

**Última actualización:** Noviembre 29, 2025
**Mantenedor:** InmoApp Team
**Versiones:** Bun 1.2.23, Next.js 16.0.1, Prisma 6.19.0
