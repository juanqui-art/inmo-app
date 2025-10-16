# AI Assistants Guide

This document contains context and instructions for AI assistants working on the InmoApp project.

---

## 🤖 Claude Code

**Quick Start**: See `QUICK_START.md` for ultra-compressed reference (<1k tokens)

### Project
Real estate platform | Next.js 15 + Supabase + Turborepo | Phase 1.5

### Documentation

**Auto-loaded:** @.claude/01-06 files (~27k tokens)
**On-demand** (in .claudeignore): Multi-tenant, Technical Debt, Teaching Style, Appointments
**Load with**: `@.claude/filename.md`

---

### Critical Rules

1. Run `bun run type-check` before commits
2. Add new packages to `transpilePackages` in `next.config.ts` + restart server
3. All DB ops in `repositories/` | Server Actions validate auth | Forms use Zod

**Data Flow:** Component → Server Action → Repository → Prisma → DB
**Files:** `actions/` | `repositories/` | `validations/` | `components/`

### Current Focus

Phase 1.5: Public-facing features | Next: Property listings + search

---

### Commands

```bash
bun run dev          # Start
bun run type-check   # Verify TS
cd packages/database && bunx prisma studio  # DB browser
```

### Troubleshooting

**Prisma client not found:** `cd packages/database && bunx prisma generate`
**Package not found:** Check `transpilePackages` in `next.config.ts` + restart server
**Changes not reflected:** `rm -rf apps/web/.next && bun run dev`

### Notes

Supabase: US East (aws-1-us-east-2) | Auth: Middleware `getUser()` | Protected: `/dashboard` | Git: Conventional commits

---

## 🔷 Gemini

This section provides a comprehensive overview of the `inmo-app` project for the Gemini AI agent.

### Project Overview

`inmo-app` is a full-stack monorepo project for a modern real estate platform. It is built using a TypeScript-first approach with a tech stack that includes Next.js, Turborepo, Supabase, and Prisma.

The project is structured as a monorepo with `apps` and `packages`:
-   **`apps/web`**: The main web application, built with Next.js and React. It handles the user interface and client-side logic.
-   **`packages/database`**: A dedicated package for managing the database schema using Prisma. It defines the core data models of the application.
-   **`packages/supabase`**: Contains configurations and clients for interacting with Supabase services (likely for authentication and storage).
-   **`packages/ui`**: A shared component library, likely used across different parts of the application.
-   **`packages/typescript-config`**: Centralized TypeScript configurations for the monorepo.

### Core Technologies

-   **Framework**: Next.js (with Turbopack)
-   **Monorepo**: Turborepo
-   **Language**: TypeScript
-   **Database ORM**: Prisma
-   **Backend-as-a-Service**: Supabase (for Auth, Storage)
-   **Styling**: Tailwind CSS
-   **UI Components**: Radix UI, shadcn/ui (inferred from file structure)
-   **Linting/Formatting**: Biome
-   **Package Manager**: Bun

### Architecture

The application follows a standard full-stack architecture:
1.  **Frontend**: The `apps/web` Next.js application serves the user interface. It uses server components and client components, with dedicated routes for public pages, authentication (`(auth)`), and a user dashboard.
2.  **Backend**: Backend logic is handled through a combination of Next.js API routes, server actions (`apps/web/app/actions`), and Supabase for authentication and database interaction.
3.  **Database**: A PostgreSQL database managed by Prisma. The schema (`packages/database/prisma/schema.prisma`) is comprehensive, defining models for `User`, `Property`, `Appointment`, `Favorite`, and social metrics like `PropertyView` and `PropertyShare`. This indicates a feature-rich platform.

### Building and Running

The project uses `bun` as the package manager and `turbo` for running tasks across the monorepo.

-   **Install Dependencies**:
    ```bash
    bun install
    ```

-   **Run Development Server**:
    *This command starts the Next.js development server for the web app.*
    ```bash
    bun run dev
    ```

-   **Create a Production Build**:
    *This command builds all workspaces, including the web app.*
    ```bash
    bun run build
    ```

-   **Run Production Server**:
    *This command starts the web app from the production build.*
    ```bash
    bun run start
    ```

-   **Linting and Formatting**:
    *The project uses Biome for code quality.*
    ```bash
    # Check for linting errors
    bun run lint

    # Format all files
    bun run format
    ```
-   **Type Checking**:
    *This command runs the TypeScript compiler to check for type errors across the monorepo.*
    ```bash
    bun run type-check
    ```

### Development Conventions

-   **Monorepo Structure**: Code is organized into `apps` and `packages` to promote separation of concerns and code reuse.
-   **Database Management**: Database schema changes are managed through the `schema.prisma` file. After modifying it, the Prisma client must be regenerated. The `postinstall` script handles this automatically, but it can also be run manually within the `packages/database` workspace.
-   **Styling**: Utility-first styling is enforced with Tailwind CSS.
-   **Components**: Reusable UI components are likely located in `packages/ui` and `apps/web/components/ui`.
-   **Authentication**: Authentication is handled via Supabase, with client and server logic likely present in `apps/web/lib/supabase` and `apps/web/lib/auth.ts`.
-   **Environment Variables**: The project uses a `.env.example` file. A `.env` file should be created with the necessary variables, particularly `DATABASE_URL`, `DIRECT_URL` for Prisma, and Supabase credentials.

---

## 📊 Quick Reference

| Task | Claude | Gemini |
|------|--------|--------|
| **Context Loading** | `@.claude/filename.md` | Read from `docs/` |
| **Primary Use** | Interactive development | Code analysis & architecture |
| **Token Limit** | 200K context | Varies |
| **Best for** | Real-time coding, debugging | Planning, documentation |

---

## 🔄 Keeping This Updated

When making architectural changes:
1. Update relevant section (Claude or Gemini)
2. Update Quick Reference if workflow changes
3. Consider if QUICK_START.md needs updating too