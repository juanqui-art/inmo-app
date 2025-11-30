# Test Suite Status - InmoApp

**Last Updated:** November 29, 2025
**Overall Status:** ✅ **87.5% Passing** (140/160 tests)

---

## Executive Summary

The test suite is **functional** and running correctly with Vitest. The previous issue was caused by using Bun's test runner instead of Vitest.

**Key Finding:** Always run `bunx vitest run` from `apps/web` directory, NOT `bun test` from root.

---

## Test Results

### Current Statistics

```
Test Files:  5 passed, 3 failed (8 total)
Tests:       140 passed, 20 failed (160 total)
Success Rate: 87.5%
Duration:    885ms
```

### Passing Test Files ✅

1. **Auth Helpers** - 100% passing
   - File: `lib/__tests__/auth-helpers.test.ts`
   - Tests: All getCurrentUser(), requireAuth(), requireRole(), etc.

2. **Auth Actions** - 100% passing
   - File: `app/actions/__tests__/auth.test.ts`
   - Tests: signupAction, loginAction, logoutAction

3. **Favorites Actions** - 100% passing
   - File: `app/actions/__tests__/favorites.test.ts`
   - Tests: addFavorite, removeFavorite, getFavorites

4. **Appointments Actions** - 100% passing
   - File: `app/actions/__tests__/appointments.test.ts`
   - Tests: createAppointment, updateAppointment, etc.

5. **Utilities** - 100% passing
   - File: Various utility test files
   - Tests: URL helpers, validations, formatters

### Failing Test Files ❌

1. **Property Actions** - 20 failures
   - File: `app/actions/__tests__/properties.test.ts`
   - Issue: `@repo/database` mock not returning `db` export
   - Impact: createPropertyAction tests failing

2. **Property Repository** - Some failures
   - File: `packages/database/src/__tests__/property-repository.test.ts`
   - Issue: Same mocking issue with `vi.mocked()`

3. **Property Limits** - Some failures
   - File: `lib/__tests__/property-limits.test.ts`
   - Issue: Same mocking issue

---

## Root Cause Analysis

### Issue 1: Wrong Test Runner

**Problem:**
```bash
# ❌ WRONG - Uses Bun's built-in test runner
bun test

# Output: "vi.mocked is not a function"
```

**Solution:**
```bash
# ✅ CORRECT - Uses Vitest
cd apps/web && bunx vitest run

# Output: 140/160 tests passing
```

**Why?**
- Bun has its own test runner (incompatible with Vitest syntax)
- Project uses Vitest, but `bun test` bypasses it
- Always use `bunx vitest` to ensure correct runner

---

### Issue 2: Database Mock Export

**Problem:**
```typescript
// ❌ Current mock (incomplete)
vi.mock("@repo/database", () => ({
  propertyRepository: {
    create: vi.fn(),
  },
}));

// ❌ Missing db export
const mockDb = vi.mocked(db.user.findUnique); // Error: No "db" export
```

**Error Message:**
```
No "db" export is defined on the "@repo/database" mock.
Did you forget to return it from "vi.mock"?
```

**Solution:**
```typescript
// ✅ Complete mock (with db export)
vi.mock("@repo/database", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      // ...other methods
    },
    property: {
      create: vi.fn(),
      count: vi.fn(),
      // ...other methods
    },
  },
  propertyRepository: {
    create: vi.fn(),
  },
}));
```

**Affected Files:**
- `app/actions/__tests__/properties.test.ts` (20 failing tests)
- `packages/database/src/__tests__/property-repository.test.ts`
- `lib/__tests__/property-limits.test.ts`

---

## How to Run Tests

### Recommended Commands

```bash
# Run all tests (from apps/web)
cd apps/web && bunx vitest run

# Run in watch mode (development)
cd apps/web && bunx vitest

# Run with UI (interactive)
cd apps/web && bunx vitest --ui

# Run with coverage
cd apps/web && bunx vitest run --coverage

# Run specific test file
cd apps/web && bunx vitest run app/actions/__tests__/auth.test.ts
```

### Common Mistakes

```bash
# ❌ DON'T: Run from root with bun test
cd /path/to/inmo-app
bun test
# Result: Bun's test runner (incompatible)

# ❌ DON'T: Use bun test from apps/web
cd apps/web
bun test
# Result: Still uses Bun's runner

# ✅ DO: Use bunx vitest
cd apps/web
bunx vitest run
# Result: Correct Vitest runner (140/160 passing)
```

---

## Next Steps to 100% Passing

### Priority 1: Fix Database Mocks (High Impact)

**Task:** Update @repo/database mocks to include `db` export

**Files to Modify:**
1. `apps/web/app/actions/__tests__/properties.test.ts`
2. `packages/database/src/__tests__/property-repository.test.ts`
3. `apps/web/lib/__tests__/property-limits.test.ts`

**Implementation:**
```typescript
// Add to each failing test file:
vi.mock("@repo/database", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    property: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    propertyImage: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  propertyRepository: {
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
  },
  userRepository: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));
```

