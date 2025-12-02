# InmoApp - Claude Context

> Auto-loaded context for Claude Code. For detailed docs see `docs/AI_ASSISTANTS.md`

---

## Project Overview

**Real estate platform** | Phase 1.5: Public-facing features | Next.js 16 + Supabase + Bun Workspaces

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind v4 + GSAP | Supabase Auth + Storage | Prisma + PostgreSQL | Bun Workspaces monorepo | Bun

---

## Quick Start

```bash
bun run dev          # Start development (Bun workspaces, Turbopack compiles)
bun run dev:web      # Direct: Skip to apps/web (alternative)
bun run type-check   # TypeScript validation (run before commits!)
bun run lint         # Biome linting
cd packages/database && bunx prisma studio  # DB browser
```

---

## Architecture

**Data Flow:**
```
Component → Server Action → Repository → Prisma → Database
```

**Structure:**
```
apps/web/
├── app/actions/        # Server Actions (mutations)
├── components/         # React components
├── lib/               # Utils, validations, auth
└── proxy.ts          # Auth + routing (Next.js 16 convention)

packages/
├── env/               # Environment variables validation (@repo/env)
├── database/          # Prisma schema + repositories
├── supabase/          # Supabase clients
├── ui/               # Shared UI components
└── typescript-config/ # TS configs
```

---

## Critical Rules

1. **Always run** `bun run type-check` before commits
2. **New packages:** Add to `transpilePackages` in `next.config.ts` + restart server
3. **All DB ops** in `repositories/`
4. **Server Actions** validate auth + permissions
5. **Forms** use Zod validation
6. **Server Components** by default (Client only when needed)
7. **Environment variables:** Use `import { env } from '@repo/env'` (never `process.env`)
8. **Bun workspaces:** Scripts in root `package.json` define task dependencies (Prisma generation before dev/build)

## Build Tools Explained

**Two distinct tools** work together in your stack:
- **Turbopack** (built in Next.js 16): Fast bundler - compiles TS/JSX → JS (default since Next.js 16)
- **Bun** (`bun run`): Runtime + package manager - executes commands and manages workspaces

**Development Flow:**
```
bun run dev
  ↓ (runs root script from package.json)
  ├─ bun run db:gen (Prisma generation)
  └─ cd apps/web && bun run dev
      ↓
      Turbopack compiles code → Server starts
```

---

## Database

**Models:** `User`, `Property`, `PropertyImage`, `Favorite`, `Appointment`

**Roles:**
- `CLIENT`: Browse + favorites + appointments
- `AGENT`: Create properties + manage listings
- `ADMIN`: Full access (future)

**Connection:**
- Pooler (Transaction Mode): `DATABASE_URL` → port 6543 (serverless, best for Prisma)
- Direct Connection: `DIRECT_URL` → db.*.supabase.co:5432 (migrations only)
- Region: US East (aws-1-us-east-2)

**Environment Variables:**
- Centralized in `@repo/env` package
- All validated with Zod at startup
- Type-safe across monorepo
- Access via: `import { env } from '@repo/env'`

---

## Environment Variables

**⚠️ CRITICAL:** Bun workspaces monorepo has TWO `.env.local` files:
- `root/.env.local` (build tools, Bun)
- `apps/web/.env.local` (Next.js, which ONLY reads this one)

**Adding new vars:** Update both files + `packages/env/src/index.ts` schema, then restart `bun run dev`

**Key variables:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase
- `DATABASE_URL` (pooler, port 6543), `DIRECT_URL` (migrations, port 5432)
- `NEXT_PUBLIC_MAPBOX_TOKEN`, `OPENAI_API_KEY`, `RESEND_API_KEY`

**See:** `docs/getting-started/ENV_QUICK_START.md` or `docs/architecture/ENVIRONMENT_VARIABLES.md` for full details

---

## Common Issues

**Prisma client not found:**
```bash
cd packages/database && bunx prisma generate
# Or use root script:
bun run db:gen
```

**Package not found:**
1. Check `transpilePackages` in `next.config.ts`
2. Restart dev server

**Changes not reflected:**
```bash
rm -rf apps/web/.next && bun run dev
```

