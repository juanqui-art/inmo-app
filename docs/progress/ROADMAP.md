# Plan de Escalabilidad - InmoApp

**Fecha de creación:** 2025-01-15
**Estado:** En progreso (2/6 fases completadas)
**Duración total estimada:** 5-6 horas

---

## 📊 Progreso General

- [x] **Fase 1:** Environment Variables Type-Safe (30 min) ✅
- [x] **Fase 2:** Vitest Setup + Tests Básicos (1 hora) ✅
- [ ] **Fase 3:** ADRs (Architecture Decision Records) (30 min)
- [ ] **Fase 4:** Error Boundaries (1 hora)
- [ ] **Fase 5:** Structured Logging (2 horas)
- [ ] **Fase 6:** Pre-commit Hooks (30 min)

---

## 🎯 Objetivos del Plan

Este plan implementa las mejores prácticas para que el código escale de manera sostenible:

1. **Type Safety** - Variables de entorno validadas en compile-time
2. **Testing** - Prevenir regresiones y bugs
3. **Documentación** - Decisiones arquitectónicas explícitas
4. **Resilience** - Error boundaries para mejor UX
5. **Observability** - Logs estructurados para debugging
6. **Workflow** - Automatización de checks pre-commit

---

## 🔐 FASE 1: Environment Variables Type-Safe

**Duración:** 30 minutos
**Estado:** ✅ Completado

### Objetivos
- Validar variables de entorno con Zod en startup
- Type-safety y autocompletado para env vars
- Documentar variables requeridas

### Archivos Creados
- `apps/web/lib/env.ts` - Schema Zod para validación
- `apps/web/.env.example` - Template documentado

### Archivos Modificados
- `apps/web/lib/supabase/server.ts` - Usa `env` en lugar de `process.env`
- `apps/web/lib/supabase/client.ts` - Usa `env` en lugar de `process.env`

### Beneficios
✅ App falla en build (no en runtime) si falta variable
✅ Autocompletado de env vars en VSCode
✅ Documentación automática de variables requeridas
✅ Previene bugs de configuración en producción

### Uso
```typescript
import { env } from '@/lib/env'

// ✅ Type-safe, autocompleta
const url = env.NEXT_PUBLIC_SUPABASE_URL

// ❌ Ya no uses esto
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
```

---

## 🧪 FASE 2: Vitest Setup + Tests Básicos

**Duración:** 1 hora
**Estado:** ✅ Completado

### Objetivos
- Configurar Vitest para testing unitario
- Escribir tests para validaciones críticas
- Agregar tests a workflow de desarrollo

### Archivos Creados
- `apps/web/vitest.config.ts` - Configuración de Vitest
- `apps/web/lib/validations/__tests__/property.test.ts` - Tests de schemas
- `apps/web/lib/utils/__tests__/serialize-property.test.ts` - Tests de utils

### Archivos Modificados
- `apps/web/package.json` - Scripts de testing

### Comandos Agregados
```bash
bun run test          # Ejecuta tests en watch mode
bun run test:run      # Ejecuta tests una vez
bun run test:ui       # Abre UI de Vitest
bun run test:coverage # Genera reporte de coverage
```

### Tests Implementados
1. **Validaciones de Propiedad** (3 tests)
   - Rechaza precio negativo
   - Rechaza título muy corto
   - Acepta datos válidos

2. **Serialización** (2 tests)
   - Convierte Decimal a number correctamente
   - Maneja arrays vacíos

### Beneficios
✅ Previene regresiones al cambiar validaciones
✅ Documentación viva del comportamiento esperado
✅ Base para agregar más tests en el futuro
✅ Confianza al refactorizar código

### Próximos Pasos
- Agregar tests para Server Actions críticos
- Configurar CI/CD para correr tests en PRs
- Incrementar coverage gradualmente

---

## 📝 FASE 3: ADRs (Architecture Decision Records)

**Duración:** 30 minutos
**Estado:** ⏳ Pendiente

### Objetivos
- Documentar decisiones arquitectónicas importantes
- Crear template para futuras decisiones
- Explicar el "por qué" detrás de elecciones técnicas

### Archivos a Crear
- `.claude/decisions/README.md` - Índice y template
- `.claude/decisions/001-oslo-gray-palette.md`
- `.claude/decisions/002-server-components-first.md`
- `.claude/decisions/003-repository-pattern.md`

### Template ADR
```markdown
# ADR-XXX: Título de la Decisión

Fecha: YYYY-MM-DD
Estado: [Propuesto | Aceptado | Rechazado | Deprecado]

## Contexto
¿Qué problema estamos resolviendo?

## Decisión
¿Qué decidimos hacer?

## Alternativas Consideradas
- Opción A: ...
- Opción B: ...

## Consecuencias
### Positivas
- Beneficio 1
- Beneficio 2

### Negativas
- Trade-off 1
- Trade-off 2
```

