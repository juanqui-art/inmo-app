# ⚡ Quick Reference Card

> Ultra-compact reference for common tasks and patterns.
> For detailed info, see main documentation files.

---

## 📦 Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage) + Prisma ORM
- **Monorepo**: Turborepo + Bun workspaces
- **Language**: TypeScript (strict mode)

---

## 🏗️ Architecture Pattern

### Data Flow
```
Component → Server Action → Repository → Prisma → Database
```

### File Organization
```
Server Actions    → apps/web/app/actions/
Repositories      → packages/database/src/repositories/
Validation        → apps/web/lib/validations/
UI Components     → packages/ui/src/ (generic)
                    apps/web/components/ (feature-specific)
```

---

## 🚨 Critical Rules

1. **TodoWrite** for tasks with 3+ steps
2. **Repository Pattern**: ALL DB operations in `packages/database/src/repositories/`
3. **Zod validation**: ALL forms and Server Actions
4. **Type-check before commit**: `bun run type-check`
5. **Restart dev server** after changing `next.config.ts`
6. **Add new packages** to `transpilePackages` immediately

---

## 🛠️ Common Commands

### Development
```bash
bun run dev                              # Start dev server
bun run type-check                       # TypeScript validation
bun run lint                             # Lint code
bun run format                           # Format code
```

### Database
```bash
cd packages/database && bunx prisma studio    # Visual DB browser
cd packages/database && bunx prisma generate  # Regenerate Prisma client
cd packages/database && bunx prisma db push   # Quick schema sync (dev)
```

### Git
```bash
git commit -m "feat(scope): add feature"     # New feature
git commit -m "fix(scope): resolve bug"      # Bug fix
git commit -m "refactor(scope): improve"     # Refactor
```

---

## 📊 Database Models (5 Core)

### Property
- **Fields**: title, price, transactionType, category, status, bedrooms, bathrooms, area, address
- **Relations**: belongsTo User (agent), hasMany PropertyImage, hasMany Favorite, hasMany Appointment

### User
- **Fields**: id, email, name, role (CLIENT/AGENT/ADMIN)
- **Relations**: hasMany Property, hasMany Favorite, hasMany Appointment

### PropertyImage
- **Fields**: url, alt, order, propertyId
- **Relations**: belongsTo Property (cascade delete)

### Favorite
- **Fields**: userId, propertyId
- **Constraint**: Unique (userId, propertyId)

### Appointment
- **Fields**: userId, propertyId, agentId, scheduledAt, status, notes
- **Relations**: belongsTo User, belongsTo Property, belongsTo Agent

---

## 🔐 Security Layers (Defense in Depth)

1. **RLS Policies** (Database) - Row Level Security filters data by ownership
2. **Server Actions** (Application) - Verify auth + role + ownership
3. **Repositories** (Business Logic) - Permission checks before DB operations
4. **Middleware** (Routing) - Protect routes, redirect unauthenticated users

---

## 🎯 Current Focus

**Phase**: 1.5 - Intermediate Development

**Status**:
- ✅ Auth (email + Google OAuth)
- ✅ CRUD properties (AGENT)
- ⏳ Public property listings (homepage, search, detail)
- ⏳ Favorites system (CLIENT)
- ⏳ Appointments system (CLIENT + AGENT)

**Next Priority**: Public property listings OR Multi-tenant infrastructure

---

## 🚑 Common Troubleshooting

### Prisma client not found
```bash
cd packages/database && bunx prisma generate
```

### Package not found
```bash
# Check next.config.ts → transpilePackages includes '@repo/your-package'
# Then restart dev server
```

### Changes not reflected
```bash
rm -rf apps/web/.next && bun run dev
```

### Type errors
```bash
bun run type-check  # See all errors
```

---

## 📝 Supabase Config

- **Region**: US East (aws-1-us-east-2)
- **Project**: pexsmszavuffgdamwrlj
- **Connection**: Pooler (transaction + session mode)
- **Auth**: `supabase.auth.getUser()` in middleware

---

## 📚 Need More Detail?

- **Overview**: @.claude/01-overview.md
- **Current Status**: @.claude/02-current-status.md
- **Architecture**: @.claude/03-architecture.md
- **Database**: @.claude/04-database.md
- **Development**: @.claude/05-development.md
- **Roadmap**: @.claude/06-next-steps.md

**Heavy docs** (in `.claudeignore`):
- **Multi-Tenant**: @.claude/08-multi-tenant-strategy.md
- **Technical Debt**: @.claude/07-technical-debt.md
- **Teaching Style**: @.claude/09-teaching-style.md
