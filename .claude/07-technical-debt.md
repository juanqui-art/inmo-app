# Technical Debt & Robustness Audit

**Última revisión**: 2025-01-04

## 📋 Executive Summary

**Project Status**: ✅ Functional MVP with solid architecture, but with **critical gaps** that must be resolved before scaling.

**Next step**: Phase 0 (Quick Wins) - Fix ~20 TypeScript errors (30-60 min)

**Critical path for AI/Chatbot**:
1. **Phase 0**: Fix TypeScript (30-60 min)
2. **Phase 1**: Critical Foundations - Error handling, validation, security, transactions (1-2 weeks)
3. **Phase 2**: Strategic Testing - Unit, integration, E2E, CI/CD (1 week)
4. **Phase 3**: Observability - Logging, metrics, monitoring (3-5 days)
5. **Phase 4**: AI Optimization - Embeddings, webhooks, REST API (future)

**Total estimated Phases 0-3**: 3-4 weeks of work before integrating AI.

---

## Context

This project is designed to be the **foundation for future AI services** (chatbot, summarizer, automated sales funnels). Therefore, prioritizing robustness and stability over quick features is critical.

## Current Strengths ✅

- **Solid Architecture**: Monorepo with clear separation of concerns
- **Basic Security**: RLS in Supabase, auth middleware, role validation
- **Repository Pattern**: Centralized business logic with permission checks
- **Type Safety**: Strict TypeScript with Zod validation in Server Actions
- **Git**: Atomic commits with conventional commits

---

## Critical Gaps Identified ❌

### 1. Inconsistent Error Handling

**Issues detected:**
- ❌ Server Actions only throw generic errors without sufficient context
- ❌ No structured logging (only scattered `console.error`)
- ❌ No monitoring/telemetry to track production errors
- ❌ No error boundaries in critical components
- ❌ Server Action errors are not user-friendly

**Impact**: Production debugging will be extremely difficult when you integrate AI/chatbot.

---

### 2. Incomplete Data Validation

**Issues detected:**
- ❌ No input sanitization (XSS risk in text fields)
- ❌ Missing rate limiting (user can create 1000 properties in seconds)
- ❌ Image URLs not validated (may contain malicious URLs or scripts)
- ❌ Content-Type validation only by extension (can upload `.jpg.js` as image)
- ❌ No total size limits per user (can fill storage)

**Impact**: Security vulnerabilities and resource abuse.

---

### 3. Security

**Issues detected:**
- ❌ No CSRF protection for critical Server Actions
- ❌ Environment variables have no runtime validation (app crashes without clear errors)
- ❌ No login retry limits (brute force attack possible)
- ❌ Missing security headers (CSP, X-Frame-Options, etc.)
- ❌ No secret rotation (keys in .env.local forever)

**Impact**: Wide attack surface, especially for public APIs that chatbot will consume.

---

### 4. Database Transaction Management

**Issues detected:**
- ❌ No automatic rollback in critical operations
  - Example: `uploadPropertyImagesAction` uploads to Storage → if DB fails, orphaned files remain
- ❌ Operations don't use Prisma transactions
  - Example: Create property + add images is not atomic
- ❌ No race condition handling
  - Example: 2 users editing same property simultaneously
- ❌ No optimistic locking to prevent overwrites

**Impact**: Data inconsistency, especially when multiple services (AI, chatbot) access DB.

---

### 5. Testing (CRITICAL)

**Issues detected:**
- ❌ **ZERO tests** (no unit, integration, or E2E)
- ❌ No regression validation when changing code
- ❌ No CI/CD pipeline to validate PRs
- ❌ Future refactors will be extremely risky

**Impact**: Impossible to scale reliably. Each change can break existing features.

---

### 6. Observability

**Issues detected:**
- ❌ No structured logging with context (userId, requestId, etc.)
- ❌ No performance metrics (slow queries, failed uploads)
- ❌ No alerts for critical errors
- ❌ Impossible to debug production without logs

**Impact**: When chatbot starts generating traffic, diagnosing problems will be impossible.

---

### 7. Type Safety Issues

**Issues detected:**
- ⚠️ ~20 TypeScript errors in the project:
  - `properties.ts:198` - Type `File | undefined` not validated
  - Auth components (`login-form.tsx`, `signup-form.tsx`) - Missing type guards for error states
  - `image-upload.tsx:57` - Optional string passed as required
  - `property-form.tsx:48-49` - Property 'error' on type `never`
- ⚠️ Missing type validation in runtime for external data (webhooks, APIs)
- ⚠️ Inconsistent type narrowing in error handling

**Impact**: Runtime errors that TypeScript doesn't catch. Reduces confidence in type system.

---

## 🚀 Strengthening Plan (4 Phases)

### **Phase 1: Critical Foundations** ⭐ (HIGH Priority)

