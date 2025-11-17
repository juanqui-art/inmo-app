# GitHub Configuration - InmoApp

Este directorio contiene la configuración de GitHub Actions (CI/CD) y Dependabot para InmoApp.

---

## Contenido

```
.github/
├── workflows/
│   └── ci.yml              # Workflow de CI/CD (quality checks)
├── dependabot.yml          # Configuración de Dependabot (updates automáticos)
├── SETUP_SECRETS.md        # Guía para configurar secretos de GitHub
└── README.md               # Este archivo
```

---

## Workflows

### CI - Quality Checks (`workflows/ci.yml`)

**Triggers:**
- Push a `main`
- Pull Request a cualquier branch
- Manual dispatch

**Jobs ejecutados:**
1. ✅ Install dependencies (con cache de Bun)
2. ✅ Generate Prisma Client
3. ✅ Type Check (TypeScript)
4. ✅ Lint (Biome)
5. ✅ Run Tests (Vitest)
6. ✅ Build (Next.js)

**Tiempo estimado:** 3-5 minutos

**Badge para README:**
```markdown
![CI](https://github.com/juanqui-art/inmo-app/workflows/CI%20-%20Quality%20Checks/badge.svg)
```

---

## Configuración Inicial

### 1. Configurar Secretos

Sigue las instrucciones en **[SETUP_SECRETS.md](./SETUP_SECRETS.md)**

**Secretos requeridos:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

**Secretos opcionales:**
- `TURBO_TOKEN` (Remote Caching)
- `TURBO_TEAM` (Remote Caching)
- `CODECOV_TOKEN` (Coverage reports)

### 2. Configurar Branch Protection

**Para `main` branch:**

1. Ve a: **Settings** → **Branches** → **Add branch protection rule**

2. Configuración recomendada:
   ```
   Branch name pattern: main

   ✅ Require a pull request before merging
      ✅ Require approvals: 1
      ✅ Dismiss stale pull request approvals when new commits are pushed

   ✅ Require status checks to pass before merging
      ✅ Require branches to be up to date before merging
      Status checks required:
         - quality / Code Quality Checks

   ✅ Require conversation resolution before merging

   ✅ Do not allow bypassing the above settings
   ```

3. Click **Create**

### 3. Verificar Workflow

**Primera ejecución:**

```bash
# 1. Crea un branch de prueba
git checkout -b test/ci-setup

# 2. Haz un cambio menor
echo "# CI Test" >> test.md

# 3. Commit y push
git add test.md
git commit -m "test: verify CI workflow"
git push -u origin test/ci-setup

# 4. Crea un Pull Request
gh pr create --title "Test CI Workflow" --body "Testing GitHub Actions setup"
```

**Verificar:**
1. Ve a la pestaña **Actions** en GitHub
2. Deberías ver el workflow "CI - Quality Checks" ejecutándose
3. Si pasa: ✅ CI configurado correctamente
4. Si falla: Revisa logs y secretos

---

## Dependabot

### Configuración (`dependabot.yml`)

**Actualizaciones automáticas para:**
- NPM dependencies (semanal)
- GitHub Actions (semanal)

**Configuración:**
- Límite: 10 PRs abiertos simultáneamente
- Labels: `dependencies`, `automated`
- Agrupación: Minor/patch updates agrupados

### Gestión de PRs de Dependabot

**Workflow recomendado:**

```bash
# 1. Dependabot crea PR
# 2. CI ejecuta automáticamente
# 3. Si CI pasa:
#    - Revisa changelog del paquete
#    - Si es minor/patch: Merge
#    - Si es major: Revisar breaking changes

# Comandos útiles en PR comments:
@dependabot merge        # Auto-merge si CI pasa
@dependabot rebase       # Rebase PR
@dependabot recreate     # Recrear PR
@dependabot close        # Cerrar sin merge
```

---

## Scripts Locales (Pre-CI)

Ejecuta estos comandos **antes de push** para evitar fallos en CI:

```bash
# Ejecutar todos los checks (igual que CI)
bun run pre-commit

# O ejecutar manualmente cada uno:
bun run type-check     # TypeScript
bun run lint           # Biome linting
bun run test           # Vitest tests

# Full CI simulation (incluye build)
bun run ci
```

**Agregar al `.git/hooks/pre-commit` (opcional):**

```bash
#!/bin/sh
echo "🔍 Running pre-commit checks..."
bun run pre-commit || exit 1
echo "✅ All checks passed!"
```

---

## Troubleshooting

### CI falla en "Install Dependencies"

**Causa:** Cache corrupted o `bun.lockb` desactualizado

**Solución:**
```bash
# Actualiza lockfile
rm bun.lockb
bun install
git add bun.lockb
git commit -m "chore: update bun lockfile"
git push
```

### CI falla en "Generate Prisma Client"

**Causa:** Schema de Prisma cambió pero no se regeneró

**Solución:**
```bash
cd packages/database
bunx prisma generate
git add prisma/schema.prisma
git commit -m "chore: update prisma schema"
git push
```

### CI falla en "Build Application"

**Causa:** Secretos faltantes o incorrectos

**Solución:**
1. Verifica secretos en: **Settings** → **Secrets and variables** → **Actions**
2. Revisa [SETUP_SECRETS.md](./SETUP_SECRETS.md)
3. Asegúrate de que todos los secretos REQUERIDOS estén configurados

### Workflow no se ejecuta

**Causa:** Permisos de Actions deshabilitados

**Solución:**
1. Ve a: **Settings** → **Actions** → **General**
2. En "Actions permissions":
   - ✅ Allow all actions and reusable workflows
3. En "Workflow permissions":
   - ✅ Read and write permissions
4. Click **Save**

---

## Próximas Mejoras

- [ ] E2E testing con Playwright
- [ ] Visual regression testing
- [ ] Performance budgets
- [ ] Lighthouse CI
- [ ] Deploy preview comments en PRs
- [ ] Slack/Discord notifications

---

## Recursos

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Dependabot Docs:** https://docs.github.com/en/code-security/dependabot
- **Turborepo CI:** https://turbo.build/repo/docs/ci
- **Bun CI Examples:** https://bun.sh/guides/test/ci

---

**Última actualización:** 17 de noviembre, 2025
**Documentación completa:** `docs/testing/TESTING_AND_CI_CD.md`
