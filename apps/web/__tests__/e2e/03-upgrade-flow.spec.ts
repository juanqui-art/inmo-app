/**
 * E2E Test: Subscription Upgrade Flow
 *
 * This test verifies that users can upgrade their subscription:
 * - FREE → PLUS/AGENT/PRO
 * - Limits increase after upgrade
 * - Tier badge updates
 *
 * WHY THIS IS CRITICAL:
 * - This is the REVENUE flow (most important for business)
 * - If this breaks, no money comes in
 * - Tests payment simulation (real Stripe integration later)
 */

import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  signup,
  verifyTierBadge,
  getPropertyCount,
  navigateToCreateProperty,
  fillPropertyBasicInfo,
  submitPropertyForm,
} from './helpers';

test.describe('Subscription Upgrade Flow', () => {
  test('User can upgrade from FREE to AGENT', async ({ page }) => {
    // ARRANGE: Signup with FREE tier
    const user = generateTestUser('FREE');
    await signup(page, user);

    // ASSERT 1: Initial tier is FREE
    await verifyTierBadge(page, 'Gratuito');

    // ACT 1: Navigate to upgrade page
    await page.goto('/dashboard/suscripcion');

    // ASSERT 2: Upgrade page loaded
    await expect(page).toHaveURL('/dashboard/suscripcion');

    // ACT 2: Click "Actualizar" on AGENT plan
    const agentPlanButton = page.locator(
      '[data-testid="plan-AGENT"] button:has-text("Actualizar")'
    );
    await agentPlanButton.click();

    // ASSERT 3: Confirmation modal appears
    const confirmModal = page.locator('[data-testid="upgrade-modal"]');
    await expect(confirmModal).toBeVisible();

    // ACT 3: Confirm upgrade
    const confirmButton = page.locator('button:has-text("Confirmar")');
    await confirmButton.click();

    // ASSERT 4: Success message
    await expect(page.locator('text=Suscripción actualizada')).toBeVisible({
      timeout: 10000,
    });

    // ASSERT 5: Tier badge updated to "Agente"
    await page.goto('/dashboard');
    await verifyTierBadge(page, 'Agente');

    // ASSERT 6: Can now create multiple properties (test new limit)
    await navigateToCreateProperty(page);
    await fillPropertyBasicInfo(page, {
      title: 'Property 1 - After upgrade',
      description: 'First property after upgrade to AGENT',
      price: '100000',
      category: 'HOUSE',
      transactionType: 'SALE',
    });
    await submitPropertyForm(page);

    // ASSERT 7: Property created successfully
    const count = await getPropertyCount(page);
    expect(count).toBe(1);

    // ACT 4: Create second property (FREE couldn't do this)
    await navigateToCreateProperty(page);
    await fillPropertyBasicInfo(page, {
      title: 'Property 2 - After upgrade',
      description: 'Second property after upgrade to AGENT',
      price: '120000',
      category: 'APARTMENT',
      transactionType: 'SALE',
    });
    await submitPropertyForm(page);

    // ASSERT 8: Second property created (proves upgrade worked)
    const finalCount = await getPropertyCount(page);
    expect(finalCount).toBe(2);
  });

  test('Upgrade persists after logout/login', async ({ page }) => {
    // ARRANGE: Signup with FREE tier
    const user = generateTestUser('FREE');
    await signup(page, user);

    // ACT 1: Upgrade to AGENT
    await page.goto('/dashboard/suscripcion');
    const agentButton = page.locator(
      '[data-testid="plan-AGENT"] button:has-text("Actualizar")'
    );
    await agentButton.click();
    await page.locator('button:has-text("Confirmar")').click();

    // Wait for success
    await expect(page.locator('text=Suscripción actualizada')).toBeVisible();

    // ASSERT 1: Tier is AGENT
    await page.goto('/dashboard');
    await verifyTierBadge(page, 'Agente');

    // ACT 2: Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Cerrar sesión');

    // ACT 3: Login again
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // ASSERT 2: Tier is still AGENT (not reverted to FREE)
    await page.waitForURL(/\/dashboard/);
    await verifyTierBadge(page, 'Agente');
  });

  test('CLIENT role is promoted to AGENT on subscription upgrade', async ({
    page,
  }) => {
    // ARRANGE: Signup with FREE tier (CLIENT role)
    const user = generateTestUser('FREE');
    await signup(page, user);

    // At this point, user should be CLIENT role
    // (FREE tier users are CLIENTs by default)

    // ACT: Upgrade to AGENT tier
    await page.goto('/dashboard/suscripcion');
    const agentButton = page.locator(
      '[data-testid="plan-AGENT"] button:has-text("Actualizar")'
    );
    await agentButton.click();
    await page.locator('button:has-text("Confirmar")').click();

    // ASSERT 1: Success
    await expect(page.locator('text=Suscripción actualizada')).toBeVisible();

    // ASSERT 2: Role upgraded to AGENT (can now access properties dashboard)
    await page.goto('/dashboard/propiedades');
    await expect(page).toHaveURL('/dashboard/propiedades');

    // ASSERT 3: Create property button is visible (only AGENT role can see this)
    const createButton = page.locator('text=Nueva propiedad');
    await expect(createButton).toBeVisible();
  });
});
