# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 📚 Quick Reference

- **Project**: Real estate platform (Next.js 15 + Supabase + Turborepo)
- **Current Phase**: Phase 1.5 - Intermediate Development
- **Next Priority**: Public Property Listings (homepage + search)
- **Region**: US East (aws-1-us-east-2)

---

## 📖 Complete Documentation

For detailed information, see:

- **Project Overview & Tech Stack**: @.claude/01-overview.md
- **Current Implementation Status**: @.claude/02-current-status.md
- **Architecture & Monorepo Setup**: @.claude/03-architecture.md
- **Database Schema & Models**: @.claude/04-database.md
- **Development Commands & Workflows**: @.claude/05-development.md
- **Next Steps & Roadmap**: @.claude/06-next-steps.md
- **Technical Debt & Robustness**: @.claude/07-technical-debt.md

---

## 🚨 Critical Rules

### Always Follow

1. **Use TodoWrite** for complex tasks (3+ steps)
2. **Never push without type-check**: `bun run type-check`
3. **Add new packages** to `transpilePackages` in `next.config.ts`
4. **Restart dev server** after changing `next.config.ts`
5. **Repository Pattern**: All DB operations in `packages/database/src/repositories/`
6. **Server Actions**: Always validate auth + permissions
7. **Zod validation**: All forms and Server Actions must use Zod schemas

### Architecture Patterns (Enforced)

**Data Flow:**
```
Component → Server Action → Repository → Prisma → Database
```

**File Organization:**
```
Server Actions    → apps/web/app/actions/
Repositories      → packages/database/src/repositories/
Validation        → apps/web/lib/validations/
Components (UI)   → packages/ui/src/components/ (generic)
                    apps/web/components/ (feature-specific)
```

**Permission Checks:**
- **Middleware**: Route protection (redirect unauthenticated users)
- **Server Actions**: Verify user authentication + role
- **Repositories**: Verify ownership (user can only edit own resources)
- **Database RLS**: Row Level Security policies (defense in depth)

---

## 🎯 Current Focus (Phase 1.5)

**You are here**: Building public-facing features with established architecture patterns

### Status
- ✅ Backend CRUD operations functional
- ✅ AGENT dashboard working
- ⏳ **Public-facing features pending** (homepage, listings, search)
- ⏳ CLIENT features pending (favorites, appointments)

### Next Features (Priority Order)
1. **Public Property Listings** (High Priority)
   - Homepage with featured properties
   - Property listing page with search
   - Property detail page
   - Map integration (Mapbox)

2. **Favorites System** (Medium Priority)
   - Toggle favorite button
   - Favorites dashboard (CLIENT)

3. **Appointments System** (Medium Priority)
   - Schedule property viewings
   - Agent appointment management

### Established Patterns
- ✅ Repository → Server Actions → Components
- ✅ Zod validation in all forms
- ✅ RLS policies in Supabase
- ✅ Feature-based folder structure
- ✅ TypeScript strict mode
- ✅ Conventional commits

---

## 🛠️ Quick Commands

### Development
```bash
bun run dev          # Start dev server
bun run type-check   # TypeScript validation
bun run lint         # Code quality check
bun run format       # Auto-format code
```

### Database
```bash
cd packages/database && bunx prisma studio    # Visual DB browser
cd packages/database && bunx prisma generate  # Regenerate Prisma client
cd packages/database && bunx prisma db push   # Quick schema sync (dev)
```

### Git (Conventional Commits)
```bash
git commit -m "feat(scope): add new feature"
git commit -m "fix(scope): resolve bug"
git commit -m "refactor(scope): improve code"
git commit -m "docs: update documentation"
```

---

## 📊 Quality Checklist (Before Each Commit)

- [ ] TypeScript has no errors (`bun run type-check`)
- [ ] Code is formatted (`bun run format`)
- [ ] Feature works in browser for all affected roles
- [ ] No `console.log` left behind
- [ ] Repository methods have permission checks
- [ ] Server Actions validate user authentication/authorization
- [ ] Forms use Zod validation schemas

---

## 🎓 Key Learnings

### Monorepo + Prisma (CRITICAL)

**Prisma Client Setup:**
- ✅ Generated in **root** `node_modules/.prisma/client`
- ✅ Output path: `../../../node_modules/.prisma/client`
- ✅ Postinstall hook auto-generates: `cd packages/database && bun run db:generate`

**Next.js Transpilation:**
- ✅ Internal packages export TypeScript directly
- ✅ Must add to `transpilePackages` in `next.config.ts`
- ⚠️ **MUST restart dev server** after config changes

**Troubleshooting:**
```bash
# Prisma client not found
cd packages/database && bunx prisma generate

# Package not found
# Check transpilePackages in next.config.ts

# Changes not reflected
rm -rf apps/web/.next && bun run dev
```

### Common Gotchas

1. ✅ **DO**: Add new packages to `transpilePackages` immediately
2. ✅ **DO**: Restart dev server after `next.config.ts` changes
3. ✅ **DO**: Run `bunx prisma generate` after schema changes
4. ❌ **DON'T**: Import from `packages/` directly (use `@repo/*`)
5. ❌ **DON'T**: Mix Prisma output paths (always use root)

---

## 🚀 When You Need Help

- **Monorepo issues**: See @.claude/03-architecture.md
- **Database schema**: See @.claude/04-database.md
- **Development workflow**: See @.claude/05-development.md
- **Next features**: See @.claude/06-next-steps.md
- **Technical debt**: See @.claude/07-technical-debt.md

---

## 📝 Important Notes

- **Supabase Region**: US East (aws-1-us-east-2)
- **Supabase Project**: pexsmszavuffgdamwrlj
- **Database**: Pooler connection (transaction + session mode)
- **Auth**: Middleware checks via `supabase.auth.getUser()`
- **Protected Routes**: `/dashboard` requires authentication
- **Public Routes**: `/`, `/login`, `/signup`
- **Git Strategy**: Main branch, conventional commits
