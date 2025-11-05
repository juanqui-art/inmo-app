# Error Handling & Logging Guide

## Overview

This guide explains the new error handling and logging infrastructure implemented in Phase 1.1 of the Technical Debt reduction plan.

**Status**: ✅ Phase 1.1 Complete

**What's Included:**
- Custom error classes with proper typing
- Structured logging with Pino
- Server Action wrapper with automatic error handling
- Error boundary components for React
- Sentry integration setup (optional)

---

## Quick Start

### 1. Using Custom Errors

```typescript
import { ValidationError, NotFoundError, PermissionError } from '@repo/shared/errors';

// Throw typed errors
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: userInput
});

throw new NotFoundError('Property not found', {
  propertyId: id
});

throw new PermissionError('Only agents can create properties');
```

### 2. Using the Logger

```typescript
import { createLogger } from '@repo/shared/logger';

// Create a logger with context
const logger = createLogger({
  service: 'PropertyService',
  userId: user.id
});

logger.info('Processing request', { propertyId: '123' });
logger.warn('Slow query detected', { duration: 2500 });
logger.error('Failed to save property', error, { propertyId: '123' });

// Simple logging without context
import { info, error } from '@repo/shared/logger';
info('User logged in');
error('Database connection failed', err);
```

### 3. Using the Server Action Wrapper

**Before (old way):**
```typescript
export async function myAction(formData: FormData) {
  const user = await requireRole(['AGENT']);

  try {
    // ... logic
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong' };
  }
}
```

**After (new way):**
```typescript
import { withFormActionHandler } from '@/lib/action-wrapper';

export const myAction = withFormActionHandler(
  async (formData: FormData, context) => {
    // Auth is handled automatically with requiredRoles
    context.logger.info('Processing action');

    // ... your logic here
    // Errors are caught and logged automatically

    return { message: 'Success' };
  },
  {
    actionName: 'myAction',
    requiredRoles: ['AGENT', 'ADMIN']
  }
);
```

**Benefits:**
- ✅ Automatic error handling and logging
- ✅ Request ID tracking
- ✅ Performance monitoring
- ✅ Type-safe error responses
- ✅ Consistent error format

### 4. Using Error Boundaries

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export function MyPage() {
  return (
    <ErrorBoundary>
      <ComplexComponent />
    </ErrorBoundary>
  );
}

// With custom fallback
<ErrorBoundary fallback={<div>Custom error message</div>}>
  <ComplexComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, errorInfo) => {
  // Custom error handling
  console.log('Error caught:', error);
}}>
  <ComplexComponent />
</ErrorBoundary>
```

---

## Architecture

### Error Classes Hierarchy

```
AppError (base)
├── ValidationError (400)
├── AuthError (401)
├── PermissionError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
├── ExternalServiceError (502)
├── DatabaseError (500)
└── StorageError (500)
```

Each error includes:
- `message`: User-friendly error message
- `statusCode`: HTTP status code
- `isOperational`: Whether it's an expected error
- `context`: Additional debugging information

### Logger Features

**Structured Logging:**
```json
{
  "level": "info",
  "time": "2025-11-05T12:00:00.000Z",
  "env": "production",
  "requestId": "abc123",
  "userId": "user-456",
  "action": "createProperty",
  "msg": "Property created successfully",
  "propertyId": "prop-789",
  "duration": 245
}
```

**Automatic Redaction:**
- Passwords
- Tokens
- API keys
- Secrets
- Authorization headers

**Log Levels:**
- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error events
- `fatal`: Critical errors that cause app termination

### Action Wrapper Flow

```
User Request
    ↓
withActionHandler
    ↓
1. Generate requestId
2. Create logger with context
3. Log action start
4. Check authentication (if required)
5. Check authorization (roles)
6. Execute handler
7. Log success/error
8. Format response
    ↓
Response to User
```

---

## Examples

### Example 1: Server Action with Validation

```typescript
import { withFormActionHandler } from '@/lib/action-wrapper';
import { ValidationError } from '@repo/shared/errors';
import { mySchema } from '@/lib/validations';

export const myAction = withFormActionHandler(
  async (formData, context) => {
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
    };

    // Validate with Zod
    const result = mySchema.safeParse(rawData);
    if (!result.success) {
      throw new ValidationError('Invalid input', {
        fieldErrors: result.error.flatten().fieldErrors
      });
    }

    // Process validated data
    context.logger.info('Creating user', { email: result.data.email });

    const user = await createUser(result.data);

    return { userId: user.id };
  },
  {
    actionName: 'createUser',
    requireAuth: true
  }
);
```

### Example 2: API Route with Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@repo/shared/logger';
import { NotFoundError, formatErrorForUser } from '@repo/shared/errors';

export async function GET(request: NextRequest) {
  const logger = createLogger({ route: '/api/properties' });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('Property ID is required');
    }

    logger.info('Fetching property', { propertyId: id });

    const property = await propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundError('Property not found', { propertyId: id });
    }

    return NextResponse.json({ data: property });
  } catch (error) {
    logger.error('API error', error);

    const userError = formatErrorForUser(error);

    return NextResponse.json(
      { error: userError.message },
      { status: userError.statusCode }
    );
  }
}
```

### Example 3: Repository with Database Errors

