# Turborepo Cheatsheet - Quick Reference

> Fast lookup guide for Turborepo, Turbopack, and Bun commands

---

## The Three Tools

```
┌─────────────────────────────────────────────────────┐
│                    bun run dev                      │
│  (Bun executes your script from package.json)       │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  turbo run dev                      │
│  (Turborepo reads turbo.json and orchestrates)      │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴──────────────┬────────────────┐
        │                            │                │
┌───────▼──────────┐      ┌─────────▼────────┐  ┌───▼─────────────┐
│ @repo/database   │      │  @repo/ui        │  │   apps/web      │
│ db:generate      │      │  (if needed)     │  │  next dev       │
│ (Prisma)         │      │                  │  │ (Turbopack)     │
└──────────────────┘      └──────────────────┘  └─────────────────┘
```

---

## Development Commands

### Start Development

```bash
bun run dev              # Turborepo orchestrates (RECOMMENDED)
bun run dev:web         # Direct mode (skip Turborepo)
```

### Code Quality

```bash
bun run type-check      # TypeScript validation (DO THIS BEFORE COMMITS!)
bun run lint            # Biome linting
bun run format          # Auto-format code
```

### Build & Deploy

```bash
bun run build           # Production build (uses cache)
bun run start           # Start production server
```

---

## Turborepo Commands

### Task Execution

```bash
turbo run build                 # Run build with caching
turbo run build --force         # Force rebuild (ignore cache)
turbo run build --verbose       # See what's cached
turbo run dev                   # Run dev (equivalent to bun run dev)
turbo run type-check            # Run type-check
```

### Filtering

```bash
turbo run build --filter=@repo/ui          # Only @repo/ui
turbo run build --filter=@repo/web         # Only @repo/web
turbo run build --filter=!@repo/database   # Everything except database
turbo run lint --filter=@repo/ui...        # @repo/ui and everything that depends on it
```

### Visualization & Info

```bash
turbo graph              # Open task graph at http://localhost:3000
turbo graph --json       # JSON output (for parsing)
```

### Cache Management

```bash
rm -rf .turbo            # Clear local cache
turbo run build --force  # Force rebuild (ignores cache)
bunx turbo prune --docker  # Create pruned lockfile for Docker
```

### Remote Caching (Team/CI)

```bash
bunx turbo link          # Connect to Turbo Cloud
bunx turbo unlink        # Disconnect from Turbo Cloud
```

---

## Database Commands

### Prisma

```bash
# From root (using Turborepo)
turbo run @repo/database#db:generate

# Direct (go to packages/database/)
cd packages/database
bunx prisma generate               # Generate Prisma client
bunx prisma migrate dev            # Create + apply migration
bunx prisma db push                # Sync schema with database
bunx prisma studio                 # Open database browser (localhost:5555)
```

### Migrations

```bash
cd packages/database

bunx prisma migrate dev --name add_users
# Creates: prisma/migrations/20240101000000_add_users/
# Applies migration
# Regenerates Prisma client

bunx prisma migrate reset           # Reset to initial state (be careful!)
```

---

## Package Management

### Install & Update

```bash
bun install              # Install all dependencies
bun add package-name     # Add package
bun add -d package-name  # Add dev dependency
bun remove package-name  # Remove package
bun update               # Update all packages
```

---

## Common Workflows

### Starting Work

```bash
bun install          # Install dependencies (including postinstall)
bun run dev          # Start development server
```

### Creating New Feature

```bash
# 1. Create page/component
touch apps/web/app/features/page.tsx

# 2. Add database changes (if needed)
code packages/database/prisma/schema.prisma

# 3. Create migration
cd packages/database
bunx prisma migrate dev --name add_feature

# 4. Start dev server
cd ../..
bun run dev

# 5. Code your feature
# Dev server hot-reloads

# 6. Before committing
bun run format
bun run lint
bun run type-check

# 7. Commit
git add .
git commit -m "feat(features): add new feature"
```

### Deploying to Production

```bash
# 1. Type check
bun run type-check

# 2. Build
bun run build

# 3. Test production build
bun run start

# 4. Push to git
git push origin main

# 5. Vercel auto-deploys
```

### Debugging Issues

```bash
# Prisma not found?
turbo run @repo/database#db:generate
bun run dev

# Package not found?
rm -rf apps/web/.next .turbo
bun run dev

# Cache issues?
rm -rf .turbo
bun run build

# Port in use?
lsof -i :3000
kill -9 <PID>
```

---

## File Locations

### Configuration

```
turbo.json                      # Turborepo config
package.json                    # Root scripts & workspaces
apps/web/package.json          # Next.js config
apps/web/next.config.ts        # Next.js settings
packages/database/package.json  # Prisma config
packages/env/package.json       # Env validation
```

### Database

```
packages/database/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migrations
└── src/
    └── repositories/          # Database queries
```

### Source Code

