# 🔍 Logging y Monitoreo - Plan de Implementación

> **Plan detallado para implementar observabilidad completa**
> Última actualización: Noviembre 16, 2025

---

## 📋 Índice

1. [Estado Actual](#estado-actual)
2. [Herramientas Propuestas](#herramientas-propuestas)
3. [Arquitectura de Observabilidad](#arquitectura-de-observabilidad)
4. [Plan de Implementación](#plan-de-implementación)
5. [Análisis de Costos](#análisis-de-costos)
6. [ROI y Métricas](#roi-y-métricas)
7. [Ejemplos de Código](#ejemplos-de-código)
8. [Referencias](#referencias)

---

## 🎯 Estado Actual

### ✅ Lo que funciona

**Logging básico:**
- ✅ Wrapper simple en `apps/web/lib/utils/logger.ts`
- ✅ Separación dev/production
- ✅ Logs en console para desarrollo

```typescript
// Implementación actual
export const logger = {
  debug: isDevelopment ? console.log : () => {},
  info: isDevelopment ? console.log : () => {},
  warn: console.warn,
  error: console.error,
};
```

**Autenticación:**
- ✅ Supabase Auth configurado
- ✅ RLS Policies en PostgreSQL
- ✅ Middleware de autenticación (`proxy.ts`)

**Deployment:**
- ✅ Vercel para hosting
- ✅ Auto-deploy desde branch `main`
- ✅ Supabase para base de datos

---

### ❌ Gaps Críticos

**1. Sin Error Tracking (0/1 herramientas)**
- ❌ Errores en producción no se capturan
- ❌ Sin stack traces de errores de usuarios
- ❌ Sin alertas cuando algo falla
- ❌ Sin session replay para reproducir bugs

**Impacto:** Bugs en producción son invisibles hasta que usuarios reportan

---

**2. Sin Structured Logging (0/1 herramientas)**
- ❌ Logs sin contexto (no hay userId, requestId, etc.)
- ❌ Imposible buscar logs por criterio
- ❌ Sin niveles de severidad claros
- ❌ Sin métricas de performance (duration, slow queries)

**Impacto:** Debugging toma 2+ horas por error

---

**3. Sin Rate Limiting (0/1 herramientas)**
- ❌ Login sin límite de intentos (brute force posible)
- ❌ Creación de propiedades sin límite (abuse posible)
- ❌ API calls sin throttling

**Impacto:** Vulnerabilidad a ataques de abuse y costos incontrolados

---

**4. Sin Performance Monitoring (0/1 herramientas)**
- ❌ Sin métricas de DB queries lentas
- ❌ Sin tracking de upload times
- ❌ Sin dashboards de métricas de negocio
- ❌ Sin alertas proactivas

**Impacto:** Performance issues son detectados solo por usuarios

---

**5. Sin Security Monitoring (0/1 área)**
- ❌ Sin logs de intentos de login fallidos
- ❌ Sin detección de patrones sospechosos
- ❌ Sin alertas de actividad anómala
- ❌ Sin audit trail de acciones críticas

**Impacto:** Ataques pueden pasar desapercibidos

---

## 🛠️ Herramientas Propuestas

### 1. **Pino** - Structured Logging

**Qué es:** Logger de alto rendimiento para Node.js con logs estructurados en JSON

**Por qué Pino:**
- ✅ 5x más rápido que Winston
- ✅ Logs estructurados (JSON) para búsqueda fácil
- ✅ Compatible con múltiples transportes (file, cloud)
- ✅ Popular en Next.js/Node.js ecosystem
- ✅ Soporte para child loggers con contexto

**Costo:** Gratis (open source)

**Instalación:**
```bash
bun add pino pino-pretty
```

**Caso de uso:**
```typescript
logger.info({
  action: 'createProperty',
  userId: 'user123',
  propertyId: 'prop456',
  duration: 145,
  requestId: 'req789'
}, 'Property created successfully')
```

**Alternativas evaluadas:**
- ❌ Winston - Más lento, API compleja
- ❌ Bunyan - Proyecto abandonado
- ❌ Console.log - Sin estructura

---

### 2. **Sentry** - Error Tracking y Performance

**Qué es:** Plataforma de monitoring de errores con session replay y performance tracking

**Por qué Sentry:**
- ✅ Líder del mercado (usado por Uber, Discord, GitHub)
- ✅ Source maps automáticos para TypeScript
- ✅ Session Replay para reproducir bugs
- ✅ Performance tracking integrado
- ✅ Alertas configurables (Slack, email, PagerDuty)
- ✅ Integración nativa con Vercel y Next.js

**Costo:**
- Free tier: 5K errors/mes + 100 session replays
- Team: $26/mes por desarrollador (50K errors + 500 replays)
- Business: $80/mes por desarrollador (ilimitado)

**Instalación:**
```bash
bun add @sentry/nextjs
bunx @sentry/wizard@latest -i nextjs
```

**Features incluidas:**
- Error tracking con stack traces
- Session replay (ver qué hizo el usuario)
- Performance monitoring (Core Web Vitals)
- Release tracking (asociar bugs a deploys)
- User feedback (capturar reportes in-app)

**Alternativas evaluadas:**
- ❌ Rollbar - Más caro, menos features
- ❌ LogRocket - Enfocado en session replay, caro
- ❌ Bugsnag - Menos integración con Next.js

---

### 3. **Upstash Redis** - Rate Limiting y Caching

**Qué es:** Redis serverless con pricing por request (no por tiempo)

**Por qué Upstash:**
- ✅ Serverless (sin mantener infra)
- ✅ Latencia ultra-baja (edge regions)
- ✅ Pricing justo (pay-per-request)
- ✅ Integración nativa con Vercel
- ✅ SDK con rate limiting built-in

**Costo:**
- Free tier: 10K requests/día
- Pay-as-you-go: $0.20 por 100K requests

**Instalación:**
```bash
bun add @upstash/redis @upstash/ratelimit
```

**Caso de uso:**
```typescript
// Rate limit: 10 properties creadas por día
const { success } = await ratelimit.limit(userId)
if (!success) {
  throw new Error('Rate limit exceeded')
}
```

**Alternativas evaluadas:**
- ❌ Redis Cloud - Requiere plan mensual ($5/mes mínimo)
- ❌ Vercel KV - Más caro para mismo uso
- ❌ In-memory (Node) - No funciona en serverless

---

### 4. **Vercel Analytics** - Web Analytics

**Qué es:** Analytics nativo de Vercel para métricas web y performance

**Por qué Vercel Analytics:**
- ✅ Incluido en plan Pro de Vercel
- ✅ Zero config (auto-detecta Next.js)
- ✅ Core Web Vitals automáticos
- ✅ Real User Monitoring (RUM)
- ✅ GDPR compliant (sin cookies)

**Costo:**
- Hobby: No disponible
- Pro: Incluido ($20/mes)

**Features:**
- Page views y unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Top pages y bounce rate
- Geolocation de usuarios

**Alternativas evaluadas:**
- ✅ Posthog - Open source, self-hosted, más features (considerar futuro)
- ❌ Google Analytics - Privacy concerns, bloated
- ❌ Plausible - Más caro ($9/mes), menos integrado

---

### 5. **Vercel Logs** - Centralized Logging

**Qué es:** Log aggregation nativo de Vercel

**Por qué Vercel Logs:**
- ✅ Incluido en Vercel Pro
- ✅ Integración automática con Next.js
- ✅ Búsqueda por timeframe, severity, función
- ✅ Exportable a Datadog/Splunk

**Costo:** Incluido en Vercel Pro ($20/mes)

**Alternativas:**
- ✅ Datadog - Más poderoso, costoso ($15/host/mes)
- ✅ Logflare - Supabase native, gratuito con límites
- ❌ CloudWatch - Solo AWS

---

## 🏗️ Arquitectura de Observabilidad

### Stack Propuesto

```
┌─────────────────────────────────────────────────┐
│              Next.js Application                │
│  ┌──────────────┐  ┌──────────────────────────┐│
│  │ Server       │  │ Client Components        ││
│  │ Components   │  │ (Browser)                ││
│  │              │  │                          ││
│  │ Pino Logger  │  │ Sentry Browser SDK       ││
│  │    ↓         │  │        ↓                 ││
│  │ Sentry SDK   │  └────────┼─────────────────┘│
│  │              │            │                  │
│  └──────┼───────┘            │                  │
└─────────┼────────────────────┼──────────────────┘
          │                    │
          ├────────────────────┴──────────────────┐
          │                                       │
          ↓                                       ↓
┌──────────────────┐                    ┌─────────────────┐
│  Vercel Logs     │                    │  Sentry.io      │
│  (Infrastructure)│                    │  (Errors)       │
│                  │                    │                 │
│  • Function logs │                    │  • Stack traces │
│  • Build logs    │                    │  • Session      │
│  • Edge logs     │                    │    replay       │
└──────────────────┘                    │  • Performance  │
                                        └─────────────────┘
┌──────────────────┐                    ┌─────────────────┐
│  Upstash Redis   │                    │ Vercel Analytics│
│  (Rate Limiting) │                    │ (Performance)   │
│                  │                    │                 │
│  • Login limits  │                    │  • Page views   │
│  • API limits    │                    │  • Web Vitals   │
│  • User quotas   │                    │  • Real users   │
└──────────────────┘                    └─────────────────┘

          ↓ All metrics flow to ↓

┌─────────────────────────────────────────────────┐
│          Alerting & Dashboards                  │
│                                                 │
│  Slack  ←  Alerts  →  Email  →  PagerDuty     │
└─────────────────────────────────────────────────┘
```

---

### Flujo de Datos

**1. Request llega a Next.js**
```typescript
// proxy.ts (middleware)
export async function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  // Request context para todos los logs
  logger.child({ requestId, path: request.url })

  // ... autenticación ...

  const duration = Date.now() - startTime
  logger.info({ requestId, duration }, 'Request completed')
}
```

**2. Server Action ejecuta lógica**
```typescript
// apps/web/app/actions/properties.ts
export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    try {
      // Rate limiting check
      const { success } = await ratelimit.limit(userId)
      if (!success) {
        throw new RateLimitError('Too many properties created')
      }

      // Business logic
      const property = await PropertyRepository.create(data)

      // Success log
      return { success: true, property }
    } catch (error) {
      // Error capturado por Sentry automáticamente
      Sentry.captureException(error, {
        tags: { action: 'createProperty' },
        user: { id: userId }
      })
      throw error
    }
  }
)
```

**3. Logs se distribuyen**
- **Pino** → Vercel Logs (infrastructure)
- **Sentry SDK** → Sentry.io (errors + performance)
- **Analytics** → Vercel Analytics (user behavior)

**4. Alertas se activan**
```typescript
// Sentry alert rules (configuración web)
if (errorRate > 5%) {
  sendSlackAlert('#engineering', 'Error rate spike detected')
}

if (p95Latency > 2000ms) {
  sendEmail('team@inmoapp.com', 'Performance degradation')
}
```

---

## 📅 Plan de Implementación

### **Fase 1: Fundamentos (Semana 1 - 8 horas)**

#### **Día 1: Setup Pino + Custom Errors (3 horas)**

**1.1 Instalar dependencias**
```bash
bun add pino pino-pretty
```

**1.2 Crear logger centralizado**
```typescript
// packages/shared/logger/index.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  },
})

// Child logger con contexto
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}
```

**1.3 Crear custom error classes**
```typescript
// packages/shared/errors/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field })
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class PermissionError extends AppError {
  constructor(message: string, resource?: string) {
    super(message, 'PERMISSION_ERROR', 403, { resource })
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, { resource, id })
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_ERROR', 429)
  }
}
```

**1.4 Wrapper para Server Actions**
```typescript
// apps/web/lib/action-wrapper.ts
import { logger } from '@repo/shared/logger'
import { AppError } from '@repo/shared/errors'

export function withLogging<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = crypto.randomUUID()
    const actionLogger = logger.child({
      action: actionName,
      requestId
    })

    const startTime = Date.now()
    actionLogger.info({ args }, `${actionName} started`)

    try {
      const result = await handler(...args)
      const duration = Date.now() - startTime

      actionLogger.info({ duration, success: true }, `${actionName} completed`)
      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Log error con contexto completo
      actionLogger.error({
        duration,
        success: false,
        error: error instanceof AppError ? {
          code: error.code,
          message: error.message,
          metadata: error.metadata
        } : {
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }, `${actionName} failed`)

      throw error
    }
  }) as T
}
```

**Archivos a crear:**
- [ ] `packages/shared/logger/package.json`
- [ ] `packages/shared/logger/index.ts`
- [ ] `packages/shared/errors/package.json`
- [ ] `packages/shared/errors/index.ts`
- [ ] `apps/web/lib/action-wrapper.ts`

**Verificación:**
```bash
bun run type-check  # Must pass
bun run dev         # Logs should appear with structure
```

---

#### **Día 2: Setup Sentry (3 horas)**

**2.1 Instalar Sentry**
```bash
bun add @sentry/nextjs
bunx @sentry/wizard@latest -i nextjs
```

Esto crea automáticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Actualiza `next.config.ts`

**2.2 Configurar Sentry**
```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'
import { env } from '@repo/env'

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,

  // Adjust sample rate for performance
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter sensitive data
  beforeSend(event, hint) {
    // Don't send validation errors (too noisy)
    if (event.exception?.values?.[0]?.type === 'ValidationError') {
      return null
    }

    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }

    return event
  },

  // Integrate with logger
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
})
```

**2.3 Agregar variables de entorno**
```typescript
// packages/env/src/index.ts
export const env = createEnv({
  server: {
    // ... existing vars ...
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },
})
```

**2.4 Integrar con wrapper de Server Actions**
```typescript
// apps/web/lib/action-wrapper.ts
import * as Sentry from '@sentry/nextjs'

export function withLogging<T extends (...args: any[]) => Promise<any>>(
  actionName: string,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const requestId = crypto.randomUUID()

    // Sentry transaction
    return await Sentry.startSpan({
      name: actionName,
      op: 'function.server_action',
    }, async () => {
      const actionLogger = logger.child({ action: actionName, requestId })
      const startTime = Date.now()

      try {
        const result = await handler(...args)
        const duration = Date.now() - startTime

        // Log success
        actionLogger.info({ duration, success: true }, `${actionName} completed`)

        // Sentry breadcrumb
        Sentry.addBreadcrumb({
          category: 'action',
          message: `${actionName} completed`,
          level: 'info',
          data: { duration }
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        // Log error
        actionLogger.error({ duration, error }, `${actionName} failed`)

        // Capture in Sentry
        Sentry.captureException(error, {
          tags: {
            action: actionName,
            requestId
          },
          contexts: {
            action: {
              name: actionName,
              duration,
              args: JSON.stringify(args).slice(0, 1000), // Truncate
            }
          }
        })

        throw error
      }
    })
  }) as T
}
```

**Archivos a modificar:**
- [ ] `packages/env/src/index.ts` - Add Sentry vars
- [ ] `apps/web/lib/action-wrapper.ts` - Integrate Sentry
- [ ] `.env.local` (root y apps/web) - Add SENTRY_DSN

**Verificación:**
```bash
# Trigger test error
bun run dev
# Navigate to app, trigger error
# Check Sentry dashboard: https://sentry.io/
```

---

#### **Día 3: Refactor 2-3 Server Actions (2 horas)**

**3.1 Refactor createPropertyAction**
```typescript
// apps/web/app/actions/properties.ts
import { withLogging } from '@/lib/action-wrapper'
import { ValidationError, PermissionError } from '@repo/shared/errors'

export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    // Validate auth
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      throw new AuthError('User not authenticated')
    }

    // Check permissions
    if (user.role !== 'AGENT') {
      throw new PermissionError('Only agents can create properties')
    }

    // Validate input
    const result = createPropertySchema.safeParse(
      Object.fromEntries(formData)
    )
    if (!result.success) {
      throw new ValidationError(
        result.error.errors[0].message,
        result.error.errors[0].path[0]?.toString()
      )
    }

    // Business logic (ya tiene error handling natural)
    const property = await PropertyRepository.create({
      ...result.data,
      userId: user.id,
    })

    return { success: true, property }
  }
)
```

**3.2 Refactor uploadPropertyImagesAction**
```typescript
export const uploadPropertyImagesAction = withLogging(
  'uploadPropertyImages',
  async (propertyId: string, files: File[]) => {
    // ... same pattern ...
  }
)
```

**3.3 Refactor deletePropertyAction**
```typescript
export const deletePropertyAction = withLogging(
  'deleteProperty',
  async (propertyId: string) => {
    // ... same pattern ...
  }
)
```

**Archivos a modificar:**
- [ ] `apps/web/app/actions/properties.ts`
- [ ] `apps/web/app/actions/favorites.ts`
- [ ] `apps/web/app/actions/appointments.ts`

**Verificación:**
```bash
# Test each action
bun run dev
# Create property → Check logs appear
# Trigger error → Check Sentry captures it
```

---

### **Fase 2: Rate Limiting (Semana 2 - 4 horas)**

#### **Día 4: Setup Upstash Redis (2 horas)**

**4.1 Crear cuenta Upstash**
1. Ir a https://upstash.com/
2. Crear cuenta (GitHub OAuth)
3. Crear Redis database (región más cercana a Vercel)
4. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

**4.2 Instalar dependencias**
```bash
bun add @upstash/redis @upstash/ratelimit
```

**4.3 Configurar cliente**
```typescript
// packages/shared/rate-limit/index.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from '@repo/env'

// Singleton Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

// Rate limiters
export const rateLimiters = {
  // Login: 5 attempts per 15 minutes
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:login',
  }),

  // Property creation: 10 per day
  createProperty: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 d'),
    analytics: true,
    prefix: 'ratelimit:property',
  }),

  // Image upload: 50 per day
  uploadImages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 d'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),

  // AI Search: 100 per day
  aiSearch: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 d'),
    analytics: true,
    prefix: 'ratelimit:ai',
  }),
}

// Helper function
export async function checkRateLimit(
  limiter: keyof typeof rateLimiters,
  identifier: string
) {
  const { success, limit, remaining, reset } = await rateLimiters[limiter].limit(
    identifier
  )

  if (!success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)}s`
    )
  }

  return { remaining, reset }
}
```

**4.4 Agregar variables de entorno**
```typescript
// packages/env/src/index.ts
export const env = createEnv({
  server: {
    // ... existing ...
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
  },
})
```

**Archivos a crear:**
- [ ] `packages/shared/rate-limit/package.json`
- [ ] `packages/shared/rate-limit/index.ts`

**Archivos a modificar:**
- [ ] `packages/env/src/index.ts`
- [ ] `.env.local` (ambos)

---

#### **Día 5: Implementar Rate Limiting (2 horas)**

**5.1 Login rate limiting**
```typescript
// apps/web/app/actions/auth.ts
import { checkRateLimit } from '@repo/shared/rate-limit'

export const loginAction = withLogging(
  'login',
  async (email: string, password: string) => {
    // Rate limit by email (prevent brute force)
    await checkRateLimit('login', email.toLowerCase())

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log failed attempt
      logger.warn({ email, error: error.message }, 'Login failed')
      throw new AuthError('Invalid credentials')
    }

    logger.info({ email, userId: data.user.id }, 'Login successful')
    return { success: true, user: data.user }
  }
)
```

**5.2 Property creation rate limiting**
```typescript
// apps/web/app/actions/properties.ts
export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AuthError('Not authenticated')

    // Rate limit by userId
    const { remaining } = await checkRateLimit('createProperty', user.id)

    // Show remaining quota in logs
    logger.info({ userId: user.id, remaining }, 'Property creation quota')

    // ... rest of logic ...
  }
)
```

**5.3 AI Search rate limiting**
```typescript
// apps/web/app/api/ai-search/route.ts
export async function POST(request: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  const identifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous'

  // Rate limit (authenticated by userId, anonymous by IP)
  await checkRateLimit('aiSearch', identifier)

  // ... OpenAI call ...
}
```

**Archivos a modificar:**
- [ ] `apps/web/app/actions/auth.ts`
- [ ] `apps/web/app/actions/properties.ts`
- [ ] `apps/web/app/api/ai-search/route.ts`

**Verificación:**
```bash
# Test rate limits
bun run dev

# Try login 6 times with wrong password
# → Should block on 6th attempt

# Create 11 properties rapidly
# → Should block on 11th
```

---

### **Fase 3: Dashboards y Alertas (Semana 3 - 6 horas)**

#### **Día 6: Configurar Sentry Alerts (2 horas)**

**6.1 Alert Rules en Sentry Dashboard**

Ir a Sentry → Alerts → Create Alert Rule:

**Alert 1: High Error Rate**
```
Condition: Error rate > 5% in 1 hour
Actions:
  - Send Slack notification to #engineering
  - Send email to team@inmoapp.com
```

**Alert 2: Performance Degradation**
```
Condition: P95 latency > 2000ms for 10 minutes
Actions:
  - Send Slack notification to #engineering
  - Create PagerDuty incident (if critical)
```

**Alert 3: New Error Type**
```
Condition: New issue created (first time seen)
Actions:
  - Send Slack notification to #bugs
```

**Alert 4: High Volume Errors**
```
Condition: Same error occurs > 100 times in 1 hour
Actions:
  - Send email immediately
  - Escalate to on-call engineer
```

**6.2 Configurar Slack Integration**
1. Sentry → Settings → Integrations → Slack
2. Authorize Slack workspace
3. Map channels to alert types

**6.3 User Feedback Widget**
```typescript
// apps/web/components/error-boundary.tsx
import * as Sentry from '@sentry/nextjs'

export function ErrorBoundary({ error }: { error: Error }) {
  const eventId = Sentry.captureException(error)

  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>We've been notified and are working on it.</p>

      <button
        onClick={() => {
          Sentry.showReportDialog({
            eventId,
            title: 'It looks like we\'re having issues.',
            subtitle: 'Our team has been notified.',
            subtitle2: 'If you\'d like to help, tell us what happened below.',
          })
        }}
      >
        Report Feedback
      </button>
    </div>
  )
}
```

**Archivos a crear:**
- [ ] `apps/web/components/error-boundary.tsx`

---

#### **Día 7: Vercel Analytics Setup (1 hora)**

**7.1 Habilitar Vercel Analytics**
```bash
# En Vercel Dashboard:
# Project Settings → Analytics → Enable

# Instalar paquete
bun add @vercel/analytics
```

**7.2 Agregar provider**
```typescript
// apps/web/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**7.3 Custom events**
```typescript
// apps/web/components/properties/property-form.tsx
import { track } from '@vercel/analytics'

export function PropertyForm() {
  const handleSubmit = async () => {
    // ... create property ...

    track('property_created', {
      propertyType: data.type,
      price: data.price,
      city: data.city,
    })
  }
}
```

**Archivos a modificar:**
- [ ] `apps/web/app/layout.tsx`
- [ ] `apps/web/components/properties/property-form.tsx`

---

#### **Día 8: Custom Metrics Dashboard (3 horas)**

**8.1 Crear métricas en Redis**
```typescript
// packages/shared/metrics/index.ts
import { Redis } from '@upstash/redis'
import { env } from '@repo/env'

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export const metrics = {
  // Increment counter
  async increment(key: string, amount: number = 1) {
    await redis.incrby(key, amount)
  },

  // Record timing
  async recordTiming(key: string, duration: number) {
    const date = new Date().toISOString().split('T')[0]
    await redis.zadd(`timings:${key}:${date}`, {
      score: duration,
      member: Date.now().toString(),
    })
  },

  // Get metrics
  async getCounters(pattern: string) {
    const keys = await redis.keys(pattern)
    const values = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await redis.get(key),
      }))
    )
    return values
  },
}

// Usage in Server Actions
export async function trackMetric(
  action: string,
  duration: number,
  success: boolean
) {
  const date = new Date().toISOString().split('T')[0]

  await Promise.all([
    // Count total calls
    metrics.increment(`metrics:${action}:${date}:total`),

    // Count successes
    success && metrics.increment(`metrics:${action}:${date}:success`),

    // Count errors
    !success && metrics.increment(`metrics:${action}:${date}:error`),

    // Record duration
    metrics.recordTiming(`metrics:${action}:${date}:duration`, duration),
  ])
}
```

**8.2 Integrar con wrapper**
```typescript
// apps/web/lib/action-wrapper.ts
import { trackMetric } from '@repo/shared/metrics'

export function withLogging<T>(...) {
  return (async (...args) => {
    // ... existing code ...

    try {
      const result = await handler(...args)
      const duration = Date.now() - startTime

      // Track success metric
      await trackMetric(actionName, duration, true)

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Track error metric
      await trackMetric(actionName, duration, false)

      throw error
    }
  }) as T
}
```

**8.3 API endpoint para dashboard**
```typescript
// apps/web/app/api/metrics/route.ts
import { metrics } from '@repo/shared/metrics'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || '*'
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const counters = await metrics.getCounters(`metrics:${action}:${date}:*`)

  return NextResponse.json({
    date,
    action,
    metrics: counters.reduce((acc, { key, value }) => {
      const metricName = key.split(':').pop()
      acc[metricName!] = value
      return acc
    }, {} as Record<string, any>),
  })
}
```

**8.4 Dashboard simple**
```typescript
// apps/web/app/admin/metrics/page.tsx
export default async function MetricsPage() {
  const response = await fetch('/api/metrics?action=createProperty')
  const data = await response.json()

  return (
    <div>
      <h1>Metrics Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Total Calls"
          value={data.metrics.total || 0}
        />
        <MetricCard
          title="Success Rate"
          value={`${((data.metrics.success / data.metrics.total) * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="Error Rate"
          value={`${((data.metrics.error / data.metrics.total) * 100).toFixed(1)}%`}
        />
      </div>
    </div>
  )
}
```

**Archivos a crear:**
- [ ] `packages/shared/metrics/package.json`
- [ ] `packages/shared/metrics/index.ts`
- [ ] `apps/web/app/api/metrics/route.ts`
- [ ] `apps/web/app/admin/metrics/page.tsx`

---

### **Fase 4: Security Monitoring (Semana 4 - 4 horas)**

#### **Día 9: Audit Logging (2 horas)**

**9.1 Crear Audit Log schema**
```prisma
// packages/database/prisma/schema.prisma
model AuditLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  // Who did it
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  // What happened
  action    String   // "property.created", "user.login", "property.deleted"
  resource  String?  // "Property", "User", etc
  resourceId String? // ID of resource affected

  // Context
  metadata  Json?    // Additional data (before/after values, IP, etc)
  ipAddress String?
  userAgent String?

  // Result
  success   Boolean
  errorCode String?

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

**9.2 Audit logger helper**
```typescript
// packages/shared/audit/index.ts
import { db } from '@repo/database'
import type { User } from '@repo/database'

export async function createAuditLog(params: {
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorCode?: string
}) {
  await db.auditLog.create({
    data: params,
  })
}

// Helper for Server Actions
export async function auditAction<T>(
  action: string,
  user: User | null,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await handler()

    await createAuditLog({
      userId: user?.id,
      action,
      success: true,
    })

    return result
  } catch (error) {
    await createAuditLog({
      userId: user?.id,
      action,
      success: false,
      errorCode: error instanceof AppError ? error.code : 'UNKNOWN',
    })

    throw error
  }
}
```

**9.3 Integrar en Server Actions críticos**
```typescript
// apps/web/app/actions/properties.ts
import { auditAction } from '@repo/shared/audit'

export const deletePropertyAction = withLogging(
  'deleteProperty',
  async (propertyId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AuthError('Not authenticated')

    return await auditAction(
      'property.deleted',
      user,
      async () => {
        // Verify ownership
        const property = await PropertyRepository.findById(propertyId)
        if (property.userId !== user.id) {
          throw new PermissionError('Not property owner')
        }

        // Delete images from storage
        await deletePropertyImages(propertyId)

        // Delete from DB
        await PropertyRepository.delete(propertyId)

        return { success: true }
      }
    )
  }
)
```

**Migración:**
```bash
cd packages/database
bunx prisma migrate dev --name add-audit-logs
```

**Archivos a crear:**
- [ ] `packages/shared/audit/package.json`
- [ ] `packages/shared/audit/index.ts`

**Archivos a modificar:**
- [ ] `packages/database/prisma/schema.prisma`
- [ ] `apps/web/app/actions/properties.ts`
- [ ] `apps/web/app/actions/auth.ts`

---

#### **Día 10: Security Headers (2 horas)**

**10.1 Configurar headers de seguridad**
```typescript
// apps/web/next.config.ts
import type { NextConfig } from 'next'

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
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.mapbox.com;
      style-src 'self' 'unsafe-inline' https://api.mapbox.com;
      img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co https://api.mapbox.com wss://*.supabase.co;
      frame-src 'self';
    `.replace(/\s+/g, ' ').trim()
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },

  // ... rest of config
}

