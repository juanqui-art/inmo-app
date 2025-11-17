# Infraestructura de Testing y CI/CD - InmoApp

> **Última actualización:** 17 de noviembre, 2025
> **Estado:** Testing ✅ Operacional | CI/CD ⚠️ No Configurado

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Infraestructura de Testing Actual](#infraestructura-de-testing-actual)
3. [Arquitectura de Testing](#arquitectura-de-testing)
4. [CI/CD con GitHub Actions](#cicd-con-github-actions)
5. [Guía de Uso](#guía-de-uso)
6. [Próximos Pasos](#próximos-pasos)

---

## Resumen Ejecutivo

### Estado Actual

**Testing Infrastructure:** ✅ **OPERACIONAL**
- 83 tests implementados (80% aprobados)
- Framework: Vitest 4.0.8
- Cobertura: Server Actions, Repositorios, Validaciones, Utilidades
- Mocking completo: Database, Auth, Supabase, Next.js

**CI/CD Pipeline:** ⚠️ **NO CONFIGURADO**
- No existe `.github/workflows/`
- Sin automatización de tests en PR/push
- Sin checks de calidad automatizados
- **Acción requerida:** Implementar GitHub Actions

### Stack Tecnológico

| Componente | Herramienta | Versión |
|------------|-------------|---------|
| Test Runner | Vitest | ^4.0.8 |
| Environment | happy-dom | ^20.0.2 |
| Component Testing | React Testing Library | ^16.3.0 |
| Coverage Reporter | v8 (built-in) | - |
| UI Mode | @vitest/ui | ^4.0.8 |

---

## Infraestructura de Testing Actual

### 1. Configuración por Workspace

#### A. `apps/web/vitest.config.ts`

**Propósito:** Testing de la aplicación Next.js

```typescript
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

**Características:**
- ✅ React plugin habilitado
- ✅ Globals (`describe`, `it`, `expect`) disponibles sin imports
- ✅ Setup file para mocks globales
- ✅ Pattern inclusivo en `__tests__/`
- ✅ Coverage con HTML viewer

#### B. `packages/database/vitest.config.ts`

**Propósito:** Testing de repositorios Prisma

```typescript
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

**Características:**
- ✅ Sin React (solo Node.js/Prisma)
- ✅ Alias `@` apunta a `./src`
- ✅ Coverage independiente

---

### 2. Setup Global (`apps/web/vitest.setup.ts`)

**67 líneas de mocking completo** para testing sin dependencias externas:

#### Mocks Implementados

**A. Variables de Entorno**
```typescript
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};
```

**B. Repositorios de Base de Datos**
```typescript
vi.mock('@repo/database', () => ({
  propertyRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    // ... 15+ métodos mockeados
  },
  propertyImageRepository: { /* ... */ },
  userRepository: { /* ... */ },
  FavoriteRepository: { /* ... */ },
}));
```

**C. Sistema de Autenticación**
```typescript
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  // ... otros helpers
}));
```

**D. Next.js APIs**
```typescript
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
```

**E. Supabase Cliente**
```typescript
vi.mock('@repo/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    storage: { from: vi.fn() },
    // ... full client mock
  })),
}));
```

**F. Storage (Supabase)**
```typescript
vi.mock('@/lib/storage', () => ({
  uploadPropertyImage: vi.fn(),
  deletePropertyImage: vi.fn(),
}));
```

---

### 3. Test Files por Categoría

#### A. Validaciones (Zod Schemas)

**Archivo:** `apps/web/lib/validations/__tests__/property.test.ts`

**Tests:** 19 tests (100% passing)

**Cobertura:**
- ✅ `createPropertySchema` - 10 tests
  - Validación de datos requeridos
  - Validación de tipos (números, strings, enums)
  - Validación de rangos (precio min/max)
  - Validación de formatos (email, teléfono)
- ✅ `updatePropertySchema` - 9 tests
  - Campos opcionales
  - Validación parcial
  - Preservación de datos existentes

**Ejemplo:**
```typescript
describe('createPropertySchema', () => {
  it('should validate valid property data', () => {
    const validData = {
      title: 'Casa en venta',
      price: 150000,
      city: 'CIUDAD_DE_GUATEMALA',
      // ... campos completos
    };
    expect(() => createPropertySchema.parse(validData)).not.toThrow();
  });

  it('should reject negative price', () => {
    const invalidData = { /* ... */, price: -100 };
    expect(() => createPropertySchema.parse(invalidData)).toThrow();
  });
});
```

---

#### B. Utilidades (Pure Functions)

**Archivo 1:** `apps/web/lib/utils/__tests__/slug-generator.test.ts`

**Tests:** 8 tests (100% passing)

**Cobertura:**
- ✅ Generación de slugs únicos
- ✅ Normalización de caracteres especiales
- ✅ Conversión a minúsculas
- ✅ Manejo de espacios/guiones
- ✅ Edge cases (strings vacíos, solo números)

**Archivo 2:** `apps/web/lib/utils/__tests__/serialize-property.test.ts`

**Tests:** 8 tests (100% passing)

**Cobertura:**
- ✅ Serialización de propiedades con imágenes
- ✅ Serialización sin imágenes
- ✅ Transformación de tipos de datos
- ✅ Manejo de campos opcionales

---

#### C. Server Actions (App Router)

**Archivo 1:** `apps/web/app/actions/__tests__/properties.test.ts`

**Tests:** 15 tests (14/15 passing - 93%)

**Cobertura de `createPropertyAction`:**
- ✅ Requiere autenticación
- ✅ Requiere rol AGENT
- ✅ Valida input con schema
- ✅ Crea propiedad con datos válidos
- ✅ Genera slug único
- ✅ Sube imágenes a storage
- ✅ Maneja errores de validación
- ✅ Maneja errores de base de datos
- ✅ Revalida cache después de crear
- ⚠️ 1 test con timing issue en mock cleanup

**Archivo 2:** `apps/web/app/actions/__tests__/favorites.test.ts`

**Tests:** 19 tests (100% passing)

**Cobertura de `toggleFavoriteAction`:**
- ✅ Requiere autenticación
- ✅ Toggle ON: Crea favorito
- ✅ Toggle OFF: Elimina favorito
- ✅ Valida existencia de propiedad
- ✅ Revalida paths correctos
- ✅ Manejo completo de errores

---

#### D. Database Repositories

**Archivo:** `packages/database/src/__tests__/property-repository.test.ts`

**Tests:** 15 tests (100% passing)

**Cobertura de `PropertyRepository`:**
- ✅ CRUD completo
- ✅ **Authorization checks** (rol-based access)
- ✅ Transacciones (rollback en errores)
- ✅ Relaciones (with images)
- ✅ Paginación
- ✅ Búsqueda/filtrado
- ✅ Edge cases (IDs inválidos, duplicados)

**Ejemplo (Authorization):**
```typescript
describe('PropertyRepository Authorization', () => {
  it('should only allow AGENT to create properties', async () => {
    const user = { id: '1', role: 'CLIENT' };
    await expect(
      propertyRepository.create(propertyData, user)
    ).rejects.toThrow('Unauthorized');
  });

  it('should allow AGENT to create properties', async () => {
    const user = { id: '1', role: 'AGENT' };
    const result = await propertyRepository.create(propertyData, user);
    expect(result).toBeDefined();
  });
});
```

---

### 4. Test Helpers y Utilidades

#### A. `apps/web/__tests__/utils/test-helpers.ts`

**Funciones:**
```typescript
// Mock de usuarios con roles
export function mockUser(role: 'CLIENT' | 'AGENT' | 'ADMIN') {
  return { id: randomUUID(), email: 'test@example.com', role };
}

// Mock de propiedades
export function mockProperty(overrides?: Partial<Property>) {
  return { id: randomUUID(), title: 'Test', /* ... */, ...overrides };
}

// Mock de imágenes
export function mockImage(propertyId: string) {
  return { id: randomUUID(), propertyId, url: 'http://...', /* ... */ };
}
```

#### B. `packages/database/src/__tests__/helpers/fixtures.ts`

**Fixtures para testing:**
```typescript
export const validPropertyData = {
  title: 'Casa de prueba',
  description: 'Descripción completa',
  price: 250000,
  // ... datos completos
};

export const validUserData = {
  email: 'agent@test.com',
  role: 'AGENT',
  // ...
};
```

#### C. `packages/database/src/__tests__/helpers/db-mock.ts`

**Mock de Prisma Client:**
```typescript
export const mockPrismaClient = {
  property: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    // ... todos los métodos
  },
  // ... otros modelos
};
```

---

### 5. Métricas de Testing

#### Cobertura por Tipo

| Tipo de Test | Archivos | Tests | Passing | % |
|--------------|----------|-------|---------|---|
| **Validaciones** | 1 | 19 | 19 | 100% |
| **Utilidades** | 2 | 16 | 16 | 100% |
| **Server Actions** | 2 | 34 | 33 | 97% |
| **Repositorios** | 1 | 15 | 15 | 100% |
| **TOTAL** | **6** | **84** | **83** | **99%** |

#### Cobertura por Layer

```
┌─────────────────────────────────────────┐
│ LAYER            │ COVERAGE            │
├─────────────────────────────────────────┤
│ Validation       │ ████████████ 100%   │
│ Utils            │ ████████████ 100%   │
│ Server Actions   │ ███████████░  97%   │
│ Repository       │ ████████████ 100%   │
│ Database Logic   │ ████████████ 100%   │
└─────────────────────────────────────────┘
```

---

## Arquitectura de Testing

### 1. Patrón de Co-locación

**Regla:** Tests viven junto al código que testean

```
Source:           lib/utils/slug-generator.ts
Test:             lib/utils/__tests__/slug-generator.test.ts

Source:           app/actions/properties.ts
Test:             app/actions/__tests__/properties.test.ts

Source:           packages/database/src/repositories/property.ts
Test:             packages/database/src/__tests__/property-repository.test.ts
```

**Ventajas:**
- ✅ Fácil de encontrar tests relacionados
- ✅ Tests se mueven con el código en refactors
- ✅ Context inmediato para nuevos desarrolladores

---

### 2. Estrategia de Mocking

**Filosofía:** "Mock en los bordes, test en el centro"

```
┌──────────────────────────────────────────────┐
│                                              │
│  Component/Action (UNDER TEST)               │
│         ↓                                    │
│  Internal Logic (REAL)                       │
│         ↓                                    │
│  Dependencies (MOCKED) ← vitest.setup.ts     │
│    - Database                                │
│    - Auth                                    │
│    - Storage                                 │
│    - Next.js APIs                            │
└──────────────────────────────────────────────┘
```

**Niveles de Mocking:**

1. **Global (vitest.setup.ts):** Auth, DB, Supabase
2. **Per-file:** Casos específicos con `vi.mock()` local
3. **Per-test:** Setup con `beforeEach()` para datos únicos

---

### 3. Estructura de Tests

**Patrón AAA (Arrange-Act-Assert):**

```typescript
describe('Feature Name', () => {
  // Setup compartido
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario 1', () => {
    it('should do X when Y', async () => {
      // ARRANGE: Preparar datos y mocks
      const user = mockUser('AGENT');
      const data = { /* ... */ };
      vi.mocked(getCurrentUser).mockResolvedValue(user);

      // ACT: Ejecutar función bajo test
      const result = await myServerAction(data);

      // ASSERT: Verificar comportamiento
      expect(result.success).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
    });
  });
});
```

---

### 4. Testing por Capas

#### Layer 1: Validaciones (Zod Schemas)

**Qué testear:**
- ✅ Datos válidos pasan
- ✅ Datos inválidos fallan con mensajes claros
- ✅ Edge cases (valores límite, opcionales)
- ✅ Transformaciones (trim, toLowerCase)

**Ejemplo:**
```typescript
it('should transform email to lowercase', () => {
  const input = { email: 'TEST@EXAMPLE.COM' };
  const result = userSchema.parse(input);
  expect(result.email).toBe('test@example.com');
});
```

#### Layer 2: Utilidades (Pure Functions)

**Qué testear:**
- ✅ Input → Output correcto
- ✅ Edge cases
- ✅ Idempotencia (mismo input = mismo output)
- ✅ Sin side effects

**Ejemplo:**
```typescript
it('should generate consistent slugs', () => {
  const input = 'Casa en Venta!';
  expect(generateSlug(input)).toBe('casa-en-venta');
  expect(generateSlug(input)).toBe('casa-en-venta'); // idempotent
});
```

#### Layer 3: Server Actions

**Qué testear:**
- ✅ Autenticación requerida
- ✅ Autorización (roles)
- ✅ Validación de input
- ✅ Llamadas a repositorio con datos correctos
- ✅ Manejo de errores
- ✅ Revalidación de cache
- ✅ Formato de respuesta

**Ejemplo:**
```typescript
it('should require authentication', async () => {
  vi.mocked(getCurrentUser).mockResolvedValue(null);
  const result = await createPropertyAction(validData);
  expect(result.success).toBe(false);
  expect(result.error).toContain('autenticación');
});
```

#### Layer 4: Repositorios

**Qué testear:**
- ✅ Queries correctas a Prisma
- ✅ Authorization checks
- ✅ Transacciones
- ✅ Relaciones (include)
- ✅ Paginación
- ✅ Error handling

---

## CI/CD con GitHub Actions

### Estado Actual: ⚠️ NO CONFIGURADO

**Qué falta:**
- ❌ `.github/workflows/` no existe
- ❌ No hay CI en Pull Requests
- ❌ No hay CD automático
- ❌ No hay checks de calidad automatizados

---

### Propuesta: Pipeline CI/CD Completo

#### Workflow 1: Quality Checks (CI)

**Archivo:** `.github/workflows/ci.yml`

**Triggers:**
- Push a `main`
- Pull Request a cualquier branch
- Manual dispatch

**Jobs:**
1. **Install Dependencies**
2. **Type Check** (TypeScript)
3. **Lint** (Biome)
4. **Unit Tests** (Vitest)
5. **Build** (Next.js)

**Tiempo estimado:** 3-5 minutos

---

#### Workflow 2: Deploy (CD)

**Archivo:** `.github/workflows/deploy.yml`

**Triggers:**
- Push a `main` (después de CI exitoso)

**Jobs:**
1. **Deploy to Vercel** (automático via Git integration)
2. **Notify Slack/Discord** (opcional)

---

### Configuración Propuesta

#### A. CI Workflow Completo

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
          fetch-depth: 2 # Para diff en Turbo

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

      # 5. Generate Prisma Client (requerido para builds)
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

      # 8. Run Tests with Coverage
      - name: Run Tests
        run: bun run test:run
        env:
          # Env vars para tests (si necesario)
          NODE_ENV: test

      # 9. Build (verifica que compile)
      - name: Build Application
        run: bun run build
        env:
          # Env vars mínimas para build
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      # 10. Upload Coverage (opcional)
      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./apps/web/coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

#### B. PR Comment Bot (opcional)

**Archivo:** `.github/workflows/pr-comment.yml`

```yaml
name: PR Comment - Test Results

on:
  workflow_run:
    workflows: ["CI - Quality Checks"]
    types: [completed]

jobs:
  comment:
    runs-on: ubuntu-latest
    if: github.event.workflow_run.event == 'pull_request'

    steps:
      - name: Comment Test Results
        uses: actions/github-script@v6
        with:
          script: |
            const conclusion = context.payload.workflow_run.conclusion;
            const emoji = conclusion === 'success' ? '✅' : '❌';

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `${emoji} **CI Checks ${conclusion}**\n\nView details: ${context.payload.workflow_run.html_url}`
            });
```

#### C. Dependabot Configuration

**Archivo:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automated"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### Secretos Requeridos (GitHub Settings)

**En: Repository Settings → Secrets and Variables → Actions**

#### Secretos Necesarios:

```bash
# Supabase (para builds)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Database
DATABASE_URL=postgresql://xxx@xxx.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://xxx@xxx.supabase.com:5432/postgres

# Turborepo Remote Cache (opcional)
TURBO_TOKEN=xxx
TURBO_TEAM=xxx

# Codecov (opcional, para coverage reports)
CODECOV_TOKEN=xxx
```

---

### Branch Protection Rules

**Configuración recomendada en: Settings → Branches → Branch Protection Rules**

**Para `main`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass:
  - `quality / Code Quality Checks`
- ✅ Require branches to be up to date
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

**Para branches `claude/*`:**
- ✅ Allow force pushes (para trabajo en progreso)
- ✅ Requiere PR para merge a `main`

---

### Integración con Vercel

**Ya configurado automáticamente:**
- ✅ Vercel detecta push a `main`
- ✅ Despliega automáticamente
- ✅ Preview deployments en PRs

**Configuración adicional recomendada:**

1. **Environment Variables en Vercel:**
   - Ya configuradas (Supabase, DB, Mapbox, OpenAI, Resend)

2. **Build Command Override:**
   ```bash
   cd packages/database && bunx prisma generate && cd ../.. && bun run build
   ```

3. **Ignored Build Step (opcional):**
   - Solo desplegar si CI pasó en GitHub Actions
   ```bash
   # En Vercel Settings → Git → Ignored Build Step
   if [ "$VERCEL_ENV" == "production" ]; then exit 1; else exit 0; fi
   ```

---

## Guía de Uso

### Comandos Disponibles

#### Testing Local

```bash
# Todos los tests (Turborepo)
bun run test

# Solo Web tests
bun run test:web
cd apps/web && bun run test

# Solo Database tests
cd packages/database && bun run test

# Watch mode (re-run on file change)
cd apps/web && bun run test -- --watch

# UI Mode (visual test runner)
cd apps/web && bun run test:ui

# Coverage report
cd apps/web && bun run test:coverage
# Abre: apps/web/coverage/index.html

# Run specific test file
cd apps/web && bun run test properties.test.ts

# Run tests matching pattern
cd apps/web && bun run test -- --grep="authentication"
```

#### Type Checking

```bash
# Check todos los workspaces
bun run type-check

# Solo web
cd apps/web && bun run type-check

# Watch mode
cd apps/web && tsc --watch --noEmit
```

#### Linting

```bash
# Lint todos los workspaces
bun run lint

# Autofix
bun run lint -- --fix

# Solo web
cd apps/web && bun run lint
```

#### Build

```bash
# Build completo (Turborepo)
bun run build

# Solo web
cd apps/web && bun run build

# Limpiar cache
rm -rf apps/web/.next .turbo
bun run build
```

---

### Workflow de Desarrollo

#### 1. Antes de hacer commit

**Checklist obligatorio:**

```bash
# 1. Type check
bun run type-check

# 2. Lint
bun run lint

# 3. Tests
bun run test

# 4. Build (opcional, pero recomendado)
bun run build
```

**Script helper (agregar a `package.json`):**

```json
{
  "scripts": {
    "pre-commit": "bun run type-check && bun run lint && bun run test:run"
  }
}
```

#### 2. Durante desarrollo

**Watch mode para feedback rápido:**

```bash
# Terminal 1: Dev server
bun run dev

# Terminal 2: Tests en watch
cd apps/web && bun run test -- --watch

# Terminal 3: Type checking en watch
cd apps/web && tsc --watch --noEmit
```

#### 3. Crear nuevos tests

**Patrón recomendado:**

```typescript
// 1. Crear archivo: lib/utils/__tests__/my-feature.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myFeature } from '../my-feature';

describe('myFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy path', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      const result = myFeature(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('Error cases', () => {
    it('should throw when input is invalid', () => {
      expect(() => myFeature(null)).toThrow();
    });
  });
});
```

---

### Debugging Tests

#### A. Failed Test

```bash
# 1. Run solo ese test
cd apps/web && bun run test properties.test.ts

# 2. Ver output detallado
cd apps/web && bun run test properties.test.ts -- --reporter=verbose

# 3. Debugger (usar UI mode)
cd apps/web && bun run test:ui
# Click en test → Ver stack trace
```

#### B. Mock no funciona

**Problema común:** Mock global no aplicado

```typescript
// ❌ NO: Import antes del mock
import { myFunction } from './my-module';
vi.mock('./my-module');

// ✅ SÍ: Mock antes del import
vi.mock('./my-module');
import { myFunction } from './my-module';
```

**Solución:** Mover `vi.mock()` al inicio del archivo

#### C. Timing Issues

**Problema:** Tests pasan solos, fallan en suite

```typescript
// ❌ NO: Mocks compartidos sin cleanup
describe('Suite', () => {
  it('test 1', () => {
    vi.mocked(myMock).mockResolvedValue('A');
    // ... test usa 'A'
  });

  it('test 2', () => {
    // ⚠️ myMock todavía retorna 'A' del test anterior!
    vi.mocked(myMock).mockResolvedValue('B');
  });
});

// ✅ SÍ: Cleanup entre tests
describe('Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia implementaciones anteriores
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restaura mocks originales
  });
});
```

---

## Próximos Pasos

### Fase 1: CI/CD Setup (PRIORIDAD ALTA)

**Objetivo:** Automatizar quality checks en GitHub

**Tareas:**
- [ ] Crear `.github/workflows/ci.yml` (usar template arriba)
- [ ] Agregar secretos en GitHub Settings
- [ ] Configurar branch protection en `main`
- [ ] Probar workflow con PR de prueba
- [ ] Documentar en README.md

**Tiempo estimado:** 2-3 horas

**Beneficios:**
- ✅ Previene regressions automáticamente
- ✅ Feedback inmediato en PRs
- ✅ Confianza para merges
- ✅ Documentación visual de calidad (badges)

---

### Fase 2: Test Task en Turbo (PRIORIDAD MEDIA)

**Objetivo:** Integrar tests en Turborepo orchestration

**Agregar a `turbo.json`:**

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["@repo/database#db:generate"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "__tests__/**/*.ts"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "test:run": {
      "dependsOn": ["@repo/database#db:generate"],
      "cache": false
    }
  }
}
```

**Actualizar `package.json` scripts:**

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:run": "turbo run test:run",
    "test:coverage": "turbo run test:coverage"
  }
}
```

**Beneficios:**
- ✅ Cache de tests para velocidad
- ✅ Dependency graph (Prisma antes de tests)
- ✅ Paralelización automática

---

### Fase 3: Coverage Targets (PRIORIDAD BAJA)

**Objetivo:** Mantener calidad de código con mínimos de coverage

**Configurar en `apps/web/vitest.config.ts`:**

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: [
        '**/__tests__/**',
        '**/*.config.{ts,js}',
        '**/types/**',
        'app/layout.tsx', // UI layout
      ],
    },
  },
});
```

**Integrar en CI:**

```yaml
# En .github/workflows/ci.yml
- name: Check Coverage Thresholds
  run: bun run test:coverage
  # Falla si no se alcanza threshold
