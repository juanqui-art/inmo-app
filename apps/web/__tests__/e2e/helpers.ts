/**
 * E2E Test Helpers
 *
 * Utilities para tests end-to-end con Playwright
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@inmoapp-test.com`;
}

/**
 * Generate test user data
 */
export function generateTestUser(tier: 'FREE' | 'PLUS' | 'AGENT' | 'PRO' = 'FREE') {
  return {
    name: 'Test User',
    email: generateTestEmail(),
    password: 'TestPass123!',
    tier,
  };
}

/**
 * Signup helper
 */
export async function signup(
  page: Page,
  userData: { name: string; email: string; password: string; tier?: string }
) {
  // Navigate to signup page
  if (userData.tier && userData.tier !== 'FREE') {
    // Signup con plan desde /vender
    await page.goto(`/signup?plan=${userData.tier.toLowerCase()}&redirect=/dashboard`);
  } else {
    // Signup normal
    await page.goto('/signup');
  }

  // Fill form
  await page.fill('input[name="name"]', userData.name);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation (to dashboard or perfil)
  // Increased timeout to 30s to handle rate limiting and slow signups
  await page.waitForURL(/\/(dashboard|perfil)/, { timeout: 30000 });

  // Wait 2 seconds to avoid rate limiting on subsequent signups
  await page.waitForTimeout(2000);

  return userData;
}

/**
 * Login helper
 */
export async function login(
  page: Page,
  credentials: { email: string; password: string }
) {
  await page.goto('/login');

  // Fill form
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/\/(dashboard|perfil)/, { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click('text=Cerrar sesión');

  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Navigate to create property page
 */
export async function navigateToCreateProperty(page: Page) {
  await page.goto('/dashboard/propiedades/nueva');
  await page.waitForLoadState('networkidle');
}

/**
 * Fill property form (basic info)
 */
export async function fillPropertyBasicInfo(
  page: Page,
  propertyData: {
    title: string;
    description: string;
    price: string;
    category: string;
    transactionType: 'SALE' | 'RENT';
  }
) {
  // Title
  await page.fill('input[name="title"]', propertyData.title);

  // Description
  await page.fill('textarea[name="description"]', propertyData.description);

  // Price
  await page.fill('input[name="price"]', propertyData.price);

  // Category (select)
  await page.selectOption('select[name="category"]', propertyData.category);

  // Transaction type (radio buttons)
  if (propertyData.transactionType === 'SALE') {
    await page.click('input[name="transactionType"][value="SALE"]');
  } else {
    await page.click('input[name="transactionType"][value="RENT"]');
  }

  // Details (optional, just fill some)
  await page.fill('input[name="bedrooms"]', '3');
  await page.fill('input[name="bathrooms"]', '2');
  await page.fill('input[name="area"]', '120');
}

/**
 * Fill property location
 */
export async function fillPropertyLocation(
  page: Page,
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }
) {
  await page.fill('input[name="address"]', location.address);
  await page.fill('input[name="city"]', location.city);
  await page.fill('input[name="state"]', location.state);
  await page.fill('input[name="zipCode"]', location.zipCode);
}

/**
 * Upload property image
 */
export async function uploadPropertyImage(page: Page, imagePath: string) {
  // Find file input (might be hidden)
  const fileInput = page.locator('input[type="file"][accept*="image"]');

  // Upload file
  await fileInput.setInputFiles(imagePath);

  // Wait for upload to complete (look for preview or success message)
  await page.waitForSelector('[data-testid="image-preview"]', {
    timeout: 10000,
  });
}

/**
 * Submit property form
 */
export async function submitPropertyForm(page: Page) {
  // Click submit button
  await page.click('button[type="submit"]:has-text("Publicar")');

  // Wait for success (redirect to properties list or success message)
  await expect(page).toHaveURL(/\/dashboard\/propiedades/, {
    timeout: 15000,
  });
}

/**
 * Get property count from dashboard
 */
export async function getPropertyCount(page: Page): Promise<number> {
  await page.goto('/dashboard/propiedades');
  await page.waitForLoadState('networkidle');

  // Find properties count text (adjust selector based on your UI)
  const countText = await page.textContent('[data-testid="property-count"]');

  if (!countText) return 0;

  // Extract number from text like "3 de 10 propiedades"
  const match = countText.match(/(\d+)\s+de/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Verify tier badge
 */
export async function verifyTierBadge(
  page: Page,
  expectedTier: 'Gratuito' | 'Plus' | 'Agente' | 'Pro'
) {
  await page.goto('/dashboard');

  // Find tier badge in navbar
  const badge = page.locator('[data-testid="tier-badge"]');
  await expect(badge).toContainText(expectedTier);
}

/**
 * Check if upgrade modal is visible
 */
export async function isUpgradeModalVisible(page: Page): Promise<boolean> {
  return page.locator('[data-testid="upgrade-modal"]').isVisible();
}

/**
 * Clean up test data (delete user and properties)
 *
 * NOTE: This should be done via API, not through UI
 * We'll implement this when we have an admin API
 */
export async function cleanupTestUser(email: string) {
  // TODO: Implement API call to delete test user
  // For now, we rely on manual cleanup or test DB reset
  console.warn(`Test user ${email} should be manually deleted from DB`);
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message: string) {
  const toast = page.locator('[data-testid="toast"]', { hasText: message });
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * Assert error message is displayed
 */
export async function assertError(page: Page, errorText: string) {
  const error = page.locator('[role="alert"]', { hasText: errorText });
  await expect(error).toBeVisible();
}
