import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for InmoApp E2E Tests
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './apps/web/__tests__/e2e',

  // Maximum time one test can run (increased to 60s for rate limiting)
  timeout: 60 * 1000,

  // Run tests in files in parallel (disabled to avoid rate limiting)
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Run tests serially to avoid rate limiting (1 worker = sequential execution)
  workers: 1,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['line']
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment if you want to test in Firefox and Safari too
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server to start
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
