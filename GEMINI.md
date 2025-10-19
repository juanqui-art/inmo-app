# InmoApp Gemini Context

This document provides a comprehensive overview of the InmoApp project, designed to be used as a context file for Google Gemini.

## Project Overview

InmoApp is a modern real estate platform built with a monorepo architecture using Turborepo.

- **Frontend:** The frontend is a Next.js 15 application located in `apps/web`. It uses React 19, Tailwind CSS, and Radix UI.
- **Backend:** The backend is powered by Supabase for authentication and storage, with a PostgreSQL database.
- **Database ORM:** Prisma is used as the ORM to interact with the database. The Prisma schema is located in `packages/database/prisma`.
- **Monorepo:** The project is a monorepo managed by Turborepo. The `apps` directory contains the web application, and the `packages` directory contains shared code, such as database access, UI components, and TypeScript configurations.

## Building and Running

The project uses `bun` as the package manager.

- **Install Dependencies:**
  ```bash
  bun install
  ```

- **Run Development Server:**
  ```bash
  bun run dev
  ```
  This will start the Next.js development server on `http://localhost:3000`.

- **Build for Production:**
  ```bash
  bun run build
  ```

- **Run Production Server:**
  ```bash
  bun run start
  ```

- **Linting and Formatting:**
  ```bash
  bun run lint
  bun run format
  ```

- **Type Checking:**
  ```bash
  bun run type-check
  ```

- **Testing:**
  ```bash
  bun run test
  ```

- **Database:**
  - **Generate Prisma Client:**
    ```bash
    cd packages/database && bunx prisma generate
    ```
  - **Open Prisma Studio:**
    ```bash
    cd packages/database && bunx prisma studio
    ```

## Development Conventions

- **Coding Style:** The project uses Biome for linting and formatting. Run `bun run lint` and `bun run format` to ensure code quality.
- **Architecture:**
  - The data flow is: `Component → Server Action → Repository → Prisma → Database`.
  - Server Components are used by default.
  - The Repository Pattern is used for data access.
  - Zod is used for validation.
- **Commits:** Use conventional commits.
- **Environment Variables:** A template for environment variables is available in `.env.example`. Copy this to `.env` and fill in the required values.
