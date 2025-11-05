# Migration Guide - Error Handling & Logging

## 🎯 Summary

This guide explains how to migrate your existing code to use the new error handling and logging infrastructure.

**Good news**: Your current code will continue to work! These changes are optional and can be done gradually.

---

## ✅ Required Changes (Do This First)

### 1. Install dependencies

```bash
bun install
bun run dev
```

That's it! Your app will run normally with the new infrastructure available.

---

## 🔄 Optional Changes (Do These Gradually)

### Level 1: Replace console.error with structured logging (5 minutes)

**Find & Replace in your Server Actions:**

```typescript
// ❌ Before
console.error("[myAction]", error.message);

// ✅ After
import { error as logError } from '@repo/shared/logger';
logError("Action failed", error, { context: 'additional info' });
```

**Files to update:**
- `apps/web/app/actions/favorites.ts` (lines 72, 126, 178)
- `apps/web/app/actions/auth.ts` (line 72)
- `apps/web/app/actions/appointments.ts`
- Any other files with `console.error`

---

### Level 2: Use Error Boundaries in components (10 minutes)

Wrap your critical components with Error Boundaries to prevent crashes:

**Example: Property Form**

```typescript
// apps/web/app/dashboard/propiedades/nueva/page.tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default function NewPropertyPage() {
  return (
    <ErrorBoundary>
      <PropertyForm />
    </ErrorBoundary>
  );
}
```

**Recommended places to add Error Boundaries:**
- Property forms (create/edit)
- Image upload sections
- Map components
- Dashboard pages
- Any complex components

---

### Level 3: Migrate Server Actions (30-60 min per file)

**When to migrate:**
- When you're already editing a Server Action
- For new Server Actions (always use the new pattern)
- For critical actions (auth, payments, data mutations)

**Migration steps:**

1. Import the wrapper and error classes:
```typescript
import { withActionHandler, withFormActionHandler } from '@/lib/action-wrapper';
import { ValidationError, AuthError, NotFoundError } from '@repo/shared/errors';
```

2. Wrap your action:
```typescript
// ❌ Before
export async function myAction(input: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    // ... logic
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong' };
  }
}

// ✅ After
export const myAction = withActionHandler(
  async (input: string, context) => {
    // Auth is automatic with requireAuth option
    const user = await getCurrentUser();
    if (!user) throw new AuthError('Not authenticated');

    context.logger.info('Processing action', { input });

    // ... your logic

    return data; // Return just the data, wrapper handles response format
  },
  {
    actionName: 'myAction',
    requireAuth: true
  }
);
```

3. Update error handling:
```typescript
// Replace returns with throws
// ❌ Before
if (!valid) return { error: 'Invalid input' };

// ✅ After
if (!valid) throw new ValidationError('Invalid input');
```

4. Update component calls (if response format changed):
```typescript
// ❌ Before
const { success, error, data } = await myAction(input);
if (!success) { /* handle error */ }

// ✅ After
const result = await myAction(input);
if (!result.success) {
  // result.error has { message, statusCode, fieldErrors? }
  console.error(result.error.message);
} else {
  // result.data has your return value
  console.log(result.data);
}
```

---

## 📝 Migration Checklist

### Quick Wins (Do Today)
- [ ] `bun install` and restart dev server
- [ ] Replace 1-2 `console.error` with `logError`
- [ ] Add one Error Boundary to a critical component

### This Week
- [ ] Replace all `console.error` with structured logging
- [ ] Add Error Boundaries to all forms
- [ ] Migrate 1-2 critical Server Actions as examples

### This Month
- [ ] Migrate all Server Actions
- [ ] Add Error Boundaries throughout the app
- [ ] Setup Sentry for production monitoring

---

## 🎯 Component-Specific Changes

### 1. Components that call Server Actions

**If you DON'T migrate the Server Action:**
No changes needed! Old format still works.

**If you DO migrate the Server Action:**
Update your component to use the new response format:

```typescript
// ❌ Before
const { success, error, data } = await myAction(input);

// ✅ After
const result = await myAction(input);
if (result.success) {
  // result.data contains your data
} else {
  // result.error contains { message, statusCode, fieldErrors? }
}
```

### 2. Forms using useFormState

**If using the old format:**
```typescript
// No changes needed - still works
export async function oldAction(prevState: unknown, formData: FormData) {
  return { error: { ... } };
}
```

**If migrating to new format:**
```typescript
// Use withFormActionHandler
export const newAction = withFormActionHandler(
  async (formData, context) => {
    // Your logic
    return result;
  },
  { actionName: 'newAction' }
);

// Component usage - same as before!
const [state, formAction] = useFormState(newAction, null);
```

### 3. Critical UI sections

Add Error Boundaries:

```typescript
// Property creation/edit forms
<ErrorBoundary fallback={<div>Error al cargar el formulario</div>}>
  <PropertyForm />
</ErrorBoundary>

// Map components
<ErrorBoundary fallback={<div>Error al cargar el mapa</div>}>
  <MapView />
</ErrorBoundary>

// Image uploads
<ErrorBoundary>
  <ImageUploadSection />
</ErrorBoundary>
```

