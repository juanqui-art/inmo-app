# Testing & CI/CD - Quick Reference

> Cheat sheet para testing y CI/CD en InmoApp

---

## 🏃 Comandos Rápidos

### Testing Local

```bash
# Todos los tests
bun run test

# Solo Web
bun run test:web

# Watch mode (auto re-run)
cd apps/web && bun run test -- --watch

# UI Mode (visual)
cd apps/web && bun run test:ui

# Con coverage
cd apps/web && bun run test:coverage

# Test específico
cd apps/web && bun run test properties.test.ts
```

### Quality Checks

```bash
# Pre-commit (type-check + lint + test)
bun run pre-commit

# Full CI simulation (incluye build)
bun run ci

# Individual
bun run type-check
bun run lint
bun run build
```

---

## 📋 Checklist Pre-Commit

Ejecuta **ANTES** de push:

```bash
# ✅ Opción 1: Todo en uno
bun run pre-commit

# ✅ Opción 2: Manual
bun run type-check  # 1. TypeScript
bun run lint        # 2. Biome
bun run test        # 3. Tests
```

---

## 🧪 Estructura de Tests

### Patrón AAA

```typescript
describe('Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do X when Y', async () => {
    // ARRANGE: Setup
    const data = { /* ... */ };
    vi.mocked(myMock).mockResolvedValue(result);

    // ACT: Execute
    const output = await myFunction(data);

    // ASSERT: Verify
    expect(output).toEqual(expected);
    expect(myMock).toHaveBeenCalledWith(data);
  });
});
```

### Ubicación de Tests

```
Source:  lib/utils/my-util.ts
Test:    lib/utils/__tests__/my-util.test.ts
```

---

## 🤖 GitHub Actions CI

### Triggers

- ✅ Push a `main`
- ✅ Pull Request a cualquier branch
- ✅ Manual dispatch

### Jobs

1. Install dependencies (con cache)
2. Generate Prisma Client
3. Type Check
4. Lint
5. Run Tests
6. Build

**Tiempo:** ~3-5 minutos

### Ver Status

```bash
# GitHub UI
gh run list

# Ver último run
gh run view

# Logs del último run
gh run view --log
```

---

## 🔧 Troubleshooting

### Tests fallan localmente

```bash
# 1. Limpiar cache
rm -rf apps/web/.next .turbo

# 2. Regenerar Prisma
cd packages/database && bunx prisma generate

# 3. Reinstalar deps
rm -rf node_modules bun.lockb
bun install

# 4. Re-run
bun run test
```

### CI falla pero local pasa

**Causa común:** Environment variables

```bash
# Verifica secretos en GitHub:
# Settings → Secrets and variables → Actions
```

**Secretos requeridos:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

### Mock no funciona

```typescript
// ❌ NO: Import antes de mock
import { fn } from './module';
vi.mock('./module');

// ✅ SÍ: Mock primero
vi.mock('./module');
import { fn } from './module';
```

---

## 📊 Coverage

```bash
# Generar reporte
cd apps/web && bun run test:coverage

# Ver en browser
open apps/web/coverage/index.html
```

**Targets recomendados:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

---

## 🎯 Testing por Capa

| Capa | Qué testear | Ejemplo |
|------|-------------|---------|
| **Validations** | Datos válidos/inválidos | `createPropertySchema` |
| **Utils** | Input → Output | `generateSlug()` |
| **Server Actions** | Auth, validación, repo calls | `createPropertyAction` |
| **Repositories** | Authorization, transactions | `PropertyRepository.create()` |

---

## 🚀 Setup CI (Primera Vez)

```bash
# 1. Configurar secretos (ver .github/SETUP_SECRETS.md)

# 2. Test workflow
git checkout -b test/ci
git commit --allow-empty -m "test: CI setup"
git push -u origin test/ci

# 3. Verificar en GitHub Actions tab

# 4. Configurar branch protection en main
#    Settings → Branches → Add rule
#    - Require PR
#    - Require status: quality / Code Quality Checks
```

---

## 📚 Documentación Completa

- **Testing & CI/CD:** `docs/testing/TESTING_AND_CI_CD.md`
- **GitHub Setup:** `.github/README.md`
- **Secrets Setup:** `.github/SETUP_SECRETS.md`
- **Web Tests:** `apps/web/__tests__/README.md`
- **DB Tests:** `packages/database/src/__tests__/README.md`

---

## 🔗 Links Útiles

- **Vitest:** https://vitest.dev
- **Testing Library:** https://testing-library.com
- **GitHub Actions:** https://docs.github.com/actions
- **Turbo CI:** https://turbo.build/repo/docs/ci

---

**Actualizado:** 17 de noviembre, 2025
