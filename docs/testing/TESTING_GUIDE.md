# Testing Guide

**Last Updated:** November 16, 2025

## Overview

This guide covers testing practices, infrastructure, and examples for the InmoApp project. We use **Vitest** as our testing framework across the monorepo.

## Table of Contents

- [Testing Infrastructure](#testing-infrastructure)
- [Running Tests](#running-tests)
- [PropertyRepository Tests](#propertyrepository-tests)
- [Writing New Tests](#writing-new-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Testing Infrastructure

### Frameworks & Tools

- **Vitest** v4.0.8 - Fast unit test framework
- **@testing-library/react** v16.3.0 - React component testing utilities
- **@testing-library/jest-dom** v6.9.1 - Custom matchers for DOM testing
- **happy-dom** v20.0.2 - Lightweight DOM implementation for tests

### Test Locations

```
apps/web/
├── lib/validations/__tests__/     # Zod schema validation tests
├── lib/utils/__tests__/            # Utility function tests
└── vitest.config.ts                # Vitest configuration

packages/database/
├── src/__tests__/                  # Repository tests
│   ├── helpers/                    # Test utilities
│   │   ├── db-mock.ts             # Database mocking helpers
│   │   └── fixtures.ts            # Test data fixtures
│   └── property-repository.test.ts # PropertyRepository tests
└── vitest.config.ts                # Vitest configuration
```

---

## Running Tests

### All Tests

```bash
# From root - Run tests in apps/web
cd apps/web
bun run test              # Watch mode
bun run test:run          # Run once
bun run test:coverage     # With coverage report

# Run PropertyRepository tests
cd packages/database
bun run test              # Watch mode
bun run test:run          # Run once
bun run test:coverage     # With coverage report
```

### Specific Test Files

```bash
# Run a specific test file
bunx vitest run path/to/test.test.ts

# Run tests matching a pattern
bunx vitest run --grep "PropertyRepository"

# Run in watch mode for TDD
bunx vitest --watch
```

### With Coverage

```bash
bun run test:coverage

# Coverage reports are generated in:
# - apps/web/coverage/
# - packages/database/coverage/
```

---

## PropertyRepository Tests

### What's Tested

The PropertyRepository tests cover the three core mutation methods with comprehensive authorization checks:

#### ✅ `create()` Method
- ✅ Creates property when user is AGENT
- ✅ Creates property when user is ADMIN
- ✅ Rejects creation when user is CLIENT
- ✅ Rejects creation when user doesn't exist
- ✅ Prevents agentId spoofing (security test)

#### ✅ `update()` Method
- ✅ Updates property when user is owner
- ✅ Updates property when user is ADMIN (even if not owner)
- ✅ Rejects update when user is different AGENT
- ✅ Rejects update when user is CLIENT
- ✅ Rejects update when property doesn't exist

#### ✅ `delete()` Method
- ✅ Deletes property when user is owner
- ✅ Deletes property when user is ADMIN (even if not owner)
- ✅ Rejects delete when user is different AGENT
- ✅ Rejects delete when user is CLIENT
- ✅ Rejects delete when property doesn't exist

### Test Coverage: 100%

All 15 tests passing ✅

```
Test Files  1 passed (1)
     Tests  15 passed (15)
  Duration  623ms
```

### Test Architecture

```typescript
// 1. Mock database client (hoisted to top)
vi.mock('../client', () => ({
  db: { /* mock methods */ }
}))

// 2. Import modules after mocking
import { PropertyRepository } from '../repositories/properties'
import { db } from '../client'

// 3. Use test fixtures
import { mockUsers, validPropertyData } from './helpers/fixtures'

// 4. Setup transaction mocks
const mockTx = {
  user: { findUnique: vi.fn().mockResolvedValue(mockUsers.agent) },
  property: { create: vi.fn().mockResolvedValue(mockPropertyWithRelations) }
}

vi.mocked(db.$transaction).mockImplementation(async (callback) => {
  return callback(mockTx)
})

// 5. Test the method
const result = await repository.create(validPropertyData, mockUsers.agent.id)

// 6. Assert expectations
expect(mockTx.user.findUnique).toHaveBeenCalledWith(...)
expect(result).toEqual(mockPropertyWithRelations)
```

---

## Writing New Tests

### 1. Create Test File

```typescript
// packages/database/src/__tests__/my-repository.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock database BEFORE imports
vi.mock('../client', () => ({
  db: {
    myModel: {
      findUnique: vi.fn(),
      create: vi.fn(),
      // ... other methods
    },
    $transaction: vi.fn(),
  },
}))

// Import after mocking
import { MyRepository } from '../repositories/my-repository'
import { db } from '../client'

describe('MyRepository', () => {
  let repository: MyRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MyRepository()
  })

  it('should do something', async () => {
    // Arrange: Setup mocks
    const mockResult = { id: '123', name: 'Test' }
    vi.mocked(db.myModel.findUnique).mockResolvedValue(mockResult)

    // Act: Call method
    const result = await repository.findById('123')

    // Assert: Verify behavior
    expect(db.myModel.findUnique).toHaveBeenCalledWith({
      where: { id: '123' }
    })
    expect(result).toEqual(mockResult)
  })
})
```

### 2. Add Test Fixtures

```typescript
// packages/database/src/__tests__/helpers/fixtures.ts

export const mockMyModel = {
  id: 'test-id',
  name: 'Test Name',
  createdAt: new Date('2025-01-01'),
}

export const validCreateData = {
  name: 'New Item',
  description: 'Test description',
}
```

### 3. Test Transactions

For repositories using `db.$transaction()`:

```typescript
it('should handle transaction correctly', async () => {
  // Create mock transaction context
  const mockTx = {
    myModel: {
      create: vi.fn().mockResolvedValue(mockResult),
    },
    otherModel: {
      findUnique: vi.fn().mockResolvedValue(mockOtherResult),
    },
  }

  // Mock $transaction to use our mock context
  vi.mocked(db.$transaction).mockImplementation(async (callback) => {
    return callback(mockTx)
  })

  // Act
  const result = await repository.create(validData)

  // Assert
  expect(mockTx.myModel.create).toHaveBeenCalled()
  expect(result).toEqual(mockResult)
})
```

---

## Best Practices

### ✅ DO

1. **Mock at module level** - Use `vi.mock()` before imports
2. **Reset mocks** - Call `vi.clearAllMocks()` in `beforeEach()`
3. **Test authorization** - Verify role-based access control
4. **Test edge cases** - Null values, missing data, errors
5. **Use fixtures** - Share test data across tests
6. **Follow AAA pattern** - Arrange, Act, Assert
7. **Test transactions** - Verify atomicity and rollback behavior
8. **Descriptive test names** - `should reject creation when user is CLIENT`

### ❌ DON'T

1. **Don't use real database** - Always mock `db` client
2. **Don't share state** - Each test should be independent
3. **Don't test implementation details** - Test behavior, not internals
4. **Don't skip cleanup** - Always reset mocks between tests
5. **Don't use top-level variables in vi.mock()** - Creates hoisting issues

### Test Naming Convention

```typescript
describe('RepositoryName', () => {
  describe('methodName()', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Test implementation
    })
  })
})
```

Examples:
- ✅ `should create property when user is AGENT`
- ✅ `should reject update when property doesn't exist`
- ❌ `test create` (not descriptive)
- ❌ `it works` (not specific)

---

## Troubleshooting

### Issue: "Cannot access before initialization"

**Cause:** Using variables in `vi.mock()` that aren't available during hoisting

**Fix:** Define mocks inline in `vi.mock()` factory function

```typescript
// ❌ WRONG - Variable not available during hoisting
const mockDb = createMockDb()
vi.mock('../client', () => ({ db: mockDb }))

// ✅ CORRECT - Inline factory function
vi.mock('../client', () => ({
  db: {
    property: { findUnique: vi.fn() }
  }
}))
```

### Issue: "vitest: command not found"

**Cause:** Dependencies not installed

**Fix:**
```bash
bun install
# Or use bunx to run vitest without installing globally
bunx vitest run
```

### Issue: Tests passing locally but failing in CI

**Causes:**
1. Date/timezone differences
2. Shared state between tests
3. Missing environment variables

**Fix:**
```typescript
// Use fixed dates in tests
const fixedDate = new Date('2025-01-01T00:00:00Z')

// Reset all mocks
beforeEach(() => {
  vi.clearAllMocks()
  vi.setSystemTime(fixedDate)
})

afterEach(() => {
  vi.useRealTimers()
})
```

### Issue: Mock not being called

**Cause:** Mock not properly configured or method called on wrong instance

**Debug:**
```typescript
console.log('Mock calls:', vi.mocked(db.property.create).mock.calls)
console.log('Mock called:', vi.mocked(db.property.create).mock.calls.length)
```

---

## Testing Roadmap

### Current Coverage
- ✅ Validation schemas (property, appointments)
- ✅ Utility functions (slug-generator, serialize-property)
- ✅ PropertyRepository (create, update, delete)

### Next Steps
- 🔲 FavoriteRepository tests
- 🔲 AppointmentRepository tests
- 🔲 UserRepository tests
- 🔲 Server Action tests (with authorization)
- 🔲 API endpoint integration tests
- 🔲 Component tests (React components)
- 🔲 E2E tests (Playwright)

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [InmoApp CLAUDE.md](../../CLAUDE.md) - Project context

---

## Getting Help

- Check the troubleshooting section above
- Review existing tests in `__tests__/` directories
- Ask in team chat or create a GitHub issue
- Refer to Vitest documentation for advanced mocking

---

**Happy Testing! 🧪**
