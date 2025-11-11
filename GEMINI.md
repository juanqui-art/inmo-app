# InmoApp Gemini Context

This document provides essential context for the InmoApp project, tailored for the Gemini AI assistant.

---

## 1. Project Overview

**InmoApp** is a modern, full-stack real estate platform. It's built as a monorepo using **Turborepo** and **Bun** as the package manager.

The primary application is a **Next.js 16** web app located in `apps/web`. The backend is powered by **Supabase** for authentication and storage, with a **PostgreSQL** database managed by the **Prisma ORM**.

### Key Technologies:

- **Monorepo:** Turborepo
- **Package Manager:** Bun
- **Web Framework:** Next.js 16 (with App Router)
- **UI:** React 19, Tailwind CSS v4, Radix UI, Shadcn/ui (inferred from `components.json`)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Backend Services:** Supabase (Auth, Storage)
- **Code Quality:** Biome (Linting & Formatting), TypeScript
- **Testing:** Vitest

---

## 2. Project Structure

The project is organized into `apps` and `packages`:

```
/
├── apps/
│   └── web/         # Main Next.js application
│       ├── app/     # Next.js App Router (pages, layouts, server actions)
│       ├── components/ # UI Components
│       └── lib/      # Utility functions and libraries
│
├── packages/
│   ├── database/    # Prisma schema, client, and repository logic
│   ├── ui/          # Shared React UI components
│   ├── supabase/    # Supabase client configuration
│   ├── env/         # Environment variable validation
│   └── typescript-config/ # Shared tsconfig files
│
├── docs/            # Project documentation
└── scripts/         # Utility scripts
```

---

## 3. Getting Started & Key Commands

The project uses **Bun** for package management and script execution.

### Setup:

1.  **Install dependencies:**
    ```bash
    bun install
    ```
2.  **Set up environment variables:**
    - Copy `.env.example` to `.env` and fill in the required values (Supabase, Database URL, etc.).
    - The `postinstall` script automatically runs `prisma generate`.

### Core Commands (run from the root directory):

-   **`bun run dev`**: Starts the development server for the web app. This is the primary command for development. It automatically handles Prisma client generation.
-   **`bun run build`**: Creates a production build of all applications and packages.
-   **`bun run lint`**: Checks the entire codebase for linting errors using Biome.
-   **`bun run type-check`**: Runs the TypeScript compiler to check for type errors.
-   **`bun run test`**: Executes the test suite using Vitest.

### Database Commands:

Database-related commands are typically run from the `packages/database` directory.

-   **`cd packages/database && bunx prisma generate`**: Manually generates the Prisma client.
-   **`cd packages/database && bunx prisma migrate dev`**: Runs database migrations.
-   **`cd packages/database && bunx prisma studio`**: Opens the Prisma Studio to view and edit data.

---

## 4. Development Conventions

-   **Code Style:** Code is formatted and linted by **Biome**. Configuration is in `biome.json`.
-   **Monorepo Management:** **Turborepo** orchestrates tasks. The pipeline is defined in `turbo.json`.
-   **Data Access:** The backend uses a **Repository Pattern** for database interactions, abstracting Prisma queries.
-   **State Management:** Zustand is used for client-side state management.
-   **Components:** The project heavily favors **React Server Components (RSCs)**. Client components (`"use client"`) are used only when necessary (e.g., for hooks and event listeners).
-   **Environment Variables:** Type-safe environment variables are managed via the `@repo/env` package. A list of environment variables passed through by Turbo is in `turbo.json`.

---

## 5. AI Assistant Guidelines

-   When asked to add or modify features, first inspect the existing code in `apps/web` and `packages/*` to understand the current implementation.
-   Adhere to the existing coding style, which is enforced by Biome.
-   For database changes, modify the `packages/database/prisma/schema.prisma` file and remember to generate the client.
-   When adding new dependencies, use `bun add -W <package>` for root dependencies or `bun add <package>` in the specific workspace.
-   Consult the extensive documentation in the `/docs` directory for deeper insights into architecture, features, and decisions.
