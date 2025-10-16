# Project Overview

## Description

This is a **real estate platform** built as a modern monorepo for managing property listings, client interactions, and agent operations.

**Primary Purpose**: Enable real estate agents to manage properties, and clients to browse, favorite, and schedule appointments for property viewings.

**Future Vision**: Foundation for AI-powered services (chatbot, automated lead generation, property recommendations).

---

## Technology Stack

### Monorepo

- **Turborepo**: Intelligent caching and parallel execution for builds
- **Bun Workspaces**: Fast dependency management across packages
- **Path Aliases**:
  - `@/` → `apps/web/` (Next.js app)
  - `@repo/*` → `packages/*` (internal packages)

### Frontend

- **Next.js 15**: App Router with React Server Components
- **React 19**: Latest features (Server Actions, use hook, etc.)
- **TypeScript**: Strict mode for type safety
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Accessible component library

### Backend

- **Supabase**:
  - PostgreSQL database
  - Authentication (email/password + OAuth)
  - Storage (images, documents)
  - Realtime subscriptions
- **Prisma**: Type-safe ORM with migrations
- **Server Actions**: Mutations and business logic
- **Repository Pattern**: Centralized data access layer

### Development

- **Bun**: Fast JavaScript runtime and package manager
- **Zod**: Runtime validation schemas
- **React Hook Form**: Form state management
- **Biome**: Linting and formatting

### Deployment

- **Vercel**: Next.js hosting with automatic previews
- **Supabase Managed**: Production database and services

---

## Monorepo Structure

```
inmo-app/
├── apps/
│   └── web/                      # Next.js 15 application
│       ├── app/                  # App Router pages
│       │   ├── (auth)/          # Auth pages (login, signup)
│       │   ├── dashboard/       # Protected dashboard (AGENT/ADMIN)
│       │   └── actions/         # Server Actions
│       ├── components/          # React components
│       ├── lib/                 # Utilities, validations, clients
│       └── middleware.ts        # Auth + route protection
│
├── packages/
│   ├── database/                # Prisma + repositories
│   │   ├── prisma/schema.prisma # Database schema
│   │   └── src/repositories/   # Data access layer
│   │
│   ├── ui/                      # Shared UI components
│   │   └── src/components/     # Button, Input, etc.
│   │
│   └── typescript-config/       # Shared TypeScript configs
│
├── docs/                        # Project documentation
│   ├── AI_ASSISTANTS.md         # Context for Claude & Gemini
│   ├── TOKEN_OPTIMIZATION.md    # Reduce AI context
│   ├── setup/                   # Setup guides
│   └── mcp/                     # MCP integration
├── .claude/                     # Detailed documentation (auto-loaded)
├── QUICK_START.md               # 5-minute onboarding
├── README.md                    # Project overview
├── turbo.json                   # Turborepo config
├── package.json                 # Root workspace config
└── bun.lockb                    # Bun lockfile
```

---

## Key Design Decisions

### 1. Monorepo with TypeScript Exports

**Decision**: Internal packages export TypeScript directly (no compilation step)

**Why**:
- ⚡ Faster dev experience (no build step)
- 🔥 Instant hot reload
- ✅ Simple setup (no watch modes)

**Trade-off**: Next.js only (requires `transpilePackages`)

**When to change**:
- Adding other frameworks (mobile, Remix)
- Package count > 10
- Publishing to npm

### 2. Repository Pattern

**Decision**: Separate data access (repositories) from business logic (Server Actions)

**Why**:
- ✅ Centralized permission checks
- ✅ Testable business logic
- ✅ Reusable queries
- ✅ Clear separation of concerns

**Flow**:
```
Component → Server Action → Repository → Prisma → Database
```

### 3. Supabase for Backend

**Decision**: Use Supabase instead of self-hosted PostgreSQL + custom auth

**Why**:
- ✅ Batteries included (auth, storage, realtime)
- ✅ Built-in RLS for security
- ✅ Generous free tier
- ✅ Easy scaling path

**Configuration**:
- Region: US East (aws-1-us-east-2)
- Connection: Pooler for serverless (pgbouncer)
- RLS: Enabled on all tables

### 4. Server Actions over API Routes

**Decision**: Use Server Actions for mutations instead of REST/GraphQL APIs

**Why**:
- ✅ Type safety end-to-end
- ✅ No need for separate API layer
- ✅ Built-in with Next.js 15
- ✅ Simpler developer experience

**When to use API Routes**:
- Webhooks from third parties
- Public APIs for external consumption
- Streaming responses

---

## Project Principles

1. **Type Safety First**: TypeScript strict mode + Zod validation
2. **Security by Default**: RLS policies + permission checks in repositories
3. **Developer Experience**: Fast feedback loops, clear errors, good docs
4. **Pragmatic Architecture**: Balance between "perfect" and "done"
5. **Future-Proof**: Prepare for AI integration, but don't over-engineer now

---

## User Roles

- **CLIENT**: Default role
  - Browse public property listings
  - Save favorites
  - Schedule appointments
  - View own favorites and appointments

- **AGENT**: Property managers
  - All CLIENT permissions
  - Create/edit/delete own properties
  - Upload property images
  - Manage appointments for own properties
  - View analytics (future)

- **ADMIN**: Platform administrators (future)
  - All AGENT permissions
  - Manage all users
  - Manage all properties
  - Platform configuration
  - Analytics and reporting
