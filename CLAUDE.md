# InmoApp - Claude Context

> Auto-loaded context for Claude Code. For detailed docs see `docs/AI_ASSISTANTS.md`

---

## Project Overview

**Real estate platform** | Phase 1.5: Public-facing features | Next.js 16 + Supabase + Turborepo

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind v4 + GSAP | Supabase Auth + Storage | Prisma + PostgreSQL | Turborepo monorepo | Bun

---

## Quick Start

```bash
bun run dev          # Start development (Turborepo orchestrates, Turbopack compiles)
bun run dev:web      # Direct: Skip Turborepo (alternative)
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
8. **Turborepo orchestrates:** `turbo.json` defines task dependencies (Prisma generation before dev/build)

## Build Tools Explained

**Three distinct tools** work together in your stack:
- **Turborepo** (`turbo.json`): Monorepo task orchestrator - schedules and caches tasks
- **Turbopack** (built in Next.js 16): Fast bundler - compiles TS/JSX → JS (default since Next.js 16)
- **Bun** (`bun run`): Runtime + package manager - executes commands with Turborepo

**Development Flow:**
```
bun run dev
  ↓ (runs root script)
turbo run dev
  ↓ (Turborepo reads turbo.json)
  ├─ @repo/database#db:generate (Prisma)
  └─ next dev (in apps/web)
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

**⚠️ CRITICAL:** Turborepo monorepo has TWO `.env.local` files:
- `root/.env.local` (build tools, Turborepo)
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
# Or use Turborepo:
turbo run @repo/database#db:generate
```

**Package not found:**
1. Check `transpilePackages` in `next.config.ts`
2. Restart dev server

**Changes not reflected:**
```bash
rm -rf apps/web/.next && bun run dev
```

**Turbo cache issues:**
```bash
# Clear Turborepo cache if builds are stale
rm -rf .turbo
bun run build  # Rebuilds everything
```

**Bypass Turborepo (direct dev):**
```bash
# If you need to skip Turborepo orchestration
bun run dev:web  # Goes directly to apps/web
```

---

## Documentation

**For AI Assistants:**
- **Auto-loaded:** `.claude/01-06` files (~27k tokens, auto-included)
- **On-demand:** `.claude/08-11` files in `.claudeignore` (multi-tenant, debt, teaching, appointments)
- **Guide:** `docs/AI_ASSISTANTS.md` (how Claude/Gemini interact with project)

**For Humans:**
- `QUICK_START.md`, `docs/INDEX.md` (navigation hub), `docs/setup/` (installation)

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

### 💾 Map Caching (/mapa)

**Status:** ✅ Complete - Using `React.cache()` for request deduplication
- Eliminates duplicate queries for same viewport bounds
- Cache hits: 15ms vs 340ms uncached
- Zero renderization loops with smart URL handling
- See: `docs/CACHE_STRATEGY.md` for strategy details

---

### 🐛 Infinite Loop in useMapViewport (RESOLVED)

**The Issue:** `useMapViewport` was using `searchParams` in the dependency array, causing `router.replace()` to create a circular effect loop.

**The Fix:** Removed `searchParams` from dependencies and used `useRef` to guard against unnecessary URL updates.

**Key Learning:** Dependency arrays express "when should this run," not "what I use." If an effect changes its own dependencies, you have a circular dependency.

**Resources:** `docs/INFINITE_LOOP_DEEP_DIVE.md`, `docs/REACT_HOOKS_ANTIPATTERNS.md`, `docs/DEBUGGING_HOOKS_GUIDE.md`

---

## Known Issues

**Email Sending (Resend):** Using testing domain (`test@resend.dev`), emails not delivered to real addresses. Need to verify domain + update sender. See `CLAUDE.md` line notes or contact for setup guidance.

---

## Current Phase

**Phase 1.5:** Public-facing features (map, AI search, authentication) - 95% complete

**Next:**
- Phase 2: Documentation reorganization (in progress)
- Phase 3: AI Search optimization (duplicate API call fix)
- Phase 4: Advanced features (image upload, appointments refinement)

---

## Git Workflow

**Commits:** Conventional format (`feat(scope):`, `fix(scope):`, `refactor(scope):`)

**Branch:** `main` (auto-deploys to Vercel)

**Parallel work:** See `docs/git-worktrees-guide.md` for multi-branch setup with `git worktree`