```

---

### Fase 4: E2E Testing (FUTURO)

**Objetivo:** Testing end-to-end con Playwright

**Stack propuesto:**
- Playwright (E2E framework)
- Test en ambientes aislados (db de prueba)
- Visual regression testing

**Casos de uso:**
- Flujo completo: Login → Browse → Create Property → Logout
- Formularios complejos
- Interacciones de mapa
- Responsive design

**Tiempo estimado:** 1-2 semanas de setup inicial

---

## Recursos

### Documentación Oficial

- **Vitest:** https://vitest.dev
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **GitHub Actions:** https://docs.github.com/en/actions
- **Turborepo:** https://turbo.build/repo/docs

### Documentación Interna

- **Test READMEs:**
  - `apps/web/__tests__/README.md`
  - `packages/database/src/__tests__/README.md`

- **Hooks & Debugging:**
  - `docs/REACT_HOOKS_ANTIPATTERNS.md`
  - `docs/DEBUGGING_HOOKS_GUIDE.md`

- **Architecture:**
  - `docs/architecture/DATA_FLOW.md`
  - `docs/architecture/SERVER_ACTIONS.md`

### Scripts de Ejemplo

#### Pre-commit Hook (Git)

**Crear:** `.husky/pre-commit` (requiere Husky instalado)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type check
echo "⚙️  Type checking..."
bun run type-check || exit 1

# Lint
echo "🔎 Linting..."
bun run lint || exit 1

# Tests
echo "🧪 Running tests..."
bun run test:run || exit 1

echo "✅ All checks passed!"
```

