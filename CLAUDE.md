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

---

## Database

**Models:** `User`, `Property`, `PropertyImage`, `Favorite`, `Appointment`

**Roles:**
- `CLIENT`: Browse + favorites + appointments
- `AGENT`: Create properties + manage listings
- `ADMIN`: Full access (future)

**Connection:**
- Pooler: `DATABASE_URL` (serverless)
- Direct: `DIRECT_URL` (migrations)
- Region: US East (aws-1-us-east-2)

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
