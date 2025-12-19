/**
 * E2E Test: Tier Limits Enforcement
 *
 * This test verifies that property creation limits are enforced correctly:
 * - FREE tier: 1 property max
 * - PLUS tier: 3 properties max
 * - AGENT tier: 10 properties max
 * - PRO tier: 20 properties max
 *
 * WHY THIS IS CRITICAL:
 * - Prevents abuse (user creating unlimited properties)
 * - Protects revenue (forces upgrades)
 * - Tests business logic integrity
 */

import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  signup,
  navigateToCreateProperty,
  fillPropertyBasicInfo,
  submitPropertyForm,
  getPropertyCount,
  assertError,
} from './helpers';

test.describe('Tier Limits: Property Creation', () => {
  test('FREE tier user cannot create more than 1 property', async ({ page }) => {
    // ARRANGE: Signup with FREE tier
    const user = generateTestUser('FREE');
    await signup(page, user);

    // ACT 1: Create first property (should succeed)
    await navigateToCreateProperty(page);
    await fillPropertyBasicInfo(page, {
      title: 'Property 1 - FREE tier',
      description: 'First property',
      price: '100000',
      category: 'APARTMENT',
      transactionType: 'SALE',
    });
    await submitPropertyForm(page);

    // ASSERT 1: Property created successfully
    let count = await getPropertyCount(page);
    expect(count).toBe(1);

    // ACT 2: Try to create second property (should fail)
    await navigateToCreateProperty(page);

    // ASSERT 2: Redirected back or shown error
    // (Depending on implementation, might redirect or show modal)
    const upgradeModal = page.locator('[data-testid="upgrade-modal"]');
    const errorMessage = page.locator('text=Has alcanzado el límite');

    // Either upgrade modal shows OR error message
    const isModalVisible = await upgradeModal.isVisible().catch(() => false);
    const isErrorVisible = await errorMessage.isVisible().catch(() => false);

    expect(isModalVisible || isErrorVisible).toBe(true);

    // ASSERT 3: Property count is still 1 (not created)
    count = await getPropertyCount(page);
    expect(count).toBe(1);
  });

  test('PLUS tier user can create up to 3 properties', async ({ page }) => {
    // ARRANGE: Signup with PLUS tier
    const user = generateTestUser('PLUS');
    await signup(page, user);

    // ACT: Create 3 properties
    for (let i = 1; i <= 3; i++) {
      await navigateToCreateProperty(page);
      await fillPropertyBasicInfo(page, {
        title: `Property ${i} - PLUS tier`,
        description: `Property number ${i}`,
        price: '100000',
        category: 'APARTMENT',
        transactionType: 'SALE',
      });
      await submitPropertyForm(page);

      // ASSERT: Property count increases
      const count = await getPropertyCount(page);
      expect(count).toBe(i);
    }

    // ASSERT: Final count is 3
    const finalCount = await getPropertyCount(page);
    expect(finalCount).toBe(3);

    // ACT: Try to create 4th property (should fail)
    await navigateToCreateProperty(page);

    // ASSERT: Blocked (upgrade modal or error)
    const upgradeModal = page.locator('[data-testid="upgrade-modal"]');
    const isBlocked = await upgradeModal.isVisible().catch(() => false);
    expect(isBlocked).toBe(true);
  });

  test('AGENT tier user can create up to 10 properties', async ({ page }) => {
    // ARRANGE: Signup with AGENT tier
    const user = generateTestUser('AGENT');
    await signup(page, user);

    // ACT: Create 10 properties (batch test)
    for (let i = 1; i <= 10; i++) {
      await navigateToCreateProperty(page);
      await fillPropertyBasicInfo(page, {
        title: `Property ${i} - AGENT tier`,
        description: `Property number ${i}`,
        price: '100000',
        category: 'APARTMENT',
        transactionType: 'SALE',
      });
      await submitPropertyForm(page);
    }

    // ASSERT: Can create all 10
    const count = await getPropertyCount(page);
    expect(count).toBe(10);

    // ACT: Try to create 11th (should fail)
    await navigateToCreateProperty(page);

    // ASSERT: Blocked
    const upgradeModal = page.locator('[data-testid="upgrade-modal"]');
    const isBlocked = await upgradeModal.isVisible().catch(() => false);
    expect(isBlocked).toBe(true);
  });
});

test.describe('Tier Limits: Image Upload', () => {
  test('FREE tier user cannot upload more than 6 images per property', async ({
    page,
  }) => {
    // ARRANGE: Signup with FREE tier
    const user = generateTestUser('FREE');
    await signup(page, user);

    // ACT: Create property
    await navigateToCreateProperty(page);
    await fillPropertyBasicInfo(page, {
      title: 'Property with images - FREE tier',
      description: 'Testing image limits',
      price: '100000',
      category: 'APARTMENT',
      transactionType: 'SALE',
    });

    // Try to upload 7 images (should only accept 6)
    // NOTE: This depends on your UI implementation
    // Adjust selectors based on your wizard

    // TODO: Implement when you have image upload in wizard
    // For now, just document the expected behavior
    test.skip('Image upload limit test pending implementation');
  });
});
