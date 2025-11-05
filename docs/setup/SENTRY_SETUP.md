# Sentry Setup Guide

## Overview

Sentry provides error tracking and performance monitoring for production applications.

**Status**: Configuration ready, requires Sentry account to activate

## Setup Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project (select "Next.js")
3. Copy your DSN (Data Source Name) - looks like: `https://xxx@xxx.ingest.sentry.io/xxx`

### 2. Install Sentry SDK

```bash
bun add @sentry/nextjs
```

### 3. Add Environment Variables

Add to both `.env.local` files (root and `apps/web/.env.local`):

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug

# Optional: Control Sentry in development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

Also update `packages/env/src/index.ts`:

```typescript
export const env = createEnv({
  server: {
    // ... existing vars
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
  },
  client: {
    // ... existing vars
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().optional(),
  },
  // ... rest of config
});
```

### 4. Initialize Sentry

Create `apps/web/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',

  // Adjust this value in production
  tracesSampleRate: 1.0,

  // Capture 100% of errors
  // replaysOnErrorSampleRate: 1.0,

  // Capture 10% of sessions for replay
  // replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

Create `apps/web/sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',

  tracesSampleRate: 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
```

Create `apps/web/sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
  tracesSampleRate: 1.0,
});
```

### 5. Update next.config.ts

Add Sentry webpack plugin:

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // ... existing config
};

export default withSentryConfig(
  nextConfig,
  {
    // Sentry Webpack Plugin Options
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  },
  {
    // Sentry SDK Options
    automaticVercelMonitoring: true,
  }
);
```

### 6. Test Sentry

Add a test error button:

```typescript
// In any component
import * as Sentry from '@sentry/nextjs';

export function TestSentryButton() {
  return (
    <button onClick={() => {
      Sentry.captureException(new Error('Test Sentry error'));
    }}>
      Test Sentry
    </button>
  );
}
```

## Integration with Error Handling

The error boundary (`components/error-boundary.tsx`) already has Sentry integration:

```typescript
if (typeof window !== 'undefined' && window.Sentry) {
  window.Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

The action wrapper will also send errors to Sentry once configured.

## Production Considerations

1. **Sample Rates**: Adjust `tracesSampleRate` in production (e.g., 0.1 = 10%)
2. **PII**: Sentry redacts sensitive data by default, but review your logs
3. **Alerts**: Configure Sentry alerts for critical errors
4. **Releases**: Enable release tracking to see which version has errors
5. **Source Maps**: Upload source maps for better error tracking

## Monitoring Checklist

- [ ] Create Sentry account
- [ ] Install @sentry/nextjs
- [ ] Add environment variables
- [ ] Initialize Sentry config files
- [ ] Update next.config.ts
- [ ] Test with sample error
- [ ] Configure alerts
- [ ] Set up release tracking
- [ ] Review PII settings
- [ ] Adjust sample rates for production

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
