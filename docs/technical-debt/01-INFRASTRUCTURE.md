# 🏗️ Infraestructura y Robustez

> **50 tareas identificadas** | Estimado: 2-3 semanas
> Fundamentos críticos para escalabilidad y producción

---

## 📋 Resumen

**Estado Actual:** ✅ MVP funcional con arquitectura sólida

**Gaps Identificados:**
- ❌ Cero tests implementados
- ❌ Sin error handling estructurado
- ❌ Sin logging para debugging
- ❌ Validación incompleta (XSS risk)
- ❌ Sin rate limiting (abuse possible)
- ❌ Transacciones sin rollback

**Impacto:** Dificulta debugging en producción y previene escalabilidad segura

---

## ✅ Fase 0: TypeScript (COMPLETADO)

**Status:** ✅ **COMPLETADO** (Oct 2025, commit: f0f69d7)

**Logros:**
- ✅ 51 errores de TypeScript corregidos
- ✅ Type guards implementados en auth components
- ✅ PropertyFormState interface agregada
- ✅ File validation mejorada en Server Actions
- ✅ Zod schemas actualizados (deprecated API migrado)
- ✅ `bun run type-check` pasa sin errores

**Tiempo invertido:** ~30 minutos

---

## 🎯 Fase 1: Fundamentos Críticos (1-2 semanas)

### 1.1 Error Handling & Structured Logging

**Objetivo:** Debugging efectivo en producción

**Tareas:** (7 items)

#### Custom Error Classes
```typescript
// packages/shared/errors/index.ts
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthError extends Error { /* ... */ }
export class PermissionError extends Error { /* ... */ }
export class NotFoundError extends Error { /* ... */ }
```

**Archivos a crear:**
- [ ] `packages/shared/errors/index.ts` - Custom error classes
- [ ] `packages/shared/logger/index.ts` - Pino logger configurado
- [ ] `apps/web/lib/action-wrapper.ts` - HOC para Server Actions
- [ ] `apps/web/components/error-boundary.tsx` - Generic boundary
- [ ] `apps/web/components/properties/property-form-error-boundary.tsx` - Specific

**Archivos a modificar:**
- [ ] `apps/web/app/actions/properties.ts` - Wrap con error handling
- [ ] `apps/web/app/dashboard/propiedades/nueva/page.tsx` - Add boundary

**Comandos:**
```bash
bun add pino pino-pretty
```

**Ejemplo de uso:**
```typescript
// Server Action con wrapper
import { withLogging } from '@/lib/action-wrapper'

export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    // ... lógica
  }
)
```

**Beneficios:**
- ✅ Errores estructurados con contexto completo
- ✅ RequestId para tracing
- ✅ Logs automáticos de duration y success/failure
- ✅ Sentry integration preparada

**Estimado:** 2-3 horas

---

### 1.2 Validación de Datos Completa

**Objetivo:** Prevenir XSS, injection, y abuse

**Tareas:** (5 items)

#### Input Sanitization
```typescript
// apps/web/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  })
}
```

#### Rate Limiting
```typescript
// apps/web/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 d'), // 10 properties per day
})
```

**Archivos a crear:**
- [ ] `apps/web/lib/sanitize.ts` - Input sanitization
- [ ] `apps/web/lib/rate-limit.ts` - Rate limiting con Redis
- [ ] `apps/web/lib/storage/validation.ts` - File validation mejorada

**Archivos a modificar:**
- [ ] `apps/web/app/actions/properties.ts` - Add sanitization y rate limits
- [ ] `apps/web/lib/validations/property.ts` - Enhanced validation rules

**Dependencias:**
```bash
bun add isomorphic-dompurify @upstash/ratelimit @upstash/redis
```

**Límites propuestos:**
- Max 10 propiedades creadas por día por usuario
- Max 50 imágenes subidas por día
- Max 5 intentos de login por 15 minutos
- Max 100MB storage total por usuario

**Validaciones a agregar:**
- [ ] URLs de imágenes (prevenir scripts)
- [ ] Content-Type real (magic bytes, no solo extensión)
- [ ] Texto de descripción (DOMPurify)
- [ ] Total size per user

**Estimado:** 3-4 horas

---

### 1.3 Seguridad Esencial