export default nextConfig
```

**10.2 Test headers**
```bash
# Start dev server
bun run dev

# Test headers in another terminal
curl -I http://localhost:3000

# Should see security headers in response
```

**10.3 Security audit checklist**
```markdown
# Security Checklist

## Headers ✅
- [x] HSTS enabled
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] CSP configured
- [x] Referrer-Policy set

## Authentication ✅
- [x] Rate limiting on login
- [x] Secure session cookies (Supabase)
- [x] RLS policies in DB

## Input Validation
- [ ] HTML sanitization (DOMPurify) - TODO Phase 1.2
- [ ] File upload validation - Partial
- [ ] SQL injection prevention - ✅ (Prisma)
- [ ] XSS prevention - Needs CSP review

## Monitoring ✅
- [x] Error tracking (Sentry)
- [x] Audit logging
- [x] Failed login attempts logged
- [x] Security alerts configured
```

**Archivos a crear:**
- [ ] `docs/security/SECURITY_CHECKLIST.md`

**Archivos a modificar:**
- [ ] `apps/web/next.config.ts`

---

## 💰 Análisis de Costos

### Costos Mensuales Estimados

#### **Escenario 1: MVP / Early Stage (0-1000 usuarios/mes)**

| Servicio | Plan | Costo | Notas |
|----------|------|-------|-------|
| **Pino** | Open Source | $0 | Gratis siempre |
| **Sentry** | Free | $0 | 5K errors/mes, 100 replays |
| **Upstash Redis** | Free | $0 | 10K requests/día = 300K/mes |
| **Vercel Logs** | Hobby | $0 | Limitado a 7 días |
| **Vercel Analytics** | - | $0 | Requiere plan Pro |
| **TOTAL** | | **$0/mes** | Sin límite de tiempo |

**Límites:**
- Sentry: 5,000 errors/mes (suficiente para MVP)
- Upstash: 10,000 requests/día (suficiente para rate limiting básico)
- Logs: Solo 7 días de retención

**Cuándo actualizar:** Cuando superes 5K errors/mes o necesites > 7 días de logs

---

#### **Escenario 2: Growth / Scale (1K-10K usuarios/mes)**

| Servicio | Plan | Costo | Notas |
|----------|------|-------|-------|
| **Pino** | Open Source | $0 | Gratis siempre |
| **Sentry** | Team | $26/dev/mes | 50K errors, 500 replays, alertas avanzadas |
| **Upstash Redis** | Pay-as-you-go | ~$5-10/mes | 1M requests/mes |
| **Vercel** | Pro | $20/mes | Logs, Analytics, 100GB bandwidth |
| **TOTAL** | | **$51-56/mes** | Para 1 desarrollador |

**Por cada dev adicional:** +$26/mes (Sentry Team)

**Límites:**
- Sentry: 50,000 errors/mes
- Upstash: Ilimitado (pay-per-request)
- Logs: 30 días de retención
- Analytics: Ilimitado

**Cuándo actualizar:** Cuando necesites > 50K errors/mes o > 1 dev en equipo

---

#### **Escenario 3: Production / Enterprise (10K+ usuarios/mes)**

| Servicio | Plan | Costo | Notas |
|----------|------|-------|-------|
| **Pino** | Open Source | $0 | Gratis siempre |
| **Sentry** | Business | $80/dev/mes | Errores ilimitados, SLA 99.9% |
| **Upstash Redis** | Pay-as-you-go | ~$20-40/mes | 5M requests/mes |
| **Vercel** | Pro/Enterprise | $20-250/mes | Según tráfico |
| **Datadog** (opcional) | Pro | $15/host/mes | Logs agregados, APM |
| **TOTAL** | | **$135-390/mes** | Para 1 desarrollador, 3-5 hosts |

**Extras opcionales:**
- PagerDuty: $25/usuario/mes (on-call rotation)
- Grafana Cloud: $0-50/mes (dashboards avanzados)

---

### ROI Estimado

#### **Sin Observabilidad (Estado Actual)**

**Costos ocultos:**
- 🔴 Debugging en producción: **2 horas/error** × 10 errors/mes = 20 horas/mes
- 🔴 Downtime por bugs no detectados: **1 hora/mes** (pérdida de revenue)
- 🔴 Customer support por bugs: **5 horas/mes**
- 🔴 Perdida de credibilidad: **Incalculable**

**Total tiempo perdido:** ~26 horas/mes × $50/hora = **$1,300/mes**

---

#### **Con Observabilidad (Después de implementación)**

**Costos directos:**
- 💰 Herramientas: **$0-56/mes** (según escenario)
- ⏱️ Setup time: **22 horas** (one-time, ~$1,100)

**Ahorros:**
- ✅ Debugging: **15 minutos/error** (12x más rápido) → Ahorro: 17.5 horas/mes
- ✅ Detección proactiva: **Previene 50% downtime** → Ahorro: 0.5 horas/mes
- ✅ Customer support: **Reduce 60%** → Ahorro: 3 horas/mes
- ✅ Developer velocity: **+30%** (confianza para refactorizar)

**Total ahorro:** ~21 horas/mes × $50/hora = **$1,050/mes**

**ROI neto:**
- Mes 1: -$1,100 (setup) + $1,050 (ahorro) - $56 (costo) = **-$106**
- Mes 2+: $1,050 - $56 = **+$994/mes**

**Payback period:** <1 mes

---

## 📊 ROI y Métricas

### KPIs a Medir

#### **Antes de implementar (Baseline)**

| Métrica | Valor Actual | Método |
|---------|--------------|--------|
| Mean Time to Detect (MTTD) | Desconocido | Sin monitoring |
| Mean Time to Resolve (MTTR) | ~2 horas | Estimado manual |
| Error Rate | Desconocido | Sin tracking |
| P95 Latency | Desconocido | Sin metrics |
| Deployment Confidence | 6/10 | Subjetivo |

---

#### **Después de implementar (Targets)**

| Métrica | Target | Método de medición |
|---------|--------|-------------------|
| Mean Time to Detect (MTTD) | <5 minutos | Sentry alerts |
| Mean Time to Resolve (MTTR) | <30 minutos | Sentry issue resolution time |
| Error Rate | <1% | Sentry dashboard |
| P95 Latency | <1000ms | Vercel Analytics |
| Deployment Confidence | 9/10 | Team survey |

---

### Métricas de Negocio

#### **Availability**
```
Target: 99.9% uptime
= Max downtime: 43 minutos/mes