---

## 📊 Before & After Examples

### Example 1: favorites.ts

**Before (current code):**
```typescript
export async function toggleFavoriteAction(propertyId: string) {
  try {
    const validatedData = favoriteSchema.parse({ propertyId });
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const favoriteRepository = new FavoriteRepository();
    const result = await favoriteRepository.toggleFavorite(
      user.id,
      validatedData.propertyId
    );

    revalidatePath("/mapa");
    revalidatePath("/favoritos");

    return { success: true, isFavorite: result.isFavorite };
  } catch (error) {
    console.error("[toggleFavoriteAction]", error.message);
    return { success: false, error: "Failed to toggle favorite" };
  }
}
```

**After (with new system):**
```typescript
import { withActionHandler } from '@/lib/action-wrapper';
import { ValidationError, AuthError } from '@repo/shared/errors';

export const toggleFavoriteAction = withActionHandler(
  async (propertyId: string, context) => {
    // Validation
    const result = favoriteSchema.safeParse({ propertyId });
    if (!result.success) {
      throw new ValidationError("Invalid property ID", {
        fieldErrors: result.error.flatten().fieldErrors
      });
    }

    // Auth (automatic with requireAuth option, but explicit check for clarity)
    const user = await getCurrentUser();
    if (!user) throw new AuthError("Authentication required");

    // Log with context
    context.logger.info("Toggling favorite", {
      userId: user.id,
      propertyId: result.data.propertyId
    });

    // Business logic
    const favoriteRepository = new FavoriteRepository();
    const toggleResult = await favoriteRepository.toggleFavorite(
      user.id,
      result.data.propertyId
    );

    // Cache invalidation
    revalidatePath("/mapa");
    revalidatePath("/favoritos");

    // Return just the data - wrapper handles success format
    return { isFavorite: toggleResult.isFavorite };
  },
  {
    actionName: 'toggleFavorite',
    requireAuth: true
  }
);
```

**Component usage:**
```typescript
// Both old and new format work the same way!
const result = await toggleFavoriteAction(propertyId);

if (result.success) {
  console.log(result.data.isFavorite);
} else {
  console.error(result.error.message);
}
```

### Example 2: Adding Error Boundary to a page

**Before:**
```typescript
// app/dashboard/propiedades/nueva/page.tsx
export default function NewPropertyPage() {
  return <PropertyForm />;
}
```

**After:**
```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function NewPropertyPage() {
  return (
    <ErrorBoundary>
      <PropertyForm />
    </ErrorBoundary>
  );
}
```

---

## ❓ FAQs

### Q: Do I need to migrate everything now?
**A:** No! Only `bun install` is required. Everything else is optional and can be done gradually.

### Q: Will my existing code break?
**A:** No, your existing Server Actions will continue to work exactly as before.

### Q: When should I migrate a Server Action?
**A:**
- When you're already editing it
- For new actions (always use the new pattern)
- For critical actions that need better debugging

### Q: What's the benefit of migrating?
**A:**
- Better error messages in production
- Automatic request tracking
- Performance monitoring
- Consistent error format
- Better debugging with structured logs

### Q: Do I need Sentry?
**A:** No, it's optional. The logging works fine without it. Sentry is only for production monitoring.

### Q: Can I use both old and new patterns together?
**A:** Yes! You can migrate actions one at a time.

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@repo/shared'"

**Solution:**
```bash
bun install
bun run dev
```

Make sure `apps/web/next.config.ts` includes:
```typescript
transpilePackages: [
  "@repo/shared",  // ← Make sure this is here
  // ... other packages
],
```

### TypeScript errors after migration

**Solution:**
Run type-check to see all errors:
```bash
bun run type-check
```

Common issues:
- Missing imports: `import { ValidationError } from '@repo/shared/errors'`
- Wrong response format: Make sure you're returning data, not `{ success, data }`
- Missing context parameter: Wrapped actions receive `(input, context)` not just `(input)`

### Logs not appearing

**Solution:**
Set environment variable:
```env
LOG_LEVEL=debug
```

In development, logs are pretty-printed to console.
In production, logs are JSON format for parsing.

---

## 📚 Additional Resources

- **Full Guide**: `docs/ERROR_HANDLING_GUIDE.md`
- **Sentry Setup**: `docs/setup/SENTRY_SETUP.md`
- **Example Migration**: `docs/migration/favorites-example.ts`
- **Technical Debt Plan**: `.claude/07-technical-debt.md`

---

## 🎉 Summary

**Required (5 minutes):**
```bash
bun install && bun run dev
```

**Recommended (when you have time):**
1. Replace `console.error` → structured logging
2. Add Error Boundaries to critical components
3. Migrate Server Actions one at a time

**Everything else can wait!** Your code works fine as-is. These are improvements for better debugging and production monitoring.
