# Development Commands & Workflows

## Daily Development Commands

```bash
# Start everything
bun run dev

# Code quality
bun run type-check    # Find TypeScript errors
bun run lint          # Find code issues
bun run format        # Auto-fix formatting

# Database
cd packages/database && bunx prisma studio    # Visual DB browser
cd packages/database && bunx prisma generate  # Regenerate client
cd packages/database && bunx prisma db push   # Quick schema sync (dev only)

# Git
git status            # See what changed
git add -p            # Review changes before committing
git log --oneline -5  # See recent commits
```

---

## Development Workflows

### Phase 1: Initial Development ✅ (COMPLETED)

**Goal**: Get features working quickly without overhead

**What was accomplished:**
- ✅ Authentication (email/password + Google OAuth)
- ✅ Database schema with 5 models + RLS policies
- ✅ Repository Pattern implemented
- ✅ Dashboard layout with role-based access
- ✅ Properties CRUD (create, read, update, delete)
- ✅ Image upload to Supabase Storage
- ✅ Zod validation schemas
- ✅ Server Actions with proper error handling

**Architecture established:**
- Repository Pattern → Server Actions → Components
- Type-safe database operations
- Centralized business logic
- Feature-based folder structure

---

### Phase 1.5: Intermediate Development (You are here)

**Goal**: Build user-facing features with existing architecture patterns

**Current Status:**
- ✅ Backend CRUD operations functional
- ✅ AGENT dashboard working
- ⏳ Public-facing features pending (homepage, listings, search)
- ⏳ CLIENT features pending (favorites, appointments)

**Feature Development Flow** (established pattern):
```bash
# 1. Start dev server
bun run dev

# 2. Follow established architecture:
#    a) Define types in Prisma schema (if needed)
#    b) Create/update Repository in packages/database/src/repositories/
#    c) Create Zod validation schemas in lib/validations/
#    d) Create Server Actions in app/actions/
#    e) Build UI components (reuse existing from packages/ui/)
#    f) Create pages in app/(public)/ or app/dashboard/

# 3. Test manually in browser:
#    - Happy path (main user flow)
#    - Edge cases (empty states, errors, permissions)
#    - Different roles (CLIENT, AGENT, ADMIN)

# 4. Commit with conventional format:
git add <specific-files>
git commit -m "feat(scope): descriptive message"

# 5. Repeat for next feature
```

**Code Organization Rules** (now enforced):
- ✅ Repository Pattern: All DB operations in `packages/database/src/repositories/`
- ✅ Feature-based folders: `components/properties/`, `components/appointments/`
- ✅ Server Actions in `app/actions/` (never in components)
- ✅ Validation schemas in `lib/validations/`
- ✅ Reusable UI in `packages/ui/`, feature-specific UI in `components/`
- ✅ Clear naming: `PropertyForm.tsx`, `PropertyCard.tsx`, `PropertyRepository.ts`

**Quality Checklist** (before each commit):
- [ ] TypeScript has no errors (`bun run type-check`)
- [ ] Code is formatted (`bun run format`)
- [ ] Feature works in browser for all affected roles
- [ ] No `console.log` left behind
- [ ] Repository methods have permission checks
- [ ] Server Actions validate user authentication/authorization
- [ ] Forms use Zod validation schemas

**Next Priorities:**
1. **Public Property Listings** (Homepage + Search)
2. **Favorites System** (CLIENT role)
3. **Appointments System** (CLIENT + AGENT)
4. **Advanced Search & Filters**

---

### Phase 2: Quality & Robustness (Next step after public features)

**Goal**: Add testing, error handling, and production-ready quality

**When to start**: After completing 2-3 public-facing features

**Priorities:**
1. **Testing Infrastructure**:
   - Install Vitest + Playwright
   - Unit tests for repositories
   - Integration tests for Server Actions
   - E2E tests for critical flows (auth, create property)

2. **Error Handling**:
   - Structured logging (Pino)
   - Custom error classes
   - Error boundaries in components
   - Sentry integration for production

