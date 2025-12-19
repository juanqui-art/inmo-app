# 🎭 E2E Tests - Playwright

End-to-end tests para InmoApp usando Playwright.

---

## 📋 Setup

### Instalar Dependencias

```bash
cd /Users/juanquizhpi/Desktop/projects/inmo-app
bun add -D @playwright/test
bunx playwright install
```

---

## 🚀 Running Tests

### Run all tests (headless)
```bash
bun run test:e2e
```

### Run tests with UI (interactive)
```bash
bun run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
bun run test:e2e:headed
```

### Run specific test file
```bash
bunx playwright test 01-critical-flow-property.spec.ts
```

### Debug tests
```bash
bun run test:e2e:debug
```

### View test report
```bash
bun run test:e2e:report
```

---

## 📁 Test Structure

```
apps/web/__tests__/e2e/
├── helpers.ts                         # Test helpers y utilities
├── 01-critical-flow-property.spec.ts  # CRÍTICO: Signup → Login → Create property
├── 02-tier-limits.spec.ts             # CRÍTICO: Tier limits enforcement
├── 03-upgrade-flow.spec.ts            # CRÍTICO: Subscription upgrade
└── README.md                          # This file
```

---

## 🎯 Test Categories

### 🔴 Critical Tests (Must Pass Before Deploy)

**01-critical-flow-property.spec.ts**
- ✅ User can signup with AGENT tier
- ✅ User can login/logout
- ✅ User can create property
- ✅ Tier persists after login cycles

**02-tier-limits.spec.ts**
- ✅ FREE tier cannot create more than 1 property
- ✅ PLUS tier can create up to 3 properties
- ✅ AGENT tier can create up to 10 properties

**03-upgrade-flow.spec.ts**
- ✅ User can upgrade from FREE to AGENT
- ✅ Limits increase after upgrade
- ✅ Tier persists after logout/login
- ✅ CLIENT role is promoted to AGENT on upgrade

---

## 🛠️ Test Helpers

### Authentication
```typescript
import { signup, login, logout } from './helpers';

// Signup
const user = generateTestUser('AGENT');
await signup(page, user);

// Login
await login(page, { email: user.email, password: user.password });

// Logout
await logout(page);
```

### Property Management
```typescript
import {
  navigateToCreateProperty,
  fillPropertyBasicInfo,
  submitPropertyForm,
  getPropertyCount,
} from './helpers';

// Create property
await navigateToCreateProperty(page);
await fillPropertyBasicInfo(page, {
  title: 'My Property',
  description: 'Test property',
  price: '150000',
  category: 'HOUSE',
  transactionType: 'SALE',
});
await submitPropertyForm(page);

// Get count
const count = await getPropertyCount(page);
```

### Tier Verification
```typescript
import { verifyTierBadge } from './helpers';

// Verify tier badge
await verifyTierBadge(page, 'Agente');
```

---

## 📊 Test Data

### Test Emails
Tests use auto-generated emails:
```
test-{timestamp}-{random}@inmoapp-test.com
```

**IMPORTANT:** These test users are NOT automatically deleted. You need to manually clean them from Supabase Dashboard or implement an admin API.

---

## 🐛 Debugging

### Run single test in debug mode
```bash
bunx playwright test 01-critical-flow-property.spec.ts --debug
```

### Pause test at specific point
```typescript
test('my test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // ← Opens inspector
  await page.click('button');
});
```

### Take screenshot
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Save video
```typescript
// Configured in playwright.config.ts
// Videos saved automatically on failure
```

---

## ✅ Pre-Commit Checklist

Before committing changes that might affect E2E tests:

- [ ] Run `bun run test:e2e` locally
- [ ] All tests pass
- [ ] No `.only()` or `.skip()` left in tests
- [ ] Test data cleaned up (if manual cleanup needed)

---

## 🔧 Configuration

E2E tests are configured in `/playwright.config.ts`:

- **Base URL:** `http://localhost:3000`
- **Timeout:** 30s per test
- **Retries:** 2 on CI, 0 locally
- **Browsers:** Chromium (default), Firefox, WebKit (commented)
- **Screenshots:** On failure
- **Videos:** On failure

---

## 🚨 Common Issues

### Issue: "Cannot find module '@playwright/test'"

**Solution:**
```bash
bun add -D @playwright/test
```

---

### Issue: "Browsers not installed"

**Solution:**
```bash
bunx playwright install
```

---

### Issue: "Server not starting"

**Check:**
1. Is dev server running? (`bun run dev`)
2. Check port 3000 is not in use
3. Check `webServer` config in `playwright.config.ts`

---

### Issue: "Test user already exists"

**Solution:**
Delete test users from Supabase Dashboard:
```sql
DELETE FROM auth.users WHERE email LIKE '%@inmoapp-test.com';
DELETE FROM public.users WHERE email LIKE '%@inmoapp-test.com';
```

---

### Issue: "Tier didn't update after upgrade"

**Debug:**
1. Check Supabase Dashboard (public.users table)
2. Check subscription_tier column
3. Check metadata in auth.users
4. Run SSOT verification: `docs/bugs/SSOT_VERIFICATION_GUIDE.md`

---

## 📝 Writing New Tests

### Template
```typescript
import { test, expect } from '@playwright/test';
import { signup, login } from './helpers';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // ARRANGE: Setup
    const user = generateTestUser('AGENT');
    await signup(page, user);

    // ACT: Perform action
    await page.click('button');

    // ASSERT: Verify result
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices
1. **Use data-testid** for reliable selectors
2. **One assertion per test** (or closely related)
3. **Clean up test data** (or document manual cleanup)
4. **Use helpers** (don't repeat yourself)
5. **Add comments** explaining WHY (not what)

---

## 🎯 Coverage Goals

| Area | Current | Target (Beta) | Target (Launch) |
|------|---------|---------------|-----------------|
| **Critical Flows** | 3 tests | 5 tests | 10 tests |
| **Tier Enforcement** | 3 tests | 5 tests | 8 tests |
| **Upgrade Flow** | 3 tests | 5 tests | 8 tests |

---

## 🔗 Related Docs

- **Fragility Audit:** `docs/security/SYSTEM_FRAGILITY_AUDIT.md`
- **Action Plan:** `docs/security/FORTIFICATION_ACTION_PLAN.md`
- **SSOT Verification:** `docs/bugs/SSOT_VERIFICATION_GUIDE.md`

---

## 📞 Need Help?

- **Playwright Docs:** https://playwright.dev
- **Discord:** [Link to your Discord]
- **Issues:** Create issue on GitHub

---

**Created:** Diciembre 16, 2025
**Last updated:** Diciembre 16, 2025
**Maintainer:** Development Team
