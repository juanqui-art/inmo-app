# CI/CD Guide - InmoApp

> **Última actualización:** Diciembre 1, 2025
> **Estado:** ✅ **ACTIVO Y FUNCIONAL**

---

## Resumen Ejecutivo

### ✅ Estado Actual (Dec 1, 2025)

**CI/CD Pipeline:** ✅ **IMPLEMENTADO Y ACTIVO**
- GitHub Actions workflow configurado
- 289 tests ejecutándose automáticamente
- Coverage enforcement activo (25% threshold)
- Bloquea merges si tests fallan

**Test Suite:** ✅ **289/289 PASSING (100%)**
- apps/web: 160 tests
- packages/database: 129 tests
- Execution: ~1.2s local, ~3-5min CI

**Coverage:** ✅ **46.53%** (target: 25%) - SUPERADO

---

## Arquitectura CI/CD

### GitHub Actions Workflow

**Archivo:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:       # 289 tests
  lint:       # Biome linting
  type-check: # TypeScript validation
```

### Jobs Ejecutados

#### 1. **Test Job** (crítico)

Ejecuta todos los tests y valida coverage:

```bash
# 1. Setup
- Checkout code
- Install Bun
- Install dependencies
- Generate Prisma client

# 2. Tests
- Run apps/web tests (160 tests)
- Run packages/database tests (129 tests)

# 3. Coverage
- Generate coverage reports
- Upload to Codecov
- Enforce thresholds:
  * apps/web: 25% lines minimum
  * packages/database: 80% lines minimum
```

**Tiempo estimado:** 2-3 minutos

#### 2. **Lint Job** (calidad)

```bash
- Run Biome linter
- Check code style
- Report issues
```

**Tiempo estimado:** 30 segundos

#### 3. **Type-check Job** (types)

```bash
- Generate Prisma client
- Run TypeScript compiler
- Verify no type errors
```

**Tiempo estimado:** 1-2 minutos

---

## Coverage Configuration

### apps/web Thresholds

**Archivo:** `apps/web/vitest.config.ts`

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    lines: 25,        // Minimum 25% line coverage
    functions: 20,    // Minimum 20% function coverage
    branches: 20,     // Minimum 20% branch coverage
    statements: 25,   // Minimum 25% statement coverage
  }
}
```

**Current Coverage:** 46.53% ✅

### packages/database Thresholds

**Archivo:** `packages/database/vitest.config.ts`

```typescript
coverage: {
  thresholds: {
    lines: 80,        // Higher threshold for repositories
    functions: 75,
    branches: 70,
    statements: 80,
  }
}
```

**Current Coverage:** ~85% ✅

---

## Cómo Funciona

### Flujo Automático

```
Developer → git push → GitHub Actions Triggered
                    ↓
           ┌────────┴────────┐
           │   CI Pipeline   │
           │  (3 jobs)       │
           └────────┬────────┘
                    ↓
           ┌────────┴────────┐
           │  Tests Pass?    │
           └────────┬────────┘
                    ↓
            Yes ✅     No ❌
             ↓          ↓
         Merge OK   Merge Blocked
```

### Ejemplo de Push

```bash
# 1. Developer hace cambios
git add .
git commit -m "feat: add new feature"
git push

# 2. GitHub Actions se ejecuta automáticamente
# 3. Developer ve el status en GitHub
# 4. Si todo pasa: ✅ Ready to merge
# 5. Si algo falla: ❌ Fix required
```

---

## Comandos Locales

### Ejecutar Tests

```bash
# All tests (apps/web)
cd apps/web && bunx vitest run

# All tests (database)
cd packages/database && bunx vitest run

# Watch mode
bunx vitest
```

### Generar Coverage

```bash
# apps/web
cd apps/web && bunx vitest run --coverage

# Ver report HTML
open apps/web/coverage/index.html
```

### Simular CI Localmente

```bash
# Full CI simulation
bun run type-check && bun run lint && cd apps/web && bunx vitest run
```

---

## Coverage Reports

### Reporters Configurados

1. **text** - Console output durante test run
2. **json** - Machine-readable para CI
3. **html** - Browseable local report
4. **lcov** - Codecov/external tools

### Ver Coverage Localmente

```bash
# 1. Generate coverage
cd apps/web && bunx vitest run --coverage

# 2. Open HTML report
open apps/web/coverage/index.html

# 3. Browse by file/folder
# 4. See uncovered lines highlighted
```

---

## GitHub Integration

### Status Checks

Cada PR muestra:

```
✅ test / Test (apps/web + database)
✅ lint / Code Quality
✅ type-check / TypeScript
```

### Merge Protection

