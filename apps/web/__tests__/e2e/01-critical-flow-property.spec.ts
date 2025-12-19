/**
 * E2E Test: Critical Flow - Signup → Login → Create Property
 *
 * This test verifies the most critical user journey:
 * 1. User signs up with AGENT tier
 * 2. User logs out and logs back in
 * 3. User creates a property successfully
 *
 * WHY THIS IS CRITICAL:
 * - Tests the full onboarding flow
 * - Verifies tier assignment works
 * - Verifies property creation (core feature)
 * - Catches auth-related bugs
 */

import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  signup,
  login,
  logout,
  navigateToCreateProperty,
  fillPropertyBasicInfo,
  submitPropertyForm,
  getPropertyCount,
  verifyTierBadge,
} from './helpers';

test.describe('Critical Flow: Signup → Login → Create Property', () => {
  test('AGENT user can signup, login, and create property', async ({ page }) => {
    // ARRANGE: Generate test user with AGENT tier
    const user = generateTestUser('AGENT');

    // ACT 1: Signup
    await signup(page, user);

    // ASSERT 1: User is redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // ASSERT 2: Tier badge shows "Agente"
    await verifyTierBadge(page, 'Agente');

    // ACT 2: Logout
    await logout(page);

    // ASSERT 3: User is on homepage
    await expect(page).toHaveURL('/');

    // ACT 3: Login again
    await login(page, { email: user.email, password: user.password });

    // ASSERT 4: User is back in dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // ASSERT 5: Tier is still AGENT (tier didn't revert to FREE)
    await verifyTierBadge(page, 'Agente');

    // ACT 4: Navigate to create property
    await navigateToCreateProperty(page);

    // ASSERT 6: Create property page loaded
    await expect(page).toHaveURL('/dashboard/propiedades/nueva');

    // ACT 5: Fill property form
    await fillPropertyBasicInfo(page, {
      title: 'Test Property - E2E Test',
      description: 'This is a test property created by E2E test',
      price: '150000',
      category: 'HOUSE',
      transactionType: 'SALE',
    });

    // ACT 6: Submit form
    await submitPropertyForm(page);

    // ASSERT 7: Redirected to properties list
    await expect(page).toHaveURL(/\/dashboard\/propiedades$/);

    // ASSERT 8: Property count is 1
    const propertyCount = await getPropertyCount(page);
    expect(propertyCount).toBe(1);

    // ASSERT 9: Success toast is visible
    const successToast = page.locator('text=Propiedad publicada');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('Tier persists after multiple login/logout cycles', async ({ page }) => {
    // ARRANGE: Create AGENT user
    const user = generateTestUser('AGENT');
    await signup(page, user);

    // ACT: Logout and login 3 times
    for (let i = 0; i < 3; i++) {
      await logout(page);
      await login(page, { email: user.email, password: user.password });

      // ASSERT: Tier is still AGENT each time
      await verifyTierBadge(page, 'Agente');
    }

    // FINAL ASSERT: After 3 cycles, tier is still AGENT
    await page.goto('/dashboard');
    await verifyTierBadge(page, 'Agente');
  });
});