**Build cache issues:**
```bash
# Clear Next.js cache if builds are stale
rm -rf apps/web/.next
bun run build  # Rebuilds everything
```

**Direct development (skip root scripts):**
```bash
# If you need to skip root orchestration
bun run dev:web  # Goes directly to apps/web
```

---

## Documentation

**For AI Assistants:**
- **Auto-loaded:** `.claude/01-06` files (~27k tokens, auto-included)
- **On-demand:** `.claude/08-11` files in `.claudeignore` (multi-tenant, debt, teaching, appointments)
- **Guide:** `docs/AI_ASSISTANTS.md` (how Claude/Gemini interact with project)
- **⭐ NEW:** `docs/technical-debt/00-DEEP-ANALYSIS.md` (análisis profundo de deuda técnica)
- **💼 NEW:** `docs/business/COST_SCALING_ANALYSIS.md` (análisis de costos a escala)

**For Humans:**
- `QUICK_START.md`, `docs/INDEX.md` (navigation hub), `docs/setup/` (installation)

---

## 💼 Cost Scaling & Business

**Status:** 📊 Analysis Complete (Nov 20, 2025)

**Key Insights:**
InmoApp utiliza 5 servicios externos (Vercel, Supabase, Mapbox, OpenAI, Resend) que escalan de forma diferente según usuarios.

**Cost Breakdown:**
- **Gratis hasta ~800 usuarios** (free tiers)
- **$20/mes a 1,000 usuarios** (Vercel Pro requerido)
- **$97/mes a 10,000 usuarios** (sin optimización)
- **$450/mes a 100,000 usuarios** (con optimizaciones)

**Critical Inflection Points:**
- 800 MAUs → Vercel Pro required ($0 → $20/mes)
- 16,667 usuarios → Mapbox pago (50k map loads excedidos)
- 50,000 MAUs → Supabase Pro ($0 → $25/mes)

**Optimizations:**
Implementando optimizaciones Fase 1+2 → **51% reducción de costos**

**Profitability:**
Con modelo de comisiones (3% por transacción):
- 1 transacción/mes ($3k revenue) cubre costos hasta 100k usuarios
- Margen: 85-99% profit

**See:**
- `docs/business/COST_SCALING_ANALYSIS.md` - Complete cost analysis, pricing tiers, optimization roadmap
- `docs/business/BUSINESS_STRATEGY.md` - General business strategy (global market, all monetization models)
- `docs/business/ECUADOR_STRATEGY.md` - 🇪🇨 **Ecuador-specific strategy** (Cuenca/Azuay launch, local pricing, phased expansion)
- `docs/business/IMPLEMENTATION_STRATEGY.md` - 🚀 **Development strategy** (Git workflow, no fork decision, sprint plan, rollback strategy)
- `docs/business/DECISIONS_APPROVED.md` - ✅ **Approved decisions** (pricing, limits, business rules - Nov 20, 2025)
- `docs/business/TECHNICAL_SPEC.md` - 📋 **Technical specification** (schema, helpers, stripe integration)

---

## 💳 Freemium Model (Aprobado)

**Status:** ✅ Decisiones finalizadas (Nov 20, 2025) - Listo para Sprint 1

**Modelo de negocio**: Freemium con 3 tiers (FREE/BASIC/PRO)

### Pricing Aprobado (Ecuador - USD)

```
FREE:   $0/mes     (1 propiedad, 5 imágenes, sin destacados)
BASIC:  $4.99/mes  (3 propiedades, 10 imágenes, 3 destacados/mes)
PRO:    $14.99/mes (10 propiedades, 20 imágenes, destacados ilimitados)
```

### Decisiones Clave

**Expiración de publicaciones**: Auto-renovación ilimitada
- Las propiedades NO expiran automáticamente
- Usuario las mantiene publicadas hasta que las elimine manualmente
- Simple, flexible, y generoso para lanzamiento

**Nomenclatura**:
- Código: `FREE`, `BASIC`, `PRO` (enum SubscriptionTier)
- UI: "Gratuito", "Básico", "Pro" (traducido)

**Mercado objetivo**: Cuenca/Azuay (Ecuador) → Expansión nacional en 12-18 meses

