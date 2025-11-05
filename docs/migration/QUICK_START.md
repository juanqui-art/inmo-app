# Quick Start - What Changes You Need to Make

## 🚀 TL;DR

```bash
bun install && bun run dev
```

**That's it to get started!** Everything else is optional improvements.

---

## 📋 Three Levels of Migration

### 🟢 Level 1: Minimal (5 minutes) - **DO THIS FIRST**

```bash
# 1. Install dependencies
bun install

# 2. Restart dev server
bun run dev

# 3. (Optional) Replace one console.error
# In any Server Action, change:
console.error(error)
# to:
import { error as logError } from '@repo/shared/logger';
logError("Action failed", error);
```

**Result:** Your app works + structured logging available

---

### 🟡 Level 2: Recommended (30 minutes) - **DO THIS WEEK**

```typescript
// 1. Add Error Boundaries to critical components
import { ErrorBoundary } from '@/components/error-boundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <PropertyForm />
    </ErrorBoundary>
  );
}

// 2. Replace all console.error with structured logging
import { error, info, warn } from '@repo/shared/logger';

info("User logged in", { userId });
error("Failed to save", err, { propertyId });
```

**Result:** Crash protection + better debugging

---

### 🔴 Level 3: Complete (2-3 hours) - **DO THIS MONTH**

```typescript
// Migrate Server Actions one by one
import { withActionHandler } from '@/lib/action-wrapper';
import { ValidationError, AuthError } from '@repo/shared/errors';

export const myAction = withActionHandler(
  async (input: string, context) => {
    context.logger.info('Processing', { input });

    if (!valid) throw new ValidationError('Invalid input');

    return result;
  },
  { actionName: 'myAction', requireAuth: true }
);
```

**Result:** Automatic error handling + performance tracking + consistent errors

---

## ✅ Quick Checklist

### Today
- [ ] Run `bun install && bun run dev`
- [ ] Test that app still works
- [ ] Read `docs/migration/MIGRATION_GUIDE.md`

### This Week
- [ ] Add Error Boundary to Property Form
- [ ] Add Error Boundary to Map component
- [ ] Replace `console.error` in 2-3 files

### This Month
- [ ] Migrate critical Server Actions
- [ ] Add Error Boundaries throughout
- [ ] Review `docs/ERROR_HANDLING_GUIDE.md`
- [ ] (Optional) Setup Sentry

---

## 🎯 Priority Actions to Migrate

**High Priority (Migrate First):**
1. `createPropertyAction` - ✅ Already done as example!
2. `signupAction`, `loginAction` - Auth is critical
3. `uploadPropertyImagesAction` - File uploads need good errors

**Medium Priority:**
4. `toggleFavoriteAction` - See example in `docs/migration/favorites-example.ts`
5. `createAppointmentAction`
6. `updatePropertyAction`

**Low Priority (Can wait):**
7. Read-only actions (`getUserFavoritesAction`, etc.)
8. Check actions (`checkIfFavoriteAction`)

---

## 🔍 What Files to Look At

**If you want examples:**
- ✅ `apps/web/app/actions/properties.ts` - Already migrated `createPropertyAction`
- ✅ `docs/migration/favorites-example.ts` - Example migration
- ✅ `docs/ERROR_HANDLING_GUIDE.md` - Full usage guide

**If you need help:**
- `docs/migration/MIGRATION_GUIDE.md` - Step-by-step migration
- `apps/web/lib/action-wrapper.ts` - See how wrapper works
- `packages/shared/src/errors/index.ts` - All error types

---

## 💡 Key Concepts

### 1. Structured Logging
```typescript
// ❌ Before
console.log("User created");
console.error(error);

// ✅ After
import { info, error } from '@repo/shared/logger';
info("User created", { userId, email });
error("Failed to create user", err, { email });
```

**Why?** Production logs are searchable, filterable, and have context.

### 2. Typed Errors
```typescript
// ❌ Before
throw new Error("Not found");

// ✅ After
import { NotFoundError } from '@repo/shared/errors';
throw new NotFoundError("Property not found", { propertyId });
```

**Why?** Errors have proper HTTP status codes and context for debugging.

### 3. Error Boundaries
```typescript
// ❌ Before
export default function Page() {
  return <ComplexComponent />;
}

// ✅ After
import { ErrorBoundary } from '@/components/error-boundary';

export default function Page() {
  return (
    <ErrorBoundary>
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

**Why?** One component error won't crash your entire app.

### 4. Action Wrapper
```typescript
// ❌ Before
export async function myAction(input) {
  try {
    // manual auth check
    // manual logging
    // manual error handling
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ✅ After
export const myAction = withActionHandler(
  async (input, context) => {
    context.logger.info('Processing');
    return data;
  },
  { actionName: 'myAction', requireAuth: true }
);
```

**Why?** Automatic auth, logging, error handling, and performance tracking.

---

## ❓ Common Questions

**Q: Will my app break if I don't migrate?**
A: No! Your current code works fine. Migration is for better debugging.

**Q: Do I need to change all Server Actions at once?**
A: No! Migrate one at a time. Old and new patterns work together.

**Q: What if I just want better logs?**
A: Replace `console.error` with `logError` from `@repo/shared/logger`. That's it!

**Q: When should I use Error Boundaries?**
A: Wrap any complex component, form, or page that could crash.

**Q: Do I need Sentry?**
A: No, it's optional. Only for production error monitoring.

---

## 🆘 Need Help?

**Read these in order:**
1. This file (you're here!)
2. `docs/migration/MIGRATION_GUIDE.md` - Detailed migration steps
3. `docs/ERROR_HANDLING_GUIDE.md` - Full usage guide
4. `docs/migration/favorites-example.ts` - Working example

**Still stuck?** Check the "Troubleshooting" section in `MIGRATION_GUIDE.md`

---

## 🎉 You're Ready!

**Start with:**
```bash
bun install && bun run dev
```

**Then gradually add:**
1. Error Boundaries (10 min)
2. Structured logging (30 min)
3. Migrate Server Actions (when you edit them)

**Your code works fine as-is. These are improvements, not requirements!**
