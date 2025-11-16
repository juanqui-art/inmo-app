# Database Package Tests

This directory contains comprehensive tests for the database repositories.

## Test Files

### `property-repository.test.ts`

Tests for PropertyRepository mutation methods (create, update, delete) with full authorization coverage.

**Coverage: 100%** - All 15 tests passing ✅

#### Test Breakdown

##### `create()` - 5 tests
1. ✅ Creates property when user is AGENT
2. ✅ Creates property when user is ADMIN
3. ✅ Rejects creation when user is CLIENT
4. ✅ Rejects creation when user doesn't exist
5. ✅ Prevents agentId spoofing (security)

##### `update()` - 5 tests
1. ✅ Updates when user is owner
2. ✅ Updates when user is ADMIN (bypass ownership)
3. ✅ Rejects when user is different AGENT
4. ✅ Rejects when user is CLIENT
5. ✅ Rejects when property doesn't exist

##### `delete()` - 5 tests
1. ✅ Deletes when user is owner
2. ✅ Deletes when user is ADMIN (bypass ownership)
3. ✅ Rejects when user is different AGENT
4. ✅ Rejects when user is CLIENT
5. ✅ Rejects when property doesn't exist

## Test Helpers

### `helpers/db-mock.ts`

Utilities for mocking Prisma client in tests:
- `createMockTransaction()` - Mock transaction context
- `createMockDb()` - Mock database client
- `resetDbMocks()` - Reset all mocks

### `helpers/fixtures.ts`

Sample test data:
- `mockUsers` - Test users (agent, admin, client)
- `mockProperty` - Sample property
- `mockPropertyWithRelations` - Property with images and agent
- `validPropertyData` - Valid creation data
- `validUpdateData` - Valid update data

## Running Tests

```bash
# From packages/database directory
bun run test              # Watch mode
bun run test:run          # Run once
bun run test:coverage     # With coverage

# Run specific test
bunx vitest run property-repository

# Debug mode
bunx vitest run --reporter=verbose
```

## Test Results

```
✓ src/__tests__/property-repository.test.ts (15 tests) 14ms

Test Files  1 passed (1)
     Tests  15 passed (15)
  Duration  623ms
```

## Adding New Repository Tests

1. Create `[repository-name].test.ts` in this directory
2. Mock the database client before imports
3. Use fixtures from `helpers/fixtures.ts`
4. Follow AAA pattern (Arrange, Act, Assert)
5. Test authorization, edge cases, and happy paths

Example:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../client', () => ({
  db: {
    myModel: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  }
}))

import { MyRepository } from '../repositories/my-repository'
import { db } from '../client'

describe('MyRepository', () => {
  let repository: MyRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new MyRepository()
  })

  it('should do something when condition is met', async () => {
    // Arrange
    vi.mocked(db.myModel.findUnique).mockResolvedValue({ id: '123' })

    // Act
    const result = await repository.findById('123')

    // Assert
    expect(result).toEqual({ id: '123' })
  })
})
```

## Best Practices

✅ **DO:**
- Reset mocks in `beforeEach()`
- Test authorization thoroughly
- Use descriptive test names
- Test transactions properly
- Use fixtures for test data

❌ **DON'T:**
- Use real database
- Share state between tests
- Skip edge case testing
- Forget to mock `$transaction`

## See Also

- [Main Testing Guide](../../../docs/testing/TESTING_GUIDE.md)
- [Vitest Configuration](../vitest.config.ts)
- [PropertyRepository Source](../repositories/properties.ts)