Alertas si:
- Error rate > 5% en 10 min
- P95 latency > 2000ms en 10 min
```

#### **Performance**
```
Target: P95 < 1000ms
Current: Unknown

Sentry Performance Monitoring:
- Track todas las Server Actions
- Alert si P95 > 2000ms
```

#### **User Satisfaction**
```
Target: <1% error rate percibido por usuarios

Sentry User Feedback:
- Widget en error boundaries
- Track user sentiment
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Server Action Completo con Todo el Stack

```typescript
// apps/web/app/actions/properties.ts
import { withLogging } from '@/lib/action-wrapper'
import { checkRateLimit } from '@repo/shared/rate-limit'
import { auditAction } from '@repo/shared/audit'
import {
  ValidationError,
  AuthError,
  PermissionError,
  NotFoundError,
} from '@repo/shared/errors'
import * as Sentry from '@sentry/nextjs'
import { track } from '@vercel/analytics'

export const createPropertyAction = withLogging(
  'createProperty',
  async (formData: FormData) => {
    // 1. Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthError('User not authenticated')
    }

    // 2. Authorization
    if (user.role !== 'AGENT') {
      throw new PermissionError('Only agents can create properties', 'Property')
    }

    // 3. Rate Limiting
    const { remaining } = await checkRateLimit('createProperty', user.id)
    logger.info({ userId: user.id, remaining }, 'Property creation quota check')

    // 4. Input Validation
    const rawData = Object.fromEntries(formData)
    const result = createPropertySchema.safeParse(rawData)

    if (!result.success) {
      const firstError = result.error.errors[0]
      throw new ValidationError(
        firstError.message,
        firstError.path[0]?.toString()
      )
    }

    // 5. Audit Logging Wrapper
    return await auditAction(
      'property.created',
      user,
      async () => {
        // 6. Business Logic with Sentry Context
        const property = await Sentry.startSpan(
          { name: 'PropertyRepository.create', op: 'db.query' },
          async () => {
            return await PropertyRepository.create({
              ...result.data,
              userId: user.id,
            })
          }
        )

        // 7. Analytics Event
        track('property_created', {
          propertyType: property.type,
          transactionType: property.transactionType,
          price: property.price,
          city: property.city,
        })

        // 8. Success Response
        return {
          success: true,
          property,
          remaining, // Quota remaining
        }
      }
    )
  }
)
```