### ADRs Planeados

#### 001: Oslo Gray Palette
**Por qué:** Necesitamos un sistema de colores consistente para dark/light mode

**Decisión:** Usar Oslo Gray en lugar de grises genéricos

**Consecuencias:**
- ✅ Colores diseñados específicamente para dark mode
- ✅ 11 tonos permiten granularidad sin custom colors
- ⚠️ Requiere refactor de componentes existentes

#### 002: Server Components First
**Por qué:** Mejorar performance y SEO

**Decisión:** Usar Server Components por defecto, Client solo cuando sea necesario

**Cuándo usar Client:**
- useState/useEffect
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Third-party libraries que requieren client

**Consecuencias:**
- ✅ Menos JavaScript enviado al cliente
- ✅ Mejor SEO (HTML pre-renderizado)
- ✅ Acceso directo a database (no API layer)
- ⚠️ Curva de aprendizaje (mental model diferente)

#### 003: Repository Pattern
**Por qué:** Separar lógica de negocio de acceso a datos

**Decisión:** Centralizar queries en `packages/database/repositories/`

**Estructura:**
```
Component → Server Action → Repository → Prisma → DB
```

**Consecuencias:**
- ✅ Lógica de permisos centralizada
- ✅ Queries reutilizables
- ✅ Fácil testear (mock repositories)
- ⚠️ Capa adicional de abstracción

### Beneficios
✅ Nuevos devs entienden decisiones rápidamente
✅ Evitas re-discutir lo ya decidido
✅ Tu "yo del futuro" recuerda el contexto
✅ Base para onboarding de equipo

---

## 🛡️ FASE 4: Error Boundaries

**Duración:** 1 hora
**Estado:** ⏳ Pendiente

### Objetivos
- Prevenir crashes completos de la app
- Mejorar UX cuando ocurren errores
- Crear custom error classes

### Archivos a Crear
- `apps/web/lib/errors/index.ts` - Custom error classes
- `apps/web/components/error-boundary.tsx` - Boundary genérico
- `apps/web/components/properties/property-form-error-boundary.tsx` - Específico

### Archivos a Modificar
- `apps/web/app/dashboard/propiedades/nueva/page.tsx` - Wrap con boundary

### Custom Error Classes

```typescript
// lib/errors/index.ts
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class PermissionError extends Error {
  constructor(action: string, resource: string) {
    super(`Not authorized to ${action} ${resource}`)
    this.name = 'PermissionError'
  }
}
```

### Error Boundary Implementation

```tsx
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // TODO: Log to Sentry
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      const reset = () => this.setState({ error: null })

      return this.props.fallback
        ? this.props.fallback(this.state.error, reset)
        : <DefaultErrorUI error={this.state.error} reset={reset} />
    }

    return this.props.children
  }
}
```

### Uso

```tsx
// app/dashboard/propiedades/nueva/page.tsx
import { PropertyFormErrorBoundary } from '@/components/properties/property-form-error-boundary'

export default function NewPropertyPage() {
  return (
    <PropertyFormErrorBoundary>
      <PropertyForm />
    </PropertyFormErrorBoundary>
  )
}
```

### Beneficios
✅ App no crashea completamente
✅ Usuario ve mensaje útil + opción de recovery
✅ Errores se pueden reportar automáticamente
✅ Mejor UX en casos edge

---

## 📊 FASE 5: Structured Logging

**Duración:** 2 horas
**Estado:** ⏳ Pendiente

### Objetivos
- Logging estructurado con contexto completo
- Métricas automáticas (duration, error rate)
- Request tracing con requestId

### Archivos a Crear
- `apps/web/lib/logger/index.ts` - Logger con Pino
- `apps/web/lib/logger/server-action-wrapper.ts` - HOC para actions
- `apps/web/middleware/request-id.ts` - Genera requestId

### Archivos a Modificar
- `apps/web/app/actions/properties.ts` - Usar wrapper
- `apps/web/middleware.ts` - Agregar requestId

### Dependencias
```bash
bun add pino pino-pretty
```

### Logger Setup

```typescript
// lib/logger/index.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
})

// Helper types
export interface LogContext {
  userId?: string
  propertyId?: string
  action: string
  requestId?: string
  duration?: number
  error?: Error
}
```

### Server Action Wrapper

```typescript
// lib/logger/server-action-wrapper.ts
import { logger } from './index'

export function withLogging<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now()

    try {
      logger.info({ action: actionName }, 'Action started')

      const result = await action(...args)

      logger.info({
        action: actionName,
        duration: Date.now() - startTime,
        success: true
      }, 'Action completed')

      return result
    } catch (error) {
      logger.error({
        action: actionName,
        duration: Date.now() - startTime,
        error,
        success: false
      }, 'Action failed')

      throw error
    }
  }) as T
}
```

