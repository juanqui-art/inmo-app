# Architecture & Patterns

## Monorepo Configuration (CRITICAL)

### Prisma Client Setup

- ✅ Prisma generates client in **root** `node_modules/.prisma/client`
- ✅ Schema output: `../../../node_modules/.prisma/client` (from `packages/database/prisma/`)
- ✅ `@prisma/client` is hoisted to root by Bun workspaces
- ✅ Postinstall hook auto-generates client: `cd packages/database && bun run db:generate`

### Next.js Transpilation (REQUIRED)

- ✅ Internal packages export TypeScript directly (`"main": "./src/index.ts"`)
- ✅ Next.js configured to transpile workspace packages via `transpilePackages`
- ⚠️ **MUST restart dev server when changing `next.config.ts`**
- ⚠️ **MUST add new packages to `transpilePackages` array**

### Troubleshooting

```bash
# Error: "@prisma/client did not initialize yet"
cd packages/database && bunx prisma generate

# Error: "Cannot find module @repo/database"
# Check that package is in transpilePackages in next.config.ts

# Changes in packages/ not reflected
rm -rf apps/web/.next && bun run dev  # Clear Turbopack cache

# Prisma Client types not found
bun install  # Triggers postinstall hook
```

---

## Package Resolution

### How it Works

- Internal packages (`@repo/*`) export TypeScript directly for faster development
- Next.js transpiles workspace packages via `transpilePackages` config
- Dependencies are hoisted to root `node_modules` by Bun (e.g., `@prisma/client`)
- Prisma Client generated in root `node_modules/.prisma/client` (required for hoisted packages)

### Prisma in Monorepo (Important)

- Prisma Client generates to **root** `node_modules/.prisma/client`
- `@prisma/client` package is hoisted to root by Bun workspaces
- Schema output path: `../../../node_modules/.prisma/client` (relative from `packages/database/prisma/`)
- Postinstall hook auto-generates client after `bun install`
- Must run `bunx prisma generate` after schema changes

**Why this configuration:**
```
Flow: @repo/database imports @prisma/client
      ↓
      @prisma/client (hoisted in root node_modules/@prisma/client)
      ↓
      require('.prisma/client')  ← looks in node_modules/.prisma/client
      ↓
      ✅ Generated client in node_modules/.prisma/client (root)
```

If client was in `packages/database/node_modules/.prisma/client`:
- ❌ @prisma/client (root) can't find it
- ❌ Error: "did not initialize yet"

---

## Next.js App Architecture (apps/web)

### Route Groups

- App Router with route groups for organization:
  - `(public)/`: Public routes (home, property listings, property details)
  - `(auth)/`: Auth pages (login, signup)
  - `dashboard/`: Protected routes (dashboard, properties, appointments)
  - `(admin)/`: Admin panel routes (future)

### Data Flow

- Server Actions (`app/actions/`) handle mutations and business logic
- Server Components by default for optimal performance and SEO
- Client Components (`'use client'`) only when needed (interactivity, hooks)
- API Routes (`app/api/`) for webhooks, third-party integrations, or streaming responses

---

## Repository Pattern

### Structure

```
Component → Server Action → Repository → Prisma → Database
```

### Responsibilities

**Component**:
- UI rendering
- User interactions
- Client-side validation
- Optimistic updates

**Server Action**:
- Authentication check
- Input validation (Zod)
- Business logic orchestration
- Call repositories
- Revalidate cache
- Return result to client

**Repository**:
- Database queries
- Permission verification (ownership, role)
- Data transformation
- Complex query logic
- Transaction management

**Prisma**:
- Type-safe database client
- Query builder
- Migrations

### Example: Create Property

```ts
// Component (Client)
'use client'
export function PropertyForm() {
  const handleSubmit = async (formData: FormData) => {
    const result = await createPropertyAction(formData)
    if (result.success) {
      router.push('/dashboard/propiedades')
    }
  }

  return <form action={handleSubmit}>...</form>
}

// Server Action
'use server'
export async function createPropertyAction(formData: FormData) {
  // 1. Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'AGENT') {
    throw new Error('Unauthorized')
  }

  // 2. Validate input
  const validated = propertySchema.parse({
    title: formData.get('title'),
    price: formData.get('price'),
    // ... more fields
  })

  // 3. Call repository
  const property = await propertyRepository.create({
    ...validated,
    agentId: user.id
  })

  // 4. Revalidate cache
  revalidatePath('/dashboard/propiedades')

  return { success: true, data: property }
}

// Repository
export const propertyRepository = {
  async create(data: CreatePropertyInput) {
    // Permission check (optional, already done in Server Action)
    // Complex query logic
    return db.property.create({ data })
  }
}
```

---

## Authentication & Authorization

### Supabase Auth

- Handles authentication (email/password, OAuth providers)
- Proxy (`apps/web/proxy.ts`) protects routes and checks permissions
- Session management via Supabase cookies (server-side)

### Authorization Levels

1. **Route Level** (Middleware):
   - Redirect unauthenticated users to login
   - Redirect CLIENTs from `/dashboard` to home

2. **Server Action Level**:
   - Check user authentication
   - Verify user role (AGENT, ADMIN)

3. **Repository Level**:
   - Verify ownership (user can only edit own resources)
   - Verify permissions (role-based access)

4. **Database Level** (RLS):
   - Row Level Security policies in Supabase
   - Defense in depth

### Example Authorization Flow

