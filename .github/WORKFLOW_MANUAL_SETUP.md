# Manual Setup Required for GitHub Actions Workflow

## ⚠️ Action Required

El archivo `ci.yml` en este directorio **no se pudo pushear automáticamente** debido a restricciones de permisos de GitHub App.

**Razón:** GitHub requiere el permiso especial `workflows` para que las Apps puedan crear o modificar archivos de workflow por seguridad.

---

## 📋 Solución: Agregar el Workflow Manualmente

### Opción 1: Push Manual (Recomendado)

El archivo `ci.yml` ya está creado localmente en este directorio. Solo necesitas hacer push manual:

```bash
# 1. Verifica que el archivo existe
ls -la .github/workflows/ci.yml

# 2. Agrégalo al git
git add .github/workflows/ci.yml

# 3. Commit
git commit -m "feat(ci): add GitHub Actions CI workflow

Add automated quality checks workflow:
- Type checking
- Linting
- Testing
- Build verification

Runs on push to main and all PRs."

# 4. Push (desde tu máquina local, NO desde Claude)
git push
```

### Opción 2: Crear Directamente en GitHub UI

1. Ve a tu repositorio en GitHub
2. Click en **Actions** tab
3. Click en **New workflow**
4. Click en **set up a workflow yourself**
5. Copia el contenido de `.github/workflows/ci.yml` (ver abajo)
6. Commit directamente en GitHub

---

## 📄 Contenido del Archivo ci.yml

El archivo completo está en: `.github/workflows/ci.yml`

O cópialo de aquí:

```yaml
name: CI - Quality Checks

on:
  push:
    branches: [main]
  pull_request:
    branches: ['**']
  workflow_dispatch:

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    timeout-minutes: 15

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      # 1. Checkout código
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      # 2. Setup Bun
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      # 3. Cache de dependencias
      - name: Cache Dependencies
        uses: actions/cache@v3
        with:
          path: |
            **/node_modules
            ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      # 4. Install dependencies
      - name: Install Dependencies
        run: bun install --frozen-lockfile

      # 5. Generate Prisma Client
      - name: Generate Prisma Client
        run: |
          cd packages/database
          bunx prisma generate

      # 6. Type Check
      - name: Type Check
        run: bun run type-check

      # 7. Lint
      - name: Lint Code
        run: bun run lint

      # 8. Run Tests
      - name: Run Tests
        run: bun run test
        env:
          NODE_ENV: test

      # 9. Build
      - name: Build Application
        run: bun run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
          NEXT_PUBLIC_MAPBOX_TOKEN: ${{ secrets.NEXT_PUBLIC_MAPBOX_TOKEN }}
```

---

## ✅ Verificación

Después de agregar el workflow:

1. Ve a **Actions** tab en GitHub
2. Deberías ver "CI - Quality Checks" en la lista de workflows
3. Crea un PR de prueba para verificar que se ejecuta automáticamente

---

## 📚 Próximos Pasos

Una vez que el workflow esté pusheado:

1. **Configurar secretos** - Ver: `.github/SETUP_SECRETS.md`
2. **Configurar branch protection** - Ver: `.github/README.md`
3. **Probar workflow** - Ver: `docs/testing/CI_CD_SETUP_SUMMARY.md`

---

**Documentación completa:** `docs/testing/TESTING_AND_CI_CD.md`