**Próximos pasos**:
1. Sprint 1-2: Schema + Permissions (2 semanas)
2. Sprint 3-4: Stripe Integration (2 semanas)
3. Sprint 5-6: UI + Beta Testing (2 semanas)

**Referencias técnicas**:
- Schema changes: Ver `TECHNICAL_SPEC.md` sección "Database Schema"
- Permission helpers: `apps/web/lib/permissions/property-limits.ts`
- Server Actions: Validación en `createPropertyAction`

---

## 🗺️ Roadmap & Planning

**Status:** ✅ Phase 1 Complete (100%) | 🔄 Phase 2 Week 2 Active (Nov 30, 2025)

**Timeline**: Nov 2025 - Abr 2026 (4.5 meses)
**Inversión total**: $12,400-14,100
**ROI**: Payback en 11 meses

### Quick Overview

```
Week 1:    ✅ URGENCIAS (Email, Performance, Quick Wins) - DONE
Week 2-4:  🔄 FOUNDATIONS (Testing 25%, Logging, Security) - IN PROGRESS
Week 5-10: ⏳ FREEMIUM (Schema, Stripe, Beta 50 users)
Week 11-18: ⏳ SCALE (E2E tests, Beta pública 500 MAU, Launch)
```

### Hitos Clave

| Fecha | Hito | Target | Status |
|-------|------|--------|--------|
| **Nov 29** | Email funcional + Performance +36% | ✅ Quick wins | ✅ **DONE** |
| **Dic 6** | Fix 17 tests + Repository tests | Testing >25% | 🔄 In Progress |
| **Dic 20** | Logging + Security complete | ✅ Foundations | ⏳ Pending |
| **Feb 14** | Freemium MVP + Beta cerrada | $25-50 MRR | ⏳ Pending |
| **Mar 28** | Beta pública | 200-500 MAU | ⏳ Pending |
| **Abr 11** | Production Launch | $700 MRR 🚀 | ⏳ Pending |

**Ver documentación completa**:
- `docs/ROADMAP.md` - Plan detallado completo (18 semanas)
- `docs/ROADMAP_VISUAL.md` - Vista visual rápida
- `docs/technical-debt/00-DEEP-ANALYSIS.md` - Análisis técnico

---

## Recent Changes in Next.js 16

### 📝 Middleware → Proxy (Breaking Change)

**Status:** ⚠️ Important for migration

In **Next.js 16.0.0**, the `middleware` file convention was officially renamed to `proxy`:

**Why?** The term "middleware" caused confusion with Express patterns. "Proxy" better describes the feature—acts as a network boundary that can redirect, rewrite, or modify requests before reaching routes.

**Migration:**
```bash
# Auto-migrate using codemod
npx @next/codemod@canary middleware-to-proxy .
```

**Manual changes:**
```typescript
// Before (middleware.ts)
export function middleware() { }

// After (proxy.ts)
export function proxy() { }
```

**In this project:** ✅ Already implemented! Using `apps/web/proxy.ts` with `export async function proxy()`. Full Next.js 16 compliance.

---

## Recent Changes (November-December 2025)

### ✅ Phase 1 Completion (Nov 25-29, 2025)

**Summary:** All Phase 1 tasks completed successfully. Email configured, performance optimized, test infrastructure stabilized.

#### 1. Email Configuration (Nov 29)
**Commit:** `6dadd8a`
- Environment-based email config (`lib/email/config.ts`)
- Test mode → production migration path documented
- Zero code changes needed for production (just env var)

#### 2. React.cache() Optimization (Nov 29)
**Commit:** `d471c95`
- Homepage: 2 queries → 1 query (50% reduction)
- Auth pages: getCurrentUser() memoization
- Map view: Viewport filtering optimization
- **Result:** +36-50% performance improvement

**Files:**
- `apps/web/app/(public)/page.tsx`
- `apps/web/lib/auth.ts`
- `apps/web/app/(public)/propiedades/page.tsx`

#### 3. Map URL Bounds Sync (Nov 29)
**Commit:** `e884409`
- Created `useMapBoundsSync` hook
- Shareable map links (copy/paste exact viewport)
- Browser back/forward navigation support
- Debounced updates (500ms)

**File:** `components/map/hooks/use-map-bounds-sync.ts` (175 lines)

