📄 CLAUDE.MD para Proyecto Inmobiliaria

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **real estate platform** built as a monorepo containing:
- **Web App** (`apps/web`): Next.js 15 App Router with TypeScript, Tailwind CSS, and shadcn/ui
- **Database Package** (`packages/database`): Prisma schemas, types, and database utilities
- **UI Package** (`packages/ui`): Shared components library with shadcn/ui
- **Supabase**: PostgreSQL database, authentication, storage, and realtime subscriptions

## Technology Stack

- **Monorepo**: Turborepo (or Bun workspaces)
- **Frontend**: Next.js 15 App Router + TypeScript + React 19
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **ORM**: Prisma + Supabase client
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod schemas
- **Forms**: React Hook Form
- **Maps**: Mapbox GL JS
- **Deployment**: Vercel

## Development Commands

### Running the application

  ```bash
  # Run all apps and packages (Turborepo)
  bun run dev

  # Run only web app
  cd apps/web && bun run dev

  # Database commands
  cd packages/database && bunx prisma studio      # Open Prisma Studio
  cd packages/database && bunx prisma migrate dev # Run migrations
  cd packages/database && bunx prisma generate    # Generate Prisma Client

  Building and linting

  # Build all apps and packages
  bun run build

  # Lint all code
  bun run lint

  # Format code
  bun run format

  # Type check
  bun run type-check

  Database operations

  # Create new migration
  cd packages/database && bunx prisma migrate dev --name <migration_name>

  # Reset database (development only)
  cd packages/database && bunx prisma migrate reset

  # Seed database
  cd packages/database && bunx prisma db seed

  # Push schema changes without migration (development)
  cd packages/database && bunx prisma db push

  Supabase operations

  # Start Supabase locally (Docker required)
  bunx supabase start

  # Stop Supabase
  bunx supabase stop

  # Generate TypeScript types from database
  bunx supabase gen types typescript --local > packages/database/types/supabase.ts

  # Create new migration
  bunx supabase migration new <migration_name>

  Architecture

  Monorepo Structure

  - Turborepo manages the monorepo with intelligent caching and parallel execution
  - Workspaces in root package.json manage dependencies across apps and packages
  - Path aliases: @/ resolves to apps/web/src/, @repo/database, @repo/ui for packages
  - Apps and packages can share code via internal package references

  Next.js App Architecture (apps/web)

  - App Router with route groups for organization:
    - (public)/: Public routes (home, property listings, property details)
    - (auth)/: Authenticated routes (dashboard, favorites, messages)
    - (admin)/: Admin panel routes (manage properties, users, settings)
  - Server Actions (app/actions/) handle mutations and business logic
  - Server Components by default for optimal performance and SEO
  - Client Components ('use client') only when needed (interactivity, hooks)
  - API Routes (app/api/) for webhooks, third-party integrations, or streaming responses

  Database Package (packages/database)

  - Prisma schema defines data models (Property, User, Favorite, Appointment, etc.)
  - Query utilities provide reusable database operations
  - Shared types exported from Prisma client and Supabase
  - Zod schemas for runtime validation (derived from Prisma schema)

  Authentication & Authorization

  - Supabase Auth handles authentication (email/password, OAuth providers)
  - Middleware (apps/web/middleware.ts) protects routes and checks permissions
  - Row Level Security (RLS) policies in Supabase for database-level authorization
  - User roles: client, agent, admin
  - Session management via Supabase cookies (server-side)

  File Storage

  - Supabase Storage for property images, documents, user avatars
  - Buckets: properties (public), documents (private), avatars (public)
  - Image optimization: Next.js Image component with Supabase loader
  - Upload flow: Client → Server Action → Supabase Storage → Database record

  Data Models (Key Entities)

  Property:
  - Fields: title, description, price, type (sale/rent), bedrooms, bathrooms, area, location (lat/lng)
  - Relations: belongsTo User (agent), hasMany PropertyImage, hasMany Favorite

  User:
  - Fields: email, name, role (client/agent/admin), phone, avatar
  - Relations: hasMany Property (if agent), hasMany Favorite, hasMany Appointment

  Favorite:
  - Fields: userId, propertyId, createdAt
  - Relations: belongsTo User, belongsTo Property

  Appointment:
  - Fields: userId, propertyId, agentId, scheduledAt, status (pending/confirmed/cancelled)
  - Relations: belongsTo User (client), belongsTo Property, belongsTo User (agent)

  API Patterns

  Server Actions (Preferred):
  // apps/web/app/actions/properties.ts
  'use server'

  export async function createProperty(data: PropertyInput) {
    const session = await getSession() // Supabase auth
    if (session.user.role !== 'agent') throw new Error('Unauthorized')

    const validated = propertySchema.parse(data) // Zod validation
    const property = await db.property.create({ data: validated })

    revalidatePath('/properties')
    return property
  }

  Database Queries:
  // packages/database/queries/properties.ts
  export async function getProperties(filters: PropertyFilters) {
    return db.property.findMany({
      where: {
        type: filters.type,
        price: { gte: filters.minPrice, lte: filters.maxPrice },
        bedrooms: { gte: filters.minBedrooms }
      },
      include: { images: true, agent: true }
    })
  }

  Search & Filters

  - Search implementation: Full-text search via Prisma or Supabase Full Text Search
  - Geospatial queries: PostGIS extension for location-based search (properties near lat/lng)
  - Filter parameters: type, price range, bedrooms, bathrooms, area, location bounds
  - Mapbox integration: Display properties on interactive map, cluster markers

  Real-time Features

  - Supabase Realtime for live updates:
    - New property alerts (subscribe to properties table)
    - Chat messages between clients and agents
    - Appointment status changes
  - Optimistic updates in UI for better UX

  Code Style & Conventions

  - Prettier: Single quotes, semicolons, 2-space indentation
  - ESLint: React 19 best practices, TypeScript strict mode
  - File naming: kebab-case for files, PascalCase for components
  - Component structure: Feature-based folders (e.g., components/property-card/)
  - Server Actions: Prefix with action verb (createProperty, updateUser)
  - Validation: Zod schemas co-located with Server Actions

  Environment Variables

  Required in apps/web/.env.local:
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_MAPBOX_TOKEN=
  DATABASE_URL=

  Testing Strategy

  - Unit tests: Vitest for utilities and business logic
  - Integration tests: Test Server Actions with test database
  - E2E tests: Playwright for critical user flows (search, create listing)
  - Run tests: bun run test

  Deployment

  - Vercel for Next.js app (automatic previews on PRs)
  - Supabase managed service for database, auth, storage
  - Environment: Production, Staging (preview deployments)
  - Database migrations: Run via Supabase CLI or Prisma Migrate before deploy

---

## Development Workflows

### Phase 1: Initial Development (You are here)

**Goal**: Get features working quickly without overhead

**Feature Development Flow**:
```bash
# 1. Start dev server
bun run dev

