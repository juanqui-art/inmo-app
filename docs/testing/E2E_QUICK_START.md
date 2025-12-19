# 🎭 E2E Tests - Quick Start Guide

**Time to complete:** 10 minutes
**Goal:** Get your first E2E test running

---

## ⚡ Quick Setup (Do This Now)

### Step 1: Install Playwright (2 min)

```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app
bun add -D @playwright/test
bunx playwright install
```

**What this does:**
- Installs Playwright test framework
- Downloads Chromium, Firefox, and WebKit browsers

---

### Step 2: Run Your First Test (3 min)

```bash
# Make sure dev server is NOT running (Playwright will start it)
# If it is, stop it (Ctrl+C)

# Run tests
bun run test:e2e
```

**What happens:**
1. Playwright starts your dev server automatically
2. Runs all 3 test files (9 tests total)
3. Shows results in terminal
4. Generates HTML report

**Expected output:**
```
Running 9 tests using 1 worker

✓ 01-critical-flow-property.spec.ts:10:5 › AGENT user can signup... (15s)
✓ 01-critical-flow-property.spec.ts:55:5 › Tier persists after... (8s)
✓ 02-tier-limits.spec.ts:25:5 › FREE tier cannot create more... (7s)
...

9 passed (45s)
```

---

### Step 3: View Test Report (1 min)

```bash
bun run test:e2e:report
```

Opens browser with interactive HTML report showing:
- Which tests passed/failed
- Screenshots of failures
- Videos of test runs
- Trace viewer

---

## 🐛 If Tests Fail

### Common Issues

#### 1. **Dev server already running**
**Error:** `Port 3000 is already in use`

**Fix:**
```bash
# Stop your dev server (Ctrl+C in terminal)
# Then run tests again
bun run test:e2e
```

---

#### 2. **Selectors not found**
**Error:** `Timeout 30000ms exceeded waiting for locator...`

**Reasons:**
- UI changed (update selectors in helpers.ts)
- Page didn't load (check dev server logs)
- Missing `data-testid` attributes

**Debug:**
```bash
# Run in headed mode (see what's happening)
bun run test:e2e:headed

# Or debug mode (step through)
bun run test:e2e:debug
```

---

#### 3. **Test user already exists**
**Error:** `User already registered`

**Fix:** Delete test users from Supabase:
```sql
-- In Supabase SQL Editor
DELETE FROM auth.users WHERE email LIKE '%@inmoapp-test.com';
DELETE FROM public.users WHERE email LIKE '%@inmoapp-test.com';
```

---

## 🎯 What Was Created

### Files Created:
```
playwright.config.ts                                    # Playwright config
package.json                                            # Added test:e2e scripts

apps/web/__tests__/e2e/
├── README.md                                           # E2E docs
├── helpers.ts                                          # Test utilities
├── 01-critical-flow-property.spec.ts                  # Test 1: Signup → Create property
├── 02-tier-limits.spec.ts                             # Test 2: Tier limits
└── 03-upgrade-flow.spec.ts                            # Test 3: Upgrade flow

.github/workflows/
└── e2e-tests.yml                                      # CI/CD config

docs/testing/
└── E2E_QUICK_START.md                                 # This file
```

---

## 📝 Adding data-testid to Your Components

For reliable tests, add `data-testid` to key elements:

### Example: User Menu
```typescript
// Before
<button onClick={logout}>Cerrar sesión</button>

// After
<button data-testid="user-menu" onClick={logout}>
  Cerrar sesión
</button>
```

### Example: Tier Badge
```typescript
// In your navbar component
<span data-testid="tier-badge">{user.subscriptionTier}</span>
```

### Example: Property Count
```typescript
// In dashboard
<p data-testid="property-count">{count} de {limit} propiedades</p>
```

### Example: Upgrade Modal
```typescript
// In upgrade modal
<div data-testid="upgrade-modal">
  <button data-testid="confirm-upgrade">Confirmar</button>
</div>
```

---

## 🚀 Next Steps

### 1. Run Tests Regularly

```bash
# Before committing
bun run test:all  # Runs unit + E2E tests

# Watch mode (re-run on file changes)
# Not available for E2E, use unit tests for fast feedback
```

---

### 2. Add More Tests

**Priority tests to add:**
- [ ] Image upload flow
- [ ] Favorite property
- [ ] Schedule appointment
- [ ] Search properties
- [ ] Filter by city/price

**Template for new test:**
```typescript
// apps/web/__tests__/e2e/04-your-feature.spec.ts
import { test, expect } from '@playwright/test';
import { signup } from './helpers';

test.describe('Your Feature', () => {
  test('should work correctly', async ({ page }) => {
    // ARRANGE
    const user = generateTestUser('AGENT');
    await signup(page, user);

    // ACT
    await page.goto('/your-page');
    await page.click('button');

    // ASSERT
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

---

### 3. Set Up CI/CD

**GitHub Actions already configured!**

Just add these secrets to your GitHub repository:
1. Go to repo → Settings → Secrets → Actions
2. Add secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`

3. Push to main/develop → Tests run automatically

---

## 🎓 Learn More

### Playwright Documentation
- **Getting Started:** https://playwright.dev/docs/intro
- **Best Practices:** https://playwright.dev/docs/best-practices
- **Debugging:** https://playwright.dev/docs/debug

### InmoApp E2E Docs
- **Full README:** `apps/web/__tests__/e2e/README.md`
- **Helpers API:** `apps/web/__tests__/e2e/helpers.ts`
- **Action Plan:** `docs/security/FORTIFICATION_ACTION_PLAN.md`

---

## ✅ Success Checklist

After completing this guide, you should have:

- [ ] Playwright installed
- [ ] 3 E2E test files created
- [ ] Tests passing locally
- [ ] HTML report viewable
- [ ] CI/CD configured
- [ ] Understanding of how to add more tests

---

## 🎉 You're Done!

You now have **9 E2E tests** covering the most critical flows:
- ✅ Signup & Login
- ✅ Tier assignment & persistence
- ✅ Property creation
- ✅ Tier limits enforcement
- ✅ Subscription upgrade

**Next:** Run `bun run test:e2e` before every deploy! 🚀

---

**Created:** Diciembre 16, 2025
**Time to complete:** 10 minutes
**Difficulty:** Beginner-friendly