**Objective**: Establish solid foundations for scalability and debugging

#### 1.1 Error Handling & Structured Logging

**Tasks:**
- [ ] Install Pino (structured logger for Node.js)
- [ ] Create custom error classes:
  - `ValidationError`, `AuthError`, `PermissionError`, `NotFoundError`
- [ ] Wrapper for Server Actions with try/catch + automatic logging
- [ ] Error boundaries in critical components (PropertyForm, ImageUpload)
- [ ] Setup Sentry for production monitoring
- [ ] Add requestId to each request for tracing

**Files to create/modify:**
- `packages/shared/errors/index.ts` - Custom error classes
- `packages/shared/logger/index.ts` - Configured logger
- `apps/web/lib/action-wrapper.ts` - HOC for Server Actions
- `apps/web/components/error-boundary.tsx`

**Benefit for AI**: Chatbot will be able to receive structured and useful error messages.

---

#### 1.2 Complete Data Validation

**Tasks:**
- [ ] Install and configure DOMPurify (HTML sanitization)
- [ ] Validate image URLs before saving (don't execute scripts)
- [ ] Validate REAL file Content-Type (magic bytes, not just extension)
- [ ] Rate limiting per user/IP using Upstash Redis:
  - Max 10 properties created per day per user
  - Max 50 images uploaded per day
  - Max 5 login attempts per 15 min
- [ ] Total storage limit per user (e.g., 100MB)

**Files to create/modify:**
- `apps/web/lib/sanitize.ts` - Input sanitization
- `apps/web/lib/rate-limit.ts` - Rate limiting with Redis
- `apps/web/lib/storage/validation.ts` - Improved file validation

**Benefit for AI**: Prevent chatbot from being used for attacks (prompt injection, etc.)

---

#### 1.3 Essential Security

**Tasks:**
- [ ] Validate environment variables with Zod at app start
- [ ] CSRF tokens for critical Server Actions (delete, update)
- [ ] Security headers in `next.config.ts`:
  - Content-Security-Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS)
- [ ] Document secret rotation (manual process for now)
- [ ] Audit RLS permissions in Supabase

**Files to create/modify:**
- `apps/web/lib/env.ts` - Env vars validation
- `apps/web/next.config.ts` - Security headers
- `docs/SECURITY.md` - Security procedures

**Benefit for AI**: Secure APIs for chatbot to consume safely.

---

#### 1.4 Transactions and Data Consistency

**Tasks:**
- [ ] Refactor `uploadPropertyImagesAction` with transaction:
  - Upload to Storage
  - If DB fails → delete from Storage (manual rollback)
- [ ] Refactor `createPropertyAction` to support images in same transaction
- [ ] Implement optimistic locking in updates:
  - Add `version` field to Property
  - Verify version before updating
- [ ] Cleanup job for orphaned files in Storage (weekly cron)

**Files to modify:**
- `apps/web/app/actions/properties.ts` - Add transactions
- `packages/database/prisma/schema.prisma` - Add `version` field
- `packages/database/src/repositories/properties.ts` - Optimistic locking

**Benefit for AI**: When multiple services (chatbot, CRM, etc.) access DB, there will be no inconsistencies.

---

### **Phase 2: Strategic Testing** ⭐ (MEDIUM-HIGH Priority)

**Objective**: Validate system works as expected and prevent regressions

#### 2.1 Infrastructure Tests

**Tasks:**
- [ ] Install Vitest for unit/integration tests
- [ ] Setup test database (Supabase local with Docker)
- [ ] Unit tests for repositories:
  - `PropertyRepository.create()` - Verify permissions
  - `PropertyRepository.update()` - Verify ownership
  - Mock Prisma with `prisma-mock`
- [ ] Integration tests for Server Actions:
  - `createPropertyAction` with valid/invalid data
  - `uploadPropertyImagesAction` with rollback
- [ ] Validation tests for all Zod schemas

**Files to create:**
- `packages/database/src/repositories/__tests__/properties.test.ts`
- `apps/web/app/actions/__tests__/properties.test.ts`
- `apps/web/lib/validations/__tests__/property.test.ts`
- `vitest.config.ts` (root and apps/web)

---

#### 2.2 Critical Case Tests (E2E)

**Tasks:**
- [ ] Install Playwright for E2E tests
- [ ] E2E test: Login with email/password
- [ ] E2E test: Login with Google OAuth
- [ ] E2E test: Create complete property (form + images)
- [ ] E2E test: Edit property (verify permissions)
- [ ] E2E test: Delete property (verify image cleanup)

**Files to create:**
- `apps/web/e2e/auth.spec.ts`
- `apps/web/e2e/properties.spec.ts`
- `playwright.config.ts`

---

#### 2.3 CI/CD Pipeline

**Tasks:**
- [ ] GitHub Actions workflow:
  - Lint (Biome)
  - Type-check (tsc)
  - Unit tests (Vitest)
  - E2E tests (Playwright on PR)
  - Build check