# 2. Code in this order:
#    a) Types first (packages/database/types.ts)
#    b) Validation schemas (Zod)
#    c) Server Actions or queries
#    d) UI components (small → large)

# 3. Test manually in browser
#    - Happy path
#    - 1-2 edge cases (empty input, error state)

# 4. When stable, commit:
git add .
git commit -m "feat: descriptive message"

# 5. Repeat for next feature
```

**Code Organization Rules** (start simple):
- Feature-based folders: `components/property/`, `components/user/`
- One responsibility per file
- If code is used 2+ times → extract to `packages/`
- Name files clearly: `PropertyCard.tsx` not `Card.tsx`

**Quality Checklist** (before each commit):
- [ ] TypeScript has no errors (`bun run type-check`)
- [ ] Code is formatted (`bun run format`)
- [ ] Feature works in browser
- [ ] No `console.log` left behind

---

### Phase 2: Git Workflow (When you have working features)

**Branch Strategy** (keep it simple):
```bash
# Main branch: always deployable
# Feature branches: work in progress

# Create feature branch
git checkout -b feature/property-search

# Work + commit frequently (small commits)
git add <specific-files>
git commit -m "feat: add search filters UI"

# When done, merge to main
git checkout main
git merge feature/property-search
git branch -d feature/property-search

# Deploy
git push origin main
```

**Commit Message Format**:
```
feat: add property search filters
fix: resolve image upload error
refactor: extract PropertyCard component
docs: update setup instructions
```

---

### Phase 3: Scaling Up (When project grows)

**Adopt these gradually**:

1. **Pre-commit hooks** (auto-format before commit):
   ```bash
   # Install Husky
   bun add -D husky lint-staged
   bunx husky init

   # .husky/pre-commit
   bun run lint-staged
   ```

2. **Testing** (only for critical code):
   - Utils/helpers → Unit tests (Vitest)
   - Server Actions → Integration tests
   - Critical flows → E2E tests (Playwright)

3. **CI/CD** (GitHub Actions):
   - Auto-run type-check, lint, build on PRs
   - Auto-deploy to Vercel on merge to main

---

## Quick Reference: "Where does this code go?"

```
Is it UI?
├─ Generic (Button, Input) → packages/ui/
└─ Feature-specific (PropertyCard) → components/property/

Is it data/logic?
├─ Server Action (mutations) → apps/web/app/actions/
└─ Query (read-only) → packages/database/queries/

Is it a type?
├─ Database-related → packages/database/types.ts
└─ UI-only → apps/web/types/

Is it a utility?
├─ Used 2+ places → packages/shared/utils/
└─ Used once → Same file that uses it
```

---

## Daily Development Commands

```bash
# Start everything
bun run dev

# Code quality
bun run type-check    # Find TypeScript errors
bun run lint          # Find code issues
bun run format        # Auto-fix formatting

# Database (when you set it up)
bunx prisma studio    # Visual DB browser
bunx prisma db push   # Quick schema sync (dev only)

# Git
git status            # See what changed
git add -p            # Review changes before committing
git log --oneline -5  # See recent commits
```

