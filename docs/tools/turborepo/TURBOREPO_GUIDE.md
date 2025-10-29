# Turborepo Guide - InmoApp

> Complete guide to Turborepo, Turbopack, and Bun integration in your monorepo

---

## Table of Contents

1. [Quick Understanding](#quick-understanding)
2. [Three Tools Explained](#three-tools-explained)
3. [Configuration Details](#configuration-details)
4. [Development Workflow](#development-workflow)
5. [Build & Production](#build--production)
6. [Caching & Performance](#caching--performance)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## Quick Understanding

**In one sentence:** Turborepo orchestrates monorepo tasks, Turbopack compiles your code, and Bun executes everything.

**Your project layout:**
```
inmo-app/ (monorepo root)
├── apps/
│   └── web/              (Next.js app)
├── packages/
│   ├── database/         (Prisma)
│   ├── ui/              (Components)
│   ├── env/             (Env validation)
│   └── supabase/        (Clients)
├── turbo.json           (Turborepo config)
├── package.json         (Root scripts)
└── bun.lockb            (Bun lock file)
```

**Key insight:** Without Turborepo, you'd have to manually generate Prisma, then start Next.js. With Turborepo, it happens automatically.

---

## Three Tools Explained

### 1. **Turborepo** - Task Orchestrator

**What:** Manages task execution across multiple packages in a monorepo

**Where it lives:** `turbo` CLI tool (in `node_modules/.bin/`)

**Configured by:** `turbo.json`

**What it does:**
- Reads task definitions from `turbo.json`
- Understands dependencies between tasks
- Executes them in the correct order
- Caches results to speed up subsequent runs
- Parallelizes independent tasks

**Example task flow:**
```bash
turbo run build
# Turbo reads turbo.json and sees:
# "build": { "dependsOn": ["^build", "@repo/database#db:generate"] }
#
# So it executes:
# 1. @repo/database#db:generate   (Prisma)
# 2. @repo/ui#build               (if exists)
# 3. @repo/env#build              (if exists)
# 4. @repo/web#build              (Next.js build)
#
# And caches results at each step
```

**Commands:**
```bash
turbo run dev              # Run dev in all packages (respecting dependencies)
turbo run build            # Run build with caching
turbo run lint             # Lint all packages
turbo run build --force    # Force rebuild (ignore cache)
turbo graph                # Visualize task dependencies
```

---

### 2. **Turbopack** - Bundler (Inside Next.js 16)

**What:** Rust-based bundler that compiles TypeScript/JSX → JavaScript

**Where it lives:** Built into Next.js 16 (no separate installation)

**What it does:**
- Compiles `.ts`, `.tsx` → `.js`
- Handles CSS, images, etc.
- Provides fast hot reload in development
- Optimizes bundles for production

**How it's used:**
```bash
# Old way (before Next.js 16):
next dev --turbopack    # Had to explicitly enable

# New way (Next.js 16+):
next dev                # Turbopack is default, no flag needed
```

**In your code:**
```json
// apps/web/package.json
{
  "scripts": {
    "dev": "next dev",      // ✅ Turbopack automatic
    "build": "next build"   // ✅ Turbopack automatic
  }
}
```

---

### 3. **Bun** - Runtime & Package Manager

**What:** Fast JavaScript runtime and package manager

**Where it lives:** System-wide (`bun` command)

**Replaces:** Node.js + npm/yarn/pnpm

**What it does:**
- Executes scripts (`bun run dev`)
- Installs dependencies (`bun install`)
- Provides fast development loop

**In your project:**
```bash
bun run dev              # Bun executes root script "dev"
# Which runs: "turbo run dev"
# Which coordinates all tasks

bun install              # Install all dependencies
bun run type-check       # Type-check with TypeScript
```

---

## Configuration Details

### turbo.json Breakdown

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalPassThroughEnv": [...],
  "tasks": {...}
}
```

#### **globalPassThroughEnv** - Environment Variables

```json
"globalPassThroughEnv": [
  "NODE_ENV",                        // Dev vs Production
  "DATABASE_URL",                    // Database connection
  "NEXT_PUBLIC_SUPABASE_URL",       // Public Supabase URL
  "CI",                              // Indicates CI/CD environment
  "VERCEL",                          // Indicates Vercel deployment
  "TURBO_FORCE"                      // Force recompilation
]
```

**Why:** Without these, Turborepo would isolate environment variables per workspace, causing builds to fail.

**Example problem without these:**
```bash
bun run dev
# DATABASE_URL not passed to @repo/database#db:generate
# Prisma fails to generate client
# ❌ "PrismaClient is not found"
```

---

#### **tasks** - Task Definitions

##### **dev** - Development Task

```json
"dev": {
  "cache": false,
  "persistent": true,
  "dependsOn": ["@repo/database#db:generate"]
}
```

| Property | Value | Meaning |
|----------|-------|---------|
| `cache` | `false` | Never cache dev (always regenerate) |
| `persistent` | `true` | Keep running (server doesn't exit) |
| `dependsOn` | `[...]` | Run Prisma generation first |

**Flow when you run `bun run dev`:**
```
1. bun run dev                          (root script)
   ↓
2. turbo run dev                        (Turborepo orchestrates)
   ↓
3. @repo/database#db:generate          (Prisma client)
   ↓ (when done)
4. next dev --filter=@repo/web         (Next.js dev server)
   ↓
5. Turbopack compiles code
   ↓
6. Server ready at http://localhost:3000
```

---

##### **build** - Production Build

```json
"build": {
  "dependsOn": ["^build", "@repo/database#db:generate"],
  "env": ["NODE_ENV"],
  "outputs": [".next/**", "dist/**"]
}
```

| Property | Value | Meaning |
|----------|-------|---------|
| `dependsOn[0]` | `"^build"` | `^` = run build in dependencies first |
| `dependsOn[1]` | `"@repo/database#db:generate"` | Generate Prisma |
| `env` | `["NODE_ENV"]` | Invalidate cache if NODE_ENV changes |
| `outputs` | `[".next/**", "dist/**"]` | Cache these files |

**The `^` symbol explained:**
```json
"dependsOn": ["^build"]
```

This means: "Before running `build` in this package, run `build` in all packages it imports from"

**In your case:**
- `@repo/web` imports from `@repo/ui`, `@repo/env`, `@repo/database`
- So `turbo run build` executes:
  1. `@repo/database#build` (if exists)
  2. `@repo/ui#build` (if exists)
  3. `@repo/env#build` (if exists)
  4. `@repo/database#db:generate` (Prisma)
  5. `@repo/web#build` (Next.js)

---

##### **@repo/database#db:generate** - Prisma Generation

```json
"@repo/database#db:generate": {
  "cache": true,
  "inputs": ["prisma/schema.prisma"],
  "outputs": ["../../node_modules/.prisma/**", "src/generated/**"]
}
```

| Property | Value | Meaning |
|----------|-------|---------|
| `cache` | `true` | Cache the generated client |
| `inputs` | `["prisma/schema.prisma"]` | Only regenerate if schema changed |
| `outputs` | `[...]` | Cache these generated files |

**Why `inputs` matters:**
- First run: Generates Prisma (slow)
- Second run: Same schema → uses cache (fast)
- Change schema.prisma → regenerates (smart invalidation)

---

##### **type-check** - TypeScript Validation

```json
"type-check": {
  "cache": true,
  "dependsOn": ["@repo/database#db:generate"],
  "outputs": []
}
```

**Important:** Depends on `db:generate` because TypeScript needs Prisma types to exist.

**Without this dependency:**
```bash
bun run type-check
# ❌ Error: Cannot find module '@prisma/client'
# Prisma types don't exist yet
```

**With this dependency:**
```bash
bun run type-check
# ✅ Generates Prisma first
# ✅ Then type-checks with Prisma types available
```

---

### Root package.json Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "cd apps/web && bun run dev",
    "build": "turbo run build",
    "start": "cd apps/web && bun run start",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "turbo run format",
    "postinstall": "turbo run @repo/database#db:generate"
  }
}
```

**Key differences:**

| Script | What it does | When to use |
|--------|-------------|------------|
| `dev` | Full Turborepo orchestration | 99% of the time |
| `dev:web` | Skip Turborepo, go direct to Next.js | Emergency only |
| `build` | Production build with caching | Before deployment |
| `postinstall` | Runs after `bun install` | Auto-generated during setup |

---

## Development Workflow

### Scenario 1: Normal Development

**Your command:**
```bash
bun run dev
```

**What happens internally:**

1. Bun reads `package.json` script: `"dev": "turbo run dev"`
2. Executes: `turbo run dev`
3. Turborepo reads `turbo.json`
4. Sees: `"dev": { "dependsOn": ["@repo/database#db:generate"] }`
5. First runs: `@repo/database#db:generate`
   - Executes: `cd packages/database && prisma generate`
   - Outputs: `.prisma/client/` with TypeScript types
6. Then runs: Next.js dev server
   - Executes: `cd apps/web && next dev`
   - Turbopack starts compiling your code
7. Server listens on `http://localhost:3000`
8. You're ready to develop!

**File changes during dev:**
```
You edit: apps/web/components/ProductCard.tsx
         ↓
Turbopack detects change
         ↓
Hot reload in browser
         ↓
Instant feedback
```

**Database schema changes:**
```
You edit: packages/database/prisma/schema.prisma
         ↓
Next.js notices change
         ↓
Automatically runs db:generate (if configured)
         ↓
Prisma client updates
         ↓
Types available in your code
```

---

### Scenario 2: Skipping Turborepo (Direct Mode)

**When to use:** Only if Turborepo is giving issues

**Your command:**
```bash
bun run dev:web
```

**What happens:**
- Bypasses Turborepo completely
- Goes directly: `cd apps/web && bun run dev`
- Next.js starts immediately (without Prisma generation)
- ⚠️ Only works if Prisma was already generated before

---

### Scenario 3: Making Package Changes

**You add a new component to @repo/ui:**

```bash
# Your changes
packages/ui/src/Button.tsx  (new file)

# How to test:
bun run dev

# Turborepo sees @repo/ui is imported by @repo/web
# Hot reload works because transpilePackages is configured:

// apps/web/next.config.ts
{
  transpilePackages: [
    "@repo/env",
    "@repo/database",
    "@repo/ui",      // ← Your new component
    "@repo/supabase"
  ]
}
```

**Why `transpilePackages`?**
- Next.js normally can't import from `../packages/ui`
- `transpilePackages` tells Next.js: "Compile this package on-the-fly"
- Without it: `Cannot find module '@repo/ui'`

---

## Build & Production

### Building for Production

**Your command:**
```bash
bun run build
```

**What happens step-by-step:**

1. **Dependency resolution:**
   ```
   turbo run build
   │
   ├─ Run: @repo/database#db:generate    (Prisma)
   │
   ├─ Run: @repo/ui#lint (if needed)
   ├─ Run: @repo/env#lint (if needed)
   │
   └─ Run: @repo/web#build (Next.js)
       ├─ Compiles TypeScript/JSX
       ├─ Optimizes images
       ├─ Bundles CSS/JS
       └─ Outputs: .next/
   ```

2. **Caching in action:**
   ```
   First run:    50 seconds  (builds everything)
   Second run:   2 seconds   (uses cache)
   Change file:  10 seconds  (only rebuilds changed package)
   ```

3. **Output:**
   ```
   apps/web/.next/    (Next.js build)
   apps/web/.turbo/   (Turbo cache)
   ```

---

### Verifying Production Build

```bash
# Test production build locally
bun run build

# Start production server
bun run start

# Visit http://localhost:3000 (production version)
```

---

## Caching & Performance

### How Turborepo Cache Works

**Without caching (old way):**
```bash
# Run 1: 45 seconds (builds everything)
bun run build

# Run 2: 45 seconds (rebuilds everything again!)
bun run build
# ❌ Wasted time
```

**With Turborepo caching:**
```bash
# Run 1: 45 seconds (builds everything)
turbo run build

# Run 2: 2 seconds (uses cache!)
turbo run build
# ✅ 22x faster

# Run 3: Changed one file
turbo run build
# ✅ Only rebuilds that package (~5 seconds)
```

---

### Smart Cache Invalidation

**Turborepo invalidates cache when:**

1. **Task inputs change:**
   ```json
   "@repo/database#db:generate": {
     "inputs": ["prisma/schema.prisma"]
   }
   // Cache cleared if schema.prisma changes
   ```

2. **Environment variables change:**
   ```json
   "build": {
     "env": ["NODE_ENV"]
   }
   // Cache cleared if NODE_ENV changes (dev → prod)
   ```

3. **Package.json changes:**
   ```
   If @repo/ui/package.json changes
   → Clear cache for @repo/ui and everything that depends on it
   ```

4. **Source code changes:**
   ```
   If apps/web/src/* changes
   → Only rebuild apps/web (not @repo/ui, @repo/env)
   ```

---

### Viewing Cache Status

```bash
# See what's cached
ls -la .turbo/

# Clear cache if builds are stale
rm -rf .turbo/

# Force rebuild (ignore cache)
turbo run build --force
```

---

## Troubleshooting

### Problem 1: "PrismaClient is not found"

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
at Runtime.requireModule [as _requireModule]
```

**Solution:**
```bash
# Generate Prisma manually
turbo run @repo/database#db:generate

# Or re-run dev (which should auto-generate)
bun run dev
```

**Why it happens:**
- `postinstall` hook didn't run
- Database schema changed but Prisma wasn't regenerated
- Dependency installation was incomplete

---

### Problem 2: "Package @repo/X is not found"

**Symptoms:**
```
Module not found: Can't resolve '@repo/ui'
```

**Solutions:**

1. **Check `transpilePackages` in `next.config.ts`:**
   ```typescript
   const nextConfig = {
     transpilePackages: [
       "@repo/ui",  // ← Must be here
     ]
   };
   ```

2. **Restart the dev server:**
   ```bash
   # Kill current dev server (Ctrl+C)
   bun run dev
   ```

3. **Check package.json naming:**
   ```json
   // packages/ui/package.json
   {
     "name": "@repo/ui"  // ← Must match this
   }
   ```

---

### Problem 3: Changes Not Reflected

**Symptoms:**
```
Edit a file, but changes don't appear in browser
```

**Solutions:**

```bash
# Option 1: Clear Next.js cache
rm -rf apps/web/.next

# Option 2: Clear Turborepo cache
rm -rf .turbo

# Option 3: Full restart
rm -rf apps/web/.next .turbo
bun run dev
```

---

### Problem 4: Build Takes Too Long

**Symptoms:**
```
turbo run build
# Takes 2+ minutes every time
```

**Solutions:**

1. **Check cache status:**
   ```bash
   turbo run build --verbose
   # Look for "CACHE MISS" vs "CACHE HIT"
   ```

2. **Clear stale cache:**
   ```bash
   rm -rf .turbo
   bun run build
   ```

3. **Check for file changes:**
   ```bash
   git status
   # Look for files that shouldn't have changed
   ```

---

### Problem 5: CI/CD Pipeline Fails

**Symptoms:**
```
GitHub Actions / Vercel shows different results than local
```

**Solutions:**

1. **Ensure CI variables are set:**
   ```bash
   # In your CI environment (GitHub Actions, Vercel):
   TURBO_TEAM=your-team
   TURBO_TOKEN=your-token
   ```

2. **Check turbo.json has CI variables:**
   ```json
   "globalPassThroughEnv": [
     "CI",
     "VERCEL",
     "VERCEL_ENV"
   ]
   ```

3. **Force rebuild in CI:**
   ```bash
   turbo run build --force
   ```

---

## Advanced Usage

### Remote Caching (Speed Up CI)

**What it does:** Share build cache between machines (CI, team members)

**Setup:**
```bash
# Connect to Turbo Cloud
bunx turbo link

# Follow the prompts to authenticate
# This creates .turbo/config.json with your token
```

**After setup:**
```bash
# Your local cache is uploaded
bun run build

# In CI, cache is downloaded
# Builds are 10x faster because nothing rebuilds!
```

**In CI/CD (GitHub Actions example):**
```yaml
- name: Build
  run: bun run build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: your-team-name
```

---

### Filtering Tasks

**Run only specific packages:**

```bash
# Only build @repo/ui
turbo run build --filter=@repo/ui

# Only lint @repo/web
turbo run lint --filter=@repo/web

# Everything except database
turbo run build --filter=!@repo/database
```

---

### Visualizing Dependencies

**See the task graph:**
```bash
turbo graph
# Opens: http://localhost:3000/task-graph
# Shows all packages and their dependencies
```

---

### Custom Task Configuration

**Example: Add test task to Turborepo:**

```json
// turbo.json
{
  "tasks": {
    "test": {
      "cache": true,
      "dependsOn": ["@repo/database#db:generate"],
      "outputs": ["coverage/**"]
    }
  }
}
```

**Then use it:**
```bash
bun run test
# Runs Vitest in all packages with cache
```

---

## Summary

| Concept | What it does | Configuration |
|---------|-------------|----------------|
| **Turborepo** | Orchestrates tasks | `turbo.json` |
| **Turbopack** | Compiles code | Built into Next.js 16 |
| **Bun** | Runs commands | `package.json` scripts |
| **transpilePackages** | Handles local imports | `next.config.ts` |
| **globalPassThroughEnv** | Shares env vars | `turbo.json` |
| **Caching** | Speeds up builds | Automatic |

---

## Quick Reference

```bash
# Development
bun run dev              # Start with Turborepo (recommended)
bun run dev:web         # Direct (skip Turborepo)

# Production
bun run build           # Build with caching
bun run start           # Start production server
bun run type-check      # Type-check with Prisma

# Maintenance
rm -rf .turbo           # Clear cache
turbo run build --force # Force rebuild
turbo graph             # Visualize dependencies
bunx turbo link         # Enable remote caching
```

---

## Related Documentation

- `CLAUDE.md` - Project quick start
- `project-structure.md` - Detailed project layout
- `ENVIRONMENT_VARIABLES.md` - Env var configuration
- `NEXTJS_CACHING_EXPLAINED.md` - Next.js 16 caching