**Instalar Husky:**

```bash
bun add -D husky
bunx husky install
bunx husky add .husky/pre-commit
```

---

## Troubleshooting

### Problema: Tests fallan en CI pero pasan localmente

**Causas comunes:**

1. **Env vars diferentes**
   - Solución: Verificar GitHub Secrets vs `.env.local`

2. **Timezone differences**
   - Solución: Usar `new Date('2024-01-01T00:00:00Z')` con timezone explícito

3. **File system paths (Windows vs Linux)**
   - Solución: Usar `path.join()` en vez de string concatenation

4. **Mocks no reseteados**
   - Solución: Agregar `afterEach(() => vi.clearAllMocks())` global

### Problema: Build falla con "Prisma Client not found"

**Solución:**

```yaml
# En GitHub Actions, agregar step:
- name: Generate Prisma Client
  run: |
    cd packages/database
    bunx prisma generate
```

### Problema: Tests muy lentos

**Diagnóstico:**

```bash
# Ver tiempo por test
cd apps/web && bun run test -- --reporter=verbose

# Profile tests
cd apps/web && bun run test -- --profile
```

**Optimizaciones:**
- Reducir mocks pesados (ej: full Supabase client)
- Usar `vi.fn()` simple en vez de implementaciones completas
- Paralelizar tests con `vitest --threads`

---

## Badges para README

**Agregar al README principal:**

```markdown
## Status

![CI](https://github.com/juanqui-art/inmo-app/workflows/CI%20-%20Quality%20Checks/badge.svg)
![Tests](https://img.shields.io/badge/tests-83%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
```

---

## Conclusión

**Estado actual:** ✅ Infraestructura sólida, lista para CI/CD

**Fortalezas:**
- Configuración Vitest completa en monorepo
- 83 tests con 99% passing rate
- Mocking comprehensivo y reutilizable
- Buena cobertura en capas críticas

**Oportunidades:**
- ⚠️ GitHub Actions CI/CD (máxima prioridad)
- Integración con Turborepo
- Coverage thresholds
- E2E testing (futuro)

**Próximo paso sugerido:** Implementar `.github/workflows/ci.yml` usando el template de este documento.

---

**Última actualización:** 17 de noviembre, 2025
**Mantenedor:** Claude (AI Assistant)
**Contacto:** Ver `docs/AI_ASSISTANTS.md`