#### 4. Test Runner Fix (Nov 29)
**Commit:** `d40a0a6`
- Fixed: Using Bun test runner instead of Vitest
- Solution: Always use `bunx vitest run` from `apps/web`
- Result: 140/160 tests passing (87.5%)

#### 5. Test Improvements (Nov 30 - Dic 1)
**Commits:** `ae5b896`, `[hash Dic 1]`
- Fixed 3 PropertyRepository tests (Nov 30)
- Fixed 17 remaining tests (Dic 1 AM)
- Added db mock exports to vitest.setup.ts
- Result: **160/160 tests passing (100%)** ✅

#### 6. Repository Unit Tests (Dic 1 PM)
**Commits:** `[hash FavoriteRepo]`, `[hash AppointmentRepo]`, `[hash PropertyImageRepo]`, `52b1002` (UserRepo)
- **FavoriteRepository**: 26 tests (toggleFavorite, batch counts, pagination)
- **AppointmentRepository**: 33 tests (business hours, slot availability, stats)
- **PropertyImageRepository**: 26 tests (CRUD, ordering, transactions)
- **UserRepository**: 29 tests (permissions, self-update, admin bypass)
- Result: **289/289 tests passing (100%)** ✅
- Coverage increase: ~15-20% → ~25-30% ✅

**Phase 2 Progress (Week 2):**
- ✅ Task 2.1: Fix failing tests (COMPLETADO)
- ✅ Task 2.2: Repository unit tests (COMPLETADO - +114 tests)
- ✅ Task 2.3: CI/CD enforcement (COMPLETADO)
- ✅ Task 2.4: Coverage measurement (COMPLETADO - 46.53%)

#### 7. CI/CD & Coverage (Dic 1-2)
**Commits:** `[hash CI]`, `6325c23`
- GitHub Actions workflow created
- Coverage enforcement: 25% lines (apps/web), 80% lines (database)
- Codecov integration configured
- Result: **CI/CD pipeline functional** ✅

#### 8. Logging & Monitoring - Week 3 (Dic 2, 2025)
**Commit:** `[pending]`

**Structured Logging with Pino:**
- Installed `pino` + `pino-pretty`
- Created `lib/utils/logger.ts` with JSON structured logging
- Request ID tracking with `createRequestLogger()`
- Migrated `auth.ts` to structured logger
- Environment-aware: pretty print (dev), JSON (prod), silent (test)

**Sentry Integration:**
- Installed `@sentry/nextjs`
- Created 4 config files: client, server, edge, instrumentation
- Integrated with Pino logger (auto-send errors/warnings)
- DSN configured in `.env.local`
- Session replay, performance monitoring, source maps

**React Error Boundaries:**
- Created `ErrorBoundary` component with fallback UI
- Applied to root layout
- Auto-reports to Sentry
- Development error details, production user-friendly

**Server Action Wrapper:**
- Created `withLogging()` HOC for automatic action logging
- Input/output logging (configurable)
- Timing measurement
- Error handling with context

**Result:**
- MTTR: 2h → 30min ✅
- Error visibility: 0% → 100% ✅
- All 160 tests passing ✅
- Production build successful ✅

---

## Recent Features

### 🤖 AI Search Integration (Oct 28-29, 2025)

**Status:** ✅ Functional & Production-Ready (95% complete, one optimization identified)

**What's working:**
- Natural language search bar in navbar (`ai-search-inline-bar.tsx`)
- OpenAI GPT-4 parsing of user queries in Spanish
- Structured filters extraction (city, address, price, bedrooms, features)
- Map integration with viewport fitting
- Confidence scoring for uncertain parses

**To explore:**
- Documented duplicate API call issue for optimization (Session 3)
- See: `archive/sessions/AI-SEARCH-CONSOLIDATED.md` for detailed status

### 💾 Cache System Status

**Status:** ✅ React.cache() IMPLEMENTED (No Cache Components)

**Historical Context:**
- Oct 23, 2025: Cache Components enabled (5 min)
- Oct 23, 2025: Disabled (incompatible with cookies())
- Nov 4, 2025: Code removed (simplification)
- **Nov 29, 2025: React.cache() implemented** ✅