```ts
// Middleware: Protect route
export async function middleware(request: NextRequest) {
  const supabase = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role check
  if (user.user_metadata.role === 'CLIENT' && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

// Server Action: Check auth + role
export async function deletePropertyAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== 'AGENT') {
    throw new Error('Unauthorized')
  }

  await propertyRepository.delete(id, user.id)
}

// Repository: Verify ownership
export const propertyRepository = {
  async delete(id: string, userId: string) {
    const property = await db.property.findUnique({ where: { id } })

    if (!property) {
      throw new Error('Property not found')
    }

    if (property.agentId !== userId) {
      throw new Error('Not authorized to delete this property')
    }

    return db.property.delete({ where: { id } })
  }
}

// Database: RLS policy
CREATE POLICY "Agents can delete own properties"
ON properties
FOR DELETE
USING (auth.uid() = agent_id);
```

---

## File Storage

- Supabase Storage for property images, documents, user avatars
- Buckets: properties (public), documents (private), avatars (public)
- Image optimization: Next.js Image component with Supabase loader
- Upload flow: Client → Server Action → Supabase Storage → Database record

---

## 📦 Working with Internal Packages

### Adding a New Internal Package

When creating a new package in `packages/`, follow this checklist:

**1. Create package structure:**
```bash
mkdir -p packages/new-package/src
cd packages/new-package
```

**2. Create `package.json`:**
```json
{
  "name": "@repo/new-package",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    // Add runtime dependencies here
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**3. Create `tsconfig.json`:**
```json
{
  "extends": "@repo/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**4. Create `src/index.ts`:**
```ts
// Export your package's public API
export * from './your-module'
```

**5. Add to Next.js transpilePackages:**
```ts
// apps/web/next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/database',
    '@repo/ui',
    '@repo/new-package'  // ← Add your new package here
  ],
}
```

**6. Install dependencies:**
```bash
bun install  # From project root
```

**7. Restart dev server:**
```bash
bun run dev  # next.config.ts changes require restart
```

### Why TypeScript Exports Work

**Traditional approach (compile to JS):**
```
packages/database/
├── src/index.ts        # Source code
├── dist/index.js       # Compiled output
└── package.json        # "main": "./dist/index.js"

❌ Slow: Must compile before use
❌ Complex: Watch mode, build pipelines
✅ Fast prod builds
✅ Framework agnostic
```

**Our approach (transpilePackages):**
```
packages/database/
├── src/index.ts        # Source code
└── package.json        # "main": "./src/index.ts"

✅ Fast dev: No compile step
✅ Simple: No build tooling needed
✅ Hot reload: Instant changes
❌ Next.js only (Turbopack transpiles)
```

### When to Migrate to Compiled Packages

Consider compiling packages to JavaScript when:

- [ ] You have **>10 internal packages** (transpilation overhead)
- [ ] You're adding **other frameworks** (Remix, Vite, mobile apps)
- [ ] **Build time exceeds 10 seconds** (transpilation slows down)
- [ ] You want to **publish packages to npm**

**Migration path:**
1. Add `build` script to package: `"build": "tsc"`
2. Update `main` to point to `dist`: `"main": "./dist/index.js"`
3. Configure Turborepo pipeline for builds
4. Remove from `transpilePackages`

See [Turborepo docs](https://turbo.build/repo/docs/handbook/package-development) for details.

### Common Issues

**Issue: "Cannot find module @repo/package"**
```bash
# Solution 1: Check transpilePackages
# apps/web/next.config.ts should include the package

# Solution 2: Reinstall dependencies
bun install

# Solution 3: Clear Next.js cache
rm -rf apps/web/.next && bun run dev
```

**Issue: Changes in package not reflected**
```bash
# Solution 1: Clear Turbopack cache
rm -rf apps/web/.next && bun run dev

# Solution 2: Restart dev server
# Ctrl+C, then bun run dev

# Solution 3: Check file is exported
# Verify src/index.ts exports the changed file
```

**Issue: Type errors in package**
```bash
# Check package types
cd packages/your-package && bun run type-check

# Check all packages
bun run type-check  # From root
```

---

## Debugging Monorepo Issues

**Step-by-step troubleshooting:**

```bash
# 1. Verify package resolution
bun pm ls @repo/database
# Should show: @repo/database@workspace:packages/database

# 2. Check if package exports exist
ls -la packages/database/src/index.ts
# Should exist and export { db }

# 3. Verify transpilePackages config
cat apps/web/next.config.ts
# Should include '@repo/database'

# 4. Check Prisma Client generation
ls -la node_modules/.prisma/client
# Should exist with index.d.ts, index.js, etc.

# 5. Test import in Node.js (bypass Next.js)
node -e "const { db } = require('@repo/database'); console.log(typeof db)"
# Should print: object

# 6. Clear all caches
rm -rf apps/web/.next node_modules/.cache
bun install
bun run dev
```

**Common Gotchas:**

1. ✅ **DO**: Add new packages to `transpilePackages` immediately
2. ✅ **DO**: Restart dev server after `next.config.ts` changes
3. ✅ **DO**: Run `bunx prisma generate` after schema changes
4. ❌ **DON'T**: Forget postinstall hook in root `package.json`
5. ❌ **DON'T**: Mix Prisma output paths (always use root)
6. ❌ **DON'T**: Import from `packages/` directly (use `@repo/*`)

---

## Future-Proofing

**When to revisit this setup:**

- [ ] Adding a second app (mobile, admin panel, etc.)
- [ ] Package count grows beyond 10
- [ ] Build time exceeds 10 seconds
- [ ] Want to publish packages to npm
- [ ] Team grows beyond 10 developers

**Migration path to compiled packages:**
1. Start with one stable package (`@repo/ui`)
2. Add build tooling (tsup, esbuild, or tsc)
3. Update Turborepo pipeline
4. Test thoroughly
5. Migrate remaining packages incrementally
