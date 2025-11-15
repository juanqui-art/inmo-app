# Development Setup - InmoApp

> Step-by-step guide to get started with development using Turborepo, Turbopack, and Bun

---

## Prerequisites

- **Node.js** 18+ (Bun is the preferred runtime)
- **Bun** 1.2+ ([Install here](https://bun.sh))
- **Git** for version control

**Verify installation:**
```bash
bun --version     # Should be >= 1.2.23
git --version     # Any recent version
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <your-repo-url> inmo-app
cd inmo-app
```

### 2. Install Dependencies

```bash
bun install
# This will:
# - Install all dependencies
# - Run postinstall hook
# - Generate Prisma client automatically
```

### 3. Environment Configuration

Copy environment templates:
```bash
cp .env.example .env.local
cp .env.development.example .env.development.local
```

**Fill in your secrets in `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
DATABASE_URL=your-database-connection-string
DIRECT_URL=your-direct-connection-string
NEXT_PUBLIC_MAPBOX_TOKEN=optional
```

**⚠️ Never commit `.env.local`** (already in `.gitignore`)

---

## Development Commands

### Starting Development Server

#### Option 1: Full Turborepo Orchestration (Recommended)

```bash
bun run dev
```

**What it does:**
1. Reads `turbo.json` configuration
2. Executes `@repo/database#db:generate` (Prisma)
3. Starts Next.js dev server
4. Opens http://localhost:3000

**Best for:** Normal development workflow

**Why use it:**
- ✅ Prisma always up-to-date
- ✅ Automatic task orchestration
- ✅ Proper dependency management
- ✅ Matches CI/CD behavior

---

#### Option 2: Direct Mode (Skip Turborepo)

```bash
bun run dev:web
```

**What it does:**
- Skips Turborepo entirely
- Goes directly to Next.js
- Assumes Prisma is already generated

**Best for:**
- Emergency situations
- Quick iterations (if no schema changes)

**When NOT to use:**
- ❌ After cloning repository
- ❌ After schema.prisma changes
- ❌ If you see "PrismaClient not found" errors

---

### Type Checking

**Before every commit:**
```bash
bun run type-check
```

**What it does:**
1. Generates Prisma client (if needed)
2. Runs TypeScript compiler
3. Reports type errors

**If you get errors:**
```bash
# Option 1: Fix them manually
# Edit the offending files

# Option 2: Use ESLint auto-fix
bun run format
bun run type-check  # Re-run to verify
```

---

### Linting & Formatting

**Check for linting errors:**
```bash
bun run lint
# Uses Biome (fast linter)
```

**Auto-fix formatting:**
```bash
bun run format
# Auto-fixes:
# - Indentation
# - Quotes
# - Trailing commas
# - Import ordering
```

**Before committing:**
```bash
bun run format
bun run lint
bun run type-check
```

---

### Database Interaction

**View database in browser:**
```bash
cd packages/database
bunx prisma studio
# Opens: http://localhost:5555
```

**Create migrations:**
```bash
cd packages/database
bunx prisma migrate dev --name your_migration_name
# Creates migration in prisma/migrations/
# Applies it to database
# Regenerates Prisma client
```

**Generate Prisma client (manual):**
```bash
turbo run @repo/database#db:generate
# Or directly:
cd packages/database && bunx prisma generate
```

**Sync schema with database:**
```bash
cd packages/database
bunx prisma db push
# For quick schema changes without migrations
```

---

## Project Navigation

### Key Directories

```
apps/web/
├── app/
│   ├── actions/          ← Server Actions (mutations)
│   ├── (auth)/           ← Protected routes
│   ├── layout.tsx        ← Root layout
│   └── page.tsx          ← Homepage
├── components/
│   ├── ui/               ← Shared UI (from @repo/ui)
│   ├── features/         ← Feature-specific components
│   └── ...
├── lib/
│   ├── auth.ts           ← Auth utilities
│   ├── db.ts             ← Database helpers
│   └── validations/      ← Zod schemas
└── proxy.ts              ← Next.js proxy

packages/database/
├── prisma/
│   └── schema.prisma     ← Database schema
├── src/
│   └── repositories/     ← Database queries
└── package.json

packages/ui/
├── src/
│   ├── components/       ← Reusable components
│   ├── hooks/           ← Custom hooks
│   └── index.ts         ← Exports
└── package.json

packages/env/
├── src/
│   └── index.ts         ← Environment validation
└── package.json
```

### Opening Files

```bash
# Quick file navigation
code apps/web/app/page.tsx        # Open homepage
code packages/database/prisma/schema.prisma  # Database schema
code packages/ui/src/components/  # Shared components

# View all dependencies
code turbo.json                    # Turborepo config
code apps/web/next.config.ts      # Next.js config
code package.json                 # Root scripts
```

---

## Common Development Tasks

### Adding a New Page

```bash
# 1. Create page file
touch apps/web/app/listings/page.tsx

# 2. Edit the file (Server Component by default)
# apps/web/app/listings/page.tsx
export default function ListingsPage() {
  return <div>Listings</div>
}

# 3. Dev server hot-reloads automatically
# Navigate to http://localhost:3000/listings
```

### Adding a New Database Model

```bash
# 1. Edit schema
code packages/database/prisma/schema.prisma

# 2. Add your model
model Review {
  id        String   @id @default(cuid())
  content   String
  rating    Int
  property  Property @relation(fields: [propertyId], references: [id])
  propertyId String
  createdAt DateTime @default(now())
}

# 3. Create migration
cd packages/database
bunx prisma migrate dev --name add_reviews

# 4. Regenerate Prisma client
# (Done automatically by migration command)

# 5. Import in your code
import { prisma } from '@repo/database'

# 6. Use in server action or API route
const reviews = await prisma.review.findMany()
```

### Creating a Shared Component

```bash
# 1. Create component in @repo/ui
touch packages/ui/src/components/ProductCard.tsx

# 2. Export from index
# packages/ui/src/index.ts
export { ProductCard } from './components/ProductCard'

# 3. Use in apps/web
import { ProductCard } from '@repo/ui'

export default function Page() {
  return <ProductCard />
}

# 4. Dev server hot-reloads automatically
# (Because transpilePackages is configured)
```

### Adding Environment Variable

```bash
# 1. Define in schema
# packages/env/src/index.ts
export const env = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  MY_NEW_VAR: z.string(),
  // ... rest of vars
})

# 2. Add to .env.example
# .env.example
MY_NEW_VAR=example_value

# 3. Add to .env.local
# .env.local
MY_NEW_VAR=actual_value

# 4. Restart dev server
# Kill: Ctrl+C
# Restart: bun run dev

# 5. Use in code
import { env } from '@repo/env'
console.log(env.MY_NEW_VAR)
```

---

## Running Tests

### Unit Tests

```bash
# Run tests once
bun run test:run

# Watch mode (re-run on changes)
bun run test

# UI dashboard
bun run test:ui
# Opens: http://localhost:51204 (or similar)

# Coverage report
bun run test:coverage
# Generates: coverage/ directory
```

### Test File Location

```bash
# Co-locate tests with source
apps/web/lib/auth.ts
apps/web/lib/auth.test.ts  # Same directory

# Or dedicated test directory
apps/web/__tests__/
```

### Writing Tests

```typescript
// apps/web/lib/auth.test.ts
import { describe, it, expect } from 'vitest'
import { getUserFromToken } from './auth'

describe('getUserFromToken', () => {
  it('should extract user from valid token', () => {
    const token = 'valid-token-123'
    const user = getUserFromToken(token)
    expect(user).toBeDefined()
  })

  it('should return null for invalid token', () => {
    const token = 'invalid-token'
    const user = getUserFromToken(token)
    expect(user).toBeNull()
  })
})
```

---

## Building for Production

### Local Production Build

```bash
# Build with caching
bun run build
# Outputs: apps/web/.next/

# Start production server
bun run start
# Server at: http://localhost:3000

# Test production build
# Navigate the site, check console for errors
```

### Understanding Build Output

```
apps/web/.next/
├── cache/           ← Build artifacts
├── server/          ← Next.js server code
├── static/          ← Static assets (CSS, JS)
├── public/          ← Public files
└── BUILD_ID         ← Build identifier
```

### Build Performance

**First build:**
```bash
bun run build
# ~45 seconds (compiles everything)
```

**Second build (no changes):**
```bash
bun run build
# ~2 seconds (uses cache)
```

**After changing one file:**
```bash
bun run build
# ~10 seconds (rebuilds that package only)
```

---

## Debugging

### Browser DevTools

```bash
# 1. Start dev server
bun run dev

# 2. Open http://localhost:3000

# 3. Open browser DevTools
# - F12 or Right-click → Inspect
# - Elements tab: View HTML
# - Console tab: JavaScript errors
# - Network tab: API calls
```

### Next.js DevTools

**Built-in error overlay:**
```
If you see an error in browser, click it to jump to source code
```

**Network inspection:**
```
Opens as panel in browser during development
```

### Server-Side Debugging

**Console logging in Server Components:**
```typescript
// apps/web/app/page.tsx
export default function Home() {
  console.log('This logs in terminal (server)')

  return (
    <div>
      {console.log('This also logs in terminal')}
    </div>
  )
}
```

**Check terminal for logs when you reload page**

---

## Troubleshooting

### Dev Server Won't Start

**Error: "PrismaClient is not found"**

```bash
# Regenerate Prisma
turbo run @repo/database#db:generate

# Restart dev server
bun run dev
```

---

**Error: "Cannot find module '@repo/ui'"**

```bash
# Check transpilePackages in next.config.ts
code apps/web/next.config.ts

# Should include:
{
  transpilePackages: ["@repo/ui"]
}

# Restart dev server
bun run dev
```

---

### Build Fails

**Error: "Cannot find module"**

```bash
# Clear caches
rm -rf .turbo apps/web/.next

# Rebuild
bun run build
```

---

**TypeScript errors**

```bash
# Run type-check to see all errors
bun run type-check

# Fix them individually
# Or use formatter
bun run format
```

---

### Port 3000 Already in Use

**On macOS/Linux:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 bun run dev
```

**On Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && bun run dev
```

---

## Git Workflow

### Before Committing

```bash
# 1. Format code
bun run format

# 2. Lint
bun run lint

# 3. Type-check
bun run type-check

# 4. Commit
git add .
git commit -m "feat(scope): description"
```

### Making Commits

**Conventional commits format:**
```
feat(database): add reviews model
fix(auth): handle expired tokens
refactor(ui): simplify Button component
docs(setup): update instructions
chore(deps): upgrade dependencies
```

**Good practices:**
```bash
# Stage specific files
git add apps/web/app/page.tsx
git commit -m "feat(homepage): redesign hero section"

# Not recommended:
git add .
git commit -m "updates"  # ❌ Too vague
```

---

## Performance Tips

### Hot Reload Performance

**Dev server is slow?**

1. **Check for CPU-intensive operations:**
   ```bash
   # Watch terminal during reload
   bun run dev
   # Look for long compilation times
   ```

2. **Limit file watchers:**
   ```bash
   # Add to .env.local
   WATCHPACK_AGGREGATETIMEOUT=500
   ```

3. **Restart if slow:**
   ```bash
   # Kill: Ctrl+C
   bun run dev
   ```

### Build Optimization

**Build is slow?**

1. **Check cache:**
   ```bash
   turbo run build --verbose
   # Look for CACHE MISS
   ```

2. **Clear cache if stale:**
   ```bash
   rm -rf .turbo
   bun run build
   ```

3. **Force rebuild:**
   ```bash
   turbo run build --force
   ```

---

## Next Steps

- Read `TURBOREPO_GUIDE.md` for deep dive
- Check `project-structure.md` for codebase overview
- See `ENVIRONMENT_VARIABLES.md` for env var details
- Review `CLAUDE.md` for quick reference

---

## Useful Commands Reference

```bash
# Development
bun run dev                    # Start with Turborepo
bun run dev:web              # Direct (skip Turborepo)

# Building
bun run build                # Production build
bun run start                # Production server

# Quality
bun run type-check          # TypeScript validation
bun run lint                # Biome linting
bun run format              # Auto-format code

# Testing
bun run test                # Watch mode
bun run test:run            # Single run
bun run test:coverage       # Coverage report
bun run test:ui             # Browser UI

# Database
cd packages/database
bunx prisma studio         # Database browser
bunx prisma migrate dev    # Create migration

# Turborepo
turbo run build --force     # Force rebuild
turbo graph                 # View dependencies
rm -rf .turbo              # Clear cache
```

---

## Getting Help

1. **Check existing docs** in `docs/` directory
2. **Review error messages** in terminal
3. **Look at git history** for similar changes
4. **Ask in team channels** with error details
