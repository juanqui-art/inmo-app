# Claude Code Guide

**Quick Start**: See `QUICK_START.md` for ultra-compressed reference (<1k tokens)

## Project
Real estate platform | Next.js 15 + Supabase + Turborepo | Phase 1.5

## Documentation

**Auto-loaded:** @.claude/01-06 files (~27k tokens)
**On-demand** (in .claudeignore): Multi-tenant, Technical Debt, Teaching Style, Appointments
**Load with**: `@.claude/filename.md`

---

## Critical Rules

1. Run `bun run type-check` before commits
2. Add new packages to `transpilePackages` in `next.config.ts` + restart server
3. All DB ops in `repositories/` | Server Actions validate auth | Forms use Zod

**Data Flow:** Component → Server Action → Repository → Prisma → DB
**Files:** `actions/` | `repositories/` | `validations/` | `components/`

## Current Focus

Phase 1.5: Public-facing features | Next: Property listings + search

---

## Commands

```bash
bun run dev          # Start
bun run type-check   # Verify TS
cd packages/database && bunx prisma studio  # DB browser
```

## Troubleshooting

**Prisma client not found:** `cd packages/database && bunx prisma generate`
**Package not found:** Check `transpilePackages` in `next.config.ts` + restart server
**Changes not reflected:** `rm -rf apps/web/.next && bun run dev`

## Notes

Supabase: US East (aws-1-us-east-2) | Auth: Middleware `getUser()` | Protected: `/dashboard` | Git: Conventional commits