**Objetivo:** Cerrar vectores de ataque conocidos

**Tareas:** (5 items)

#### Security Headers
```typescript
// apps/web/next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

**Archivos a crear:**
- [ ] `apps/web/lib/env.ts` - Runtime env validation (migrar a @repo/env)
- [ ] `docs/security/SECRET_ROTATION.md` - Procedimiento documentado

**Archivos a modificar:**
- [ ] `apps/web/next.config.ts` - Add security headers
- [ ] `packages/env/src/index.ts` - Enhanced validation

**Tareas:**
- [ ] Environment variables validation con Zod en startup
- [ ] CSRF tokens para Server Actions críticos (delete, update)
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Documentar secret rotation procedure
- [ ] Auditar RLS policies en Supabase

**Estimado:** 2-3 horas

---

### 1.4 Transacciones y Consistencia

**Objetivo:** Prevenir datos inconsistentes

**Tareas:** (4 items)

**Problema actual:**
```typescript
// apps/web/app/actions/properties.ts - CURRENT (NO TRANSACTION)
export async function uploadPropertyImagesAction(propertyId, files) {
  // 1. Upload to Storage
  const urls = await uploadToSupabase(files)

  // 2. Save to DB
  await db.propertyImage.createMany({ data: urls })
  // ⚠️ Si falla aquí, files quedan huérfanos en Storage
}
```

**Solución propuesta:**
```typescript
// WITH TRANSACTION + ROLLBACK
export async function uploadPropertyImagesAction(propertyId, files) {
  const uploadedFiles = []

  try {
    // 1. Upload to Storage
    uploadedFiles = await uploadToSupabase(files)

    // 2. Save to DB in transaction
    await db.$transaction(async (tx) => {
      await tx.propertyImage.createMany({ data: uploadedFiles })
    })
  } catch (error) {
    // 3. Manual rollback - delete uploaded files
    await deleteFromSupabase(uploadedFiles.map(f => f.path))
    throw error
  }
}
```

**Archivos a modificar:**
- [ ] `apps/web/app/actions/properties.ts` - Add transactions
- [ ] `packages/database/prisma/schema.prisma` - Add `version` field
- [ ] `packages/database/src/repositories/properties.ts` - Optimistic locking

**Tareas:**
- [ ] Refactor `uploadPropertyImagesAction` con rollback
- [ ] Refactor `createPropertyAction` (create + images atomic)
- [ ] Implementar optimistic locking:
  - Add `version Int @default(1)` to Property model
  - Check version before updates
- [ ] Cleanup job para archivos huérfanos (cron semanal)

**Ejemplo optimistic locking:**
```typescript
// UPDATE with version check
await db.property.update({
  where: {
    id: propertyId,
    version: currentVersion // ← Check version matches
  },
  data: {
    ...updates,
    version: { increment: 1 } // ← Increment on success
  }
})
```

**Estimado:** 4-5 horas

---

## 🧪 Fase 2: Testing Estratégico (1 semana)

### Estado Actual

**Coverage:** ❌ **0% (ZERO TESTS)**

**Vitest instalado:** ✅ Configurado (Fase 0.5)
- 5 tests básicos escritos (validations, serialization)
- Scripts disponibles: `bun test`, `bun test:run`, `bun test:coverage`

### 2.1 Tests de Infraestructura

**Tareas:** (10 items)

#### Unit Tests - Repositories
- [ ] `PropertyRepository.create()` - Verify permissions
- [ ] `PropertyRepository.update()` - Verify ownership
- [ ] `PropertyRepository.delete()` - Verify cleanup
- [ ] `FavoriteRepository.add()` - Verify user can favorite
- [ ] Mock Prisma with `prisma-mock`

#### Integration Tests - Server Actions
- [ ] `createPropertyAction` with valid data → success
- [ ] `createPropertyAction` with invalid data → validation error
- [ ] `uploadPropertyImagesAction` with rollback scenario
- [ ] `deletePropertyAction` verifies image cleanup

#### Validation Tests - Zod Schemas
- [ ] All schema edge cases covered
- [ ] Custom error messages verified

**Archivos a crear:**
```
packages/database/src/repositories/__tests__/
├── properties.test.ts
├── favorites.test.ts
└── appointments.test.ts