```
apps/web/
├── app/
│   ├── actions/               # Server Actions
│   ├── (auth)/               # Protected routes
│   └── page.tsx              # Homepage
├── components/               # React components
├── lib/                       # Utilities
└── proxy.ts                  # Auth proxy

packages/ui/src/components/    # Shared components
packages/env/src/              # Env validation
```

---

## Environment Variables

### Files

```
.env.example                # Template (tracked in git)
.env.local                  # Your secrets (in .gitignore)
.env.development.example    # Dev template
.env.production.example     # Prod template
```

### Adding Variable

1. **Edit schema:**
   ```bash
   code packages/env/src/index.ts
   ```

2. **Add to example:**
   ```bash
   echo "MY_VAR=example" >> .env.example
   ```

3. **Set in local:**
   ```bash
   echo "MY_VAR=actual_value" >> .env.local
   ```

4. **Restart dev:**
   ```bash
   bun run dev
   ```

---

## Useful Shortcuts

### Quick Access

```bash
# View logs
bun run dev 2>&1 | tee dev.log

# Run multiple commands
bun run format && bun run lint && bun run type-check

# Kill port manually (macOS/Linux)
kill -9 $(lsof -i :3000 -t)

# Install and dev
bun install && bun run dev
```

### Git Integration

```bash
# Commit with checks
bun run format && bun run lint && bun run type-check && git add . && git commit -m "feat: your message"

# View recent commits
git log --oneline -10

# See what changed
git diff
```

---

## Turborepo Config Reference

### turbo.json Structure

```json
{
  "$schema": "https://turbo.build/schema.json",

  "globalPassThroughEnv": [
    "NODE_ENV",
    "DATABASE_URL"
  ],

  "tasks": {
    "dev": {
      "cache": false,           // Don't cache dev
      "persistent": true,       // Keep running
      "dependsOn": ["@repo/database#db:generate"]
    },

    "build": {
      "dependsOn": ["^build", "@repo/database#db:generate"],
      "env": ["NODE_ENV"],      // Invalidate if NODE_ENV changes
      "outputs": [".next/**"]   // Cache these files
    },

    "@repo/database#db:generate": {
      "cache": true,
      "inputs": ["prisma/schema.prisma"],  // Only run if schema changed
      "outputs": ["../../node_modules/.prisma/**"]
    },

    "type-check": {
      "cache": true,
      "dependsOn": ["@repo/database#db:generate"]
    },

    "lint": {
      "cache": true,
      "outputs": []
    },

    "format": {
      "cache": false
    }
  }
}
```

---

## Package.json Scripts Reference

### Root package.json

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

### apps/web/package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "type-check": "tsc --noEmit",
    "format": "biome format --write .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Performance Tips

### Dev Server Speed

```bash
# Slow hot reload?
# Option 1: Restart
bun run dev

# Option 2: Clear caches
rm -rf apps/web/.next .turbo
bun run dev
```

### Build Speed

```bash
# Check cache status
turbo run build --verbose

# Use cache
turbo run build                 # Fast (cached)

# Skip cache
turbo run build --force         # Slow (rebuilds)

# Clear old cache
rm -rf .turbo
turbo run build --force
```

### Development Tips

```bash
# Pre-commit checklist
bun run format    # Format
bun run lint      # Lint
bun run type-check   # Types
git commit -m "message"

# Faster iteration
bun run dev:web   # Skip Turborepo (if you know schema is fine)

# Monitor file changes
bun run dev --verbose  # See what's hot-reloading
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **PrismaClient not found** | `turbo run @repo/database#db:generate && bun run dev` |
| **Module not found @repo/X** | Check `transpilePackages` in `next.config.ts` + restart |
| **Changes not reflecting** | `rm -rf apps/web/.next .turbo && bun run dev` |
| **Build slow** | `rm -rf .turbo && turbo run build --force` |
| **Port 3000 in use** | `kill -9 $(lsof -i :3000 -t)` or `PORT=3001 bun run dev` |
| **Type errors after schema change** | `cd packages/database && bunx prisma migrate dev` |

---

## CI/CD (Vercel/GitHub Actions)

### Environment Variables to Set

```
CI=true
VERCEL=true
TURBO_TOKEN=<your-token>
TURBO_TEAM=<your-team>
DATABASE_URL=<production-db>
DIRECT_URL=<production-db-direct>
```

### Build Command

```bash
bun run build
```

### Start Command

```bash
bun run start
```

---

## More Information

- **Full Guide:** Read `TURBOREPO_GUIDE.md`
- **Setup Details:** Read `DEVELOPMENT_SETUP.md`
- **Project Structure:** Read `project-structure.md`
- **Quick Start:** Check `CLAUDE.md`

---

## Quick Links

```
Turbo Docs:        https://turborepo.com
Next.js Docs:      https://nextjs.org
Bun Docs:          https://bun.sh
Prisma Docs:       https://www.prisma.io
TypeScript Docs:   https://www.typescriptlang.org
```

---

## Last Updated

- **Date:** October 22, 2025
- **Changes:** Initial Turborepo optimization
- **Next Review:** Check when major upgrades happen
