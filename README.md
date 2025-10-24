# InmoApp

Modern real estate platform built with Next.js 15, Supabase, and Turborepo.

---

## 📚 Quick Links

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Claude Context](./CLAUDE.md)** - Auto-loaded context for Claude Code
- **[AI Assistants Guide](./docs/AI_ASSISTANTS.md)** - Complete guide for Claude & Gemini
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
├── 📄 ROOT DOCUMENTATION (Entry Points)
│   ├── README.md            # Este archivo
│   ├── CLAUDE.md            # Auto-loaded Claude context
│   ├── GEMINI.md            # Auto-loaded Gemini context
│   ├── QUICK_START.md       # 5-minute onboarding
│   ├── WARP.md              # Symlink to CLAUDE.md
│   └── WORKTREES_CHEATSHEET.md
│
├── apps/
│   └── web/                 # Next.js application
│       ├── app/             # App router (pages & layouts)
│       ├── components/      # React components
│       └── lib/             # Utilities & helpers
│
├── packages/
│   ├── database/            # Prisma schema & repositories
│   ├── supabase/            # Supabase clients
│   ├── ui/                  # Shared UI components
│   ├── env/                 # Environment variables validation
│   └── typescript-config/   # Shared TypeScript configs
│
└── docs/                    # 📚 COMPREHENSIVE DOCUMENTATION
    ├── INDEX.md             # Documentation hub & navigation
    ├── README.md            # Docs overview
    ├── DOCUMENTATION.md     # How to write docs
    ├── QUICK_REFERENCE.md   # Quick command reference
    │
    ├── 🚀 GETTING STARTED
    │   ├── DEVELOPMENT_SETUP.md
    │   ├── ENV_QUICK_START.md
    │   ├── project-structure.md
    │   └── ENVIRONMENT_VARIABLES.md
    │
    ├── 🛠️ BUILD TOOLS
    │   ├── TURBOREPO_GUIDE.md
    │   ├── TURBOREPO_CHEATSHEET.md
    │   ├── BIOME_EXPLAINED.md
    │   ├── BIOME_IMPROVEMENTS.md
    │   ├── WEBSTORM_BIOME_SETUP.md
    │   └── WEBSTORM_FORMAT_ISSUE.md
    │
    ├── 💾 CACHING & OPTIMIZATION
    │   ├── caching/
    │   │   ├── CACHE_COMPONENTS_GUIDE.md
    │   │   ├── CACHE_IMPLEMENTATION_REVISED.md
    │   │   ├── CACHE_IMPLEMENTATION_SUMMARY.md
    │   │   └── CACHE_QUICK_START.md
    │   ├── CACHE_STRATEGY.md
    │   └── NEXTJS_CACHING_EXPLAINED.md
    │
    ├── 🗺️ MAP & CLUSTERING
    │   ├── CLUSTERING_GUIDE.md
    │   ├── CLUSTERING_AND_BOUNDS_QUICK_REFERENCE.md
    │   ├── CLUSTERING_EXERCISES.md
    │   ├── GLASSMORPHISM_CLUSTERING_GUIDE.md
    │   ├── MAP_BOUNDS_URL_GUIDE.md
    │   └── troubleshooting/MAP_ISSUES.md
    │
    ├── 🐛 DEBUGGING
    │   ├── DEBUGGING_HOOKS_GUIDE.md
    │   ├── REACT_HOOKS_ANTIPATTERNS.md
    │   ├── INFINITE_LOOP_DEEP_DIVE.md
    │   ├── INFINITE_LOOP_VISUAL_GUIDE.md
    │   ├── INFINITE_LOOP_QUICK_REFERENCE.md
    │   └── INFINITE_LOOP_DOCS_INDEX.md
    │
    ├── 🎨 DESIGN & FEATURES
    │   ├── design/
    │   │   ├── COLOR_PALETTE.md
    │   │   ├── DARK_MODE.md
    │   │   └── GLASSMORPHISM_IMPLEMENTATION_SUMMARY.md
    │   ├── features/MAP.md
    │   └── map-features-roadmap.md
    │
    ├── 📊 PROGRESS & DECISIONS
    │   ├── progress/ROADMAP.md
    │   └── decisions/
    │       ├── CLUSTERING_SOLUTION.md
    │       └── MAP_BOUNDS_CALCULATION.md
    │
    ├── 🤖 AI & DEVELOPMENT
    │   ├── AI_ASSISTANTS.md
    │   ├── TOKEN_OPTIMIZATION.md
    │   ├── ai-search-implementation.md
    │   └── development-tasks-guide.md
    │
    ├── 🔧 GIT & WORKFLOW
    │   ├── git/WORKTREES_CHEATSHEET.md
    │   ├── git-worktrees-guide.md
    │   └── node-modules-explained.md
    │
    ├── 📚 REFERENCE
    │   ├── references/
    │   ├── technical/
    │   └── NEXTJS_2025_UPDATES.md
    │
    ├── 📖 GUIDES
    │   ├── guides-web/
    │   │   ├── ADDING_FEATURES.md
    │   │   └── TESTING.md
    │   └── setup/               # Setup & configuration
    │
    └── 🔌 MCP
        └── mcp/                 # Model Context Protocol
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