- [ ] Auto-deploy to Vercel Preview on each PR
- [ ] Protection rules on main branch (require CI pass)

**Files to create:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

**Benefit for AI**: When you integrate chatbot, you can make changes with confidence.

---

### **Phase 3: Observability** ⭐ (MEDIUM Priority)

**Objective**: Be able to debug and optimize in production

#### 3.1 Logging and Metrics

**Tasks:**
- [ ] Structured logging in all Server Actions:
  - Context: `userId`, `propertyId`, `action`, `duration`, `requestId`
  - Levels: `info`, `warn`, `error`
- [ ] Performance monitoring:
  - DB query time (slow query log)
  - Storage upload time
  - Error rate per endpoint
- [ ] Dashboards with Vercel Analytics or Grafana:
  - Properties created/day
  - Errors by type
  - Active users
- [ ] Alerts for critical errors:
  - Error rate > 5%
  - Upload failing > 10 times/hour

**Tools:**
- Sentry (errors)
- Vercel Analytics (performance)
- Upstash (custom metrics in Redis)

---

#### 3.2 Developer Experience (DX)

**Tasks:**
- [ ] Pre-commit hooks with Husky:
  - Auto-format with Biome
  - Lint
  - Type-check only changed files
- [ ] Lint-staged for performance
- [ ] Conventional commits with Commitlint
- [ ] Automatic changelog with `release-please`

**Files to create:**
- `.husky/pre-commit`
- `.lintstagedrc.json`
- `.commitlintrc.json`

**Benefit for AI**: Consistent and documented code facilitates model fine-tuning.

---

### **Phase 4: Optimization and AI Preparation** ⭐ (LOW Priority - Future)

**Objective**: Scale and prepare infrastructure for AI services

#### 4.1 Performance and Scalability

**Tasks:**
- [ ] Database query optimization:
  - Analyze slow queries with `EXPLAIN ANALYZE`
  - Add compound indexes where needed
  - Implement cursor-based pagination
- [ ] Image optimization pipeline:
  - Automatic compression on upload (Sharp)
  - Thumbnail generation (multiple sizes)
  - Automatic WebP conversion
- [ ] Caching strategy:
  - Redis for frequent queries (property listings)
  - ISR (Incremental Static Regeneration) for public pages
- [ ] CDN for images (Cloudflare or Vercel Edge)

---

#### 4.2 AI Integration Preparation

**Tasks:**
- [ ] Embeddings schema for semantic search:
  - `PropertyEmbedding` table with 1536-dim vector
  - Trigger to generate embedding when creating/editing property
  - Endpoint for similarity search (cosine similarity)
- [ ] Detailed audit logs:
  - `AuditLog` table for all user actions
  - Useful for model training (predict user intent)
- [ ] Webhooks for events:
  - `property.created`, `property.viewed`, `lead.generated`
  - Enables integration with chatbot, CRM, marketing automation
- [ ] Stable REST API for chatbot:
  - `/api/properties/search` - Search with filters
  - `/api/properties/:id` - Detail
  - `/api/chat/context` - Context for chatbot
- [ ] GraphQL API (optional, if chatbot needs complex queries)

**Files to create:**
- `packages/database/prisma/schema.prisma` - AI models
- `apps/web/app/api/properties/route.ts` - REST API
- `apps/web/app/api/webhooks/route.ts` - Webhooks
- `packages/ai/embeddings/index.ts` - Embedding generation

---

## ⏭️ Recommended Next Step

**Start with Phase 0 (Quick Wins): Fix TypeScript errors**

### Concrete action for next session:

**Phase 0: Quick Wins (30 min - 1 hour)** - Fix ~20 existing TypeScript errors
1. Add type guards in auth components
2. Validate optional types before passing as required
3. Run `bun run type-check` until it passes without errors

**Phase 1.1: Error Handling & Logging (1-2 hours)**
1. Install Pino: `bun add pino pino-pretty`
2. Create `packages/shared/logger/index.ts`
3. Create error classes in `packages/shared/errors/index.ts`
4. Refactor 1 Server Action as example (`createPropertyAction`)
5. Add error boundary in `PropertyForm`

**Command to continue**:
```
"Continue with Phase 0 of strengthening plan (fix TypeScript errors)"
```

Or if you prefer to go straight to Phase 1.1:
```
"Continue with Phase 1.1 of strengthening plan (Error Handling & Logging)"
```

---

## 📊 Progress Metrics

**Current plan status:**
- [ ] Phase 1: Critical Foundations (0/4 completed)
- [ ] Phase 2: Strategic Testing (0/3 completed)
- [ ] Phase 3: Observability (0/2 completed)
- [ ] Phase 4: AI Optimization (0/2 completed)

**Total tasks**: ~50 tasks identified