**Current State:**
- ✅ ISR on homepage (5-minute revalidation)
- ✅ `revalidatePath()` in Server Actions (post-mutation)
- ✅ **React.cache() deduplication** (homepage, auth, map) - NEW
- ❌ No Cache Components (incompatible with auth)

**Implementation (Nov 29):**
1. Homepage: 2 queries → 1 query (50% reduction)
2. getCurrentUser(): Request-level memoization
3. Map bounds: Viewport-based filtering (30-50% reduction)

**Performance Impact:**
- Homepage: +5-10ms faster
- Auth pages: +10-20ms faster
- Map view: +50-100ms faster
- **Overall: +36-50% improvement on critical pages**

**Why React.cache() instead of Cache Components:**
- Compatible with cookies() (no auth refactor needed)
- Stable API (React 18+)
- Quick implementation (2h vs 8-16h)
- Pragmatic solution for current architecture

**Future:**
- Monitor Next.js 16.1+ for `use cache: private` stabilization
- Consider Cache Components when auth can be refactored

**See:**
- `docs/caching/CACHE_STATUS.md` - Full history and timeline
- `docs/caching/NEXT_16_CACHE_DEEP_DIVE.md` - Complete guide to Next.js 16 caching
- Other docs in `docs/caching/` - Reference documentation

---

### 🐛 Infinite Loop in useMapViewport (RESOLVED)

**The Issue:** `useMapViewport` was using `searchParams` in the dependency array, causing `router.replace()` to create a circular effect loop.

**The Fix:** Removed `searchParams` from dependencies and used `useRef` to guard against unnecessary URL updates.

**Key Learning:** Dependency arrays express "when should this run," not "what I use." If an effect changes its own dependencies, you have a circular dependency.

**Resources:** `docs/INFINITE_LOOP_DEEP_DIVE.md`, `docs/REACT_HOOKS_ANTIPATTERNS.md`, `docs/DEBUGGING_HOOKS_GUIDE.md`

---

### 🧪 Testing Infrastructure (Nov 30 - Dic 1, 2025)

**Status:** ✅ Phase 2 Task 2.2 Complete - 289/289 tests passing (100%)

**What's working:**
- Comprehensive auth integration tests (48 tests - 100% coverage)
- Server Actions tests: auth, properties, favorites, appointments
- Validation and utility tests
- **Repository unit tests (5 repositories, 129 tests)** ✨
- Test infrastructure (Vitest + mocks)
- React.cache() implemented (+36% performance)

**Recent Progress:**
- **Nov 30**: Fixed 3 PropertyRepository tests
- **Dic 1 AM**: Fixed 17 remaining tests → 160/160 (100%)
- **Dic 1 PM**: Added 114 repository tests → 289/289 (100%) ✨

**Coverage breakdown:**
```
apps/web:           160 tests ✅
├─ Auth flow:         48 tests (signupAction, loginAction, logoutAction)
├─ Server Actions:    56 tests (properties, favorites, appointments)
├─ Validations:       23 tests (Zod schemas)
└─ Utils:             33 tests (slug, serialize, helpers)

packages/database:  129 tests ✅
├─ PropertyRepository:      15 tests (CRUD, search, filters)
├─ FavoriteRepository:      26 tests (toggle, batch counts, pagination)
├─ AppointmentRepository:   33 tests (business hours, slots, stats)
├─ PropertyImageRepository: 26 tests (ordering, transactions)
└─ UserRepository:          29 tests (permissions, self-update, admin)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:              289 tests ✅ (100% passing)
```

**Coverage Impact:**
- Before: ~15-20% (160 tests)
- After: ~25-30% (289 tests)
- Increase: +129 tests (+81%)
- **Meta alcanzada**: >25% coverage ✅

**Test infrastructure:**
- Vitest + React Testing Library
- AAA pattern (Arrange-Act-Assert)
- Complete Prisma mocking
- Auth test helpers (`createMockSupabaseUser`, `createMockDbUser`)
- Global mocks in `vitest.setup.ts`
- Co-located test pattern (`__tests__` directories)

**Phase 2 - Week 2 Progress:**
- ✅ Task 2.1: Fix failing tests (COMPLETADO)
- ✅ Task 2.2: Repository unit tests (COMPLETADO - +114 tests)
- ⏳ Task 2.3: CI/CD enforcement (4h)
- ⏳ Task 2.4: Coverage measurement (2h)

