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

**Status:** 📋 18-Week Plan Defined (Nov 23, 2025)

**Timeline**: Nov 2025 - Abr 2026 (4.5 meses)
**Inversión total**: $12,400-14,100
**ROI**: Payback en 11 meses

### Quick Overview

```
Week 1:    URGENCIAS (Email, Performance, Quick Wins)
Week 2-4:  FOUNDATIONS (Testing 25%, Logging, Security)
Week 5-10: FREEMIUM (Schema, Stripe, Beta 50 users)
Week 11-18: SCALE (E2E tests, Beta pública 500 MAU, Launch)
```

### Hitos Clave

| Fecha | Hito | Target |
|-------|------|--------|
| **Nov 29** | Email funcional + Performance +36% | ✅ Quick wins |
| **Dic 20** | Testing 25% + Logging + Security | ✅ Foundations |
| **Feb 14** | Freemium MVP + Beta cerrada | $25-50 MRR |
| **Mar 28** | Beta pública | 200-500 MAU |
| **Abr 11** | Production Launch | $700 MRR 🚀 |

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

**Status:** ❌ NOT IMPLEMENTED (No caching currently active)

**Historical Context:**
- Oct 23, 2025: Cache Components enabled for 5 minutes
- Oct 23, 2025: Disabled (incompatible with `cookies()` in auth)
- Nov 4, 2025: Code completely removed (simplification)

**Current State:**
- ✅ ISR on homepage (5-minute revalidation)
- ✅ `revalidatePath()` in Server Actions (post-mutation invalidation)
- ❌ No request-level deduplication (no `React.cache()`)
- ❌ No persistent cross-request caching

**Why Disabled:**
`use cache` + `cacheComponents` cannot coexist with `cookies()` which InmoApp uses for authentication. This was documented and decided pragmatically.

**Recommendation:**
- **TODAY:** Implement `React.cache()` for map deduplication (36% performance gain, 1-2 hours work)
- **TOMORROW:** Monitor Next.js 16.1+ for `use cache: private` stabilization
- **FUTURE:** Consider Cache Components migration when auth can be refactored

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

### 🧪 Testing Infrastructure (Nov 18, 2025)

**Status:** ✅ Auth Flow Complete - 113/129 tests passing (87.6%)

**What's working:**
- Comprehensive auth integration tests (48 tests - 100% coverage)
- Server Actions tests: `signupAction`, `loginAction`, `logoutAction`
- Auth helpers tests: `getCurrentUser`, `requireAuth`, `requireRole`, `checkPermission`, `requireOwnership`
- Properties and favorites server actions tests
- Validation and utility tests
- Test helpers and mocking infrastructure

**Coverage breakdown:**
- Auth flow: 48/48 tests (100%) ✨
- Server Actions: 22 auth + 34 properties/favorites
- Validations: 23 tests
- Utils: 14 tests
- Overall: 113/129 tests (87.6%)

**Test infrastructure:**
- Vitest + React Testing Library
- Auth test helpers (`createMockSupabaseUser`, `createMockDbUser`, `createSignupFormData`)
- Global mocks in `vitest.setup.ts`
- Co-located test pattern (`__tests__` directories)

**Next steps:**
- CI/CD pipeline setup (GitHub Actions)
- E2E tests with Playwright
- Repository layer tests

**See:**
- `apps/web/__tests__/README.md` - Testing guide
- `docs/technical-debt/07-TESTING.md` - Complete testing roadmap
- Test files in `apps/web/app/actions/__tests__/` and `apps/web/lib/__tests__/`

---

## Known Issues

### 📧 Email Sending (Resend) - Development Mode

**Status:** ⚠️ TESTING MODE - Emails NOT delivered to real users

**Current Setup:**
- Using `test@resend.dev` as sender (testing-only domain)
- Enhanced error handling implemented (logs all Resend API responses)
- Appointments/confirmations still create successfully even if emails fail

**What Works:**
- ✅ Server Actions complete successfully
- ✅ All email failures are logged with details
- ✅ Warnings included in action responses if email fails
- ✅ No silent failures

**What Doesn't Work:**
- ❌ Emails to real addresses (Gmail, Outlook, etc.) are NOT delivered
- ❌ Users don't receive appointment confirmations/cancellations

**Testing Emails in Development:**

Option 1: Use Resend test addresses (recommended)
```typescript
// In appointment-emails.ts, temporarily change:
from: "test@resend.dev",
to: "delivered@resend.dev"  // ← Use this for testing
```

Option 2: Check logs for Resend API responses
```bash
# When creating an appointment, check terminal for:
[sendAppointmentCreatedEmail] Resend API results: { ... }
# This shows exactly what Resend returned
```

**Production Solution (when ready):**
1. Purchase/configure a domain (e.g., `inmoapp.com`)
2. Verify domain in Resend Dashboard (add DNS records)
3. Update code: `from: "noreply@inmoapp.com"`
4. See: `docs/technical-debt/04-EMAIL.md` for complete guide

**Related Files:**
- `apps/web/lib/email/appointment-emails.ts` - Email service (with enhanced logging)
- `apps/web/app/actions/appointments.ts` - Server Actions (checks email results)
- `docs/technical-debt/04-EMAIL.md` - Complete implementation guide
- `docs/features/EMAIL_SENDING_TODO.md` - Original analysis

---

## Current Phase

**Phase 1.5:** Public-facing features - 98% complete
- ✅ Map integration with clustering
- ✅ AI search (natural language)
- ✅ Authentication (Supabase + roles)
- ✅ **Testing infrastructure (auth flow 100% covered)**

**Phase 2:** Quality & Infrastructure - In Progress
- ✅ Auth flow integration tests (48 tests - 100%)
- 🔄 Documentation reorganization (ongoing)
- ⏳ CI/CD pipeline setup (next)
- ⏳ E2E tests with Playwright

**Next:**
- Phase 3: CI/CD automation + E2E testing
- Phase 4: AI Search optimization (duplicate API call fix)
- Phase 5: Advanced features (image upload, appointments refinement)

---

## Git Workflow

**Commits:** Conventional format (`feat(scope):`, `fix(scope):`, `refactor(scope):`)

**Branch:** `main` (auto-deploys to Vercel)

**Parallel work:** See `docs/git-worktrees-guide.md` for multi-branch setup with `git worktree`