### Uso

```typescript
// app/actions/properties.ts
import { withLogging } from '@/lib/logger/server-action-wrapper'

export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    // ... lógica existente
  }
)
```

### Request ID Middleware

```typescript
// middleware.ts
import { v4 as uuidv4 } from 'uuid'

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || uuidv4()

  // Store in AsyncLocalStorage for access in Server Actions
  // TODO: Implement AsyncLocalStorage

  const response = NextResponse.next()
  response.headers.set('x-request-id', requestId)

  return response
}
```

### Log Examples

```json
// Successful action
{
  "level": "info",
  "action": "createProperty",
  "userId": "user_123",
  "duration": 245,
  "success": true,
  "msg": "Action completed"
}

// Failed action
{
  "level": "error",
  "action": "createProperty",
  "userId": "user_123",
  "duration": 123,
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Price must be positive"
  },
  "msg": "Action failed"
}
```

### Beneficios
✅ Debugging 10x más fácil en producción
✅ Métricas automáticas sin código extra
✅ Context completo en cada log
✅ Base para alertas (error rate > threshold)

---

## 🪝 FASE 6: Pre-commit Hooks

**Duración:** 30 minutos
**Estado:** ⏳ Pendiente

### Objetivos
- Automatizar checks antes de commit
- Prevenir código roto en el repo
- Mejorar calidad del código automáticamente

### Archivos a Crear
- `.husky/pre-commit` - Hook de pre-commit
- `.lintstagedrc.json` - Config de lint-staged

### Archivos a Modificar
- `package.json` (root) - Script de prepare

### Dependencias
```bash
bun add -D husky lint-staged
```

### Setup

```bash
# Inicializar Husky
bunx husky init

# El script prepare se ejecuta automáticamente en bun install
```

### Configuración

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "biome check --write",
    "bun run type-check"
  ],
  "*.{json,md}": [
    "biome format --write"
  ]
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bun run lint-staged
```

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### Checks Ejecutados

1. **Biome** - Auto-format y lint
2. **Type-check** - Solo archivos modificados
3. **Tests** - (opcional) Tests relacionados

### Beneficios
✅ No pusheas código roto
✅ Formateo automático antes de commit
✅ Ahorra tiempo en CI
✅ Calidad consistente del código

---

## 📦 Bonus: Quick Wins

Si sobra tiempo en alguna sesión, considera:

### Feature Flags
```typescript
// lib/feature-flags.ts
export const features = {
  enablePropertyMap: env.NEXT_PUBLIC_FEATURE_MAP === 'true',
  enableSocialSharing: env.NEXT_PUBLIC_FEATURE_SOCIAL === 'true',
} as const
```

### README por Feature
```
features/
  property-listing/
    README.md      ← Documenta componentes, hooks, actions
    components/
    hooks/
    actions/
```

### Component Composition
```tsx
// En lugar de 20 props, usar composición
<PropertyCard>
  <PropertyCard.Image />
  <PropertyCard.Header>
    <PropertyCard.Title />
    <PropertyCard.Price />
  </PropertyCard.Header>
  <PropertyCard.Actions>
    <FavoriteButton />
    <ShareButton />
  </PropertyCard.Actions>
</PropertyCard>
```

### Dynamic Imports
```tsx
// Lazy load componentes pesados
const PropertyMap = dynamic(() => import('./property-map'), {
  loading: () => <MapSkeleton />,
  ssr: false,
})
```

---

## ✅ Checklist Final

Al completar todas las fases, verificar:

- [ ] `bun run dev` falla si falta env var
- [ ] `bun run test` pasa todos los tests
- [ ] 3 ADRs documentados
- [ ] PropertyForm con error boundary funcional
- [ ] Logs estructurados en Server Actions críticos
- [ ] Pre-commit hook funcionando
- [ ] CI/CD ejecutando tests automáticamente
- [ ] Coverage de tests > 50% en validations y utils

---

## 📚 Recursos

### Documentación
- [Vitest](https://vitest.dev/)
- [Pino Logger](https://getpino.io/)
- [Husky](https://typicode.github.io/husky/)
- [ADR Templates](https://github.com/joelparkerhenderson/architecture-decision-record)

### Mejores Prácticas
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Error Handling in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Structured Logging](https://www.honeycomb.io/blog/structured-logging-and-your-team)

---

## 🔄 Notas de Sesiones

### Sesión 1 (2025-01-15)
- ✅ Fase 1 completada: Environment Variables
- ✅ Fase 2 completada: Vitest Setup
- 📝 Documentación creada en SCALING_PLAN.md

### Sesión 2 (Pendiente)
- Objetivo: Fases 3 y 4 (ADRs + Error Boundaries)

### Sesión 3 (Pendiente)
- Objetivo: Fases 5 y 6 (Logging + Hooks)

---

**Última actualización:** 2025-01-15