```typescript
import { DatabaseError } from '@repo/shared/errors';
import { createLogger } from '@repo/shared/logger';
import { prisma } from '@repo/database';

export class PropertyRepository {
  private logger = createLogger({ service: 'PropertyRepository' });

  async create(data, userId) {
    try {
      this.logger.debug('Creating property', { userId });

      const property = await prisma.property.create({
        data: {
          ...data,
          agentId: userId
        }
      });

      this.logger.info('Property created', { propertyId: property.id });

      return property;
    } catch (error) {
      this.logger.error('Failed to create property', error, { userId });

      throw new DatabaseError('Failed to save property', {
        originalError: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }
}
```

---

## Migration Guide

### Migrating Existing Server Actions

**Step 1:** Import the wrapper and errors
```typescript
import { withFormActionHandler } from '@/lib/action-wrapper';
import { ValidationError } from '@repo/shared/errors';
```

**Step 2:** Wrap your action
```typescript
// Before
export async function myAction(prevState, formData) {
  // ...
}

// After
export const myAction = withFormActionHandler(
  async (formData, context) => {
    // Same logic, but use context.logger
  },
  { actionName: 'myAction', requiredRoles: ['AGENT'] }
);
```

**Step 3:** Replace console.log with logger
```typescript
// Before
console.log('Creating property');

// After
context.logger.info('Creating property');
```

**Step 4:** Throw typed errors instead of returning errors
```typescript
// Before
if (!validatedData.success) {
  return { error: validatedData.error.flatten().fieldErrors };
}

// After
if (!validatedData.success) {
  throw new ValidationError('Invalid input', {
    fieldErrors: validatedData.error.flatten().fieldErrors
  });
}
```

**Step 5:** Test!

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ValidationError } from '@repo/shared/errors';

describe('ValidationError', () => {
  it('should have correct status code', () => {
    const error = new ValidationError('Invalid input');
    expect(error.statusCode).toBe(400);
  });

  it('should include context', () => {
    const error = new ValidationError('Invalid input', {
      field: 'email'
    });
    expect(error.context).toEqual({ field: 'email' });
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { createPropertyAction } from './properties';

describe('createPropertyAction', () => {
  it('should create property with valid data', async () => {
    const formData = new FormData();
    formData.set('title', 'Test Property');
    formData.set('price', '100000');
    // ... more fields

    const result = await createPropertyAction(null, formData);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
  });

  it('should return validation error for invalid data', async () => {
    const formData = new FormData();
    formData.set('title', ''); // Invalid: empty title

    const result = await createPropertyAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error.statusCode).toBe(400);
    expect(result.error.message).toContain('Invalid');
  });
});
```

---

## Best Practices

### ✅ DO

- Use typed errors instead of generic Error
- Include context in errors for debugging
- Use structured logging with context
- Log at appropriate levels (debug, info, warn, error)
- Wrap critical components with ErrorBoundary
- Use the action wrapper for all Server Actions
- Sanitize sensitive data before logging

### ❌ DON'T

- Don't use console.log/console.error (use logger instead)
- Don't expose internal errors to users
- Don't log passwords, tokens, or secrets
- Don't catch errors without re-throwing (unless handled)
- Don't return raw errors from Server Actions
- Don't skip error boundaries on critical UI

---

## Next Steps

### Phase 1.2: Data Validation
- Input sanitization (XSS prevention)
- Rate limiting
- File validation improvements

### Phase 1.3: Security
- CSRF protection
- Security headers
- Environment variable validation

### Phase 1.4: Transactions
- Database transactions
- Optimistic locking
- Rollback mechanisms

See `docs/technical-debt/07-technical-debt.md` for full roadmap.

---

## Files Created

**New Package:**
- `packages/shared/` - Shared utilities package
  - `src/errors/index.ts` - Custom error classes
  - `src/logger/index.ts` - Pino logger configuration
  - `src/index.ts` - Main exports

**New App Files:**
- `apps/web/lib/action-wrapper.ts` - Server Action wrapper
- `apps/web/components/error-boundary.tsx` - Error boundary component

**Modified Files:**
- `apps/web/app/actions/properties.ts` - Refactored createPropertyAction
- `apps/web/package.json` - Added dependencies
- `apps/web/next.config.ts` - Added @repo/shared to transpilePackages

**Documentation:**
- `docs/ERROR_HANDLING_GUIDE.md` - This file
- `docs/setup/SENTRY_SETUP.md` - Sentry configuration guide

---

## Troubleshooting

### "Cannot find module '@repo/shared'"

**Solution:**
1. Install dependencies: `bun install`
2. Restart dev server: `bun run dev`
3. Check `next.config.ts` has `@repo/shared` in `transpilePackages`

### Logs not appearing

**Solution:**
1. Check `NODE_ENV` environment variable
2. Set `LOG_LEVEL=debug` for more verbose logs
3. In production, check Sentry dashboard

### TypeScript errors

**Solution:**
1. Run `bun run type-check` to see all errors
2. Make sure you imported from the correct package
3. Restart TypeScript server in your IDE

---

## Support

For questions or issues:
1. Check this guide
2. Review code examples in `apps/web/app/actions/properties.ts`
3. See technical debt roadmap: `.claude/07-technical-debt.md`