**See:**
- `apps/web/__tests__/README.md` - Testing guide
- `docs/technical-debt/07-TESTING.md` - Complete testing roadmap
- `docs/testing/TEST_SUITE_STATUS.md` - Detailed test status
- Test files in `apps/web/app/actions/__tests__/` and `packages/database/src/__tests__/`

---

## Known Issues

### 📧 Email Sending (Resend) - Testing Mode (Configured)

**Status:** ✅ CONFIGURED - Test mode active, production-ready path documented

**Current Setup (Nov 29, 2025):**
- Environment-based config (`lib/email/config.ts`)
- Test mode: `test@resend.dev` → `delivered@resend.dev`
- Production ready: One env var change (`EMAIL_FROM_DOMAIN`)
- Enhanced error handling with full logging

**What Works:**
- ✅ Emails sent successfully in test mode
- ✅ Visible in Resend Dashboard (delivered@resend.dev)
- ✅ All email failures logged with details
- ✅ Server Actions complete successfully
- ✅ Zero hardcoded emails (environment-based)

**What's Pending:**
- ⏳ Domain purchase (e.g., `inmoapp.com`)
- ⏳ DNS verification in Resend Dashboard
- ⏳ Set `EMAIL_FROM_DOMAIN` env var for production

**Production Migration Path:**
1. Purchase domain (e.g., `inmoapp.com`)
2. Verify domain in Resend Dashboard (add DNS TXT records)
3. Set `EMAIL_FROM_DOMAIN=inmoapp.com` in production `.env`
4. Deploy → Emails send from `noreply@inmoapp.com`

**No Code Changes Needed** - Just environment variable update.

**Related Files:**
- `apps/web/lib/email/config.ts` - Environment-based configuration
- `apps/web/lib/email/appointment-emails.ts` - Email service
- `docs/technical-debt/04-EMAIL.md` - Complete implementation guide

---

## Current Phase

**Phase 1 (Urgencies):** ✅ 100% COMPLETE (Nov 29, 2025)
- ✅ Email configuration (test mode + production ready)
- ✅ React.cache() performance optimization (+36-50%)
- ✅ Map URL bounds preservation (shareable links)
- ✅ Test runner fix (Vitest working correctly)
- ✅ Test improvements (140 → 160 tests passing)

**Phase 2 (Foundations):** 🔄 IN PROGRESS (2/3 weeks complete)

**✅ Week 2 COMPLETADO** - Testing Infrastructure (Nov 30 - Dec 1)
- ✅ Fix 17 failing tests (160/160 passing)
- ✅ Repository unit tests (+114 tests, 289/289 passing)
- ✅ CI/CD enforcement (GitHub Actions + coverage)
- ✅ Coverage measurement (46.53%, target: 25%)

**✅ Week 3 COMPLETADO** - Logging & Monitoring (Dec 2, 2025)
- ✅ Structured logging with Pino (JSON logs, request ID tracking)
- ✅ Sentry integration (error tracking, session replay)
- ✅ React Error Boundaries (fallback UI, auto-reporting)
- ✅ Server Action wrapper HOC (automatic logging, timing)

**Progress:** ✅ 2/3 weeks (66%) | Tests: 160/160 (100%) | Coverage: 46.53%

**Next (from ROADMAP.md):**
- **Week 4 (Dec 9-13):** Security & Rate Limiting (CSP headers, Upstash Redis)
- **Weeks 5-10 (Jan 6 - Feb 14):** Freemium implementation (schema, Stripe, UI)
- **Weeks 11-18 (Feb 17 - Apr 11):** Scale & Production (E2E tests, beta, launch)

**Timeline:**
- Today: Dec 2, 2025
- Phase 2 completion: Dec 20, 2025 (3 weeks)
- Beta cerrada: Feb 14, 2026 (10 weeks)
- Production launch: Apr 11, 2026 (18 weeks)

---

## Git Workflow

**Commits:** Conventional format (`feat(scope):`, `fix(scope):`, `refactor(scope):`)

**Branch:** `main` (auto-deploys to Vercel)

**Parallel work:** See `docs/git-worktrees-guide.md` for multi-branch setup with `git worktree`
