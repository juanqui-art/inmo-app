# Quick Start Reference

> Ultra-compressed guide for Claude Code (~1k tokens)

## Stack
**Monorepo:** Bun Workspaces | **Frontend:** Next.js 16 + React 19 + TS + Tailwind v4 + GSAP | **Backend:** Supabase + Prisma | **Deploy:** Vercel

## Commands
```bash
bun run dev          # Start dev server
bun run type-check   # TypeScript validation
bun run lint         # Code quality
cd packages/database && bunx prisma studio  # Visual DB browser
```

## File Structure
```
apps/web/
├── app/actions/        # Server Actions (mutations)
├── components/         # React components
├── lib/               # Utils, validations, clients
└── proxy.ts          # Auth + routing (Next.js 16)

packages/
├── database/          # Prisma + repositories
├── ui/               # Shared UI components
└── typescript-config/ # TS configs
```

## Core Patterns

**Data Flow:**
```
Component → Server Action → Repository → Prisma → Database
```

**Auth:**
```
Middleware → getUser() → Role check → Repository
```

**Validation:**
- All forms: Zod schemas (`lib/validations/`)
- All Server Actions: Auth + permission checks
- All repositories: Ownership verification

## Database
5 models: `User`, `Property`, `PropertyImage`, `Favorite`, `Appointment`

**Connection:**
- Pooler: `DATABASE_URL` (serverless)
- Direct: `DIRECT_URL` (migrations)
- Region: US East (aws-1-us-east-2)

## User Roles
- `CLIENT`: Browse + favorites + appointments
- `AGENT`: Create properties + manage listings
- `ADMIN`: Full access (future)

## Critical Rules
1. ✅ Run `bun run type-check` before commits
2. ✅ Add new packages to `transpilePackages` in `next.config.ts`
3. ✅ Restart dev server after config changes
4. ✅ All DB operations in `repositories/`
5. ✅ Server Actions validate auth/permissions
6. ✅ Forms use Zod validation

## Quick Fixes

**Prisma client not found:**
```bash
cd packages/database && bunx prisma generate
```

**Package not found:**
- Check `transpilePackages` in `next.config.ts`
- Restart dev server

**Type errors:**
```bash
bun run type-check
```

## Git
Conventional commits: `feat(scope):`, `fix(scope):`, `refactor(scope):`

## Need More?
- Architecture: `@.claude/03-architecture.md`
- Database: `@.claude/04-database.md`
- Development: `@.claude/05-development.md`
- Multi-tenant: `@.claude/08-multi-tenant-strategy.md` (load on demand)
