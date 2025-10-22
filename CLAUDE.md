# InmoApp - Claude Context

> Auto-loaded context for Claude Code. For detailed docs see `docs/AI_ASSISTANTS.md`

---

## Project Overview

**Real estate platform** | Phase 1.5: Public-facing features | Next.js 15 + Supabase + Turborepo

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind v4 + GSAP | Supabase Auth + Storage | Prisma + PostgreSQL | Turborepo monorepo | Bun

---

## Quick Start

```bash
bun run dev          # Start development
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
```

**Package not found:**
1. Check `transpilePackages` in `next.config.ts`
2. Restart dev server

**Changes not reflected:**
```bash
rm -rf apps/web/.next && bun run dev
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
