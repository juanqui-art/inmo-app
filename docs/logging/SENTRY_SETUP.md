# Sentry Setup Guide

> **Status**: ✅ Configured (Dec 2, 2025)
> **Phase**: Fase 2 - Semana 3 (Logging & Monitoring)

---

## Overview

Sentry provides real-time error tracking and monitoring for both client and server-side code. It's integrated with the custom Pino logger to automatically capture errors and warnings.

---

## Setup Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project:
   - Platform: **Next.js**
   - Project name: **inmo-app-production** (or your choice)
   - Team: Your team name

### 2. Get Your DSN

After creating the project, you'll receive a **DSN (Data Source Name)** that looks like:

```
https://abc123def456@o123456.ingest.sentry.io/789012
```

### 3. Configure Environment Variables

Add these variables to your environment files:

#### `apps/web/.env.local` (for development)

```bash
# Sentry Configuration
# Leave empty to disable Sentry in development
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
SENTRY_DSN=https://your-dsn-here@sentry.io/project-id

# Optional: Enable Sentry in development
NEXT_PUBLIC_SENTRY_ENABLED=false
SENTRY_ENABLED=false

# Optional: Set environment name
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_ENVIRONMENT=development
```

#### Production (Vercel/hosting platform)

Set these environment variables in your production environment:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_ENVIRONMENT=production

# For source maps upload (optional but recommended)
SENTRY_AUTH_TOKEN=your-auth-token-here
```

---

## How It Works

### Automatic Error Reporting

Sentry is automatically integrated with the logger. Every `logger.error()` and `logger.warn()` call sends data to Sentry:

```typescript
import { logger } from '@/lib/utils/logger';

// This automatically sends to Sentry
logger.error({ err: error, userId: "123" }, "Failed to process payment");

// Warnings are also captured
logger.warn({ count: 50 }, "High failure rate detected");
```

### Configuration Files

The project has 4 Sentry configuration files:

1. **`sentry.client.config.ts`** - Browser/client-side errors
2. **`sentry.server.config.ts`** - Node.js server errors
3. **`sentry.edge.config.ts`** - Edge runtime (middleware)
4. **`instrumentation.ts`** - Initializes Sentry on server start

### Behavior by Environment

#### Development
- **Default**: Disabled (errors logged to console only)
- **Enable**: Set `SENTRY_ENABLED=true` in `.env.local`
- **Debug mode**: Enabled for troubleshooting

#### Production
- **Default**: Enabled automatically
- **Sample rate**: 10% of transactions (configurable)
- **Session replay**: 10% of sessions, 100% on errors

---

## Testing Sentry

### Test in Development

1. Enable Sentry in development:
   ```bash
   # apps/web/.env.local
   SENTRY_ENABLED=true
   NEXT_PUBLIC_SENTRY_ENABLED=true
   ```

2. Trigger a test error:
   ```typescript
   import { logger } from '@/lib/utils/logger';

   logger.error(new Error("Test error"), "Testing Sentry integration");
   ```

3. Check Sentry Dashboard:
   - Go to [sentry.io/issues](https://sentry.io/issues)
   - You should see the test error within seconds

### Test in Production

After deploying:

1. Trigger an intentional error (e.g., access non-existent page)
2. Check Sentry Dashboard for the error
3. Verify source maps are uploaded (stack traces should show real file names, not minified)

---

## Features Configured

### ✅ Error Tracking
- Automatic capture of all `logger.error()` calls
- Captures unhandled exceptions
- Captures promise rejections

### ✅ Performance Monitoring
- Transaction tracing for server requests
- Client-side performance metrics
- Database query monitoring (Prisma integration)

### ✅ Session Replay
- Records 10% of user sessions
- Records 100% of sessions with errors
- Helps reproduce bugs visually

### ✅ Source Maps
- Uploaded automatically in production builds
- De-minifies stack traces
- Shows real file names and line numbers

### ✅ Contextual Data
- Request ID tracking
- User context (when authenticated)
- Custom metadata from logger calls

---

## Alert Configuration

### Recommended Alerts

Go to **Settings → Alerts** in Sentry Dashboard and create:

1. **Critical Errors Alert**
   - Condition: More than 10 errors in 1 hour
   - Action: Email to team
   - Priority: High

2. **New Error Type Alert**
   - Condition: First time seen error
   - Action: Slack/Email notification
   - Priority: Medium

3. **High Error Rate Alert**
   - Condition: Error rate > 5%
   - Action: Email + Slack
   - Priority: Critical

---

## Ignored Errors

The following errors are automatically filtered out (see `sentry.client.config.ts`):

- Browser extension errors
- Third-party script errors
- Network errors (not actionable)
- ISP-injected errors

To add more ignored errors, edit the `ignoreErrors` array in the config files.

---

## Cost

### Free Tier (Current)
- **5,000 errors/month**
- **10,000 transactions/month**
- **50 replays/month**
- **90 days data retention**

This is sufficient for:
- Development + staging
- Beta testing (up to ~500 MAU)
- Early production

### Team Plan (if needed)
- **$26/month**
- **50K errors/month**
- **100K transactions/month**
- **500 replays/month**

---

## Troubleshooting

### Sentry Not Capturing Errors

1. **Check DSN is set**:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   echo $SENTRY_DSN
   ```

2. **Check Sentry is enabled**:
   ```bash
   # For development
   echo $SENTRY_ENABLED
   ```

3. **Check logs**:
   - Sentry logs appear in console when `debug: true`
   - Look for "[Sentry]" prefixed messages

4. **Verify instrumentation loaded**:
   - Check that `instrumentation.ts` file exists
   - Restart dev server after adding DSN

### Source Maps Not Working

1. **Check auth token** is set in production environment
2. **Verify build logs** show "Uploading source maps to Sentry"
3. **Check Sentry project** has source maps in Releases section

---

## Next Steps

After Sentry is configured:

1. ✅ **Task 3.3**: Create React error boundaries (2h)
2. ✅ **Task 3.4**: Create Server Action wrapper (2h)
3. Monitor Sentry dashboard regularly
4. Set up alerts for critical errors
5. Review and resolve errors weekly

---

## Related Documentation

- `docs/logging/PINO_LOGGER.md` - Structured logging guide
- `docs/technical-debt/00-DEEP-ANALYSIS.md` - Technical debt analysis
- `docs/ROADMAP.md` - Phase 2 Week 3 progress

---

**Last updated**: December 2, 2025
**Configured by**: Claude (AI Assistant)