apps/web/app/actions/__tests__/
├── properties.test.ts
├── favorites.test.ts
└── appointments.test.ts
```

**Dependencias:**
```bash
bun add -D prisma-mock @faker-js/faker
```

**Estimado:** 8-10 horas

---

### 2.2 Tests E2E Críticos

**Tareas:** (6 items)

#### Playwright Setup
```bash
bun add -D @playwright/test
bunx playwright install
```

#### Test Cases
- [ ] **Auth Flow:** Login con email/password
- [ ] **Auth Flow:** Login con Google OAuth
- [ ] **Properties:** Crear propiedad completa (form + images)
- [ ] **Properties:** Editar propiedad (verify permissions)
- [ ] **Properties:** Eliminar propiedad (verify image cleanup)
- [ ] **Appointments:** Crear cita (verify email sent)

**Archivos a crear:**
```
apps/web/e2e/
├── auth.spec.ts
├── properties.spec.ts
└── appointments.spec.ts

playwright.config.ts
```

**Ejemplo:**
```typescript
// e2e/properties.spec.ts
import { test, expect } from '@playwright/test'

test('create property successfully', async ({ page }) => {
  // 1. Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'agent@test.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // 2. Navigate to new property
  await page.goto('/dashboard/propiedades/nueva')

  // 3. Fill form
  await page.fill('[name="title"]', 'Casa de Prueba')
  await page.fill('[name="price"]', '150000')

  // 4. Submit
  await page.click('button[type="submit"]')

  // 5. Verify redirect to property page
  await expect(page).toHaveURL(/\/propiedades\/\d+/)
})
```

**Estimado:** 6-8 horas

---

### 2.3 CI/CD Pipeline

**Tareas:** (3 items)

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Lint
        run: bun run lint

      - name: Type check
        run: bun run type-check

      - name: Unit tests
        run: bun test:run

      - name: Build
        run: bun run build

      - name: E2E tests
        run: bunx playwright test
```

**Archivos a crear:**
- [ ] `.github/workflows/ci.yml` - Lint, test, build
- [ ] `.github/workflows/deploy.yml` - Vercel deployment
- [ ] Branch protection rules en GitHub

**Tareas:**
- [ ] Setup GitHub Actions workflow
- [ ] Auto-deploy to Vercel Preview on PR
- [ ] Require CI pass before merge
- [ ] Setup test database for CI

**Estimado:** 3-4 horas

---

## 📊 Fase 3: Observabilidad (3-5 días)

### 3.1 Logging y Métricas

**Tareas:** (8 items)

#### Structured Logging Context
```typescript
// Every log includes:
interface LogContext {
  userId?: string
  propertyId?: string
  action: string
  requestId?: string
  duration?: number
  error?: Error
}
```

**Tareas:**
- [ ] Structured logging en todos los Server Actions
- [ ] Performance monitoring:
  - DB query time (slow query log > 100ms)
  - Storage upload time
  - Error rate per endpoint
- [ ] Dashboards con Vercel Analytics o Grafana:
  - Properties created/day
  - Errors by type
  - Active users
- [ ] Alertas para errores críticos:
  - Error rate > 5%
  - Upload failing > 10 times/hour

**Herramientas:**
- Sentry (errores)
- Vercel Analytics (performance)
- Upstash (métricas custom en Redis)

**Estimado:** 4-6 horas

---

### 3.2 Developer Experience

**Tareas:** (6 items)

#### Pre-commit Hooks
```bash
bun add -D husky lint-staged
bunx husky init
```

**Archivos a crear:**
- [ ] `.husky/pre-commit`
- [ ] `.lintstagedrc.json`
- [ ] `.commitlintrc.json`
- [ ] `docs/decisions/` - ADR templates
- [ ] `docs/decisions/001-oslo-gray-palette.md`
- [ ] `docs/decisions/002-server-components-first.md`

**Configuración:**
```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "biome check --write",
    "bun run type-check"
  ]
}
```

**Tareas:**
- [ ] Pre-commit hooks con Husky
- [ ] Lint-staged para performance
- [ ] Conventional commits con Commitlint
- [ ] Automatic changelog con `release-please`
- [ ] ADRs (Architecture Decision Records)
- [ ] Storybook para componentes (opcional)