**Qué hace este código:**
1. ✅ Autenticación con Supabase
2. ✅ Verificación de permisos (role)
3. ✅ Rate limiting (10 properties/día)
4. ✅ Validación con Zod
5. ✅ Audit logging (quién, qué, cuándo)
6. ✅ Error tracking con Sentry
7. ✅ Performance monitoring (DB query span)
8. ✅ Analytics tracking con Vercel
9. ✅ Structured logging con Pino (via wrapper)

**Beneficios:**
- 🔍 Debugging: Logs completos con contexto
- 🚨 Alertas: Sentry captura errores automáticamente
- 📊 Métricas: Track de uso y performance
- 🔒 Seguridad: Rate limiting + audit trail
- ✅ Mantenibilidad: Todo en un solo lugar

---

### Ejemplo 2: Error Boundary con Feedback

```typescript
// apps/web/components/error-boundary.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error in Sentry
    const eventId = Sentry.captureException(error)

    // Store eventId for feedback widget
    ;(window as any).__SENTRY_EVENT_ID__ = eventId
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold">Algo salió mal</h1>

        <p className="mb-6 text-gray-600">
          Nuestro equipo ha sido notificado automáticamente.
          Estamos trabajando en solucionarlo.
        </p>

        {error.digest && (
          <p className="mb-4 text-sm text-gray-500">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            Intentar de nuevo
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              Sentry.showReportDialog({
                eventId: (window as any).__SENTRY_EVENT_ID__,
                title: 'Ayúdanos a mejorar',
                subtitle: 'Cuéntanos qué estabas haciendo cuando ocurrió el error.',
                labelName: 'Nombre',
                labelEmail: 'Email',
                labelComments: '¿Qué estabas haciendo?',
                labelSubmit: 'Enviar reporte',
                successMessage: 'Gracias! Tu reporte nos ayuda a mejorar.',
              })
            }}
          >
            Reportar problema
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Features:**
- ✅ Auto-captura errores en Sentry
- ✅ Feedback widget para usuarios
- ✅ Error ID para soporte
- ✅ Retry functionality

---

### Ejemplo 3: Dashboard de Métricas Simple

```typescript
// apps/web/app/admin/metrics/page.tsx
import { metrics } from '@repo/shared/metrics'
import { Card } from '@/components/ui/card'