**Expected Impact:** 20 failing tests → 0 failing tests (100% passing)

**Estimated Time:** 1-2 hours

---

### Priority 2: Add Missing Test Coverage

**Current Coverage:** ~15-20% (estimated)
**Target Coverage:** 25% (Fase 2 goal)

**Areas Needing Tests:**
1. Repository layer (FavoriteRepository, AppointmentRepository, UserRepository)
2. Edge cases in Server Actions
3. Error boundary components
4. Validation schemas

---

## CI/CD Integration

### GitHub Actions Configuration

**File:** `.github/workflows/test.yml` (to be created)

```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Generate Prisma Client
        run: bun run db:gen

      - name: Run tests
        run: cd apps/web && bunx vitest run

      - name: Check coverage threshold
        run: cd apps/web && bunx vitest run --coverage --coverage.thresholds.lines=25
```

**Benefits:**
- ✅ Automatic test runs on every PR
- ✅ Block merges if tests fail
- ✅ Enforce coverage threshold (25%)
- ✅ Catch regressions early

---

## Testing Best Practices

### 1. Always Use Vitest Runner

```bash
# ✅ Correct
bunx vitest run

# ❌ Wrong
bun test
```

### 2. Mock External Dependencies

```typescript
// ✅ Complete mock
vi.mock("@repo/database", () => ({
  db: { /* all methods */ },
  propertyRepository: { /* all methods */ },
}));

// ❌ Incomplete mock (will fail)
vi.mock("@repo/database", () => ({
  propertyRepository: { /* only repository */ },
}));
```

### 3. Test Isolation

```typescript
// ✅ Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// ❌ No cleanup (tests affect each other)
```

### 4. Meaningful Assertions

```typescript
// ✅ Specific assertions
expect(mockCreate).toHaveBeenCalledWith(
  expect.objectContaining({
    title: "Casa en venta",
    price: 150000,
  }),
  "user-id"
);

// ❌ Vague assertions
expect(mockCreate).toHaveBeenCalled();
```

---

## Test File Organization

```
apps/web/
├── app/
│   └── actions/
│       └── __tests__/
│           ├── auth.test.ts          ✅ Passing
│           ├── appointments.test.ts  ✅ Passing
│           ├── favorites.test.ts     ✅ Passing
│           └── properties.test.ts    ❌ 20 failures
├── lib/
│   └── __tests__/
│       ├── auth-helpers.test.ts      ✅ Passing
│       └── property-limits.test.ts   ❌ Some failures
└── vitest.config.ts
└── vitest.setup.ts

packages/database/
└── src/
    └── __tests__/
        └── property-repository.test.ts  ❌ Some failures
```

---

## Performance Metrics

```
Transform:    764ms  (TypeScript compilation)
Setup:        1.11s  (Test environment initialization)
Collect:      932ms  (Test file discovery)
Tests:        89ms   (Actual test execution)
Environment:  3.12s  (Happy-DOM setup)
Total:        885ms  (Wall clock time)
```

**Analysis:**
- ✅ Fast execution (< 1 second)
- ✅ Good for CI/CD (quick feedback)
- ✅ Suitable for watch mode (development)

---

## Troubleshooting

### Problem: "vi.mocked is not a function"

**Solution:** You're using Bun's test runner instead of Vitest

```bash
# Fix: Use bunx vitest
cd apps/web && bunx vitest run
```

---

### Problem: "No db export defined"

**Solution:** Mock is incomplete, add `db` export

```typescript
vi.mock("@repo/database", () => ({
  db: {
    user: { findUnique: vi.fn() },
    property: { create: vi.fn() },
  },
  // ... other exports
}));
```

---

### Problem: Tests pass locally but fail in CI

**Solution:** Ensure Prisma client is generated before running tests

```bash
# In CI/CD pipeline
bun run db:gen
cd apps/web && bunx vitest run
```

---

## Related Documentation

- `/docs/ROADMAP.md` - Fase 2 testing goals (25% coverage)
- `/apps/web/vitest.config.ts` - Vitest configuration
- `/apps/web/vitest.setup.ts` - Global test setup
- `/docs/technical-debt/07-TESTING.md` - Testing roadmap

---

## Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Tests Passing** | 140/160 | ✅ 87.5% |
| **Test Runner** | Vitest 4.0.8 | ✅ Working |
| **Prisma Generation** | Working | ✅ No issues |
| **Known Issues** | Database mock incomplete | ⚠️ Fixable |
| **Estimated Fix Time** | 1-2 hours | ⏳ Priority 1 |

**Conclusion:** Test suite is **functional and healthy**. The 20 failing tests are due to a fixable mocking issue, not fundamental problems. With 1-2 hours of work, we can achieve 100% passing tests.

---

**Last Updated:** November 29, 2025
**Next Review:** After fixing database mocks
**Target:** 100% passing (160/160 tests)
