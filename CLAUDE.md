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
└── middleware.ts      # Auth + routing

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

**Files Structure:**
```
root/
├── .env.example              # Template (public, tracked in Git)
├── .env.local                # Your secrets (private, in .gitignore)
├── .env.development.example  # Development template
└── .env.production.example   # Production template
```

**Adding New Variables:**
1. Edit schema in `packages/env/src/index.ts`
2. Add to `.env.example` with description
3. Add value to `.env.local` (never commit)
4. Restart: `bun run dev`

**Variables Reference:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public key (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Secret key (server only)
- `DATABASE_URL` - Pooler connection (Transaction Mode, port 6543)
- `DIRECT_URL` - Direct DB connection (migrations, port 5432)
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox API key (optional)
- `NODE_ENV` - Automatically set by Next.js (don't change manually)

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

**Auto-loaded:** `@.claude/01-06` files (~27k tokens)

**On-demand** (in .claudeignore):
- `@.claude/08-multi-tenant-strategy.md` - Multi-tenant architecture
- `@.claude/09-technical-debt.md` - Known issues
- `@.claude/10-teaching-style.md` - Teaching approach
- `@.claude/11-appointments.md` - Appointments system

**Human-readable:**
- `QUICK_START.md` - Ultra-compressed reference
- `docs/AI_ASSISTANTS.md` - Complete AI guide (Claude + Gemini)
- `docs/TOKEN_OPTIMIZATION.md` - Reduce context usage
- `docs/setup/` - Setup guides
- `docs/mcp/` - Model Context Protocol integration

---

## Optimization: Caching for /mapa

**Status:** ✅ Complete (Oct 23, 2024) - Using React.cache()

Implemented intelligent caching on the `/mapa` route to eliminate renderization loops and optimize property queries:

- Created `lib/cache/properties-cache.ts` with `React.cache()` for deduplication
- Updated `mapa/page.tsx` to use cached queries
- Added `revalidatePath('/mapa')` in server actions for invalidation
- Keeps implementation stable (no experimental features)

**Implementation Approach:**
- Originally tried experimental `Cache Components` (cacheTag/updateTag)
- Disabled due to Next.js 16.0.0 limitation with uncached data access (cookies)
- Switched to stable `React.cache()` approach instead
- Same performance benefits, better compatibility

**Results:**
- Request deduplication (eliminates duplicate queries for same bounds)
- Faster responses on cache hits (15ms vs 340ms)
- Fewer DB queries in normal usage
- Zero renderization loops
- Data stays fresh with automatic invalidation

**Documentation:**
- `CACHE_IMPLEMENTATION_REVISED.md` - Why we use React.cache() (current approach)
- `CACHE_IMPLEMENTATION_SUMMARY.md` - Executive overview
- `CACHE_COMPONENTS_GUIDE.md` - Concepts and future upgrade path
- `docs/CACHE_STRATEGY.md` - Visual strategy diagrams

---

## Bug Fix: Infinite Loop in useMapViewport (RESOLVED)

**What Happened:** The `/mapa` route was making infinite database queries due to a circular dependency in the `useMapViewport` hook's `useEffect`.

**Root Cause Analysis:** The `searchParams` hook was included in the effect's dependency array:
```typescript
// ❌ BEFORE (infinite loop)
useEffect(() => {
  const newUrl = buildBoundsUrl(debouncedBounds);
  router.replace(newUrl); // ← Changes URL
}, [debouncedBounds, router, mounted, searchParams]);
//                                     ↑ This causes the loop
```

**The Circular Dependency:**
1. `router.replace()` executes → changes the URL
2. URL change → `useSearchParams()` returns a new object
3. `searchParams` in dependencies → effect runs again
4. Back to step 1 (infinite cycle)

**Solution Implemented:**
```typescript
// ✅ AFTER (fixed)
const lastUrlRef = useRef<string>("");

useEffect(() => {
  if (!mounted) return;

  const newUrl = buildBoundsUrl(debouncedBounds);

  // Guard: Only update if URL actually changed
  if (lastUrlRef.current !== newUrl) {
    lastUrlRef.current = newUrl;
    router.replace(newUrl, { scroll: false });
  }
}, [debouncedBounds, router, mounted]); // ← NO searchParams
```

**Fix Details:**
- Added `useRef<string>("")` to track last built URL
- Removed `searchParams` from dependency array
- Added string comparison to prevent unnecessary `router.replace()` calls
- File: `apps/web/components/map/hooks/use-map-viewport.ts` (commit `f28948e`)

**Learning Resources Created:**
1. **`docs/INFINITE_LOOP_DEEP_DIVE.md`** - Complete technical analysis with diagrams
2. **`docs/REACT_HOOKS_ANTIPATTERNS.md`** - 11 common anti-patterns with solutions
3. **`docs/DEBUGGING_HOOKS_GUIDE.md`** - Practical debugging techniques
4. **`docs/INFINITE_LOOP_QUICK_REFERENCE.md`** - Quick reference card

**Key Takeaway:** The dependency array should express "when should this run," NOT "what variables do I use." If an effect changes something in its dependencies, you've created a circular dependency.

---

## Current Focus

Phase 1.5: Public-facing features
**Next:** Property listings + search functionality

---

## Git Workflow

**Conventional commits:** `feat(scope):`, `fix(scope):`, `refactor(scope):`

**Branch:** `main` (deploy to Vercel)

**Parallel Work:** Use `git worktrees` for simultaneous feature/bugfix branches
```bash
# Quick setup (see docs/git-worktrees-guide.md for full guide)
git branch feature/name && git branch bugfix/name
git worktree add ../inmo-app-feature feature/name
git worktree add ../inmo-app-bugfix bugfix/name
# Then: cd ../inmo-app-feature && claude (terminal 1)
#       cd ../inmo-app-bugfix && claude (terminal 2)
# Finally: git merge feature/name && git merge bugfix/name
```