**Estimado:** 3-4 horas

---

## 📈 Plan de Implementación

### Semana 1-2: Fundamentos (Fase 1)

**Día 1-2:** Error Handling & Logging
- Setup Pino
- Custom error classes
- Wrapper para Server Actions
- Error boundaries

**Día 3-4:** Validación & Security
- Input sanitization
- Rate limiting con Redis
- Security headers
- Env validation

**Día 5:** Transacciones
- Refactor uploadPropertyImagesAction
- Optimistic locking
- Cleanup job

**Checkpoint:** Aplicación con error handling robusto

---

### Semana 3: Testing (Fase 2)

**Día 1-2:** Unit & Integration Tests
- Repository tests
- Server Action tests
- Validation tests

**Día 3-4:** E2E Tests
- Playwright setup
- Auth flow tests
- Property CRUD tests

**Día 5:** CI/CD
- GitHub Actions workflow
- Branch protection
- Vercel integration

**Checkpoint:** Coverage > 50%, CI/CD funcionando

---

### Semana 4: Observability (Fase 3)

**Día 1-2:** Logging & Metrics
- Structured logs en Server Actions
- Performance monitoring
- Dashboards

**Día 3-4:** DX Improvements
- Pre-commit hooks
- Lint-staged
- Commitlint

**Día 5:** Documentation
- ADRs
- Testing guide
- Contributing guide

**Checkpoint:** App production-ready con full observability

---

## ✅ Checklist de Completitud

Al terminar todas las fases, verificar:

### Fase 1: Fundamentos
- [ ] `bun run dev` falla si falta env var crítica
- [ ] Server Actions tienen try/catch y logging automático
- [ ] Error boundaries funcionan en componentes críticos
- [ ] Rate limiting previene abuse (10 properties/day funciona)
- [ ] Security headers presentes en todas las respuestas
- [ ] Transacciones con rollback en uploads

### Fase 2: Testing
- [ ] `bun test` pasa todos los tests
- [ ] Coverage > 50% en repositories y Server Actions
- [ ] E2E tests pasan para flujos críticos
- [ ] CI/CD ejecuta tests en cada PR
- [ ] Branch protection requiere CI pass

### Fase 3: Observability
- [ ] Logs estructurados visibles en producción
- [ ] Sentry captura y reporta errores
- [ ] Dashboards muestran métricas clave
- [ ] Alertas configuradas para errores críticos
- [ ] Pre-commit hooks funcionando
- [ ] 3+ ADRs documentados

---

## 🎯 Métricas de Éxito

**KPIs después de implementación:**

| Métrica | Antes | Después | Meta |
|---------|-------|---------|------|
| Test Coverage | 0% | >50% | >70% |
| Mean Time to Debug | ~2 horas | ~15 min | <30 min |
| Error Rate | Desconocido | <1% | <2% |
| Deployment Confidence | 6/10 | 9/10 | >8/10 |
| Onboarding Time | ~2 días | ~4 horas | <1 día |

---

## 💰 ROI Estimado

**Inversión:** 2-3 semanas (~80-120 horas)

**Retorno:**
- ✅ Debugging 10x más rápido (ahorro: ~10 horas/mes)
- ✅ Prevención de bugs en producción (ahorro: ~5 horas/mes)
- ✅ Confianza para refactorizar (velocity +30%)
- ✅ Onboarding 50% más rápido (ahorro: ~1 día/dev)
- ✅ Deploy sin miedo (psychological benefit)

**Payback period:** ~2-3 meses

---

## 📚 Referencias

**Guías relacionadas:**
- `.claude/07-technical-debt.md` - Plan original
- `docs/progress/ROADMAP.md` - Plan de escalabilidad
- `docs/testing/TESTING_STRATEGY.md` - Estrategia de testing (a crear)
- `docs/security/SECURITY_GUIDELINES.md` - Guidelines (a crear)

**Herramientas:**
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - E2E testing
- [Pino](https://getpino.io/) - Structured logging
- [Sentry](https://sentry.io/) - Error tracking
- [Upstash](https://upstash.com/) - Redis for rate limiting

---

**Última actualización:** Noviembre 14, 2025
**Status:** Documentado, listo para implementación
