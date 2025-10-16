# InmoApp

Modern real estate platform built with Next.js 15, Supabase, and Turborepo.

---

## 📚 Quick Links

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[AI Assistants Guide](./docs/AI_ASSISTANTS.md)** - Context for Claude & Gemini
- **[Token Optimization](./docs/TOKEN_OPTIMIZATION.md)** - Reduce AI context usage
- **[Setup Guides](./docs/setup/)** - Configuration & troubleshooting
- **[MCP Integration](./docs/mcp/)** - Model Context Protocol

---

## 🚀 Getting Started

### Prerequisites

- **Bun** (package manager)
- **Supabase** account
- **PostgreSQL** database

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials

# Generate Prisma client
cd packages/database && bunx prisma generate

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📁 Project Structure

```
inmo-app/
├── apps/
│   └── web/                 # Next.js application
│       ├── app/             # App router
│       ├── components/      # React components
│       └── lib/             # Utilities
├── packages/
│   ├── database/           # Prisma schema & repositories
│   ├── supabase/           # Supabase clients
│   ├── ui/                 # Shared UI components
│   └── typescript-config/  # Shared TS configs
└── docs/                   # Documentation
    ├── AI_ASSISTANTS.md    # AI context
    ├── TOKEN_OPTIMIZATION.md
    ├── setup/              # Setup guides
    └── mcp/                # MCP integration
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (React 19, App Router)
- **Tailwind CSS** (Styling)
- **Radix UI** (Accessible components)

### Backend
- **Supabase** (Auth & Storage)
- **Prisma** (Database ORM)
- **PostgreSQL** (Database)

### Tooling
- **Turborepo** (Monorepo)
- **Biome** (Linting & Formatting)
- **TypeScript** (Type Safety)
- **Vitest** (Testing)

---

## 📝 Available Commands

```bash
# Development
bun run dev          # Start dev server
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Lint with Biome
bun run type-check   # TypeScript check
bun run format       # Format code
bun run test         # Run tests
bun run test:ui      # Test UI

# Database
cd packages/database && bunx prisma studio  # DB browser
cd packages/database && bunx prisma generate # Generate client
```

---

## 🗂️ Documentation

### For Developers
- **[Quick Start](./QUICK_START.md)** - Onboarding guide
- **[Setup: Prisma Pooler](./docs/setup/PRISMA_POOLER.md)** - Connection pooling
- **[Setup: Restart Server](./docs/setup/RESTART_SERVER.md)** - Dev server issues

### For AI Assistants
- **[AI Assistants Guide](./docs/AI_ASSISTANTS.md)** - Claude & Gemini context
- **[Token Optimization](./docs/TOKEN_OPTIMIZATION.md)** - Reduce context size

### For MCP Integration
- **[MCP README](./docs/mcp/README.md)** - Overview
- **[MCP Setup](./docs/mcp/SETUP.md)** - Installation guide
- **[MCP Guide](./docs/mcp/GUIDE.md)** - Complete guide
- **[MCP Quick Reference](./docs/mcp/QUICK_REFERENCE.md)** - Cheatsheet

---

## 🏗️ Architecture

### Data Flow
```
Component → Server Action → Repository → Prisma → Database
```

### Key Patterns
- **Server Components** by default (use Client only when needed)
- **Repository Pattern** for data access
- **Zod** for validation
- **Type-safe environment variables**

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `turbo.json` | Turborepo config |
| `biome.json` | Linter/formatter |
| `package.json` | Root dependencies |
| `.env.example` | Environment template |
| `.claudeignore` | AI context exclusions |

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `bun run type-check`
4. Commit with conventional commits
5. Create a pull request

---

## 🐛 Troubleshooting

### Prisma client not found
```bash
cd packages/database && bunx prisma generate
```

### Package not found
1. Check `transpilePackages` in `next.config.ts`
2. Restart dev server

### Changes not reflected
```bash
rm -rf apps/web/.next && bun run dev
```

More help: [Setup Guides](./docs/setup/)

---

## 📄 License

Private project - All rights reserved

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)