3. **Security Hardening**:
   - Rate limiting (Upstash Redis)
   - Input sanitization (DOMPurify)
   - CSRF protection
   - Security headers in next.config.ts

4. **Git Workflow** (if working in team):
   ```bash
   # Feature branches
   git checkout -b feature/favorites-system

   # Work + commit frequently (atomic commits)
   git add <specific-files>
   git commit -m "feat(favorites): add toggle favorite button"

   # Push and create PR
   git push origin feature/favorites-system

   # After review, merge to main
   ```

**Commit Message Format** (conventional commits):
```
feat(scope): add new feature
fix(scope): resolve bug
refactor(scope): improve code structure
docs: update documentation
test(scope): add tests
chore: update dependencies
```

---

### Phase 3: Scaling & Production (Future)

**Goal**: Prepare for production deployment and scale

**When to start**: After Phase 2 is solid (tests passing, error handling in place)

**Adopt these gradually**:

1. **CI/CD Pipeline** (GitHub Actions):
   - Auto-run type-check, lint, build on PRs
   - Run tests (unit + integration)
   - E2E tests on staging environment
   - Auto-deploy to Vercel on merge to main
   - Protection rules (require CI pass before merge)

2. **Pre-commit hooks** (code quality):
   ```bash
   # Install Husky + lint-staged
   bun add -D husky lint-staged
   bunx husky init

   # .husky/pre-commit
   bun run lint-staged
   ```

3. **Observability**:
   - Structured logging in all Server Actions
   - Performance monitoring (Vercel Analytics)
   - Error tracking (Sentry)
   - Database query optimization
   - Slow query alerts

4. **Performance Optimization**:
   - Image optimization pipeline (Sharp, WebP conversion)
   - CDN for static assets
   - ISR for public pages
   - Redis caching for frequent queries
   - Database indexing optimization

---

## Quick Reference: "Where does this code go?"

```
Is it UI?
├─ Generic (Button, Input) → packages/ui/
└─ Feature-specific (PropertyCard) → components/property/

Is it data/logic?
├─ Server Action (mutations) → apps/web/app/actions/
└─ Repository (queries) → packages/database/src/repositories/

Is it a type?
├─ Database-related → packages/database/prisma/schema.prisma
└─ UI-only → apps/web/types/

Is it validation?
└─ Zod schemas → apps/web/lib/validations/

Is it a utility?
├─ Used 2+ places → packages/shared/utils/
└─ Used once → Same file that uses it
```

---

## Code Style & Conventions

- **Prettier**: Single quotes, semicolons, 2-space indentation
- **ESLint**: React 19 best practices, TypeScript strict mode
- **File naming**: kebab-case for files, PascalCase for components
- **Component structure**: Feature-based folders (e.g., `components/property-card/`)
- **Server Actions**: Prefix with action verb (`createProperty`, `updateUser`)
- **Validation**: Zod schemas co-located with Server Actions

---

## Running the Application

```bash
# Run all apps and packages (Turborepo)
bun run dev

# Run only web app
cd apps/web && bun run dev

# Database commands
cd packages/database && bunx prisma studio      # Open Prisma Studio
cd packages/database && bunx prisma migrate dev # Run migrations
cd packages/database && bunx prisma generate    # Generate Prisma Client
```

---

## Building and Linting

```bash
# Build all apps and packages
bun run build

# Lint all code
bun run lint

# Format code
bun run format

# Type check
bun run type-check
```

---

## Testing Strategy (Future)

- **Unit tests**: Vitest for utilities and business logic
- **Integration tests**: Test Server Actions with test database
- **E2E tests**: Playwright for critical user flows (search, create listing)
- **Run tests**: `bun run test`

---

## Deployment

- **Vercel** for Next.js app (automatic previews on PRs)
- **Supabase managed service** for database, auth, storage
- **Environment**: Production, Staging (preview deployments)
- **Database migrations**: Run via Supabase CLI or Prisma Migrate before deploy
