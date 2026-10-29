import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/** End-to-end tests: play the real game in a real browser. Run with `npm run test:e2e`. */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // The phone project only runs the specs that are tagged @mobile.
    { name: 'phone', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    // Test the production build, exactly what students will get.
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