export default async function MetricsPage() {
  const today = new Date().toISOString().split('T')[0]

  // Fetch metrics from Redis
  const [propertyMetrics, userMetrics, errorMetrics] = await Promise.all([
    getActionMetrics('createProperty', today),
    getActionMetrics('login', today),
    getActionMetrics('*', today),
  ])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Métricas del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Properties Created */}
        <MetricCard
          title="Propiedades Creadas"
          value={propertyMetrics.total}
          change={propertyMetrics.change}
          subtitle={`${propertyMetrics.successRate}% exitoso`}
        />

        {/* Logins */}
        <MetricCard
          title="Logins Hoy"
          value={userMetrics.total}
          change={userMetrics.change}
          subtitle={`${userMetrics.failedAttempts} intentos fallidos`}
        />

        {/* Error Rate */}
        <MetricCard
          title="Tasa de Error"
          value={`${errorMetrics.errorRate}%`}
          change={errorMetrics.change}
          subtitle={`${errorMetrics.totalErrors} errores hoy`}
          variant={errorMetrics.errorRate > 5 ? 'danger' : 'success'}
        />
      </div>

      {/* Recent Errors from Sentry */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Errores Recientes</h2>
        <RecentErrorsList />
      </div>
    </div>
  )
}

async function getActionMetrics(action: string, date: string) {
  const counters = await metrics.getCounters(`metrics:${action}:${date}:*`)

  const total = counters.find(c => c.key.endsWith(':total'))?.value || 0
  const success = counters.find(c => c.key.endsWith(':success'))?.value || 0
  const error = counters.find(c => c.key.endsWith(':error'))?.value || 0

  return {
    total,
    success,
    error,
    successRate: total > 0 ? ((success / total) * 100).toFixed(1) : '0',
    errorRate: total > 0 ? ((error / total) * 100).toFixed(1) : '0',
    failedAttempts: error,
    totalErrors: error,
    change: '+12%', // TODO: Calculate vs yesterday
  }
}