**Branch Protection Rules (main):**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date
- ✅ Block merge if any check fails

### Codecov Integration

Coverage reports uploaded automáticamente a Codecov (opcional):

```yaml
- name: Upload coverage reports
  uses: codecov/codecov-action@v4
  with:
    files: ./apps/web/coverage/coverage-final.json
    fail_ci_if_error: false
  env:
    CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

---

## Troubleshooting

### Tests pasan local pero fallan en CI

**Causa común:** Environment variables

**Solución:**
1. Verifica que todos los secretos estén configurados en GitHub
2. Revisa logs en GitHub Actions tab
3. Asegura que Prisma client se genera antes de tests

### Coverage threshold fails

**Error:**
```
ERROR: Coverage threshold not met
Expected: 25%, Actual: 23%
```

**Solución:**
```bash
# 1. Check what's not covered
cd apps/web && bunx vitest run --coverage

# 2. Add tests for uncovered code
# 3. Verify locally
bunx vitest run --coverage

# 4. Push again
```

### Workflow doesn't trigger

**Causas posibles:**
1. Workflow file tiene errores de sintaxis
2. GitHub Actions disabled en repo settings
3. Push a branch protegida sin permisos

**Solución:**
1. Valida YAML: `yamllint .github/workflows/test.yml`
2. Settings → Actions → Allow all actions
3. Crear PR en vez de push directo

---

## Metrics & Performance

### Current Stats (Dec 1, 2025)

```
Test Suite:
- Total Tests:      289
- Passing:          289 (100%)
- Execution Time:   ~1.2s (local)
- CI Time:          ~3-5min (GitHub Actions)

Coverage:
- apps/web:         46.53% (target: 25%) ✅
- database:         ~85% (target: 80%) ✅

CI Performance:
- Setup:            ~30s (Bun + deps)
- Prisma Gen:       ~15s
- Tests:            ~1.5-2min
- Lint:             ~30s
- Type-check:       ~1min
- Total:            ~3-5min
```

### GitHub Actions Limits

**Free tier (public repos):**
- 2,000 minutes/month
- Unlimited concurrent jobs

**InmoApp usage:**
- ~5 min per CI run
- ~10 pushes/week = ~50 min/week
- ~200 min/month = **10% of quota** ✅

---

## Best Practices

### Writing Tests

```typescript
// ✅ Good - AAA pattern
it("should create user successfully", async () => {
  // Arrange
  const userData = { name: "Juan", email: "juan@test.com" };
  vi.mocked(db.user.create).mockResolvedValue(mockUser);

  // Act
  const result = await repository.create(userData);

  // Assert
  expect(result).toEqual(mockUser);
  expect(db.user.create).toHaveBeenCalledWith({ data: userData });
});
```

### Coverage Guidelines

1. **Focus on critical paths:** Auth, payments, data mutations
2. **Don't chase 100%:** 70-80% is excellent for most code
3. **Ignore config files:** Already excluded in vitest.config.ts
4. **Test behavior, not implementation:** Mock external deps

### CI Optimization

```bash
# ✅ Run tests in parallel
bunx vitest run --threads

# ✅ Use coverage cache
bunx vitest run --coverage --coverage.clean=false

# ❌ Don't run tests twice
# Bad: bun test && bunx vitest run
# Good: bunx vitest run
```

---

## Roadmap

### ✅ Completed (Dec 1, 2025)

- [x] GitHub Actions workflow
- [x] 289 tests implemented
- [x] Coverage enforcement
- [x] Codecov integration
- [x] Documentation

### 🔄 In Progress

- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance budgets

### 📅 Planned

- [ ] Deploy preview comments
- [ ] Slack/Discord notifications
- [ ] Coverage trend tracking

---

## Resources

### Documentation

- **Main Roadmap:** `docs/ROADMAP.md`
- **Test Suite Status:** `docs/testing/TEST_SUITE_STATUS.md`
- **Quick Reference:** `docs/testing/QUICK_REFERENCE.md`

### External Links

- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov](https://codecov.io/)
- [@vitest/coverage-v8](https://github.com/vitest-dev/vitest/tree/main/packages/coverage-v8)

---

## Summary

**Status:** ✅ **PRODUCTION READY**

| Metric | Value | Status |
|--------|-------|--------|
| **CI/CD** | Active | ✅ |
| **Tests** | 289/289 | ✅ |
| **Coverage** | 46.53% | ✅ |
| **GitHub Actions** | Configured | ✅ |
| **Auto-block merges** | Enabled | ✅ |

**CI/CD is fully operational and protecting the codebase from regressions.**

---

**Last Updated:** December 1, 2025
**Next Review:** After Week 3 completion
**Maintained by:** Development Team