function MetricCard({
  title,
  value,
  change,
  subtitle,
  variant = 'default'
}: {
  title: string
  value: string | number
  change: string
  subtitle: string
  variant?: 'default' | 'success' | 'danger'
}) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className={
          variant === 'danger' ? 'text-red-600' :
          variant === 'success' ? 'text-green-600' :
          'text-gray-600'
        }>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </Card>
  )
}
```

---

## 📚 Referencias

### Documentación Oficial

**Pino:**
- https://getpino.io/
- https://github.com/pinojs/pino
- Best practices: https://getpino.io/#/docs/best-practices

**Sentry:**
- https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Performance monitoring: https://docs.sentry.io/product/performance/
- Session Replay: https://docs.sentry.io/product/session-replay/

**Upstash:**
- https://docs.upstash.com/redis
- Rate limiting: https://github.com/upstash/ratelimit
- Vercel integration: https://vercel.com/integrations/upstash

**Vercel:**
- Analytics: https://vercel.com/docs/analytics
- Logs: https://vercel.com/docs/observability/logging
- Speed Insights: https://vercel.com/docs/speed-insights

---

### Artículos y Guías

**Observability Best Practices:**
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/ch04.html)
- [Observability in Next.js](https://nextjs.org/docs/advanced-features/measuring-performance)

**Error Tracking:**
- [Error Monitoring Best Practices](https://sentry.io/resources/error-monitoring-best-practices/)

**Rate Limiting:**
- [Rate Limiting Algorithms](https://blog.upstash.com/rate-limiting-algorithms)
- [API Rate Limiting Strategies](https://www.nginx.com/blog/rate-limiting-nginx/)

---

### Documentos Internos Relacionados

- `docs/technical-debt/01-INFRASTRUCTURE.md` - Plan completo de infraestructura
- `docs/technical-debt/README.md` - Resumen ejecutivo de deuda técnica
- `.claude/07-technical-debt.md` - Documento estratégico original
- `docs/security/SECURITY_HEADERS.md` - Guía de security headers

---

## ✅ Checklist de Implementación

### Fase 1: Fundamentos (Semana 1)

- [ ] **Día 1: Pino + Errors**
  - [ ] Instalar Pino (`bun add pino pino-pretty`)
  - [ ] Crear `packages/shared/logger/index.ts`
  - [ ] Crear `packages/shared/errors/index.ts`
  - [ ] Crear `apps/web/lib/action-wrapper.ts`
  - [ ] Verificar logs en desarrollo

- [ ] **Día 2: Sentry**
  - [ ] Crear cuenta Sentry
  - [ ] Instalar SDK (`bunx @sentry/wizard`)
  - [ ] Configurar DSN en env vars
  - [ ] Integrar con action wrapper
  - [ ] Test: Trigger error y verificar en Sentry

- [ ] **Día 3: Refactor Actions**
  - [ ] Refactor `createPropertyAction`
  - [ ] Refactor `uploadPropertyImagesAction`
  - [ ] Refactor `deletePropertyAction`
  - [ ] Refactor actions de favorites
  - [ ] Refactor actions de appointments

### Fase 2: Rate Limiting (Semana 2)

- [ ] **Día 4: Upstash Setup**
  - [ ] Crear cuenta Upstash
  - [ ] Crear Redis database
  - [ ] Instalar SDK (`bun add @upstash/redis @upstash/ratelimit`)
  - [ ] Crear `packages/shared/rate-limit/index.ts`
  - [ ] Configurar env vars

- [ ] **Día 5: Implementar Limits**
  - [ ] Rate limit en login (5/15min)
  - [ ] Rate limit en create property (10/día)
  - [ ] Rate limit en upload images (50/día)
  - [ ] Rate limit en AI search (100/día)
  - [ ] Test: Verificar límites funcionan

### Fase 3: Dashboards (Semana 3)

- [ ] **Día 6: Sentry Alerts**
  - [ ] Configurar alert para error rate > 5%
  - [ ] Configurar alert para P95 > 2000ms
  - [ ] Configurar alert para new issues
  - [ ] Setup Slack integration
  - [ ] Test: Trigger alert

- [ ] **Día 7: Vercel Analytics**
  - [ ] Habilitar en Vercel dashboard
  - [ ] Instalar SDK (`bun add @vercel/analytics`)
  - [ ] Agregar provider a layout
  - [ ] Agregar custom events
  - [ ] Verificar datos en dashboard

- [ ] **Día 8: Custom Metrics**
  - [ ] Crear `packages/shared/metrics/index.ts`
  - [ ] Integrar con action wrapper
  - [ ] Crear API endpoint `/api/metrics`
  - [ ] Crear dashboard básico
  - [ ] Test: Verificar métricas se guardan

### Fase 4: Security (Semana 4)

- [ ] **Día 9: Audit Logging**
  - [ ] Agregar AuditLog model a Prisma
  - [ ] Crear migration
  - [ ] Crear `packages/shared/audit/index.ts`
  - [ ] Integrar en delete/update actions
  - [ ] Verificar logs en DB

- [ ] **Día 10: Security Headers**
  - [ ] Configurar headers en `next.config.ts`
  - [ ] Test con `curl -I`
  - [ ] Verificar CSP no rompe app
  - [ ] Crear security checklist
  - [ ] Documentar procedimientos

---

## 🎯 Siguiente Paso

**¿Listo para comenzar?**

Ejecuta:
```bash
# Fase 1, Día 1
bun add pino pino-pretty
```

Y sigue los pasos en la sección [Día 1: Setup Pino + Custom Errors](#día-1-setup-pino--custom-errors-3-horas).

---

**Última actualización:** Noviembre 16, 2025
**Tiempo estimado total:** 22 horas (4 semanas × 5-6 horas/semana)
**ROI:** Payback en <1 mes
